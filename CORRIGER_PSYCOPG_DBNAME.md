# Correction : "option de connexion invalide 'database'"

## 🔴 Erreur

Dans les logs, vous voyez :
```
Erreur de connexion à la base de données : option de connexion invalide "database"
```

## ✅ Cause

`psycopg` (version 3) utilise `dbname` au lieu de `database` pour le nom de la base de données.

**Dans psycopg2 :** on utilisait `database`  
**Dans psycopg (v3) :** on doit utiliser `dbname`

## ✅ Solution : Correction du code

Le code a été corrigé pour utiliser `dbname` au lieu de `database`.

### Changements effectués

**Avant (incorrect pour psycopg v3) :**
```python
return {
    'host': result.hostname,
    'port': result.port or 5432,
    'database': result.path[1:],  # ❌ Incorrect pour psycopg v3
    'user': result.username,
    'password': result.password
}
```

**Après (correct pour psycopg v3) :**
```python
return {
    'host': result.hostname,
    'port': result.port or 5432,
    'dbname': result.path[1:],  # ✅ Correct pour psycopg v3
    'user': result.username,
    'password': result.password
}
```

## 📋 Fichiers modifiés

- ✅ `backend/app.py` - Corrigé
- ✅ `backend/app_production.py` - Corrigé

## 🚀 Déploiement

1. **Commettez et poussez les modifications :**
   ```bash
   git add backend/app.py backend/app_production.py
   git commit -m "Fix: Utiliser dbname au lieu de database pour psycopg v3"
   git push
   ```

2. **Render redéploiera automatiquement** (2-3 minutes)

3. **Testez après redéploiement :**
   ```
   https://post-aypc.onrender.com/api/health
   ```

## ✅ Vérification

Après le redéploiement, vous devriez voir :
```json
{
  "status": "healthy",
  "database": "connected",
  "environment": "production"
}
```

Et `/api/layers` devrait fonctionner sans erreur 500.

## 📝 Note technique

**psycopg2 vs psycopg (v3) :**

| Paramètre | psycopg2 | psycopg v3 |
|-----------|----------|------------|
| Nom de la base | `database` | `dbname` |
| Import | `import psycopg2` | `import psycopg` |
| Cursor | `RealDictCursor` | `dict_row` |

Le code a été mis à jour pour être compatible avec `psycopg` v3.3.2.













