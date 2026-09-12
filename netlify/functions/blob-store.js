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
// Contrairement à ce que suggère la documentation Netlify, NETLIFY_SITE_ID
// n'est PAS toujours disponible automatiquement à l'intérieur d'une fonction
// (confirmé en conditions réelles) : les deux valeurs sont donc fournies via
// des variables d'environnement définies à la main sur Netlify.
// - BLOBS_SITE_ID : le "Project ID" / "Site ID" visible dans
//   Project configuration → General → Project information.
// - BLOBS_TOKEN : un "Personal access token" Netlify
//   (User settings → Applications → New access token).
// Voir DEPLOIEMENT.md pour la procédure complète.
"use strict";

const { getStore } = require("@netlify/blobs");

function getConfigError() {
  if (!process.env.BLOBS_SITE_ID) {
    return "La variable d'environnement BLOBS_SITE_ID n'est pas configurée sur Netlify (voir DEPLOIEMENT.md, étape Netlify Blobs).";
  }
  if (!process.env.BLOBS_TOKEN) {
    return "La variable d'environnement BLOBS_TOKEN n'est pas configurée sur Netlify (voir DEPLOIEMENT.md, étape Netlify Blobs).";
  }
  return null;
}

function getConfiguredStore(name) {
  const err = getConfigError();
  if (err) throw new Error(err);
  return getStore(name, {
    siteID: process.env.BLOBS_SITE_ID,
    token: process.env.BLOBS_TOKEN
  });
}

module.exports = { getConfiguredStore, getConfigError };
