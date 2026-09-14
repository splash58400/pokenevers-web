// Worker unique de PokeNevers (modèle Cloudflare "Workers + static assets").
//
// Sert le site statique (dossier /public) pour toutes les routes, sauf les
// routes ci-dessous qui doivent exécuter du code (déclarées dans
// wrangler.jsonc via "assets.run_worker_first" — sans ça, Cloudflare
// servirait directement les fichiers statiques sans jamais lancer ce
// script) :
//  - GET  /gamedata.json      : données de jeu actuelles (KV, ou démo)
//  - POST /deploy-gamedata    : publie de nouvelles données (bouton admin)
//  - POST /verify-password    : écran de connexion léger de l'admin
//  - POST /verify-battle-code : vérifie un code de combat tapé par un joueur
//                                (voir handleVerifyBattle ci-dessous — le
//                                code secret de chaque commerçant ne doit
//                                JAMAIS être envoyé au navigateur du joueur,
//                                c'est tout l'intérêt de le vérifier ici).
//  - POST /save-progress      : sauvegarde la progression d'un joueur sous
//                                un code de récupération (voir plus bas).
//  - GET  /load-progress      : récupère une progression à partir de son
//                                code, pour la restaurer sur un autre
//                                appareil.
"use strict";

import { readGamedata, writeGamedata } from "./lib/kv-store.js";
import { SEED_GAMEDATA } from "./lib/seed-data.js";

const REQUIRED_ARRAYS = ["merchants", "pois", "events", "missions", "badges"];

// Portée de capture/combat (mètres) — doit rester identique à RANGE_M dans
// public/index.html : c'est la même notion de "à proximité" partout dans le jeu.
const RANGE_M = 60;

// Barème de récompenses de combat, par rareté du commerçant — même logique
// que RARITY_XP/RARITY_ZONE etc. dans public/index.html (la rareté pilote
// toute la difficulté/récompense du jeu). RARITY_XP est dupliqué ici
// volontairement : ces nombres ne sont utilisés que côté serveur (c'est lui
// qui calcule la récompense), donc pas besoin d'un fichier partagé pour un
// projet de cette taille — garder les deux copies alignées si on ajuste
// l'équilibrage un jour.
const RARITY_XP = { commun: 40, "peu-commun": 70, rare: 120, legendaire: 400 };
const BATTLE_COINS = { commun: 5, "peu-commun": 8, rare: 12, legendaire: 20 };

function json(status, obj, extraHeaders) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: Object.assign({ "content-type": "application/json; charset=utf-8" }, extraHeaders || {})
  });
}

// Distance à vol d'oiseau en mètres entre deux points GPS (formule de
// haversine) — utilisée pour vérifier côté serveur qu'un joueur est bien
// à proximité du commerçant avant de valider son code de combat (on ne
// peut pas faire confiance à une vérification faite uniquement côté
// navigateur, elle est trivialement contournable).
function distanceMeters(lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(a)));
}

async function loadCurrentGamedata(env) {
  try {
    const current = await readGamedata(env);
    if (current && typeof current === "object") return current;
  } catch (err) {
    // KV indisponible : on retombe sur les données de démonstration plutôt
    // que de renvoyer une erreur au joueur.
  }
  return SEED_GAMEDATA;
}

async function handleGamedata(env) {
  const payload = await loadCurrentGamedata(env);
  // Ne jamais exposer les codes de combat au navigateur du joueur : ce
  // sont les seules données du panel admin qui doivent rester secrètes
  // (tout le reste — nom, description, photo, récompenses possibles — n'a
  // pas besoin de l'être). On renvoie une copie filtrée, jamais l'original.
  const publicPayload = Object.assign({}, payload, {
    merchants: (payload.merchants || []).map((m) => {
      const copy = Object.assign({}, m);
      delete copy.battleCode;
      return copy;
    })
  });
  return json(200, publicPayload, { "cache-control": "no-store" });
}

