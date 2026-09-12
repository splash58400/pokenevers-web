// Worker unique de PokeNevers (modèle Cloudflare "Workers + static assets").
//
// Sert le site statique (dossier /public) pour toutes les routes, sauf les
// trois routes ci-dessous qui doivent exécuter du code (déclarées dans
// wrangler.jsonc via "assets.run_worker_first" — sans ça, Cloudflare
// servirait directement les fichiers statiques sans jamais lancer ce
// script) :
//  - GET  /gamedata.json     : données de jeu actuelles (KV, ou démo)
//  - POST /deploy-gamedata   : publie de nouvelles données (bouton admin)
//  - POST /verify-password   : écran de connexion léger de l'admin
"use strict";

import { readGamedata, writeGamedata } from "./lib/kv-store.js";
import { SEED_GAMEDATA } from "./lib/seed-data.js";

const REQUIRED_ARRAYS = ["merchants", "pois", "events", "missions", "badges"];

function json(status, obj, extraHeaders) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: Object.assign({ "content-type": "application/json; charset=utf-8" }, extraHeaders || {})
  });
}

async function handleGamedata(env) {
  let payload = SEED_GAMEDATA;
  try {
    const current = await readGamedata(env);
    if (current && typeof current === "object") payload = current;
  } catch (err) {
    // KV indisponible : on sert les données de démonstration plutôt que
    // de renvoyer une erreur au joueur.
    payload = SEED_GAMEDATA;
  }
  return json(200, payload, { "cache-control": "no-store" });
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

    // Toute autre requête : fichiers statiques (index.html, admin.html, etc.)
    return env.ASSETS.fetch(request);
  }
};
