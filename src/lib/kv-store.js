// Petit helper partagé par le Worker PokeNevers (src/worker.js).
//
// La liaison KV nommée "POKENEVERS_KV" est déclarée dans wrangler.jsonc
// (clé "kv_namespaces"), et apparaît alors directement dans
// `env.POKENEVERS_KV` à l'intérieur du Worker. Voir DEPLOIEMENT.md pour la
// procédure complète (création du namespace, récupération de son ID).
"use strict";

const KEY = "gamedata";

export function getConfigError(env) {
  if (!env || !env.POKENEVERS_KV) {
    return "La liaison KV « POKENEVERS_KV » n'est pas configurée (voir DEPLOIEMENT.md, étape Workers KV).";
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
