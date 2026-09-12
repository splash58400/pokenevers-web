// Petit helper partagé par gamedata.js et deploy-gamedata.js.
//
// La configuration "automatique" de Netlify Blobs (getStore(name) sans rien
// d'autre) est censée fonctionner sans réglage à l'intérieur d'une fonction
// Netlify, mais c'est un point connu et documenté comme peu fiable en
// production (voir les nombreux retours "MissingBlobsEnvironmentError" sur
// answers.netlify.com, y compris sur des sites fraîchement créés et du code
// pourtant correct). On utilise donc le mode "manuel" recommandé par Netlify
// en solution de repli : fournir explicitement siteID + token.
//
// - NETLIFY_SITE_ID est injecté automatiquement par Netlify dans toutes les
//   fonctions (pas besoin de le configurer soi-même).
// - NETLIFY_BLOBS_TOKEN doit être créé une fois par Jérémy : un "Personal
//   access token" Netlify (User settings → Applications → New access token),
//   ajouté comme variable d'environnement du site. Voir DEPLOIEMENT.md.
"use strict";

const { getStore } = require("@netlify/blobs");

function getConfigError() {
  if (!process.env.NETLIFY_SITE_ID) {
    return "NETLIFY_SITE_ID est absent (devrait normalement être fourni automatiquement par Netlify).";
  }
  if (!process.env.NETLIFY_BLOBS_TOKEN) {
    return "La variable d'environnement NETLIFY_BLOBS_TOKEN n'est pas configurée sur Netlify (voir DEPLOIEMENT.md, étape sur Netlify Blobs).";
  }
  return null;
}

function getConfiguredStore(name) {
  const err = getConfigError();
  if (err) throw new Error(err);
  return getStore(name, {
    siteID: process.env.NETLIFY_SITE_ID,
    token: process.env.NETLIFY_BLOBS_TOKEN
  });
}

module.exports = { getConfiguredStore, getConfigError };
