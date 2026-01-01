# Vérifier la santé de la base de données

## 🔍 Méthode 1 : Via l'endpoint /api/health (Recommandé)

### Étape 1 : Obtenir l'URL de votre backend

1. **Allez sur Render.com**
2. **Ouvrez votre service backend** (probablement `sig-backend` ou similaire)
3. **Copiez l'URL** affichée en haut (ex: `https://sig-backend-abc123.onrender.com`)

### Étape 2 : Tester l'endpoint de santé

**Ouvrez dans votre navigateur :**

```
https://votre-backend.onrender.com/api/health
```

**Remplacez `votre-backend` par l'URL réelle de votre backend Render.**

### Réponse attendue (Succès)

```json
{
  "status": "healthy",
  "database": "connected",
  "environment": "production"
}
```

✅ **Si vous voyez cette réponse :**
- Le backend fonctionne
- La connexion à la base de données fonctionne
- Tout est OK !

### Réponse d'erreur

```json
{
  "status": "unhealthy",
  "database": "disconnected"
}
```

❌ **Si vous voyez cette réponse :**
- La connexion à la base de données échoue
- Vérifiez la variable `DATABASE_URL` dans le backend

## 🔍 Méthode 2 : Tester directement les couches

Testez si les couches sont accessibles :

```
https://votre-backend.onrender.com/api/layers
```

### Réponse attendue (Succès)

```json
[
  {
    "name": "nom_de_la_table",
    "schema": "public"
  },
  ...
]
```

✅ **Si vous voyez une liste de tables :**
- La base de données est accessible
- PostGIS fonctionne
- Les tables sont détectées

### Réponse d'erreur

```json
{
  "error": "Impossible de se connecter à la base de données"
}
```

❌ **Si vous voyez une erreur :**
- Problème de connexion à la base de données
- Vérifiez `DATABASE_URL` dans le backend

## 🔍 Méthode 3 : Vérifier les logs du backend

1. **Dans Render.com** → Votre service backend
2. **Allez dans l'onglet "Logs"**
3. **Cherchez les erreurs** liées à la base de données

**Erreurs courantes :**
- `connection refused`
- `password authentication failed`
- `database does not exist`
- `could not connect to server`

## ✅ Vérifications dans Render

### Vérifier DATABASE_URL

1. **Backend → Settings → Environment**
2. **Vérifiez que `DATABASE_URL` existe**
3. **Vérifiez le format :**
   ```
   postgresql://user:password@host:port/database
   ```

### Vérifier que la base de données est active

1. **Dans Render**, ouvrez votre service PostgreSQL
2. **Vérifiez le statut** : doit être "Available" (pas "Paused")

## 📋 Checklist de vérification

- [ ] Backend accessible : `https://votre-backend.onrender.com/api/health`
- [ ] Réponse : `{"status":"healthy","database":"connected"}`
- [ ] Variable `DATABASE_URL` configurée dans le backend
- [ ] Base de données PostgreSQL "Available" sur Render
- [ ] Pas d'erreurs dans les logs du backend

## 🚨 Dépannage

### Erreur : "database": "disconnected"

**Solution :**
1. Vérifiez `DATABASE_URL` dans le backend
2. Vérifiez que la base de données est "Available"
3. Vérifiez les logs du backend pour plus de détails

### Erreur : 404 Not Found

**Solution :**
- Vérifiez que l'URL du backend est correcte
- Vérifiez que le backend est déployé et en ligne

### Erreur : 500 Internal Server Error

**Solution :**
1. Vérifiez les logs du backend
2. Vérifiez `DATABASE_URL`
3. Vérifiez que PostGIS est activé dans la base de données

## 💡 Commandes de test

### Via curl (terminal)

```bash
# Test de santé
curl https://votre-backend.onrender.com/api/health

# Test des couches
curl https://votre-backend.onrender.com/api/layers
```

### Via PowerShell (Windows)

```powershell
# Test de santé
Invoke-WebRequest -Uri "https://votre-backend.onrender.com/api/health" | Select-Object -ExpandProperty Content

# Test des couches
Invoke-WebRequest -Uri "https://votre-backend.onrender.com/api/layers" | Select-Object -ExpandProperty Content
```

## 🎯 Test rapide

**Ouvrez simplement dans votre navigateur :**

```
https://votre-backend.onrender.com/api/health
```

Si vous voyez `"database": "connected"`, tout fonctionne ! ✅














