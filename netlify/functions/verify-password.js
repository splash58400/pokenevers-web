// POST /.netlify/functions/verify-password
//
// Utilisé uniquement par l'écran de connexion de admin.html. Ce n'est PAS une
// vraie sécurité (n'importe qui connaissant l'URL peut appeler cette fonction),
// mais ça évite qu'admin.html soit utilisable "en clair" par quelqu'un qui
// tomberait sur son URL, tant que ADMIN_PASSWORD est configuré sur Netlify.
// Elle réutilise la même variable d'environnement que la fonction de déploiement.
"use strict";

exports.handler = async function handler(event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ ok: false, error: "Method Not Allowed" }) };
  }

  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) {
    return {
      statusCode: 500,
      headers: { "content-type": "application/json; charset=utf-8" },
      body: JSON.stringify({ ok: false, error: "ADMIN_PASSWORD n'est pas configuré." })
    };
  }

  let body;
  try {
    body = JSON.parse(event.body || "{}");
  } catch (err) {
    return { statusCode: 400, headers: { "content-type": "application/json; charset=utf-8" }, body: JSON.stringify({ ok: false }) };
  }

  if (typeof body.password === "string" && body.password === adminPassword) {
    return { statusCode: 200, headers: { "content-type": "application/json; charset=utf-8" }, body: JSON.stringify({ ok: true }) };
  }
  return { statusCode: 401, headers: { "content-type": "application/json; charset=utf-8" }, body: JSON.stringify({ ok: false }) };
};
