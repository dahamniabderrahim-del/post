# 📚 Guide Complet des Fonctionnalités - Site Web SIG

## 🌐 Vue d'ensemble

Ce site est une application web de **Système d'Information Géographique (SIG)** permettant de visualiser et d'analyser des données géospatiales stockées dans une base de données PostgreSQL avec PostGIS. L'application utilise **Flask** pour le backend et **React** avec **OpenLayers** pour le frontend.

---

## 🎯 Fonctionnalités Principales

### 1. 📊 Visualisation de Couches Géospatiales

#### Description
L'application charge automatiquement toutes les tables de la base de données PostgreSQL qui contiennent des colonnes géométriques (géométries PostGIS).

#### Fonctionnalités :
- **Détection automatique** : Toutes les tables avec des colonnes géométriques sont détectées automatiquement
- **Affichage multiple** : Possibilité d'afficher plusieurs couches simultanément sur la carte
- **Projection automatique** : Conversion automatique des coordonnées (EPSG:4326 vers EPSG:3857)
- **Types de géométries supportés** :
  - Points et MultiPoints
  - LineString et MultiLineString
  - Polygon et MultiPolygon

#### Utilisation :
1. Les couches disponibles apparaissent dans le panneau latéral gauche
2. Cochez la case à côté du nom de la couche pour l'afficher
3. Décochez pour la masquer

---

### 2. 🎨 Personnalisation des Couleurs

#### Description
Chaque couche peut être stylisée avec une couleur personnalisée pour une meilleure différenciation visuelle.

