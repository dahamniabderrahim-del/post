# Résumé : Configuration des URLs

## 🌐 URLs à configurer

### Frontend (Site Statique)

**Nom du site :** `sig-frontend`

**URLs possibles selon la plateforme :**
- Netlify : `https://sig-frontend.netlify.app`
- Vercel : `https://sig-frontend.vercel.app`
- Render : `https://sig-frontend.onrender.com`

⚠️ **Note :** Si le nom est déjà pris, la plateforme ajoutera un suffixe (ex: `sig-frontend-123456`)

### Backend (API)

**Nom du service :** `sig-backend` (ou le nom que vous avez donné)

**URL :** `https://votre-backend.onrender.com`
- ⚠️ Remplacez par l'URL réelle de votre backend Render

---

## 📝 Variables d'environnement à configurer

### Dans le Frontend (Netlify/Vercel/Render)

**Variable :** `VITE_API_URL`

**Valeur :** `https://votre-backend.onrender.com`
- ⚠️ Sans le `/api` à la fin
- ⚠️ Utilisez `https://` (pas `http://`)
- ⚠️ Remplacez par l'URL réelle de votre backend

**Exemple :**
```
VITE_API_URL=https://sig-backend-abc123.onrender.com
```

### Dans le Backend (Render)

**Variable :** `ALLOWED_ORIGINS`

**Valeur :** `https://sig-frontend.netlify.app`
- ⚠️ URL complète du frontend
- Séparez plusieurs URLs par des virgules si vous déployez sur plusieurs plateformes

**Exemples :**
```
# Une seule URL (Netlify)
ALLOWED_ORIGINS=https://sig-frontend.netlify.app

# Plusieurs URLs (Netlify + Vercel)
ALLOWED_ORIGINS=https://sig-frontend.netlify.app,https://sig-frontend.vercel.app

# Plusieurs URLs (toutes les plateformes)
ALLOWED_ORIGINS=https://sig-frontend.netlify.app,https://sig-frontend.vercel.app,https://sig-frontend.onrender.com
```

---

## ✅ Checklist de configuration

### Backend Render

- [ ] Service backend créé et déployé
- [ ] URL du backend obtenue (ex: `https://sig-backend-abc123.onrender.com`)
- [ ] Variable `DATABASE_URL` configurée
- [ ] Variable `ALLOWED_ORIGINS` configurée avec l'URL du frontend
- [ ] Backend accessible : `https://votre-backend.onrender.com/api/health`

### Frontend (Netlify/Vercel/Render)

- [ ] Site statique créé (nom: `sig-frontend`)
- [ ] Repository GitHub connecté
- [ ] Configuration correcte (Base directory: `frontend`, Build: `npm run build`, Publish: `dist`)
- [ ] Variable `VITE_API_URL` configurée avec l'URL du backend
- [ ] Site déployé et accessible
- [ ] URL du frontend notée

### Vérification finale

- [ ] `ALLOWED_ORIGINS` dans le backend contient l'URL réelle du frontend
- [ ] `VITE_API_URL` dans le frontend contient l'URL réelle du backend
- [ ] Site frontend charge correctement
- [ ] Les données se chargent depuis le backend (pas d'erreurs CORS)
- [ ] Console du navigateur (F12) sans erreurs

---

## 🔍 Comment obtenir les URLs

### Backend Render

1. Allez dans votre service backend sur Render
2. L'URL est affichée en haut de la page
3. Format : `https://[nom-du-service].onrender.com`

### Frontend Netlify

1. Allez dans votre site sur Netlify
2. L'URL est affichée en haut de la page
3. Format : `https://[nom-du-site].netlify.app`

### Frontend Vercel

1. Allez dans votre projet sur Vercel
2. L'URL est affichée dans les déploiements
3. Format : `https://[nom-du-projet].vercel.app`

### Frontend Render

1. Allez dans votre service statique sur Render
2. L'URL est affichée en haut de la page
3. Format : `https://[nom-du-service].onrender.com`

---

## 🚨 Dépannage

### Erreur CORS

**Cause :** `ALLOWED_ORIGINS` ne contient pas l'URL exacte du frontend

**Solution :**
1. Vérifiez l'URL exacte de votre frontend
2. Mettez à jour `ALLOWED_ORIGINS` avec cette URL exacte
3. Redéployez le backend

### Erreur "Failed to fetch"

**Cause :** `VITE_API_URL` est incorrecte ou le backend n'est pas accessible

**Solution :**
1. Vérifiez que `VITE_API_URL` contient l'URL correcte du backend
2. Testez le backend directement : `https://votre-backend.onrender.com/api/health`
3. Vérifiez que le backend est en ligne (pas "Paused")

### Le frontend charge mais pas les données

**Cause :** Problème de configuration des variables d'environnement

**Solution :**
1. Vérifiez la console du navigateur (F12)
2. Vérifiez que `VITE_API_URL` est correcte
3. Vérifiez que `ALLOWED_ORIGINS` contient l'URL du frontend
4. Redéployez frontend et backend














