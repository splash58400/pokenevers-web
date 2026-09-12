# Déployer les changements en un clic — mode d'emploi (Cloudflare Pages)

Cette mise à jour ajoute un bouton **« Déployer sur le jeu »** dans `admin.html` :
en un clic, vos modifications (commerçants, POI, évènements, missions, badges)
sont publiées pour tous les joueurs, sans avoir à exporter/réimporter un fichier
à la main.

Techniquement, ça repose sur trois petites fonctions serveur (dossier
`functions/`) et sur **Cloudflare Workers KV** (un espace de stockage clé/valeur
fourni gratuitement par Cloudflare) pour garder la dernière version publiée.
Le mot de passe qui protège le déploiement n'est **jamais** présent dans le
code du site : il vit uniquement dans une variable d'environnement sur
Cloudflare.

> **Pourquoi Cloudflare et pas Netlify ?** Le projet a d'abord été mis en
> route sur Netlify, mais son compte gratuit s'est retrouvé bloqué par un
> système de « crédits opérationnels » qui met en pause les déploiements
> (souci assez répandu sur les comptes gratuits Netlify courant 2026).
> Cloudflare Pages a un plan gratuit sans ce genre de blocage : 100 000
> requêtes/jour et 1000 écritures KV/jour offertes, largement suffisant pour
> ce projet, sans risque de facturation surprise puisqu'aucune carte
> bancaire n'est même demandée à l'inscription.

Ce projet ne nécessite **aucune dépendance npm** (contrairement à la version
Netlify) : pas de `package.json`, pas d'installation à faire, juste les
fichiers du dossier tels quels.

## Étape 1 — Créer un compte Cloudflare (gratuit)

Si vous n'en avez pas : https://dash.cloudflare.com/sign-up — aucune carte
bancaire n'est demandée pour le plan gratuit utilisé ici.

## Étape 2 — Déposer le projet sur GitHub

1. Créez un compte gratuit sur https://github.com si vous n'en avez pas.
2. Créez un nouveau dépôt (repository), par exemple `pokenevers-web`.
3. Déposez-y **le contenu** de ce dossier (via « Add file » → « Upload files »
   sur GitHub — glissez tous les fichiers et dossiers **à l'intérieur** du
   dossier, pas le dossier lui-même, sinon tout se retrouve imbriqué dans un
   sous-dossier en trop et Cloudflare ne trouve plus les fichiers).

## Étape 3 — Créer le projet Cloudflare Pages

1. Sur le tableau de bord Cloudflare : menu de gauche **Workers & Pages** →
   **Create application** → onglet **Pages** → **Connect to Git**.
2. Choisissez votre dépôt GitHub (`pokenevers-web`), autorisez l'accès si
   demandé.
3. Réglages de build :
   - **Framework preset** : `None`
   - **Build command** : laissez vide
   - **Build output directory** : `/` (la racine — c'est un site statique,
     aucune étape de build n'est nécessaire)
4. Cliquez sur **Save and Deploy**. Au bout de quelques secondes, votre site
   est en ligne sur une adresse du type `pokenevers-web.pages.dev`.

À ce stade, le jeu (`index.html`) et l'admin (`admin.html`) sont déjà en
ligne, mais le mot de passe et le bouton « Déployer » ne fonctionnent pas
encore — il manque les deux réglages ci-dessous.

## Étape 4 — Définir le mot de passe (variable d'environnement)

1. Dans votre projet Pages : **Settings → Environment variables**.
2. **Add variable** : nom `ADMIN_PASSWORD`, valeur : le mot de passe de votre
   choix (gardez-le pour vous, c'est lui qui protège l'admin et le
   déploiement). Cochez bien l'environnement **Production** (et Preview si
   vous voulez aussi tester sur les déploiements de prévisualisation).
3. Enregistrez.

Tant que cette variable n'est pas définie, `admin.html` reste accessible sans
mot de passe (un bandeau orange vous le rappelle), et le bouton « Déployer »
répond avec un message d'erreur clair plutôt que d'échouer silencieusement.

