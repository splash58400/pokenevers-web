// POST /deploy-gamedata
//
// Reçoit { password, gamedata } depuis le bouton « Déployer sur le jeu » de
// admin.html. Si le mot de passe correspond à la variable d'environnement
// ADMIN_PASSWORD configurée sur Cloudflare Pages (Settings → Environment
// variables), les données sont enregistrées dans Workers KV : le jeu les
// sert alors immédiatement via /gamedata.json (voir gamedata.json.js).
//
// Le mot de passe n'est JAMAIS écrit dans le code livré au navigateur : il ne
// vit que côté serveur (variable d'environnement) et dans la mémoire de session
// de l'admin qui le saisit.
"use strict";

import { writeGamedata } from "./_lib/kv-store.js";

const REQUIRED_ARRAYS = ["merchants", "pois", "events", "missions", "badges"];

function json(status, obj) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" }
  });
}

export async function onRequestPost(context) {
  const { request, env } = context;

  const adminPassword = env.ADMIN_PASSWORD;
  if (!adminPassword) {
    return json(500, {
      error:
        "La variable d'environnement ADMIN_PASSWORD n'est pas configurée sur Cloudflare Pages (Settings → Environment variables), le déploiement est donc désactivé."
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
