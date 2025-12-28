# Dépanner l'erreur 500 sur /api/layers

## 🔴 Problème

Vous obtenez :
```
GET https://post-aypc.onrender.com/api/layers 500 (Internal Server Error)
```

Cela signifie que :
- ✅ La requête atteint le backend (pas de problème CORS)
- ✅ Le backend répond
- ❌ Mais il y a une erreur lors de l'exécution de `/api/layers`

## ✅ Solution : Vérifier les logs du backend

### Étape 1 : Accéder aux logs

1. **Allez sur Render.com**
2. **Ouvrez votre service backend** (`post-aypc`)
3. **Allez dans l'onglet "Logs"**
4. **Regardez les erreurs récentes** (lignes en rouge)

Les logs vous diront **exactement** quel est le problème.

## 🔍 Erreurs courantes et solutions

### Erreur 1 : PostGIS non activé

**Dans les logs, vous verrez :**
```
function st_srid does not exist
```
ou
```
function st_asgeojson does not exist
```

**Solution :**
1. **Connectez-vous à la base de données** (SQL Shell)
2. **Exécutez :**
   ```sql
   CREATE EXTENSION IF NOT EXISTS postgis;
   CREATE EXTENSION IF NOT EXISTS postgis_topology;
   ```
3. **Vérifiez :**
   ```sql
   SELECT PostGIS_version();
   ```
   Devrait retourner une version (ex: `3.5.0`)

### Erreur 2 : Aucune table avec géométrie

**Dans les logs, vous verrez :**
```
Aucune colonne géométrique trouvée
```

**Solution :**
- Vérifiez que vos tables existent dans la base de données
- Vérifiez que les tables ont des colonnes de type `geometry`
- Importez vos données si nécessaire

### Erreur 3 : Problème de connexion à la base de données

**Dans les logs, vous verrez :**
```
Erreur de connexion à la base de données: ...
```

**Solution :**
- Vérifiez `DATABASE_URL` dans le backend
- Vérifiez que la base de données est "Available"

### Erreur 4 : Erreur Python

**Dans les logs, vous verrez :**
```
Traceback (most recent call last):
  File "...", line X, in ...
TypeError: ...
```

**Solution :**
- Notez l'erreur exacte
- Vérifiez le code à la ligne indiquée
- Corrigez l'erreur

## 📋 Diagnostic étape par étape

### 1. Vérifier les logs du backend

Dans Render → Backend → Logs, cherchez :
- Les lignes en rouge (erreurs)
- Les messages d'erreur Python
- Les erreurs de connexion à la base de données
- Les erreurs PostGIS

### 2. Tester l'endpoint de santé d'abord

Testez :
```
https://post-aypc.onrender.com/api/health
```

**Si ça retourne :**
```json
{"status": "unhealthy", "database": "disconnected"}
```
→ Problème de connexion à la base de données → Corrigez `DATABASE_URL`

**Si ça retourne :**
```json
{"status": "healthy", "database": "connected"}
```
→ La connexion fonctionne, le problème est dans `/api/layers` → Vérifiez PostGIS

### 3. Vérifier PostGIS

Connectez-vous à la base de données et exécutez :
```sql
SELECT PostGIS_version();
```

**Si ça retourne une erreur :**
→ PostGIS n'est pas activé → `CREATE EXTENSION postgis;`

**Si ça retourne une version :**
→ PostGIS est activé → Le problème est ailleurs

### 4. Vérifier les tables

Connectez-vous à la base de données et exécutez :
```sql
-- Lister toutes les tables
\dt

-- Vérifier les tables avec géométrie
SELECT f.table_name
FROM information_schema.tables f
WHERE f.table_schema = 'public'
AND f.table_type = 'BASE TABLE'
AND EXISTS (
    SELECT 1 
    FROM information_schema.columns c
    WHERE c.table_schema = f.table_schema
    AND c.table_name = f.table_name
    AND (c.data_type LIKE '%geometry%' OR c.udt_name = 'geometry')
);
```

**Si aucune table n'est retournée :**
→ Aucune table avec géométrie → Importez vos données

## ✅ Solutions rapides

### Solution 1 : Activer PostGIS (le plus probable)

1. **Connectez-vous à la base de données** (SQL Shell)
2. **Exécutez :**
   ```sql
   CREATE EXTENSION IF NOT EXISTS postgis;
   ```
3. **Vérifiez :**
   ```sql
   SELECT PostGIS_version();
   ```
4. **Testez à nouveau :** `https://post-aypc.onrender.com/api/layers`

### Solution 2 : Vérifier DATABASE_URL

1. **Backend → Settings → Environment**
2. **Vérifiez `DATABASE_URL`** existe et est correcte
3. **Redéployez** si nécessaire

### Solution 3 : Vérifier les tables

1. **Connectez-vous à la base de données**
2. **Vérifiez que vos tables existent**
3. **Vérifiez qu'elles ont des colonnes géométriques**

## 🎯 Action immédiate

1. **Backend → Logs** sur Render
2. **Cherchez les erreurs en rouge**
3. **Copiez l'erreur exacte**
4. **Identifiez le type d'erreur** :
   - PostGIS → `CREATE EXTENSION postgis;`
   - Connexion → Vérifiez `DATABASE_URL`
   - Tables → Importez vos données
   - Code → Corrigez l'erreur Python

## 💡 Test rapide

### Test 1 : Santé de la base de données
```
https://post-aypc.onrender.com/api/health
```

### Test 2 : PostGIS dans la base de données
```sql
SELECT PostGIS_version();
```

### Test 3 : Tables avec géométrie
```sql
SELECT f.table_name
FROM information_schema.tables f
WHERE f.table_schema = 'public'
AND EXISTS (
    SELECT 1 FROM information_schema.columns c
    WHERE c.table_schema = f.table_schema
    AND c.table_name = f.table_name
    AND (c.data_type LIKE '%geometry%' OR c.udt_name = 'geometry')
);
```

## 📝 Informations à partager

Pour mieux diagnostiquer, pouvez-vous me dire :
1. **Quelle erreur exacte voyez-vous dans les logs du backend ?**
2. **Que retourne `/api/health` ?**
3. **PostGIS est-il activé ?** (testez avec `SELECT PostGIS_version();`)

La cause la plus probable est que **PostGIS n'est pas activé** dans la base de données. Activez-le avec `CREATE EXTENSION postgis;` et testez à nouveau.