// Tirage pondéré d'une récompense de combat. Les poids ne dépendent que du
// type de segment (pas de la rareté) — la rareté du commerçant influence
// seulement le MONTANT gagné (via RARITY_XP/BATTLE_COINS ci-dessus), pas la
// probabilité de tomber dessus.
function pickBattleReward(merchant) {
  const rarity = merchant.rarity || "commun";
  const hasCoupon = !!(merchant.battleCouponLabel && merchant.battleCouponLabel.trim());
  const segments = [
    { type: "xp_small", weight: 28 },
    { type: "coins_small", weight: 28 },
    { type: "xp_big", weight: 17 },
    { type: "coins_big", weight: 17 },
    { type: "jackpot", weight: 7 }
  ];
  if (hasCoupon) segments.push({ type: "coupon", weight: 3 });

  const total = segments.reduce((s, seg) => s + seg.weight, 0);
  let roll = Math.random() * total;
  let chosen = segments[0].type;
  for (const seg of segments) {
    if (roll < seg.weight) { chosen = seg.type; break; }
    roll -= seg.weight;
  }

  const xpFull = RARITY_XP[rarity] || RARITY_XP.commun;
  const coinsFull = BATTLE_COINS[rarity] || BATTLE_COINS.commun;

  switch (chosen) {
    case "xp_small": return { type: chosen, xp: Math.round(xpFull * 0.25) };
    case "xp_big": return { type: chosen, xp: Math.round(xpFull * 0.6) };
    case "coins_small": return { type: chosen, coins: Math.max(2, Math.round(coinsFull * 0.4)) };
    case "coins_big": return { type: chosen, coins: coinsFull };
    case "jackpot": return { type: chosen, xp: Math.round(xpFull * 0.6), coins: coinsFull };
    case "coupon":
      return {
        type: chosen,
        xp: Math.round(xpFull * 0.15),
        couponLabel: merchant.battleCouponLabel.trim(),
        couponCode: "BON-" + Date.now().toString(36).toUpperCase() + "-" + Math.random().toString(36).slice(2, 6).toUpperCase()
      };
    default: return { type: "xp_small", xp: Math.round(xpFull * 0.25) };
  }
}

async function handleVerifyBattle(request, env) {
  let body;
  try {
    body = await request.json();
  } catch (err) {
    return json(400, { error: "JSON invalide." });
  }
  const code = typeof body.code === "string" ? body.code.trim() : "";
  const lat = typeof body.lat === "number" ? body.lat : null;
  const lon = typeof body.lon === "number" ? body.lon : null;
  if (!code) return json(400, { error: "Aucun code fourni." });
  if (lat === null || lon === null) {
    return json(400, { error: "Position GPS manquante — impossible de vérifier la proximité." });
  }

  const gamedata = await loadCurrentGamedata(env);
  const merchant = (gamedata.merchants || []).find(
    (m) =>
      m.active !== false &&
      m.battleEnabled &&
      typeof m.battleCode === "string" &&
      m.battleCode.trim().length > 0 &&
      m.battleCode.trim().toLowerCase() === code.toLowerCase()
  );
  if (!merchant) return json(404, { error: "Code invalide." });
  if (merchant.lat == null || merchant.lon == null) {
    return json(409, { error: "Ce commerçant n'est pas placé sur la carte." });
  }

  const dist = distanceMeters(lat, lon, merchant.lat, merchant.lon);
  if (dist > RANGE_M) {
    return json(403, { error: "Trop loin du commerçant pour valider ce code.", tooFar: true });
  }

  const reward = pickBattleReward(merchant);
  return json(200, {
    ok: true,
    merchantId: merchant.id,
    merchantName: merchant.name || "Commerçant",
    reward
  }, { "cache-control": "no-store" });
}

// ---------------------------------------------------------------------------
// Sauvegarde multi-appareils par code (alternative légère à un vrai compte
// Google : Jérémy ne voulait pas encore mettre en place le client OAuth
// nécessaire sur Google Cloud Console, voir la conversation). Le joueur
// obtient un code de récupération (généré côté navigateur, voir index.html)
// qui sert de clé dans Workers KV pour retrouver sa progression sur un autre
// appareil. C'est un simple secret partagé — comme les codes de combat —
// pas une vraie authentification : quiconque connaît le code peut lire ou
// écraser cette sauvegarde. Adapté à la taille du projet, mais à garder en
// tête si le jeu grandit (voir "Prochaines étapes" du suivi de projet).
const SAVE_CODE_RE = /^[A-Z0-9]{5}-[A-Z0-9]{5}$/;
const MAX_PROGRESS_BYTES = 40000; // largement au-dessus d'une sauvegarde réelle (quelques Ko)

