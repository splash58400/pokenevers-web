// v4 : changement de stratégie pour les pages HTML (voir plus bas) — Jérémy a signalé que
// son téléphone continuait d'afficher une ancienne version du jeu après plusieurs mises à
// jour. Cause : la v3 servait index.html/admin.html en "cache d'abord" (comme le reste de
// l'app-shell), donc une fois la page mise en cache une première fois sur un appareil, elle
// n'était plus JAMAIS revérifiée sur le réseau, quel que soit le nombre de déploiements
// suivants — même le renommage du cache lors d'un déploiement ne suffisait qu'une fois,
// puisque après coup le nouveau cache se remplissait à nouveau de façon figée. Changer le
// nom du cache ici force au passage la purge de l'ancien contenu bloqué chez les joueurs
// qui avaient déjà chargé le jeu avant ce correctif.
const CACHE = 'pokenevers-v4';
const APP_SHELL = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(APP_SHELL)));
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
  );
  self.clients.claim();
});

function isHtmlRequest(request, url) {
  // Une navigation de page (adresse tapée, lien, PWA relancée) ou un fichier .html —
  // c'est précisément ce qui doit toujours refléter le dernier déploiement.
  return request.mode === 'navigate' || url.pathname.endsWith('.html') || url.pathname === '/';
}

// Pages HTML (index.html, admin.html, "/") : réseau d'abord, cache seulement en secours
// hors-ligne — c'est ce qui garantit qu'un joueur voit toujours la dernière version publiée
// dès qu'il a du réseau, plutôt que la version qu'il avait chargée la toute première fois.
// gamedata.json suit la même logique, pour la même raison (contenu republié depuis l'admin).
// Le reste de l'app-shell (icônes, manifest — qui ne changent quasiment jamais) : cache
// d'abord, pour un rechargement hors-ligne rapide. Tout le reste (tuiles de carte, polices) :
// on laisse passer directement au réseau, sans mise en cache.
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  const isShell = url.origin === self.location.origin;
  if (!isShell) return; // let tiles/fonts hit the network normally

  if (isHtmlRequest(e.request, url) || url.pathname.endsWith('/gamedata.json')) {
    e.respondWith(
      fetch(e.request)
        .then((res) => {
          // Ne jamais mettre en cache une erreur (404/500/...) : sinon une panne
          // temporaire resterait servie indéfiniment depuis le cache du navigateur,
          // même une fois le vrai problème corrigé côté serveur.
          if (res.ok) {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(e.request, copy));
          }
          return res;
        })
        .catch(() => caches.match(e.request))
    );
    return;
  }

  e.respondWith(
    caches.match(e.request).then((cached) => {
      if (cached) return cached;
      return fetch(e.request)
        .then((res) => {
          // Même précaution ici : une réponse non-OK ne doit jamais être mise en cache.
          if (res.ok) {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(e.request, copy));
          }
          return res;
        })
        .catch(() => cached);
    })
  );
});
