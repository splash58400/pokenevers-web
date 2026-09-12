// POST /.netlify/functions/deploy-gamedata
//
// Reçoit { password, gamedata } depuis le bouton « Déployer sur le jeu » de
// admin.html. Si le mot de passe correspond à la variable d'environnement
// ADMIN_PASSWORD configurée sur Netlify (Site settings → Environment variables),
// les données sont enregistrées dans Netlify Blobs : le jeu les sert alors
// immédiatement via /gamedata.json (voir gamedata.js + netlify.toml).
//
// Le mot de passe n'est JAMAIS écrit dans le code livré au navigateur : il ne
// vit que côté serveur (variable d'environnement) et dans la mémoire de session
// de l'admin qui le saisit.
"use strict";

const { getConfiguredStore } = require("./blob-store");

const STORE_NAME = "pokenevers";
const BLOB_KEY = "gamedata";
const REQUIRED_ARRAYS = ["merchants", "pois", "events", "missions", "badges"];

exports.handler = async function handler(event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ error: "Method Not Allowed" }) };
  }

  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) {
    return {
      statusCode: 500,
      headers: { "content-type": "application/json; charset=utf-8" },
      body: JSON.stringify({
        error:
          "La variable d'environnement ADMIN_PASSWORD n'est pas configurée sur Netlify (Site settings → Environment variables), le déploiement est donc désactivé."
      })
    };
  }

  let body;
  try {
    body = JSON.parse(event.body || "{}");
  } catch (err) {
    return { statusCode: 400, headers: { "content-type": "application/json; charset=utf-8" }, body: JSON.stringify({ error: "JSON invalide." }) };
  }

  if (typeof body.password !== "string" || body.password !== adminPassword) {
    return { statusCode: 401, headers: { "content-type": "application/json; charset=utf-8" }, body: JSON.stringify({ error: "Mot de passe incorrect." }) };
  }

  const gamedata = body.gamedata;
  if (!gamedata || typeof gamedata !== "object" || Array.isArray(gamedata)) {
    return { statusCode: 400, headers: { "content-type": "application/json; charset=utf-8" }, body: JSON.stringify({ error: "Données de jeu invalides." }) };
  }
  for (const key of REQUIRED_ARRAYS) {
    if (!Array.isArray(gamedata[key])) {
      return {
        statusCode: 400,
        headers: { "content-type": "application/json; charset=utf-8" },
        body: JSON.stringify({ error: `Champ manquant ou invalide dans les données : ${key}` })
      };
    }
  }

  gamedata.updatedAt = new Date().toISOString();
  if (gamedata.version == null) gamedata.version = 1;

  try {
    const store = getConfiguredStore(STORE_NAME);
    await store.setJSON(BLOB_KEY, gamedata);
  } catch (err) {
    return {
      statusCode: 500,
      headers: { "content-type": "application/json; charset=utf-8" },
      body: JSON.stringify({ error: "Échec de l'enregistrement côté serveur : " + (err && err.message ? err.message : String(err)) })
    };
  }

  return {
    statusCode: 200,
    headers: { "content-type": "application/json; charset=utf-8" },
    body: JSON.stringify({ ok: true, updatedAt: gamedata.updatedAt })
  };
};