async function handleSaveProgress(request, env) {
  if (!env.POKENEVERS_KV) {
    return json(500, { error: "La liaison KV « POKENEVERS_KV » n'est pas configurée." });
  }
  let body;
  try {
    body = await request.json();
  } catch (err) {
    return json(400, { error: "JSON invalide." });
  }
  const code = typeof body.code === "string" ? body.code.trim().toUpperCase() : "";
  if (!SAVE_CODE_RE.test(code)) {
    return json(400, { error: "Format de code invalide." });
  }
  if (!body.state || typeof body.state !== "object" || Array.isArray(body.state)) {
    return json(400, { error: "Progression invalide." });
  }
  const serialized = JSON.stringify(body.state);
  if (serialized.length > MAX_PROGRESS_BYTES) {
    return json(413, { error: "Progression trop volumineuse." });
  }
  try {
    await env.POKENEVERS_KV.put(
      "progress:" + code,
      JSON.stringify({ state: body.state, updatedAt: new Date().toISOString() })
    );
  } catch (err) {
    return json(500, { error: "Échec de l'enregistrement côté serveur." });
  }
  return json(200, { ok: true });
}

async function handleLoadProgress(request, env) {
  if (!env.POKENEVERS_KV) {
    return json(500, { error: "La liaison KV « POKENEVERS_KV » n'est pas configurée." });
  }
  const url = new URL(request.url);
  const code = (url.searchParams.get("code") || "").trim().toUpperCase();
  if (!SAVE_CODE_RE.test(code)) {
    return json(400, { error: "Format de code invalide." });
  }
  let raw;
  try {
    raw = await env.POKENEVERS_KV.get("progress:" + code);
  } catch (err) {
    return json(500, { error: "Lecture impossible côté serveur." });
  }
  if (!raw) return json(404, { error: "Aucune sauvegarde ne correspond à ce code." });
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (err) {
    return json(500, { error: "Sauvegarde corrompue." });
  }
  return json(200, { ok: true, state: parsed.state, updatedAt: parsed.updatedAt }, { "cache-control": "no-store" });
}

async function handleVerifyPassword(request, env) {
  const adminPassword = env.ADMIN_PASSWORD;
  if (!adminPassword) {
    return json(500, { error: "ADMIN_PASSWORD non configuré côté serveur." });
  }
  let body;
  try {
    body = await request.json();
  } catch (err) {
    return json(400, { error: "JSON invalide." });
  }
  if (typeof body.password === "string" && body.password === adminPassword) {
    return json(200, { ok: true });
  }
  return json(401, { error: "Mot de passe incorrect." });
}

async function handleDeployGamedata(request, env) {
  const adminPassword = env.ADMIN_PASSWORD;
  if (!adminPassword) {
    return json(500, {
      error:
        "La variable ADMIN_PASSWORD n'est pas configurée sur Cloudflare (Settings → Variables and Secrets), le déploiement est donc désactivé."
    });
  }

  let body;
  try {
    body = await request.json();
  } catch (err) {
    return json(400, { error: "JSON invalide." });
  }

  if (typeof body.password !== "string" || body.password !== adminPassword) {
    return json(401, { error: "Mot de passe incorrect." });
  }

  const gamedata = body.gamedata;
  if (!gamedata || typeof gamedata !== "object" || Array.isArray(gamedata)) {
    return json(400, { error: "Données de jeu invalides." });
  }
  for (const key of REQUIRED_ARRAYS) {
    if (!Array.isArray(gamedata[key])) {
      return json(400, { error: `Champ manquant ou invalide dans les données : ${key}` });
    }
  }

  gamedata.updatedAt = new Date().toISOString();
  if (gamedata.version == null) gamedata.version = 1;

  try {
    await writeGamedata(env, gamedata);
  } catch (err) {
    return json(500, {
      error: "Échec de l'enregistrement côté serveur : " + (err && err.message ? err.message : String(err))
    });
  }

  return json(200, { ok: true, updatedAt: gamedata.updatedAt });
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (url.pathname === "/gamedata.json" && request.method === "GET") {
      return handleGamedata(env);
    }
    if (url.pathname === "/verify-password" && request.method === "POST") {
      return handleVerifyPassword(request, env);
    }
    if (url.pathname === "/deploy-gamedata" && request.method === "POST") {
      return handleDeployGamedata(request, env);
    }
    if (url.pathname === "/verify-battle-code" && request.method === "POST") {
      return handleVerifyBattle(request, env);
    }
    if (url.pathname === "/save-progress" && request.method === "POST") {
      return handleSaveProgress(request, env);
    }
    if (url.pathname === "/load-progress" && request.method === "GET") {
      return handleLoadProgress(request, env);
    }

    // Toute autre requête : fichiers statiques (index.html, admin.html, etc.)
    return env.ASSETS.fetch(request);
  }
};
