// GET /gamedata.json
//
// Sert les données de jeu actuelles :
//  - si l'admin a déjà déployé une version via le bouton « Déployer sur le jeu »,
//    on la lit depuis Workers KV ;
//  - sinon (ou en cas de souci avec KV), on retombe sur les données de
//    démonstration intégrées, pour que le jeu ne soit jamais cassé.
//
// Le nom de fichier "gamedata.json.js" est important : Cloudflare Pages route
// les fonctions d'après le nom de fichier (extension ".js" retirée), donc ce
// fichier répond bien à l'URL "/gamedata.json" — exactement ce que le jeu
// (index.html) et l'admin appellent déjà, sans aucun changement de leur côté.
"use strict";

import { readGamedata } from "./_lib/kv-store.js";
import { SEED_GAMEDATA } from "./_lib/seed-data.js";

export async function onRequestGet(context) {
  let payload = SEED_GAMEDATA;
  try {
    const current = await readGamedata(context.env);
    if (current && typeof current === "object") {
      payload = current;
    }
  } catch (err) {
    // KV indisponible (liaison pas encore configurée, etc.) : on sert les
    // données de démonstration plutôt que de renvoyer une erreur au joueur.
    payload = SEED_GAMEDATA;
  }

  return new Response(JSON.stringify(payload), {
    status: 200,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store"
    }
  });
}