## Étape 5 — Créer et relier l'espace de stockage Workers KV

C'est l'endroit où sont enregistrées les données publiées par le bouton
« Déployer ».

1. Sur le tableau de bord Cloudflare : **Workers & Pages** → onglet
   **KV** (dans le menu de gauche, sous « Storage & Databases ») → **Create
   namespace**.
2. Donnez-lui un nom, par exemple `pokenevers-kv`, puis **Add**.
3. Retournez dans votre projet Pages → **Settings → Functions** → section
   **KV namespace bindings** → **Add binding**.
4. Renseignez :
   - **Variable name** : `POKENEVERS_KV` **(exactement ce nom, en
     majuscules)** — c'est le nom que le code utilise pour retrouver le
     stockage.
   - **KV namespace** : sélectionnez `pokenevers-kv` (créé à l'étape 2).
5. Enregistrez.

## Étape 6 — Redéployer pour appliquer les réglages

Les variables d'environnement et les liaisons KV ne s'appliquent qu'aux
**nouveaux** déploiements, pas à ceux déjà en ligne :

1. Onglet **Deployments** de votre projet Pages.
2. Sur le dernier déploiement : menu **⋯** → **Retry deployment** (ou faites
   n'importe quel petit changement dans le dépôt GitHub, ce qui déclenche
   automatiquement un nouveau déploiement).
3. Attendez le statut **Success**.

## Étape 7 — Tester

1. Ouvrez `admin.html` sur votre site (`https://<votre-projet>.pages.dev/admin.html`) :
   une page de connexion doit apparaître. Entrez le mot de passe défini à
   l'étape 4.
2. Modifiez un commerçant, cliquez sur **« Déployer sur le jeu »**.
3. Ouvrez `index.html` (ou rafraîchissez-le) : le changement doit apparaître.
4. Le bouton **« Récupérer la version en ligne »** recharge dans l'admin la
   version actuellement publiée (utile si vous rouvrez l'admin sur un autre
   appareil, ou après avoir vidé le cache de votre navigateur).

Comme précédemment, cette partie ne peut pas être testée depuis mon
environnement (pas d'accès à Cloudflare) : merci de faire ce test réel et de
me dire précisément ce qui se passe à chaque étape en cas de souci (message
d'erreur exact, capture d'écran si possible).

## Pour vos futures mises à jour

- **Contenu du jeu** (commerçants, POI, évènements, missions, badges) : tout
  se fait depuis `admin.html` via « Déployer sur le jeu », plus besoin de
  repasser par GitHub/Cloudflare.
- **Code du site** (`index.html`, `admin.html`, fonctions serveur) : mettez à
  jour les fichiers directement dans le dépôt GitHub (via l'interface web, en
  écrasant les fichiers existants) ; Cloudflare Pages redéploie
  automatiquement à chaque mise à jour du dépôt.

## Domaine personnalisé (optionnel)

Si vous voulez une adresse plus mémorable que `*.pages.dev`, Cloudflare Pages
permet de relier un nom de domaine que vous possédez déjà, gratuitement
(**Custom domains** dans les réglages du projet).

## En secours

Les boutons **Exporter / Importer un gamedata.json** restent disponibles dans
tous les cas dans l'admin : si le bouton « Déployer sur le jeu » ne
fonctionne pas encore chez vous, vous pouvez exporter une sauvegarde depuis
l'admin, continuer à travailler dessus, puis la réimporter plus tard (via
« Importer un gamedata.json ») pour la publier dès que le déploiement en un
clic fonctionne de nouveau.

Note technique : contrairement à la version Netlify, déposer manuellement un
fichier `gamedata.json` sur GitHub n'a ici aucun effet sur le jeu en ligne —
la fonction `/gamedata.json` répond toujours en priorité (elle lit Workers
KV, ou les données de démo si KV n'est pas configuré), quel que soit le
contenu d'un éventuel fichier statique du même nom dans le dépôt.
