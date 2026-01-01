# ⚠️ CORRECTION IMPORTANTE : VITE_API_URL

## 🔴 Erreur identifiée

Vous avez mis l'URL de la base de données PostgreSQL dans `VITE_API_URL`, mais c'est **incorrect** !

**Ce que vous avez mis :**
```
postgresql://backend:o421xTuVDOuHTogm2kVcYKo1VckB9ykM@dpg-d57e3n0gjchc739i6de0-a.oregon-postgres.render.com/backend_bzzj
```

**❌ C'est l'URL de la BASE DE DONNÉES, pas du backend API !**

## ✅ Correction nécessaire

### VITE_API_URL doit contenir l'URL du BACKEND (service Flask)

**Exemple correct :**
```
https://sig-backend-abc123.onrender.com
```

**OU**

```
https://votre-backend.onrender.com
```

⚠️ **Sans** `/api` à la fin  
⚠️ **Sans** `postgresql://`  
⚠️ **Avec** `https://`

## 📋 Où configurer quoi

### Dans le FRONTEND (Render/Netlify/Vercel)

**Variable :** `VITE_API_URL`

**Valeur :** `https://votre-backend.onrender.com`
- ⚠️ URL de votre service backend Flask
- ⚠️ Pas l'URL de la base de données
- ⚠️ Remplacez par l'URL réelle de votre backend

### Dans le BACKEND (Render)

**Variable :** `DATABASE_URL`

**Valeur :** `postgresql://backend:o421xTuVDOuHTogm2kVcYKo1VckB9ykM@dpg-d57e3n0gjchc739i6de0-a.oregon-postgres.render.com/backend_bzzj`
- ✅ C'est correct pour `DATABASE_URL` dans le backend
- ✅ Mais PAS pour `VITE_API_URL` dans le frontend

## 🔍 Comment trouver l'URL de votre backend

1. **Allez sur Render.com**
2. **Ouvrez votre service backend** (probablement nommé `sig-backend` ou similaire)
3. **En haut de la page**, vous verrez l'URL du service
4. **Copiez cette URL** (ex: `https://sig-backend-abc123.onrender.com`)

## ✅ Étapes de correction

### Étape 1 : Trouver l'URL de votre backend

Dans Render → Service backend → Copiez l'URL

### Étape 2 : Modifier VITE_API_URL dans le frontend

1. **Render.com** → Service `sig-frontend`
2. **Settings → Environment**
3. **Trouvez `VITE_API_URL`**
4. **Modifiez la valeur** pour mettre l'URL du backend :
   ```
   https://votre-backend.onrender.com
   ```
   (Remplacez par l'URL réelle de votre backend)
5. **Save Changes**
6. **Render redéploiera automatiquement** (attendez 2-3 minutes)

### Étape 3 : Vérifier DATABASE_URL dans le backend

1. **Render.com** → Service backend
2. **Settings → Environment**
3. **Vérifiez `DATABASE_URL`** contient bien :
   ```
   postgresql://backend:o421xTuVDOuHTogm2kVcYKo1VckB9ykM@dpg-d57e3n0gjchc739i6de0-a.oregon-postgres.render.com/backend_bzzj
   ```
   ✅ C'est correct pour le backend

## 🎯 Résumé

| Variable | Où ? | Valeur |
|----------|------|--------|
| `VITE_API_URL` | Frontend | `https://votre-backend.onrender.com` (URL du service Flask) |
| `DATABASE_URL` | Backend | `postgresql://backend:...@dpg-d57e3n0gjchc739i6de0-a.oregon-postgres.render.com/backend_bzzj` (URL de la base) |

## 🔍 Vérification

Après correction, testez :

1. **Test du backend :** `https://votre-backend.onrender.com/api/health`
2. **Test du frontend :** Ouvrez votre site et vérifiez dans la Console que les requêtes vont vers la bonne URL

Dans la Console du navigateur (F12), les requêtes devraient aller vers :
```
https://votre-backend.onrender.com/api/layers
```

**PAS vers :**
```
postgresql://backend:.../api/layers
```