#### Fonctionnalités :
- **Sélecteur de couleur** : Palette de 24 couleurs prédéfinies
- **Couleur personnalisée** : Input HTML5 pour choisir n'importe quelle couleur
- **Application automatique** : La couleur est appliquée immédiatement sur la carte
- **Style adaptatif** : Le style change selon le type de géométrie :
  - **Points** : Cercles colorés avec bordure blanche
  - **Lignes** : Traits colorés de 5px de largeur
  - **Polygones** : Contours colorés avec remplissage semi-transparent (40% d'opacité)

#### Utilisation :
1. Cliquez sur le bouton de couleur (palette) à côté du nom de la couche
2. Choisissez une couleur dans la palette ou utilisez le sélecteur personnalisé
3. La couleur est appliquée automatiquement

---

### 3. 🔍 Zoom sur Couche

#### Description
Permet de centrer et zoomer automatiquement sur une couche sélectionnée pour voir toutes ses entités.

#### Fonctionnalités :
- **Calcul automatique des limites** : Les limites (bounding box) de la couche sont calculées automatiquement
- **Zoom adaptatif** : Le niveau de zoom s'ajuste pour afficher toute la couche
- **Animation fluide** : Transition animée vers la zone (1 seconde)
- **Padding intelligent** : Espace de 50px autour de la zone pour une meilleure visibilité

#### Utilisation :
1. Cliquez sur le bouton de zoom (loupe) à côté du nom de la couche
2. La carte centre et zoome automatiquement sur cette couche

---

### 4. 🗺️ Fond de Carte Interchangeable

#### Description
Permet de basculer entre deux types de fonds de carte pour une meilleure contextualisation.

#### Fonctionnalités :
- **OpenStreetMap (OSM)** : Fond de carte routier et géographique standard
- **Imagerie Satellite** : Fond de carte satellite via ArcGIS World Imagery
- **Basculement instantané** : Changement immédiat du fond de carte
- **Conservation des couches** : Les couches vectorielles restent visibles lors du changement

#### Utilisation :
1. Cliquez sur le bouton de basculement de couches en haut à gauche de la carte
2. Le fond de carte alterne entre OSM et Satellite

---

### 5. 📏 Outil de Mesure de Distance

#### Description
Permet de mesurer des distances entre des points sur la carte en utilisant des calculs géodésiques précis.

#### Fonctionnalités :
- **Mesure géodésique** : Utilise la formule de Haversine pour des calculs précis sur la sphère terrestre
- **Mesures multiples** : Possibilité de faire plusieurs mesures
- **Affichage en temps réel** : La distance s'affiche pendant le dessin
- **Unités adaptatives** :
  - Centimètres (cm) pour les petites distances
  - Mètres (m) pour les distances moyennes
  - Kilomètres (km) pour les grandes distances
- **Visualisation** : Ligne rouge avec style en pointillés pendant le dessin
- **Total cumulatif** : Affiche la somme de toutes les distances mesurées

#### Utilisation :
1. Cliquez sur le bouton "Distance" dans la barre d'outils de mesure
2. Cliquez sur la carte pour commencer la mesure
3. Cliquez à nouveau pour ajouter des points
4. Double-cliquez pour terminer la mesure
5. La distance s'affiche le long de la ligne
6. Pour arrêter l'outil, cliquez à nouveau sur le bouton "Distance"

---

### 6. 📐 Outil de Mesure de Surface

#### Description
Permet de mesurer des surfaces (aires) de polygones sur la carte avec calculs géodésiques.

#### Fonctionnalités :
- **Calcul géodésique précis** : Utilise plusieurs méthodes pour garantir la précision :
  - Méthode OpenLayers (getArea)
  - Méthode de l'excès sphérique
  - Méthode de Girard
  - Méthode des trapèzes
- **Moyenne des méthodes** : Combine les résultats pour une précision maximale
- **Mesures multiples** : Possibilité de mesurer plusieurs surfaces
- **Affichage en temps réel** : La surface s'affiche après le dessin
- **Unités adaptatives** :
  - Mètres carrés (m²) pour les petites surfaces
  - Hectares (ha) pour les surfaces moyennes
  - Kilomètres carrés (km²) pour les grandes surfaces
- **Visualisation** : Polygone rouge avec remplissage semi-transparent
- **Total cumulatif** : Affiche la somme de toutes les surfaces mesurées

#### Utilisation :
1. Cliquez sur le bouton "Surface" dans la barre d'outils de mesure
2. Cliquez sur la carte pour commencer à dessiner le polygone
3. Cliquez plusieurs fois pour définir les sommets
4. Double-cliquez pour fermer et terminer le polygone
5. La surface s'affiche au centre du polygone
6. Pour arrêter l'outil, cliquez à nouveau sur le bouton "Surface"

---

### 7. 🧹 Effacement des Mesures

#### Description
Permet de supprimer toutes les mesures (distances et surfaces) de la carte.

#### Fonctionnalités :
- **Suppression complète** : Efface toutes les mesures affichées
- **Rafraîchissement automatique** : La carte se met à jour immédiatement

#### Utilisation :
1. Cliquez sur le bouton "Effacer" dans la barre d'outils de mesure
2. Toutes les mesures sont supprimées de la carte

---

### 8. 🔎 Filtrage des Entités

#### Description
Permet de filtrer les entités d'une couche selon des critères définis sur les attributs.

#### Fonctionnalités :
- **Sélection de couche** : Choisir parmi les couches actuellement affichées
- **Sélection de colonne** : Choisir parmi les attributs (colonnes) de la couche
- **Opérateurs de filtrage** :
  - `=` (Égal à)
  - `≠` (Différent de)
  - `>` (Supérieur à)
  - `<` (Inférieur à)
  - `≥` (Supérieur ou égal à)
  - `≤` (Inférieur ou égal à)
  - `LIKE` (Contient - recherche partielle)
  - `NOT LIKE` (Ne contient pas)
- **Valeur de filtre** : Saisie libre de la valeur à rechercher
- **Application en temps réel** : Les filtres sont appliqués immédiatement
- **Effet visuel** : Les entités filtrées clignotent en jaune vif pour être facilement identifiables
- **Rechargement automatique** : La couche est rechargée avec les nouveaux filtres

#### Utilisation :
1. Cliquez sur le bouton "Filtre" en haut à droite de la carte
2. Sélectionnez une couche dans le menu déroulant
3. Sélectionnez une colonne (attribut) à filtrer
4. Choisissez un opérateur de comparaison
5. Saisissez la valeur à rechercher
6. Cliquez sur "Appliquer"
7. Les entités correspondantes s'affichent en clignotement jaune
8. Cliquez sur "Effacer" pour retirer le filtre

#### Exemples de filtres :
- Trouver tous les bâtiments avec `nom = "Mairie"`
- Trouver toutes les routes avec `type LIKE "%Autoroute%"`
- Trouver toutes les parcelles avec `surface > 1000`

---

### 9. 📍 Consultation des Attributs d'Entité

#### Description
Permet de visualiser toutes les informations (attributs) d'une entité géographique en cliquant dessus.

#### Fonctionnalités :
- **Popup interactif** : Fenêtre contextuelle affichant les informations
- **Affichage de tous les attributs** : Toutes les propriétés non-géométriques sont affichées
- **Formatage intelligent** :
  - Nombres formatés avec séparateurs de milliers
  - Dates formatées automatiquement
  - Types de données identifiés (nombre, texte, booléen, date)
- **Positionnement dynamique** : Le popup suit l'entité lors du zoom et du déplacement
- **Adaptation à l'écran** : Le popup s'ajuste pour rester visible
- **Informations de contexte** :
  - Type de géométrie (Point, LineString, Polygon, etc.)
  - Nom de la couche d'origine
- **Fermeture facile** : Bouton X pour fermer le popup

#### Utilisation :
1. Assurez-vous qu'aucun outil de mesure n'est actif
2. Cliquez sur une entité (point, ligne ou polygone) sur la carte
3. Un popup s'affiche avec toutes les informations de l'entité
4. Cliquez sur le X ou cliquez ailleurs pour fermer

---

### 10. 🗄️ Gestion de Base de Données

#### Description
Connexion et interaction avec une base de données PostgreSQL/PostGIS.

#### Fonctionnalités Backend :
- **Connexion automatique** : Connexion à PostgreSQL au démarrage
- **Détection de tables** : Recherche automatique des tables avec colonnes géométriques
- **Conversion GeoJSON** : Conversion automatique des données PostGIS en GeoJSON
- **Gestion de projections** : Conversion automatique des systèmes de coordonnées (SRID)
- **Filtrage côté serveur** : Les filtres sont appliqués dans la requête SQL pour optimiser les performances
- **Limite de sécurité** : Limite de 10 000 entités par requête pour éviter les surcharges

#### Configuration :
- **Hôte** : localhost
- **Port** : 5432
- **Base de données** : pos
- **Utilisateur** : postgres
- **Mot de passe** : Admin123

*Note : La configuration peut être modifiée dans `backend/app.py`*

---

## 🔌 API Backend (Endpoints)

### 1. `GET /api/layers`
Récupère la liste de toutes les couches (tables) disponibles.

**Réponse** :
```json
[
  {
    "name": "nom_table",
    "schema": "public"
  }
]
```

---

### 2. `GET /api/layers/<layer_name>/geojson`
Récupère les données d'une couche au format GeoJSON.

**Paramètres de requête (optionnels)** :
- `column` : Nom de la colonne à filtrer
- `operator` : Opérateur de comparaison (=, !=, >, <, >=, <=, LIKE, NOT LIKE)
- `value` : Valeur à rechercher

**Réponse** :
```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "geometry": {...},
      "properties": {...}
    }
  ]
}
```

---

### 3. `GET /api/layers/<layer_name>/bounds`
Récupère les limites (bounding box) d'une couche.

**Réponse** :
```json
{
  "minx": -8.7,
  "miny": 19.0,
  "maxx": 11.9,
  "maxy": 37.1
}
```

---

### 4. `GET /api/health`
Vérifie l'état de l'API et de la connexion à la base de données.

**Réponse** :
```json
{
  "status": "healthy",
  "database": "connected"
}
```

---

### 5. `GET /api/test/<layer_name>`
Endpoint de test pour déboguer une couche spécifique.

**Réponse** :
```json
{
  "table_exists": true,
  "row_count": 150,
  "geometry_column": "geom"
}
```

---

## 🎛️ Interface Utilisateur

### Panneau Latéral (Sidebar)
- **En-tête de base de données** : Affiche le nom de la base de données connectée
- **Liste des couches** : Toutes les couches disponibles avec :
  - Case à cocher pour activer/désactiver
  - Sélecteur de couleur
  - Bouton de zoom

### Carte Principale
- **Contrôles de navigation** : Zoom, panoramique (drag), rotation
- **Outils de mesure** : Boutons pour mesurer distances et surfaces
- **Filtre** : Panneau de filtrage des entités
- **Basculeur de fond** : Bouton pour changer le fond de carte

---

## ⚙️ Fonctionnalités Techniques

### Sécurité
- **Protection SQL Injection** : Les valeurs de filtres sont échappées
- **Validation des colonnes** : Seules les colonnes existantes peuvent être filtrées
- **Limites de requête** : Limite de 10 000 entités par requête

### Performance
- **Chargement paresseux** : Les couches ne sont chargées que lorsqu'elles sont activées
- **Cache des couches** : Les couches déjà chargées ne sont pas rechargées sauf si nécessaire
- **Projection efficace** : Conversion optimisée des coordonnées

### Gestion des Erreurs
- **Gestion des connexions** : Reconnexion automatique en cas d'erreur
- **Messages d'erreur** : Affichage clair des erreurs dans la console
- **Fallback** : Valeurs par défaut en cas d'erreur (ex: SRID 4326)

---

## 🚀 Démarrage Rapide

### Prérequis
- Python 3.8+
- Node.js 16+
- PostgreSQL avec PostGIS
- Base de données configurée

### Installation

1. **Backend** :
```bash
cd backend
pip install -r requirements.txt
```

2. **Frontend** :
```bash
cd frontend
npm install
```

### Lancement

**Option 1 - Fichiers Batch (Windows)** :
- Double-cliquer sur `start_flask.bat`
- Double-cliquer sur `start_react.bat`

**Option 2 - Manuel** :
```bash
# Terminal 1
cd backend
python app.py

# Terminal 2
cd frontend
npm run dev
```

### Accès
- **Frontend** : http://localhost:3000 (ou le port indiqué par Vite)
- **Backend API** : http://localhost:5000

---

## 📝 Notes Importantes

1. **Projection par défaut** : La carte utilise EPSG:3857 (Web Mercator) pour l'affichage
2. **Données** : Les données doivent être en EPSG:4326 ou compatibles dans PostgreSQL
3. **Performance** : Pour de très grandes couches (>10 000 entités), considérez l'utilisation de tuiles vectorielles
4. **Filtres** : Les filtres sont appliqués côté serveur pour optimiser les performances
5. **Mesures** : Les mesures utilisent des calculs géodésiques précis (Haversine, formules sphériques)

---

## 🔧 Personnalisation

### Modifier les couleurs par défaut
Éditez `frontend/src/components/ColorPicker.jsx` pour changer la palette de couleurs.

### Modifier le style des couches
Éditez `frontend/src/components/Map.jsx` dans la fonction `styleFunction` pour personnaliser l'apparence.

### Ajouter des opérateurs de filtre
Modifiez `backend/app.py` dans la route `/api/layers/<layer_name>/geojson` pour ajouter de nouveaux opérateurs.

---

## 📞 Support

Pour toute question ou problème, consultez :
- Les logs de la console du navigateur (F12)
- Les logs du serveur Flask dans le terminal
- La console PostgreSQL pour les erreurs de base de données

---

**Version du guide** : 1.0  
**Date** : 2024  
**Application** : Site Web SIG - Visualisation de données géospatiales PostgreSQL

