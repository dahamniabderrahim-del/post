# Guide de Déploiement Rapide

Ce guide vous permet de déployer rapidement votre application sur différentes plateformes.

## 🚀 Déploiement sur Render.com (Recommandé pour débutants)

### Étape 1 : Préparer le code

1. **Modifier `backend/app.py` pour utiliser les variables d'environnement**
   - Utilisez `app_production.py` comme référence
   - Ou copiez le contenu de `app_production.py` dans `app.py`

2. **Ajouter `Procfile` dans le dossier `backend/`**
   ```
   web: gunicorn app:app --bind 0.0.0.0:$PORT
   ```

3. **Ajouter `runtime.txt` dans le dossier `backend/`**
   ```
   python-3.11.0
   ```

### Étape 2 : Déployer sur Render

1. **Créer un compte sur [Render.com](https://render.com)**

2. **Créer une base de données PostgreSQL**
   - New > PostgreSQL
   - Choisir un nom et une région
   - Noter les informations de connexion

3. **Créer un Web Service pour le Backend**
   - New > Web Service
   - Connecter votre repository GitHub/GitLab
   - Configuration :
     - **Name** : `sig-backend`
     - **🔴 Root Directory** : `backend` ⚠️ **CRITIQUE - Ne pas oublier !**
     - **Environment** : `Python 3`
     - **Build Command** : `pip install -r requirements-prod.txt` ⚠️ **Utilisez requirements-prod.txt, pas requirements.txt seul !**
     - **Start Command** : `gunicorn app:app --bind 0.0.0.0:$PORT`
   
   **⚠️ Erreurs courantes :**
   
   **Erreur ImportError avec psycopg2 (Python 3.13) :**
   - Modifiez `backend/runtime.txt` : `python-3.11.9`
   - Consultez `DEPANNAGE_ERREUR_PSYCOPG2.md`
   
   **Erreur code 127 "gunicorn: commande introuvable" :**
   - Utilisez `pip install -r requirements-prod.txt` dans Build Command
   - Consultez `DEPANNAGE_ERREUR_CODE_127.md`
   
   **Erreur code 2 "requirements.txt not found" :**
   - **Vérifiez que Root Directory = `backend`** (c'est la cause la plus fréquente !)
   - Vérifiez que `app.py` utilise les variables d'environnement (modifié automatiquement)
   - Consultez `RESOLUTION_ERREUR_CODE_2.md` pour la solution rapide
   - Consultez `DEPANNAGE_ERREUR_CODE_2.md` pour plus de détails
   - Variables d'environnement :
     - `DATABASE_URL` : (copié depuis votre base de données Render)
     - `FLASK_ENV` : `production`
     - `ALLOWED_ORIGINS` : `https://votre-frontend.onrender.com`

4. **Créer un Static Site pour le Frontend**
   - New > Static Site
   - Connecter votre repository
   - Configuration :
     - **Root Directory** : `frontend`
     - **Build Command** : `npm install && npm run build`
     - **Publish Directory** : `dist`
   - Variables d'environnement :
     - `VITE_API_URL` : `https://sig-backend.onrender.com`

### Étape 3 : Migrer la base de données

1. **Exporter depuis votre base locale**
   ```bash
   pg_dump -U postgres -h localhost -d pos > backup.sql
   ```

2. **Importer vers Render**
   ```bash
   # Obtenir la commande de connexion depuis Render Dashboard
   psql "postgresql://user:password@host:5432/dbname" < backup.sql
   ```

---

## 🚂 Déploiement sur Railway.app

### Étape 1 : Préparer le code

Même préparation que Render (Procfile, runtime.txt)

### Étape 2 : Déployer

1. **Créer un compte sur [Railway.app](https://railway.app)**

2. **Créer un nouveau projet**
   - New Project > Deploy from GitHub repo

3. **Ajouter PostgreSQL**
   - New > Database > PostgreSQL
   - Railway créera automatiquement `DATABASE_URL`

4. **Déployer le Backend**
   - New > Service > GitHub Repo
   - Root Directory : `backend`
   - Railway détectera automatiquement Python
   - Variables : Utiliser `DATABASE_URL` automatique

5. **Déployer le Frontend**
   - New > Service > GitHub Repo
   - Root Directory : `frontend`
   - Build Command : `npm install && npm run build`
   - Start Command : `npx serve -s dist -l $PORT`

---

## 🌐 Déploiement sur Netlify (Frontend) + Render (Backend)

### Frontend sur Netlify

1. **Créer un compte sur [Netlify.com](https://netlify.com)**

2. **Déployer depuis Git**
   - New site from Git
   - Sélectionner votre repository
   - Configuration :
     - **Base directory** : `frontend`
     - **Build command** : `npm install && npm run build`
     - **Publish directory** : `frontend/dist`

3. **Ajouter `netlify.toml` dans `frontend/`**
   ```toml
   [build]
     command = "npm run build"
     publish = "dist"
   
   [[redirects]]
     from = "/*"
     to = "/index.html"
     status = 200
   ```

4. **Variables d'environnement**
   - Site settings > Environment variables
   - `VITE_API_URL` = URL de votre backend Render

### Backend sur Render

Suivez les instructions de Render ci-dessus.

---

## 📝 Fichiers à créer

### `backend/Procfile`
```
web: gunicorn app:app --bind 0.0.0.0:$PORT
```

### `backend/runtime.txt`
```
python-3.11.0
```

### `frontend/netlify.toml` (si vous utilisez Netlify)
```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

---

## ✅ Checklist de déploiement

- [ ] Code modifié pour utiliser les variables d'environnement
- [ ] `Procfile` créé pour le backend
- [ ] `runtime.txt` créé pour le backend
- [ ] Base de données créée sur la plateforme
- [ ] Variables d'environnement configurées
- [ ] Backend déployé et accessible
- [ ] Frontend déployé et accessible
- [ ] Base de données migrée
- [ ] Tests effectués

---

## 🔧 Dépannage

### Le backend ne démarre pas
- Vérifier les logs sur la plateforme
- Vérifier que `requirements-prod.txt` inclut `gunicorn`
- Vérifier la commande de démarrage dans Procfile

### Le frontend ne charge pas les données
- Vérifier `VITE_API_URL` dans les variables d'environnement
- Vérifier les CORS dans le backend
- Vérifier la console du navigateur

### Erreurs de connexion à la base de données
- Vérifier `DATABASE_URL` ou les variables individuelles
- Vérifier que PostGIS est activé : `CREATE EXTENSION postgis;`

