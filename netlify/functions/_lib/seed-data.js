// Données de démonstration intégrées directement (pas de fichier externe à charger),
// utilisées par gamedata.json.js tant que rien n'a encore été déployé via
// l'admin (ou en cas de souci avec Workers KV) : le jeu ne doit jamais
// afficher une erreur, il retombe sur ce contenu de démo.
export const SEED_GAMEDATA = {
  "version": 1,
  "updatedAt": "2026-09-11T00:00:00.000Z",
  "merchants": [
    {
      "id": "boulangerie",
      "name": "Boulangerie du Pont",
      "category": "Boulangerie",
      "icon": "bread",
      "rarity": "commun",
      "lat": 46.988714,
      "lon": 3.158675,
      "description": "Une camionnette qui vend du pain chaud au coin de la rue, à l'odeur irrésistible.",
      "image": null,
      "stages": [
        {
          "name": "Le Petit Pain",
          "desc": "Une camionnette qui vend du pain chaud au coin de la rue, à l'odeur irrésistible.",
          "need": 8
        },
        {
          "name": "Boulangerie du Pont",
          "desc": "Une échoppe fixe près du pont de Loire, réputée pour ses viennoiseries du dimanche.",
          "need": 20
        },
        {
          "name": "Fournil Doré",
          "desc": "L'institution du quartier : une file d'attente tous les matins pour sa baguette signature.",
          "need": null
        }
      ],
      "active": true,
      "shiny": {
        "active": false,
        "label": "",
        "color": "#d9a441",
        "expiresAt": ""
      }
    },
    {
      "id": "marche",
      "name": "Étal Ambulant",
      "category": "Marché",
      "icon": "basket",
      "rarity": "commun",
      "lat": 46.991355,
      "lon": 3.161301,
      "description": "Un petit étal de fruits et légumes posé sur une place, replié le soir venu.",
      "image": null,
      "stages": [
        {
          "name": "Étal Ambulant",
          "desc": "Un petit étal de fruits et légumes posé sur une place, replié le soir venu.",
          "need": 8
        },
        {
          "name": "Petit Marché",
          "desc": "Une devanture ouverte sur la rue, avec ses cageots colorés bien rangés.",
          "need": 20
        },
        {
          "name": "Épicerie Renommée",
          "desc": "Le repère des habitués, qui connaît le prénom de chaque client.",
          "need": null
        }
      ],
      "active": true,
      "shiny": {
        "active": false,
        "label": "",
        "color": "#d9a441",
        "expiresAt": ""
      }
    },
    {
      "id": "cafe",
      "name": "Café de la Loire",
      "category": "Café",
      "icon": "coffee",
      "rarity": "commun",
      "lat": 46.991618,
      "lon": 3.160195,
      "description": "Une petite guérite en bois où l'on prend son café en vitesse.",
      "image": null,
      "stages": [
        {
          "name": "Kiosque à Café",
          "desc": "Une petite guérite en bois où l'on prend son café en vitesse.",
          "need": 8
        },
        {
          "name": "Café de la Loire",
          "desc": "Une terrasse avec vue sur le fleuve, parfaite pour observer les passants.",
          "need": 20
        },
        {
          "name": "Salon Doré",
          "desc": "Un salon feutré aux banquettes de velours, célèbre pour son chocolat chaud.",
          "need": null
        }
      ],
      "active": true,
      "shiny": {
        "active": false,
        "label": "",
        "color": "#d9a441",
        "expiresAt": ""
      }
    },
    {
      "id": "fleuriste",
      "name": "Jardin des Halles",
      "category": "Fleuriste",
      "icon": "flower",
      "rarity": "commun",
      "lat": 46.98932,
      "lon": 3.158012,
      "description": "Un seau de tulipes posé sur le trottoir, changé chaque matin.",
      "image": null,
      "stages": [
        {
          "name": "Étal Fleuri",
          "desc": "Un seau de tulipes posé sur le trottoir, changé chaque matin.",
          "need": 8
        },
        {
          "name": "Jardin des Halles",
          "desc": "Une boutique débordante de bouquets, ouverte sur la halle couverte.",
          "need": 20
        },
        {
          "name": "Serre Royale",
          "desc": "Une véritable serre en ville, avec des compositions dignes d'un mariage.",
          "need": null
        }
      ],
      "active": true,
      "shiny": {
        "active": false,
        "label": "",
        "color": "#d9a441",
        "expiresAt": ""
      }
    },
    {
      "id": "fromagerie",
      "name": "Crèmerie de la Place",
      "category": "Fromagerie",
      "icon": "cheese",
      "rarity": "peu-commun",
      "lat": 46.991193,
      "lon": 3.156053,
      "description": "Une glacière ambulante et une petite planche de dégustation.",
      "image": null,
      "stages": [
        {
          "name": "Étal à Fromage",
          "desc": "Une glacière ambulante et une petite planche de dégustation.",
          "need": 10
        },
        {
          "name": "Crèmerie de la Place",
          "desc": "Une vitrine réfrigérée bien garnie, avec plus de trente variétés locales.",
          "need": 25
        },
        {
          "name": "Maître Affineur",
          "desc": "Une cave d'affinage à l'ancienne, gardée comme un secret de famille.",
          "need": null
        }
      ],
      "active": true,
      "shiny": {
        "active": false,
        "label": "",
        "color": "#d9a441",
        "expiresAt": ""
      }
    },
    {
      "id": "chocolatier",
      "name": "Chocolaterie Fine",
      "category": "Chocolatier",
      "icon": "chocolate",
      "rarity": "peu-commun",
      "lat": 46.987646,
      "lon": 3.155697,
      "description": "Un petit comptoir qui embaume le cacao chaud dès l'entrée.",
      "image": null,
      "stages": [
        {
          "name": "Comptoir Cacao",
          "desc": "Un petit comptoir qui embaume le cacao chaud dès l'entrée.",
          "need": 10
        },
        {
          "name": "Chocolaterie Fine",
          "desc": "Un atelier-boutique où l'on voit fondre le chocolat en vitrine.",
          "need": 25
        },
        {
          "name": "Palais du Chocolat",
          "desc": "Une adresse gastronomique, primée pour ses créations originales.",
          "need": null
        }
      ],
      "active": true,
      "shiny": {
        "active": false,
        "label": "",
        "color": "#d9a441",
        "expiresAt": ""
      }
    },
    {
      "id": "librairie",
      "name": "Librairie de la Rue",
      "category": "Librairie",
      "icon": "book",
      "rarity": "peu-commun",
      "lat": 46.988392,
      "lon": 3.155645,
      "description": "Une caisse de livres d'occasion posée sur un tréteau.",
      "image": null,
      "stages": [
        {
          "name": "Bouquiniste",
          "desc": "Une caisse de livres d'occasion posée sur un tréteau.",
          "need": 10
        },
        {
          "name": "Librairie de la Rue",
          "desc": "Une boutique chaleureuse aux étagères qui montent jusqu'au plafond.",
          "need": 25
        },
        {
          "name": "Grand Bibliophile",
          "desc": "Une institution littéraire qui organise des rencontres d'auteurs.",
          "need": null
        }
      ],
      "active": true,
      "shiny": {
        "active": false,
        "label": "",
        "color": "#d9a441",
        "expiresAt": ""
      }
    },
    {
      "id": "caviste",
      "name": "Grand Cru Nivernais",
      "category": "Caviste",
      "icon": "wine",
      "rarity": "rare",
      "lat": 46.988966,
      "lon": 3.156264,
      "description": "Une petite cave discrète nichée sous une maison ancienne.",
      "image": null,
      "stages": [
        {
          "name": "Cave Voûtée",
          "desc": "Une petite cave discrète nichée sous une maison ancienne.",
          "need": 14
        },
        {
          "name": "Grand Cru Nivernais",
          "desc": "Une adresse réputée dans toute la région pour ses conseils avisés.",
          "need": null
        }
      ],
      "active": true,
      "shiny": {
        "active": false,
        "label": "",
        "color": "#d9a441",
        "expiresAt": ""
      }
    },
    {
      "id": "antiquaire",
      "name": "Cabinet de Curiosités",
      "category": "Antiquaire",
      "icon": "antique",
      "rarity": "rare",
      "lat": 46.989421,
      "lon": 3.161232,
      "description": "Un capharnaüm d'objets chinés, entassés jusqu'à la porte.",
      "image": null,
      "stages": [
        {
          "name": "Brocante du Vieux Nevers",
          "desc": "Un capharnaüm d'objets chinés, entassés jusqu'à la porte.",
          "need": 14
        },
        {
          "name": "Cabinet de Curiosités",
          "desc": "Une boutique élégante spécialisée dans la faïence ancienne.",
          "need": null
        }
      ],
      "active": true,
      "shiny": {
        "active": false,
        "label": "",
        "color": "#d9a441",
        "expiresAt": ""
      }
    },
    {
      "id": "faiencerie",
      "name": "Maître Faïencier de Nevers",
      "category": "Faïencerie",
      "icon": "vase",
      "rarity": "legendaire",
      "lat": 46.989183,
      "lon": 3.158366,
      "description": "Le dernier atelier à peindre encore le bleu de Nevers à la main. Extrêmement rare.",
      "image": null,
      "stages": [
        {
          "name": "Maître Faïencier de Nevers",
          "desc": "Le dernier atelier à peindre encore le bleu de Nevers à la main. Extrêmement rare.",
          "need": null
        }
      ],
      "active": true,
      "shiny": {
        "active": false,
        "label": "",
        "color": "#d9a441",
        "expiresAt": ""
      }
    }
  ],
  "pois": [
    {
      "id": "poi_cathedrale",
      "name": "Cathédrale Saint-Cyr",
      "icon": "cathedral",
      "lat": 46.9908,
      "lon": 3.1583,
      "rewardCoinsMin": 2,
      "rewardCoinsMax": 4,
      "rewardXp": 15,
      "active": true
    },
    {
      "id": "poi_palais",
      "name": "Palais Ducal",
      "icon": "palace",
      "lat": 46.9895,
      "lon": 3.1567,
      "rewardCoinsMin": 2,
      "rewardCoinsMax": 4,
      "rewardXp": 15,
      "active": true
    },
    {
      "id": "poi_porte",
      "name": "Porte du Croux",
      "icon": "gate",
      "lat": 46.9875,
      "lon": 3.1558,
      "rewardCoinsMin": 2,
      "rewardCoinsMax": 4,
      "rewardXp": 15,
      "active": true
    },
    {
      "id": "poi_pont",
      "name": "Pont de Loire",
      "icon": "bridge",
      "lat": 46.9875,
      "lon": 3.149,
      "rewardCoinsMin": 2,
      "rewardCoinsMax": 4,
      "rewardXp": 15,
      "active": true
    },
    {
      "id": "poi_halles",
      "name": "Halles du Marché",
      "icon": "stall",
      "lat": 46.989,
      "lon": 3.16,
      "rewardCoinsMin": 2,
      "rewardCoinsMax": 4,
      "rewardXp": 15,
      "active": true
    }
  ],
  "events": [
    {
      "id": "marche-automne",
      "name": "Marché d'Automne",
      "icon": "basket",
      "start": "2026-09-01T00:00:00",
      "end": "2026-09-30T23:59:00",
      "description": "Les étals de Fromagerie et de Marché apparaissent bien plus souvent sur la carte.",
      "bonusType": "none",
      "bonusSpeciesId": "",
      "bonusLabel": "+50% d'apparitions Marché & Fromagerie",
      "active": true
    },
    {
      "id": "dernier-bal",
      "name": "Le Dernier Bal — Nevers Hanté",
      "icon": "star",
      "start": "2026-10-31T00:00:00",
      "end": "2026-11-01T23:59:00",
      "description": "Pour l'évènement Halloween d'ICOO Games à l'Espace des Saules : des versions hantées des commerçants apparaissent en ville.",
      "bonusType": "double_tampons",
      "bonusSpeciesId": "",
      "bonusLabel": "x2 tampons de fidélité sur toutes les captures",
      "active": true
    },
    {
      "id": "inventaire-faience",
      "name": "Grand Inventaire de Faïence",
      "icon": "vase",
      "start": "2026-12-05T00:00:00",
      "end": "2026-12-20T23:59:00",
      "description": "Une saison spéciale où le Maître Faïencier de Nevers se montre bien plus souvent qu'à l'accoutumée.",
      "bonusType": "none",
      "bonusSpeciesId": "",
      "bonusLabel": "Taux d'apparition légendaire boosté",
      "active": true
    }
  ],
  "missions": [],
  "badges": [
    {
      "id": "badge_first",
      "label": "Première capture",
      "icon": "star",
      "description": "Capturez votre premier commerçant.",
      "criteriaType": "captures_count",
      "criteriaValue": 1,
      "active": true
    },
    {
      "id": "badge_five",
      "label": "5 commerçants",
      "icon": "trophy",
      "description": "Capturez 5 commerçants différents.",
      "criteriaType": "captures_count",
      "criteriaValue": 5,
      "active": true
    },
    {
      "id": "badge_all",
      "label": "Collection complète",
      "icon": "compass",
      "description": "Capturez tous les commerçants disponibles.",
      "criteriaType": "all_captured",
      "criteriaValue": null,
      "active": true
    },
    {
      "id": "badge_legend",
      "label": "Trouver le Faïencier",
      "icon": "vase",
      "description": "Capturez le Maître Faïencier de Nevers.",
      "criteriaType": "species_captured",
      "criteriaValue": "faiencerie",
      "active": true
    }
  ]
};
