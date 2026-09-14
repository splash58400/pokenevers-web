# Déployer les changements en un clic — mode d'emploi (Cloudflare)

Cette mise à jour ajoute un bouton **« Déployer sur le jeu »** dans `admin.html` :
en un clic, vos modifications (commerçants, POI, évènements, missions, badges)
sont publiées pour tous les joueurs, sans avoir à exporter/réimporter un fichier
à la main.

> **Changement important par rapport à la version précédente de ce guide** :
> le premier essai sur Cloudflare a échoué avec l'erreur *"Asset too large"*
> (148 Mo) — la faute à la structure du projet, pas à vous. En creusant, il
> s'est avéré que Cloudflare a fusionné son ancien produit « Pages » dans un
> nouveau modèle unifié **« Workers avec fichiers statiques »**, différent de
> ce que documentait l'ancienne version de ce guide. Le dossier a été
> réorganisé en conséquence (voir plus bas) : ça ne change rien à l'usage
> quotidien, juste à la structure des fichiers et à la procédure de mise en
> route, à refaire une fois.

Le projet est maintenant organisé ainsi :
- `public/` : tous les fichiers du site tels que le navigateur les reçoit
  (`index.html`, `admin.html`, `manifest.json`, `sw.js`, les icônes).
- `src/worker.js` : un unique petit programme serveur qui gère les 3 actions
  qui ont besoin de code (récupérer les données du jeu, vérifier le mot de
  passe, déployer une mise à jour) — tout le reste est servi directement
  comme fichier statique, sans passer par ce programme.
- `wrangler.jsonc` : le fichier de configuration qui indique à Cloudflare où
  sont les fichiers statiques, quel est le programme serveur, et à quel
  espace de stockage (KV) se connecter.

Le mot de passe qui protège le déploiement n'est **jamais** présent dans le
code du site : il vit uniquement dans une variable chiffrée sur Cloudflare.

## Étape 1 — Créer un compte Cloudflare (gratuit)

Si ce n'est pas déjà fait : https://dash.cloudflare.com/sign-up — aucune
carte bancaire n'est demandée pour le plan gratuit utilisé ici.

## Étape 2 — Créer l'espace de stockage KV (avant tout le reste)

C'est l'endroit où sont enregistrées les données publiées par le bouton
« Déployer ». Il faut le créer en premier car son identifiant doit être écrit
dans un fichier du projet avant de le déposer sur GitHub.

1. Sur le tableau de bord Cloudflare : menu de gauche **Storage & Databases**
   → **KV** → **Create namespace** (ou **Create a namespace**).
2. Donnez-lui un nom, par exemple `pokenevers-kv`, puis validez.
3. Une fois créé, cliquez dessus : notez l'**ID du namespace** affiché (une
   longue suite de lettres/chiffres, ex. `a1b2c3d4e5f6...`).

## Étape 3 — Compléter `wrangler.jsonc`

Dans le dossier du projet, ouvrez `wrangler.jsonc` et remplacez
`REMPLACER_PAR_ID_NAMESPACE_KV` par l'ID noté à l'étape 2 :

```jsonc
"kv_namespaces": [
  {
    "binding": "POKENEVERS_KV",
    "id": "COLLEZ_ICI_L_ID_DE_VOTRE_NAMESPACE"
  }
]
```

Enregistrez le fichier.

## Étape 4 — Déposer le projet sur GitHub

1. Créez un compte gratuit sur https://github.com si vous n'en avez pas.
2. Créez un nouveau dépôt (repository), par exemple `pokenevers-web` (ou
   réutilisez le dépôt existant si vous aviez déjà tenté l'étape Netlify —
   dans ce cas, supprimez d'abord tous les anciens fichiers du dépôt, la
   structure a changé).
3. Déposez-y **le contenu** de ce dossier — `public/`, `src/`,
   `wrangler.jsonc`, `package.json`, `DEPLOIEMENT.md` — en glissant tout ça
   **à l'intérieur** du dépôt via « Add file » → « Upload files » (glissez le
   contenu du dossier, pas le dossier lui-même, sinon tout se retrouve
   imbriqué dans un sous-dossier en trop).

## Étape 5 — Créer le Worker et le relier au dépôt

1. Sur le tableau de bord Cloudflare : menu de gauche **Compute (Workers)** →
   **Workers & Pages** → **Create application** (ou **Create Worker**).
2. Choisissez l'option de déploiement **depuis un dépôt Git** / **Connect to
   Git** (le libellé exact peut varier selon les mises à jour de
   l'interface), puis sélectionnez votre dépôt GitHub.
3. Cloudflare doit détecter automatiquement `wrangler.jsonc` à la racine du
   dépôt et l'utiliser pour la configuration (nom du Worker, fichiers
   statiques, liaison KV) — vous n'avez rien d'autre à remplir à cette étape.
