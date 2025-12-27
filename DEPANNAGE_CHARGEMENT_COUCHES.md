# Dépannage : Les couches ne se chargent pas

## 🔍 Diagnostic étape par étape

### Étape 1 : Vérifier la console du navigateur

1. **Ouvrez votre site frontend**
2. **Appuyez sur F12** (ou Clic droit → Inspecter)
3. **Allez dans l'onglet "Console"**
4. **Regardez les erreurs**

#### Erreurs courantes :

**❌ `Failed to fetch` ou `Network Error`**
→ L'URL de l'API n'est pas correcte ou le backend n'est pas accessible

**❌ `CORS policy: No 'Access-Control-Allow-Origin'`**
→ Problème de configuration CORS dans le backend

**❌ `404 Not Found`**
→ L'URL de l'API est incorrecte

**❌ `500 Internal Server Error`**
→ Problème dans le backend (base de données, etc.)

### Étape 2 : Vérifier l'URL de l'API utilisée

Dans la console du navigateur, ouvrez l'onglet **"Network"** (Réseau) :

1. **Rechargez la page** (F5)
2. **Cherchez les requêtes vers `/api/layers`**
3. **Cliquez sur la requête**
4. **Vérifiez l'URL complète** dans "Request URL"

**L'URL devrait être :** `https://votre-backend.onrender.com/api/layers`

Si vous voyez `http://localhost:5000/api/layers`, alors la variable d'environnement n'est pas configurée.

### Étape 3 : Vérifier les variables d'environnement

#### Dans Netlify/Vercel/Render (Frontend)

1. Allez dans les **Settings** de votre site frontend
2. **Environment Variables**
3. Vérifiez que `VITE_API_URL` existe et contient :
   ```
   https://votre-backend.onrender.com
   ```
   ⚠️ **Sans le `/api` à la fin**
   ⚠️ **Avec `https://`** (pas `http://`)
   ⚠️ **Remplacez `votre-backend` par l'URL réelle**

#### Vérifier après redéploiement

Si vous avez ajouté/modifié la variable :
1. **Redéployez le site** (Netlify/Vercel/Render redéploiera automatiquement)
2. Attendez que le déploiement soit terminé
3. Testez à nouveau

### Étape 4 : Vérifier que le backend est accessible

Testez directement l'API du backend :

```
https://votre-backend.onrender.com/api/health
```

**Réponse attendue :**
```json
{
  "status": "healthy",
  "database": "connected",
  "environment": "production"
}
```

Si vous obtenez une erreur :
- Vérifiez que le backend est "Available" (pas "Paused") sur Render
- Vérifiez les logs du backend sur Render

### Étape 5 : Vérifier CORS dans le backend

#### Dans Render → Backend → Settings → Environment

Vérifiez que `ALLOWED_ORIGINS` contient l'URL exacte de votre frontend :

```
ALLOWED_ORIGINS=https://sig-frontend.netlify.app
```

⚠️ **Important :**
- Utilisez l'URL **exacte** de votre frontend
- Si l'URL est différente (ex: `sig-frontend-123456.netlify.app`), mettez à jour
- Séparez plusieurs URLs par des virgules si nécessaire
- Redéployez le backend après modification

### Étape 6 : Vérifier le code du frontend

Assurez-vous que le code utilise bien la variable d'environnement :

**Dans `frontend/src/App.jsx` :**
```javascript
const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000'
fetch(`${apiUrl}/api/layers`)
```

**Dans `frontend/src/components/Map.jsx` :**
```javascript
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'
axios.get(`${API_URL}/api/layers/${layerName}/geojson`)
```

## ✅ Solutions selon l'erreur

### Solution 1 : Variable d'environnement non configurée

**Problème :** La console montre `http://localhost:5000`

**Solution :**
1. Ajoutez `VITE_API_URL` dans les variables d'environnement du frontend
2. Valeur : `https://votre-backend.onrender.com`
3. Redéployez le frontend

### Solution 2 : Erreur CORS

**Problème :** `CORS policy: No 'Access-Control-Allow-Origin'`

**Solution :**
1. Vérifiez `ALLOWED_ORIGINS` dans le backend
2. Ajoutez l'URL exacte de votre frontend
3. Redéployez le backend

### Solution 3 : Backend non accessible

**Problème :** `Failed to fetch` ou `Network Error`

**Solution :**
1. Vérifiez que le backend est "Available" sur Render
2. Testez : `https://votre-backend.onrender.com/api/health`
3. Si le backend est "Paused", activez-le

### Solution 4 : Erreur 404

**Problème :** `404 Not Found` sur `/api/layers`

**Solution :**
1. Vérifiez l'URL complète dans la console Network
2. Assurez-vous que l'URL est : `https://votre-backend.onrender.com/api/layers`
3. Vérifiez que `VITE_API_URL` ne contient **pas** `/api` à la fin

### Solution 5 : Erreur 500

**Problème :** `500 Internal Server Error`

**Solution :**
1. Vérifiez les logs du backend sur Render
2. Vérifiez que `DATABASE_URL` est configurée
3. Vérifiez que la base de données est accessible

## 🔧 Test rapide

Créez un fichier de test pour vérifier la configuration :

**Dans la console du navigateur (F12), tapez :**

```javascript
console.log('API URL:', import.meta.env.VITE_API_URL || 'Non défini')
```

**Résultat attendu :**
```
API URL: https://votre-backend.onrender.com
```

Si vous voyez `Non défini` ou `undefined`, la variable n'est pas configurée.

## 📋 Checklist complète

- [ ] Console du navigateur ouverte (F12)
- [ ] Erreurs identifiées dans la console
- [ ] Onglet Network vérifié
- [ ] Variable `VITE_API_URL` configurée dans le frontend
- [ ] Variable `VITE_API_URL` contient l'URL correcte du backend (sans `/api`)
- [ ] Backend accessible : `https://votre-backend.onrender.com/api/health`
- [ ] Variable `ALLOWED_ORIGINS` configurée dans le backend
- [ ] Variable `ALLOWED_ORIGINS` contient l'URL exacte du frontend
- [ ] Backend redéployé après modification de `ALLOWED_ORIGINS`
- [ ] Frontend redéployé après modification de `VITE_API_URL`
- [ ] Site testé à nouveau

## 🎯 Commandes de test

### Tester le backend directement

```bash
# Tester l'endpoint de santé
curl https://votre-backend.onrender.com/api/health

# Tester la liste des couches
curl https://votre-backend.onrender.com/api/layers
```

### Tester depuis le navigateur

Allez directement sur :
```
https://votre-backend.onrender.com/api/layers
```

Vous devriez voir un JSON avec la liste des couches.

## 🚨 Si rien ne fonctionne

1. **Vérifiez les logs du backend** sur Render
2. **Vérifiez les logs du frontend** (build logs sur Netlify/Vercel/Render)
3. **Vérifiez que toutes les variables d'environnement sont correctes**
4. **Testez le backend localement** pour vérifier qu'il fonctionne

## 💡 Astuce : Mode développement local

Pour tester localement avec le backend en production :

1. Créez un fichier `frontend/.env.local` :
   ```
   VITE_API_URL=https://votre-backend.onrender.com
   ```

2. Lancez le frontend :
   ```bash
   cd frontend
   npm run dev
   ```

3. Testez si les couches se chargent

⚠️ **Note :** Assurez-vous que `ALLOWED_ORIGINS` dans le backend inclut `http://localhost:3000` pour le développement.



