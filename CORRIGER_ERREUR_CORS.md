# Corriger l'erreur CORS

## 🔴 Erreur

```
Access to fetch at 'https://post-aypc.onrender.com/api/layers' from origin 'https://sig-frontend.onrender.com' has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

## ✅ Solution : Configurer ALLOWED_ORIGINS dans le backend

Le backend doit autoriser les requêtes depuis votre frontend.

### Étape 1 : Ajouter ALLOWED_ORIGINS dans le backend

1. **Allez sur Render.com**
2. **Ouvrez votre service backend** (`post-aypc` ou similaire)
3. **Settings → Environment**
4. **Add Environment Variable** (ou modifiez si elle existe déjà)

**Key :** `ALLOWED_ORIGINS`

**Value :** `https://sig-frontend.onrender.com`

⚠️ **Important :**
- Utilisez l'URL **exacte** de votre frontend
- Avec `https://`
- Sans `/` à la fin
- Si vous avez plusieurs frontends, séparez par des virgules :
  ```
  https://sig-frontend.onrender.com,https://sig-frontend.netlify.app
  ```

5. **Save Changes**
6. **Render redéploiera automatiquement** (attendez 2-3 minutes)

### Étape 2 : Vérifier la configuration CORS dans le code

Le code dans `backend/app.py` devrait déjà gérer `ALLOWED_ORIGINS` correctement. Vérifiez que le code utilise bien cette variable.

### Étape 3 : Tester après redéploiement

1. **Attendez que le backend soit redéployé** (2-3 minutes)
2. **Rechargez votre site frontend**
3. **Vérifiez que les couches se chargent**

## 📋 URLs identifiées

D'après l'erreur :
- **Frontend :** `https://sig-frontend.onrender.com`
- **Backend :** `https://post-aypc.onrender.com`

## ✅ Configuration complète

### Dans le Backend (Render)

**Variables d'environnement :**

1. **DATABASE_URL** :
   ```
   postgresql://backend:o421xTuVDOuHTogm2kVcYKo1VckB9ykM@dpg-d57e3n0gjchc739i6de0-a.oregon-postgres.render.com/backend_bzzj
   ```

2. **ALLOWED_ORIGINS** :
   ```
   https://sig-frontend.onrender.com
   ```

### Dans le Frontend (Render)

**Variables d'environnement :**

1. **VITE_API_URL** :
   ```
   https://post-aypc.onrender.com
   ```
   ⚠️ **Sans** `/api` à la fin

## 🔍 Vérification

### Test 1 : Vérifier CORS

Après avoir ajouté `ALLOWED_ORIGINS` et redéployé, testez :

1. **Ouvrez votre site frontend**
2. **F12 → Console**
3. **Rechargez la page**
4. **L'erreur CORS devrait disparaître**

### Test 2 : Vérifier les requêtes

Dans DevTools → Network :
- Les requêtes vers `/api/layers` devraient maintenant fonctionner
- Status devrait être `200 OK` (pas `CORS error`)

## 🚨 Si l'erreur persiste

### Vérifier que le backend est redéployé

1. **Backend → Logs** sur Render
2. **Vérifiez qu'il n'y a pas d'erreurs**
3. **Vérifiez que le service est "Available"**

### Vérifier le format de ALLOWED_ORIGINS

Le format doit être exactement :
```
https://sig-frontend.onrender.com
```

⚠️ **Vérifiez :**
- Pas d'espaces avant ou après
- Pas de saut de ligne
- URL complète avec `https://`
- Pas de `/` à la fin

### Vérifier plusieurs origines

Si vous déployez sur plusieurs plateformes, séparez par des virgules :
```
https://sig-frontend.onrender.com,https://sig-frontend.netlify.app,http://localhost:3000
```

## 📝 Code CORS dans app.py

Le code devrait déjà gérer cela. Vérifiez que `backend/app.py` contient :

```python
allowed_origins = os.getenv('ALLOWED_ORIGINS', '*').split(',')
if '*' in allowed_origins:
    CORS(app)  # Autoriser tous en développement
else:
    CORS(app, resources={
        r"/api/*": {
            "origins": allowed_origins,
            "methods": ["GET", "POST", "OPTIONS"],
            "allow_headers": ["Content-Type"]
        }
    })
```

Si ce code est présent, il suffit d'ajouter `ALLOWED_ORIGINS` dans Render.

## ✅ Checklist

- [ ] Variable `ALLOWED_ORIGINS` ajoutée dans le backend
- [ ] Valeur : `https://sig-frontend.onrender.com` (URL exacte)
- [ ] Backend redéployé après modification
- [ ] Variable `VITE_API_URL` dans le frontend : `https://post-aypc.onrender.com`
- [ ] Frontend redéployé si nécessaire
- [ ] Site testé après redéploiement
- [ ] Erreur CORS disparue dans la Console

## 🎯 Action immédiate

1. **Backend → Settings → Environment**
2. **Ajoutez/modifiez `ALLOWED_ORIGINS`** : `https://sig-frontend.onrender.com`
3. **Save Changes**
4. **Attendez le redéploiement** (2-3 minutes)
5. **Testez votre site frontend**

C'est tout ! Une fois `ALLOWED_ORIGINS` configurée, l'erreur CORS devrait disparaître.