4. Lancez le déploiement.

Si l'interface vous propose de choisir entre « Workers » et « Pages » à un
moment donné : choisissez **Workers** (Pages a été fusionné dedans dans le
nouveau modèle utilisé ici).

## Étape 6 — Définir le mot de passe (variable chiffrée)

1. Une fois le Worker créé : allez dans son onglet **Settings** →
   **Variables and Secrets** (le nom exact peut varier légèrement).
2. **Add** : nom `ADMIN_PASSWORD`, valeur : le mot de passe de votre choix —
   cochez/choisissez le type **Secret** (chiffré) plutôt que texte brut.
3. Enregistrez.

Cette variable est indépendante du fichier `wrangler.jsonc` : elle survit aux
prochains déploiements sans qu'il soit nécessaire de la redéfinir à chaque
fois.

Tant que cette variable n'est pas définie, `admin.html` reste accessible sans
mot de passe (un bandeau orange vous le rappelle), et le bouton « Déployer »
répond avec un message d'erreur clair plutôt que d'échouer silencieusement.

## Étape 7 — Tester

1. Ouvrez `admin.html` sur l'adresse de votre Worker (affichée sur sa page
   Cloudflare, du type `https://pokenevers-web.<vous>.workers.dev/admin.html`) :
   une page de connexion doit apparaître. Entrez le mot de passe défini à
   l'étape 6.
2. Modifiez un commerçant, cliquez sur **« Déployer sur le jeu »**.
3. Ouvrez `index.html` (ou rafraîchissez-le) : le changement doit apparaître.
4. Le bouton **« Récupérer la version en ligne »** recharge dans l'admin la
   version actuellement publiée.

Comme précédemment, cette partie ne peut pas être testée depuis mon
environnement (pas d'accès à Cloudflare) : merci de faire ce test réel et de
me dire précisément ce qui se passe à chaque étape en cas de souci (message
d'erreur exact, capture d'écran si possible).

## Pour vos futures mises à jour

- **Contenu du jeu** (commerçants, POI, évènements, missions, badges) : tout
  se fait depuis `admin.html` via « Déployer sur le jeu », plus besoin de
  repasser par GitHub/Cloudflare.
- **Code du site** (`public/index.html`, `public/admin.html`,
  `src/worker.js`) : mettez à jour les fichiers directement dans le dépôt
  GitHub (via l'interface web, en écrasant les fichiers existants) ;
  Cloudflare redéploie automatiquement à chaque mise à jour du dépôt.

## Clé MapTiler (style de carte personnalisé)

Depuis la Version 17, la carte (jeu et admin) utilise le style MapTiler
« Streets v4 » plutôt que le rendu OpenStreetMap brut. La clé API de votre
compte MapTiler gratuit est écrite en clair dans `public/index.html` et
`public/admin.html` (constante `MAPTILER_KEY`, tout en haut de chaque
fichier) — c'est normal et voulu, une clé MapTiler est faite pour être
visible côté navigateur, ce n'est pas un secret comme le mot de passe admin.

Ce qui protège votre quota gratuit, c'est la **restriction par domaine** à
régler une fois dans votre compte MapTiler (Account → Keys → Allowed URLs) :
autorisez-y uniquement votre adresse `*.workers.dev` (ou votre domaine
personnalisé si vous en avez configuré un). Sans cette restriction,
n'importe qui pourrait repérer la clé dans le code de la page et l'utiliser
ailleurs, consommant votre quota gratuit à votre place.

Pour changer de style de carte plus tard (MapTiler propose plusieurs styles
prêts à l'emploi, ou un éditeur pour en personnaliser un) : remplacez
`streets-v4` par le nom du nouveau style dans les deux fichiers (recherchez
`streets-v4`), directement sur GitHub — pas besoin de repasser par moi pour
un simple changement de style.

## Domaine personnalisé (optionnel)

Cloudflare permet de relier gratuitement un nom de domaine que vous possédez
déjà, à la place de l'adresse `*.workers.dev` (onglet **Domains & Routes** du
Worker, ou **Triggers**).

## En secours

Les boutons **Exporter / Importer un gamedata.json** restent disponibles dans
tous les cas dans l'admin : si le bouton « Déployer sur le jeu » ne
fonctionne pas encore chez vous, vous pouvez exporter une sauvegarde depuis
l'admin, continuer à travailler dessus, puis la réimporter plus tard (via
« Importer un gamedata.json ») pour la publier dès que le déploiement en un
clic fonctionne de nouveau.

Note technique : déposer manuellement un fichier `gamedata.json` dans
`public/` sur GitHub n'a ici aucun effet sur le jeu en ligne — la route
`/gamedata.json` est toujours interceptée en priorité par `src/worker.js`
(qui lit Workers KV, ou les données de démo si KV n'est pas configuré),
quel que soit le contenu du fichier statique du même nom.
