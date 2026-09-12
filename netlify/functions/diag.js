// GET /.netlify/functions/diag
//
// Outil de diagnostic TEMPORAIRE : n'expose aucune valeur secrète (seulement
// présence/longueur/aperçu de 4 caractères), pour voir ce que la fonction
// voit réellement côté variables d'environnement au moment de l'exécution.
// Utile pour déboguer l'échec persistant de Netlify Blobs malgré une
// configuration en apparence correcte. À supprimer une fois le problème
// résolu (ce fichier ne doit pas rester en ligne indéfiniment).
"use strict";

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

  return {
    statusCode: 200,
    headers: { "content-type": "application/json; charset=utf-8" },
    body: JSON.stringify(report, null, 2)
  };
};
