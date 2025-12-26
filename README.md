# Site Web SIG - Système d'Information Géographique

Application web moderne pour visualiser des couches géospatiales depuis une base de données PostgreSQL, utilisant Flask (backend) et React (frontend) avec OpenLayers.

## 🚀 Fonctionnalités

- Visualisation de couches géospatiales depuis PostgreSQL
- Fond de carte OpenStreetMap (OSM)
- Interface moderne et responsive
- Sélection multiple de couches
- Affichage automatique des limites des couches

## 📋 Prérequis

- Python 3.8+
- Node.js 16+
- PostgreSQL avec PostGIS
- Base de données PostgreSQL configurée (user: postgres, password: Admin123, database: pos)

## 🛠️ Installation

### Backend (Flask)

1. Naviguez vers le dossier backend
2. Créez un environnement virtuel (si nécessaire)
3. Installez les dépendances :
```bash
pip install -r requirements.txt
```

### Frontend (React)

1. Naviguez vers le dossier frontend
2. Installez les dépendances :
```bash
npm install
```

## ▶️ Lancement

### Option 1 : Utiliser les fichiers batch (Windows)

1. **Lancer le serveur Flask** : Double-cliquez sur `start_flask.bat`
2. **Lancer le serveur React** : Double-cliquez sur `start_react.bat`

### Option 2 : Lancer manuellement

**Terminal 1 - Flask :**
```bash
cd backend
python app.py
```

**Terminal 2 - React :**
```bash
cd frontend
npm run dev
```

## 🌐 Accès

- **Frontend** : http://localhost:3000
- **Backend API** : http://localhost:5000

## 📡 API Endpoints

- `GET /api/layers` - Liste toutes les couches disponibles
- `GET /api/layers/<layer_name>/geojson` - Récupère les données d'une couche en GeoJSON
- `GET /api/layers/<layer_name>/bounds` - Récupère les limites d'une couche
- `GET /api/health` - Vérifie l'état de l'API et de la connexion DB

## 🗄️ Configuration de la base de données

Assurez-vous que votre base de données PostgreSQL :
- A PostGIS installé et activé
- Contient des tables avec des colonnes géométriques
- Est accessible avec les identifiants configurés dans `backend/app.py`

## 🎨 Technologies utilisées

- **Backend** : Flask, psycopg2, flask-cors
- **Frontend** : React, Vite, OpenLayers, Axios
- **Cartographie** : OpenStreetMap (OSM)

## 📝 Notes

- Les couches sont automatiquement détectées en recherchant les tables avec des colonnes géométriques
- Le style des couches peut être personnalisé dans `frontend/src/components/Map.jsx`

## 🚀 Déploiement en Production

Pour déployer votre application en production, consultez les guides suivants :

- **[Guide d'Hébergement Complet](GUIDE_HEBERGEMENT.md)** - Guide détaillé étape par étape pour différents types d'hébergement (VPS, Cloud, etc.)
- **[Guide de Déploiement Rapide](DEPLOIEMENT_RAPIDE.md)** - Guide rapide pour déployer sur Render, Railway, Netlify

### Fichiers de configuration pour la production

- `backend/app_production.py` - Version de production de l'API avec support des variables d'environnement
- `backend/.env.example` - Exemple de fichier de configuration
- `backend/gunicorn_config.py` - Configuration Gunicorn pour la production
- `backend/requirements-prod.txt` - Dépendances pour la production (inclut Gunicorn)

