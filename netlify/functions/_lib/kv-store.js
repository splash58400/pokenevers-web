// Petit helper partagé par les fonctions PokeNevers (Cloudflare Pages Functions).
//
// Contrairement à Netlify Blobs, Cloudflare Workers KV n'a pas de mode
// "automatique" fragile : on relie une liaison KV nommée "POKENEVERS_KV" au
// projet Pages une bonne fois pour toutes (Settings → Functions → KV
// namespace bindings), et cette liaison apparaît alors directement dans
// `context.env.POKENEVERS_KV` pour chaque fonction. Voir DEPLOIEMENT.md
// pour la procédure complète.
"use strict";

const KEY = "gamedata";

export function getConfigError(env) {
  if (!env || !env.POKENEVERS_KV) {
    return "La liaison KV « POKENEVERS_KV » n'est pas configurée sur Cloudflare Pages (voir DEPLOIEMENT.md, étape Workers KV).";
  }
  return null;
}

export async function readGamedata(env) {
  const err = getConfigError(env);
  if (err) throw new Error(err);
  const raw = await env.POKENEVERS_KV.get(KEY);
  return raw ? JSON.parse(raw) : null;
}

export async function writeGamedata(env, gamedata) {
  const err = getConfigError(env);
  if (err) throw new Error(err);
  await env.POKENEVERS_KV.put(KEY, JSON.stringify(gamedata));
}
