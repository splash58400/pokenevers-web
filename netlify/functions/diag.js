// GET /.netlify/functions/diag
//
// Outil de diagnostic TEMPORAIRE : n'expose aucune valeur secrète (seulement
// présence/longueur/aperçu de 4 caractères), pour voir ce que la fonction
// voit réellement côté variables d'environnement au moment de l'exécution,
// et pour tester directement l'appel à Netlify Blobs (le même que celui
// utilisé par « Déployer sur le jeu »). À supprimer une fois le problème
// résolu (ce fichier ne doit pas rester en ligne indéfiniment).
"use strict";

const { getConfiguredStore } = require("./blob-store");

function info(value) {
  if (typeof value !== "string" || value.length === 0) {
    return { present: false };
  }
  return { present: true, length: value.length, preview: value.slice(0, 4) + "…" };
}

exports.handler = async function handler(event) {
  if (event.httpMethod !== "GET") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const report = {
    ADMIN_PASSWORD: info(process.env.ADMIN_PASSWORD),
    BLOBS_SITE_ID: info(process.env.BLOBS_SITE_ID),
    BLOBS_TOKEN: info(process.env.BLOBS_TOKEN),
    NETLIFY_BLOBS_TOKEN_ancienne_variable: info(process.env.NETLIFY_BLOBS_TOKEN),
    NETLIFY_SITE_ID_fourni_par_netlify: info(process.env.NETLIFY_SITE_ID),
    NETLIFY_BLOBS_CONTEXT_fourni_par_netlify: info(process.env.NETLIFY_BLOBS_CONTEXT),
    deployContext: process.env.CONTEXT || null,
    nodeVersion: process.version
  };

  // Test réel : on essaie d'appeler Netlify Blobs exactement comme le fait
  // deploy-gamedata.js, pour voir si l'échec vient de la configuration
  // (déjà écartée ci-dessus) ou d'autre chose (jeton invalide/permissions
  // insuffisantes, store inaccessible, etc.).
  try {
    const store = getConfiguredStore("pokenevers");
    const current = await store.get("gamedata", { type: "json" });
    report.blobsTest = {
      ok: true,
      message: current
        ? "Lecture réussie : une version déployée existe déjà dans Blobs."
        : "Lecture réussie : le store répond, mais aucune valeur 'gamedata' n'existe encore (normal si jamais déployé)."
    };
  } catch (err) {
    report.blobsTest = {
      ok: false,
      errorName: err && err.name,
      errorMessage: err && err.message ? err.message : String(err),
      errorStack: err && err.stack ? String(err.stack).split("\n").slice(0, 5) : null
    };
  }

  return {
    statusCode: 200,
    headers: { "content-type": "application/json; charset=utf-8" },
    body: JSON.stringify(report, null, 2)
  };
};
