# Guide d'Hébergement du Frontend React

Ce guide vous explique comment héberger votre frontend React sur Netlify, Vercel ou Render.

## 📋 Préparation : Configuration de l'URL de l'API

Avant de déployer, il faut configurer le frontend pour qu'il utilise l'URL de votre backend en production.

### Étape 1 : Modifier App.jsx et Map.jsx

Les fichiers doivent utiliser une variable d'environnement pour l'URL de l'API.

**Variable à utiliser :** `import.meta.env.VITE_API_URL`

### Étape 2 : Créer un fichier .env.example

Pour documenter la variable nécessaire.

---

## 🚀 Option 1 : Hébergement sur Netlify (Recommandé)

### Préparation

1. **Modifiez le code** pour utiliser `import.meta.env.VITE_API_URL`
2. **Créez un fichier `.env.example`** dans `frontend/`
3. **Le fichier `netlify.toml` existe déjà** ✅

### Déploiement sur Netlify

#### Méthode A : Depuis GitHub (Recommandée)

1. **Créer un compte sur [Netlify.com](https://netlify.com)**

2. **Connecter votre repository**
   - New site from Git
   - Sélectionner GitHub
   - Autoriser Netlify à accéder à votre repository
   - Sélectionner le repository : `dahamniabderrahim-del/post`

3. **Configuration du déploiement**
   - **Site name** : `sig-frontend` (ou laissez Netlify en générer un)
   - **Base directory** : `frontend`
   - **Build command** : `npm install && npm run build`
   - **Publish directory** : `frontend/dist`

4. **Variables d'environnement**
   - Site settings → Environment variables
   - Ajoutez :
     - **Key** : `VITE_API_URL`
     - **Value** : `https://votre-backend.onrender.com`
       - ⚠️ Remplacez par l'URL réelle de votre backend Render

5. **Déployer**
   - Cliquez sur "Deploy site"
   - Netlify construira et déploiera automatiquement

#### Méthode B : Drag & Drop

1. **Construire le frontend localement**
   ```bash
   cd frontend
   npm install
   npm run build
   ```

2. **Sur Netlify**
   - Allez sur votre dashboard
   - Drag & Drop le dossier `frontend/dist`

### Configuration Netlify

Le fichier `frontend/netlify.toml` est déjà configuré :

```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### URL de votre site

Après le déploiement, vous obtiendrez une URL comme :
```
https://sig-frontend.netlify.app
```

Si le nom `sig-frontend` est déjà pris, Netlify ajoutera un suffixe (ex: `sig-frontend-123456`). Vous pouvez aussi utiliser un domaine personnalisé.

---

## 🚀 Option 2 : Hébergement sur Vercel

### Préparation

1. **Modifiez le code** pour utiliser `import.meta.env.VITE_API_URL`
2. **Créez un fichier `vercel.json`** (optionnel)

### Déploiement sur Vercel

#### Méthode A : Depuis GitHub (Recommandée)

1. **Créer un compte sur [Vercel.com](https://vercel.com)**

2. **Connecter votre repository**
   - Import Project
   - Sélectionner GitHub
   - Autoriser Vercel à accéder à votre repository
   - Sélectionner le repository : `dahamniabderrahim-del/post`

3. **Configuration du déploiement**
   - **Root Directory** : `frontend`
   - **Framework Preset** : Vite
   - **Build Command** : `npm run build`
   - **Output Directory** : `dist`
   - **Install Command** : `npm install`

4. **Configuration du site**
   - **Site name** : `sig-frontend` (si disponible, sinon Vercel générera un nom)
   
5. **Variables d'environnement**
   - Settings → Environment Variables
   - Ajoutez :
     - **Key** : `VITE_API_URL`
     - **Value** : `https://votre-backend.onrender.com`
     - **Environment** : Production, Preview, Development (cochez tous)

5. **Déployer**
   - Cliquez sur "Deploy"
   - Vercel construira et déploiera automatiquement

### Configuration Vercel

Créez `frontend/vercel.json` (optionnel) :

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

---

## 🚀 Option 3 : Hébergement sur Render (Static Site)

### Déploiement sur Render

1. **Créer un compte sur [Render.com](https://render.com)**

2. **Créer un nouveau Static Site**
   - New → Static Site
   - Connecter votre repository GitHub

3. **Configuration**
   - **Name** : `sig-frontend`
   - **Root Directory** : `frontend`
   - **Build Command** : `npm install && npm run build`
   - **Publish Directory** : `dist`
   
   Votre site sera accessible à : `https://sig-frontend.onrender.com`

4. **Variables d'environnement**
   - Environment Variables
   - Ajoutez :
     - **Key** : `VITE_API_URL`
     - **Value** : `https://votre-backend.onrender.com`

5. **Déployer**
   - Cliquez sur "Create Static Site"
   - Render construira et déploiera automatiquement

---

## ⚙️ Configuration CORS dans le Backend

⚠️ **Important :** Assurez-vous que votre backend autorise les requêtes depuis votre frontend.

Dans Render → Backend → Settings → Environment Variables :

Ajoutez ou modifiez :
- **Key** : `ALLOWED_ORIGINS`
- **Value** : `https://sig-frontend.netlify.app,https://sig-frontend.vercel.app,https://sig-frontend.onrender.com`
  - (Séparez plusieurs URLs par des virgules)
  - ⚠️ Remplacez par les URLs réelles de votre frontend déployé

---

## 🔍 Vérification après déploiement

1. **Vérifiez que le site charge**
   - Allez sur l'URL de votre frontend

2. **Ouvrez la console du navigateur (F12)**
   - Vérifiez qu'il n'y a pas d'erreurs CORS
   - Vérifiez que les appels API fonctionnent

3. **Testez les fonctionnalités**
   - Chargement des couches
   - Affichage sur la carte
   - Zoom, etc.

---

## 📝 Résumé des URLs à configurer

### Variables d'environnement Frontend

- `VITE_API_URL` = `https://votre-backend.onrender.com`
  - ⚠️ Sans le `/api` à la fin
  - ⚠️ Utilisez `https://` (pas `http://`)

### Variables d'environnement Backend

- `ALLOWED_ORIGINS` = `https://sig-frontend.netlify.app` (ou votre URL réelle)
  - ⚠️ URL complète du frontend
  - Séparez plusieurs URLs par des virgules si nécessaire
  - Exemples :
    - Netlify : `https://sig-frontend.netlify.app`
    - Vercel : `https://sig-frontend.vercel.app`
    - Render : `https://sig-frontend.onrender.com`

---

## 🎯 Checklist de déploiement

- [ ] Code modifié pour utiliser `import.meta.env.VITE_API_URL`
- [ ] URL du backend obtenue depuis Render
- [ ] Frontend déployé sur Netlify/Vercel/Render
- [ ] Variable `VITE_API_URL` configurée dans le frontend
- [ ] Variable `ALLOWED_ORIGINS` configurée dans le backend
- [ ] Site accessible et fonctionnel
- [ ] Console du navigateur sans erreurs CORS

---

## 🚨 Dépannage

### Erreur CORS

**Solution :** Vérifiez que `ALLOWED_ORIGINS` dans le backend inclut l'URL de votre frontend.

### Erreur "Failed to fetch"

**Solution :** Vérifiez que `VITE_API_URL` est correcte et que le backend est accessible.

### Le site charge mais pas les données

**Solution :** 
- Vérifiez la console du navigateur (F12)
- Vérifiez que `VITE_API_URL` est configurée
- Vérifiez que le backend répond : `https://votre-backend.onrender.com/api/health`

---

## 📚 Guides complémentaires

- Configuration du backend : Voir les guides de déploiement backend précédents
- Variables d'environnement : `CONFIGURER_DATABASE_URL.md`

