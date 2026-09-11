# Déployer les changements en un clic — mode d'emploi

Cette mise à jour ajoute un bouton **« Déployer sur le jeu »** dans `admin.html` :
en un clic, vos modifications (commerçants, POI, évènements, missions, badges)
sont publiées pour tous les joueurs, sans avoir à exporter/réimporter un fichier
à la main.

Techniquement, ça repose sur trois petites fonctions serveur (dossier
`netlify/functions/`) et sur **Netlify Blobs** (un espace de stockage fourni par
Netlify) pour garder la dernière version publiée. Le mot de passe qui protège
le déploiement n'est **jamais** présent dans le code du site : il vit uniquement
dans une variable d'environnement sur Netlify.

Comme convenu, ceci demande un compte Netlify réel (pas le mode « Drop »
anonyme utilisé jusqu'ici), plus une petite étape de configuration ci-dessous.

## Étape 1 — Un vrai site Netlify (pas juste un « Drop »)

Si votre site actuel a été créé via la page anonyme netlify.com/drop, créez un
compte Netlify (gratuit) sur https://app.netlify.com/signup, puis créez un
nouveau site à partir de ce dossier (voir Étape 2 pour la méthode de dépôt).
Un site créé avec un compte permet de configurer des variables d'environnement
et d'utiliser les fonctions serveur — ce que le mode Drop anonyme ne permet pas.

## Étape 2 — Déployer le dossier (deux méthodes possibles)

**Le dossier contient maintenant un fichier `package.json`** car les fonctions
serveur ont besoin d'une petite dépendance (`@netlify/blobs`). Or votre méthode
habituelle (glisser-déposer le dossier) ne l'installe pas automatiquement.
Deux façons de faire, choisissez celle qui vous convient :

### Option A — Recommandée : relier le site à GitHub

C'est la méthode la plus fiable sur la durée : Netlify installe lui-même la
dépendance à chaque déploiement, vous n'avez plus jamais à y penser.

1. Créez un compte gratuit sur https://github.com si vous n'en avez pas.
2. Créez un nouveau dépôt (repository), par exemple `pokenevers-web`, et
   déposez-y tout le contenu de ce dossier (via l'interface web de GitHub —
   « Add file » → « Upload files » — glissez-y tous les fichiers et dossiers).
3. Sur Netlify : **Add new site → Import an existing project → Deploy with
   GitHub**, choisissez ce dépôt.
4. Laissez les réglages de build par défaut (Netlify détecte tout seul qu'il
   faut installer les dépendances ; vous pouvez laisser la commande de build
   vide et le dossier de publication à `.` — la racine).
5. Cliquez sur Deploy. Netlify installera `@netlify/blobs` et publiera le site
   avec les fonctions actives.

Pour vos futures mises à jour du **code** du jeu (pas du contenu — celui-ci se
met à jour via le bouton Déployer), il suffira de remplacer les fichiers dans
le dépôt GitHub ; Netlify redéploiera automatiquement.

### Option B — Rester en glisser-déposer, avec Node.js installé une fois

Si vous préférez continuer à glisser-déposer le dossier depuis votre
ordinateur (sur la page « Deploys » de votre site, pas sur netlify.com/drop) :

1. Installez Node.js une fois sur votre ordinateur : https://nodejs.org
   (version « LTS », installation classique en cliquant sur « suivant »).
2. Ouvrez un terminal dans ce dossier et lancez : `npm install`
   Cela crée un dossier `node_modules` à côté des autres fichiers.
3. Glissez-déposez **tout le dossier**, `node_modules` inclus, sur la page
   « Deploys » de votre site Netlify (dans votre compte réel, pas Drop
   anonyme).

Si `node_modules` n'est pas présent au moment du dépôt, les fonctions
échoueront (le bouton Déployer et le mot de passe ne fonctionneront pas) —
le jeu, lui, continuera de fonctionner normalement avec le gamedata.json de
secours livré avec le site.

## Étape 3 — Définir le mot de passe (variable d'environnement)

Une fois le site créé avec l'une des deux méthodes ci-dessus :

1. Sur Netlify : **Site settings → Environment variables → Add a variable**.
2. Clé : `ADMIN_PASSWORD` — Valeur : le mot de passe de votre choix (gardez-le
   pour vous, c'est lui qui protège l'admin et le déploiement).
3. Enregistrez, puis redéployez le site (**Deploys → Trigger deploy → Deploy
   site**) pour que la variable soit prise en compte par les fonctions.

Tant que cette variable n'est pas définie, `admin.html` reste accessible sans
mot de passe (un bandeau orange vous le rappelle), et le bouton « Déployer »
répond avec un message d'erreur clair plutôt que d'échouer silencieusement.

## Étape 4 — Tester

1. Ouvrez `admin.html` sur votre site : une page de connexion doit apparaître.
   Entrez le mot de passe défini à l'étape 3.
2. Modifiez un commerçant, cliquez sur **« Déployer sur le jeu »**.
3. Ouvrez `index.html` (ou rafraîchissez-le) : le changement doit apparaître.
4. Le bouton **« Récupérer la version en ligne »** recharge dans l'admin la
   version actuellement publiée (utile si vous rouvrez l'admin sur un autre
   appareil, ou après avoir vidé le cache de votre navigateur).

Comme pour la carte précédemment, cette partie ne peut pas être testée depuis
mon environnement (pas d'accès à Netlify ni à npm) : merci de faire ce test
réel et de me dire précisément ce qui se passe à chaque étape en cas de souci
(message d'erreur exact, capture d'écran si possible).

## En secours

Les boutons **Exporter / Importer un gamedata.json** restent disponibles dans
tous les cas : si le déploiement en un clic ne fonctionne pas encore chez vous,
vous pouvez toujours exporter le fichier et le déposer manuellement à côté
d'`index.html`, comme avant.
