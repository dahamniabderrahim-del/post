# Corriger "database": "disconnected"

## 🔴 Problème

Quand vous testez `/api/health`, vous obtenez :
```json
{
  "database": "disconnected",
  "status": "unhealthy"
}
```

Cela signifie que le backend ne peut pas se connecter à la base de données PostgreSQL.

## ✅ Solutions

### Solution 1 : Vérifier DATABASE_URL dans le backend

1. **Allez sur Render.com**
2. **Ouvrez votre service backend** (pas la base de données, le service Flask)
3. **Settings → Environment**
4. **Vérifiez que `DATABASE_URL` existe**

**Si elle n'existe pas, ajoutez-la :**

**Key :** `DATABASE_URL`

**Value :**
```
postgresql://backend:o421xTuVDOuHTogm2kVcYKo1VckB9ykM@dpg-d57e3n0gjchc739i6de0-a.oregon-postgres.render.com/backend_bzzj
```

5. **Save Changes**
6. **Render redéploiera automatiquement** (attendez 2-3 minutes)

### Solution 2 : Vérifier que la base de données est "Available"

1. **Dans Render**, ouvrez votre service **PostgreSQL** (pas le backend)
2. **Vérifiez le statut** : doit être "Available" (pas "Paused")
3. **Si elle est "Paused"**, activez-la

### Solution 3 : Vérifier les logs du backend

1. **Backend → Logs** (onglet dans Render)
2. **Cherchez les erreurs** de connexion à la base de données

**Erreurs courantes :**
- `connection refused`
- `password authentication failed`
- `database does not exist`
- `could not connect to server`

### Solution 4 : Vérifier le format de DATABASE_URL

Le format doit être exactement :
```
postgresql://[user]:[password]@[host]/[database]
```

Dans votre cas :
```
postgresql://backend:o421xTuVDOuHTogm2kVcYKo1VckB9ykM@dpg-d57e3n0gjchc739i6de0-a.oregon-postgres.render.com/backend_bzzj
```

⚠️ **Vérifiez :**
- Pas d'espaces avant ou après
- Pas de saut de ligne
- Format exact comme ci-dessus

### Solution 5 : Utiliser l'URL de connexion depuis Render

1. **Dans Render**, ouvrez votre service **PostgreSQL**
2. **Cherchez "Connections"** ou "Internal Database URL"
3. **Copiez l'URL fournie par Render**
4. **Utilisez cette URL** dans `DATABASE_URL`

Render peut fournir une URL légèrement différente, utilisez celle qu'il donne.

## 🔍 Diagnostic détaillé

### Vérifier que DATABASE_URL est bien définie

Dans les logs du backend, cherchez :
- Messages de connexion à la base de données
- Erreurs spécifiques de psycopg/psycopg2

### Tester la connexion depuis les logs

Si vous voyez des erreurs détaillées dans les logs, elles vous diront exactement quel est le problème :
- **"password authentication failed"** → Mot de passe incorrect
- **"could not connect to server"** → Serveur inaccessible
- **"database does not exist"** → Nom de base de données incorrect

## 📋 Checklist

- [ ] `DATABASE_URL` existe dans le backend (Settings → Environment)
- [ ] `DATABASE_URL` a le bon format (postgresql://...)
- [ ] Base de données PostgreSQL est "Available" (pas "Paused")
- [ ] Backend redéployé après modification de `DATABASE_URL`
- [ ] Logs du backend vérifiés pour erreurs détaillées
- [ ] Test `/api/health` effectué après corrections

## 🎯 Étapes rapides

1. **Backend → Settings → Environment**
2. **Vérifiez/ajoutez `DATABASE_URL`** avec votre URL complète
3. **Save Changes**
4. **Attendez le redéploiement** (2-3 minutes)
5. **Testez à nouveau :** `https://votre-backend.onrender.com/api/health`

## 💡 Alternative : Vérifier depuis Render

Render peut fournir une URL de connexion directement :

1. **PostgreSQL → Connections**
2. **Internal Database URL** ou **Connection String**
3. **Copiez cette URL** et utilisez-la dans `DATABASE_URL`

Cette URL peut être légèrement différente mais devrait fonctionner.

## 🚨 Si le problème persiste

1. **Vérifiez les logs du backend** pour l'erreur exacte
2. **Vérifiez que la base de données est accessible** depuis Render
3. **Testez la connexion** avec SQL Shell (comme vous l'avez fait précédemment)
4. **Vérifiez les credentials** (user, password, database name)







