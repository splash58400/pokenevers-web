// POST /verify-password
//
// Vérifie un mot de passe contre la variable d'environnement ADMIN_PASSWORD,
// utilisé uniquement pour l'écran de connexion léger de admin.html (pas une
// vraie sécurité côté client, mais évite un accès "en clair" si l'URL fuite).
"use strict";

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
    return json(500, { error: "ADMIN_PASSWORD non configuré côté serveur." });
  }

  let body;
  try {
    body = await request.json();
  } catch (err) {
    return json(400, { error: "JSON invalide." });
  }

  if (typeof body.password === "string" && body.password === adminPassword) {
    return json(200, { ok: true });
  }
  return json(401, { error: "Mot de passe incorrect." });
}
