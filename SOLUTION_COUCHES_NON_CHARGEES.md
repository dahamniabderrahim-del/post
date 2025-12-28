# Solution : Les couches ne se chargent pas - "0 requests"

## 🔴 Problème identifié

Dans le Network tab, vous voyez **"0/8 requests"** - cela signifie qu'**aucune requête n'est effectuée**.

Cela indique probablement que :
1. ❌ La variable `VITE_API_URL` n'est **pas configurée**
2. ❌ Il y a une **erreur JavaScript** dans la Console

## ✅ Solution immédiate

### Étape 1 : Vérifier la Console (CRITIQUE)

1. **Dans DevTools**, allez dans l'onglet **"Console"** (à côté de Network)
2. **Regardez les erreurs en rouge**
3. **Prenez une capture d'écran** ou notez l'erreur exacte

Les erreurs les plus probables :
- `VITE_API_URL is not defined`
- `Failed to fetch`
- `CORS policy`
- Erreur de syntaxe JavaScript

### Étape 2 : Vérifier VITE_API_URL dans Render

Le site est sur `sig-frontend.onrender.com`, donc il est déployé sur Render.

1. **Allez sur Render.com**
2. **Ouvrez votre service** `sig-frontend`
3. **Settings → Environment**
4. **Vérifiez** si `VITE_API_URL` existe

**Si elle n'existe pas :**
1. **Add Environment Variable**
2. **Key** : `VITE_API_URL`
3. **Value** : `https://votre-backend.onrender.com`
   - ⚠️ Remplacez par l'URL réelle de votre backend Render
   - ⚠️ Sans `/api` à la fin
   - ⚠️ Avec `https://` (pas `http://`)
4. **Save Changes**
5. **Render redéploiera automatiquement** (attendez que le déploiement se termine)

### Étape 3 : Vérifier l'URL du backend

1. **Dans Render**, ouvrez votre service backend
2. **Copiez l'URL** (ex: `https://sig-backend-abc123.onrender.com`)
3. **Testez** : `https://votre-backend.onrender.com/api/health`
   - Devrait retourner : `{"status":"healthy","database":"connected"}`

### Étape 4 : Vérifier CORS dans le backend

Dans Render → Backend → Settings → Environment :

**Ajoutez/modifiez :**
- **Key** : `ALLOWED_ORIGINS`
- **Value** : `https://sig-frontend.onrender.com`
- **Save Changes**
- **Redéployez le backend** si nécessaire

## 🔍 Diagnostic dans la Console

### Test rapide dans la Console

Ouvrez la Console (F12 → Console) et tapez :

```javascript
console.log('VITE_API_URL:', import.meta.env.VITE_API_URL)
```

**Résultats possibles :**

✅ **Si vous voyez l'URL du backend :**
```
VITE_API_URL: https://votre-backend.onrender.com
```
→ La variable est configurée, vérifiez les autres erreurs

❌ **Si vous voyez `undefined` :**
```
VITE_API_URL: undefined
```
→ La variable n'est PAS configurée → Ajoutez-la dans Render

## 📋 Checklist rapide

- [ ] Onglet Console ouvert dans DevTools
- [ ] Erreurs JavaScript identifiées
- [ ] Variable `VITE_API_URL` configurée dans Render (service `sig-frontend`)
- [ ] Variable `VITE_API_URL` contient l'URL correcte du backend (sans `/api`)
- [ ] Backend accessible : `https://votre-backend.onrender.com/api/health`
- [ ] Variable `ALLOWED_ORIGINS` configurée dans le backend
- [ ] Site redéployé après modification des variables

## 🎯 Actions immédiates

1. **Ouvrez la Console** (F12 → Console) et notez les erreurs
2. **Vérifiez Render** → Service `sig-frontend` → Settings → Environment → `VITE_API_URL`
3. **Si elle n'existe pas**, ajoutez-la avec l'URL de votre backend
4. **Attendez le redéploiement** (2-3 minutes)
5. **Testez à nouveau**

## 💡 Pourquoi "0 requests" ?

Si aucune requête n'apparaît dans Network, c'est que :
- Le code JavaScript ne s'exécute pas jusqu'à la partie qui fait les requêtes
- Il y a une erreur JavaScript qui arrête l'exécution
- La variable d'environnement n'est pas disponible (le code essaie peut-être `undefined/api/layers`)

La Console vous dira exactement ce qui ne va pas.

## 📸 Informations à partager

Pour mieux diagnostiquer, pouvez-vous me dire :
1. **Quelles erreurs voyez-vous dans la Console ?**
2. **Est-ce que `VITE_API_URL` est configurée dans Render ?**
3. **Quelle est l'URL de votre backend Render ?**









