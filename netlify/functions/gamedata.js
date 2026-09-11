// GET /gamedata.json  (redirigé ici par netlify.toml, avec force = true)
//
// Sert les données de jeu actuelles :
//  - si l'admin a déjà déployé une version via le bouton « Déployer sur le jeu »,
//    on la lit depuis Netlify Blobs (stockage clé/valeur géré par Netlify) ;
//  - sinon (ou en cas de souci avec Blobs), on retombe sur le gamedata.json de
//    démonstration livré avec le site, pour que le jeu ne soit jamais cassé.
"use strict";

const { getStore } = require("@netlify/blobs");
const seedData = require("../../gamedata.json");

const STORE_NAME = "pokenevers";
const BLOB_KEY = "gamedata";

exports.handler = async function handler(event) {
  if (event.httpMethod !== "GET") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  let payload = seedData;
  try {
    const store = getStore(STORE_NAME);
    const current = await store.get(BLOB_KEY, { type: "json" });
    if (current && typeof current === "object") {
      payload = current;
    }
  } catch (err) {
    // Netlify Blobs indisponible (site pas encore relié à un vrai compte,
    // fonctions désactivées, etc.) : on sert les données de démonstration
    // plutôt que de renvoyer une erreur au jeu.
    payload = seedData;
  }

  return {
    statusCode: 200,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store"
    },
    body: JSON.stringify(payload)
  };
};
