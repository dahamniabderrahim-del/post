# Configuration DATABASE_URL sur Render

## 📋 URL de votre base de données

```
postgresql://backend:o421xTuVDOuHTogm2kVcYKo1VckB9ykM@dpg-d57e3n0gjchc739i6de0-a.oregon-postgres.render.com/backend_bzzj
```

## ✅ Étapes pour configurer dans Render

### Étape 1 : Aller dans les Environment Variables

1. **Dans Render.com**, allez dans votre service backend
2. **Settings** → **Environment**
3. Cliquez sur **"Add Environment Variable"**

### Étape 2 : Ajouter DATABASE_URL

**Key :**
```
DATABASE_URL
```

**Value :**
```
postgresql://backend:o421xTuVDOuHTogm2kVcYKo1VckB9ykM@dpg-d57e3n0gjchc739i6de0-a.oregon-postgres.render.com/backend_bzzj
```

⚠️ **Important :** Copiez-collez l'URL complète, sans espaces avant ou après.

### Étape 3 : Sauvegarder et redéployer

1. Cliquez sur **"Save Changes"**
2. Render redéploiera automatiquement votre service
3. Vérifiez les logs pour confirmer que la connexion fonctionne

## 🔍 Vérification

### Vérifier dans les logs

Après le redéploiement, testez l'endpoint de santé :

```
https://votre-service.onrender.com/api/health
```

Vous devriez voir :
```json
{
  "status": "healthy",
  "database": "connected",
  "environment": "production"
}
```

### Tester la connexion

Vous pouvez aussi tester :
```
https://votre-service.onrender.com/api/layers
```

Cela devrait retourner la liste des couches disponibles dans votre base de données.

## 📝 Format de l'URL

Votre URL est au format standard PostgreSQL :
```
postgresql://[user]:[password]@[host]:[port]/[database]
```

Dans votre cas :
- **User** : `backend`
- **Password** : `o421xTuVDOuHTogm2kVcYKo1VckB9ykM`
- **Host** : `dpg-d57e3n0gjchc739i6de0-a.oregon-postgres.render.com`
- **Database** : `backend_bzzj`
- **Port** : `5432` (par défaut, non spécifié dans l'URL)

## ✅ Code déjà configuré

Votre `app.py` gère déjà `DATABASE_URL` automatiquement :

```python
def get_db_config():
    database_url = os.getenv('DATABASE_URL')
    
    if database_url:
        # Parse l'URL automatiquement
        result = urlparse(database_url)
        return {
            'host': result.hostname,
            'port': result.port or 5432,
            'database': result.path[1:],
            'user': result.username,
            'password': result.password
        }
```

Donc il suffit d'ajouter la variable d'environnement dans Render !

## 🚨 Sécurité

⚠️ **Ne commitez JAMAIS cette URL dans votre code !**

- ✅ Utilisez les variables d'environnement (comme vous le faites)
- ❌ Ne mettez pas l'URL directement dans le code
- ✅ Le fichier `.gitignore` exclut déjà les fichiers `.env`

## 📋 Checklist

- [ ] Variable `DATABASE_URL` ajoutée dans Render
- [ ] URL copiée correctement (sans espaces)
- [ ] Service redéployé
- [ ] Endpoint `/api/health` retourne `"database": "connected"`
- [ ] Endpoint `/api/layers` fonctionne







