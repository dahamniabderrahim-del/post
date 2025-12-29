# Configuration des Variables d'Environnement sur Render

## Problème résolu

Le backend essayait de se connecter à `localhost` pour PostgreSQL, ce qui ne fonctionne pas sur Render. Le code a été modifié pour utiliser les variables d'environnement.

## Modifications effectuées

Le fichier `backend/app.py` a été mis à jour pour :
1. Lire `DATABASE_URL` depuis les variables d'environnement
2. Parser l'URL PostgreSQL au format `postgresql://user:password@host:port/database`
3. Fallback sur des variables individuelles (`DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`)
4. Utiliser des valeurs par défaut pour le développement local

## Configuration sur Render

### Étape 1 : Obtenir les informations de connexion PostgreSQL

1. Allez sur votre dashboard Render
2. Ouvrez votre base de données PostgreSQL
3. Dans l'onglet **Info**, copiez la **Internal Database URL** ou **External Database URL**

Le format ressemble à :
```
postgresql://user:password@hostname:5432/database_name
```

### Étape 2 : Configurer les variables d'environnement

1. Allez sur votre service backend (`post-aypc`)
2. Cliquez sur **Environment** dans le menu de gauche
3. Ajoutez la variable suivante :

   **Option A - Utiliser DATABASE_URL (recommandé)** :
   - **Key**: `DATABASE_URL`
   - **Value**: Collez l'URL complète de votre base de données (Internal ou External)
   - Exemple: `postgresql://postgres:password@dpg-xxxxx-a.oregon-postgres.render.com:5432/dbname`

   **Option B - Utiliser des variables individuelles** :
   - `DB_HOST`: Le hostname de votre base de données
   - `DB_PORT`: `5432` (généralement)
   - `DB_NAME`: Le nom de votre base de données
   - `DB_USER`: Le nom d'utilisateur
   - `DB_PASSWORD`: Le mot de passe

### Étape 3 : Redéployer le service

1. Après avoir ajouté les variables d'environnement, Render redéploiera automatiquement
2. Ou cliquez sur **Manual Deploy** > **Deploy latest commit**

### Étape 4 : Vérifier

1. Attendez que le déploiement soit terminé
2. Testez l'endpoint de santé :
   ```
   https://post-aypc.onrender.com/api/health
   ```
   Devrait retourner :
   ```json
   {
     "status": "healthy",
     "database": "connected"
   }
   ```

3. Testez la liste des couches :
   ```
   https://post-aypc.onrender.com/api/layers
   ```

## Vérification des logs

Si vous avez encore des erreurs de connexion :

1. Allez dans **Logs** de votre service backend
2. Vérifiez les messages d'erreur
3. Les erreurs courantes :
   - **"connexion au serveur chez localhost"** : La variable `DATABASE_URL` n'est pas définie
   - **"authentication failed"** : Les identifiants sont incorrects
   - **"database does not exist"** : Le nom de la base de données est incorrect

## Notes importantes

- **Internal Database URL** : Utilisez cette URL si votre backend et votre base de données sont sur le même compte Render (plus rapide, gratuit)
- **External Database URL** : Utilisez cette URL si vous accédez depuis l'extérieur de Render
- Les variables d'environnement sont sensibles à la casse
- Après modification des variables, le service redéploie automatiquement

## Dépannage

### Le backend ne se connecte toujours pas

1. Vérifiez que `DATABASE_URL` est bien définie dans l'onglet Environment
2. Vérifiez que l'URL est au bon format (commence par `postgresql://`)
3. Testez la connexion manuellement avec `psql` :
   ```bash
   psql "postgresql://user:password@host:5432/dbname"
   ```

### Erreur "database does not exist"

1. Vérifiez que le nom de la base de données dans l'URL correspond à votre base
2. Créez la base de données si nécessaire :
   ```sql
   CREATE DATABASE pos;
   ```

### Erreur "relation does not exist"

1. Vérifiez que vos tables existent dans la base de données
2. Migrez vos données depuis votre base locale si nécessaire




