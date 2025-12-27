# Dépanner l'erreur 500 (Internal Server Error)

## 🔴 Problème

Vous voyez l'erreur :
```
Failed to load resource: the server responded with a status of 500
```

Cela signifie que :
- ✅ La requête atteint le backend (pas de problème CORS)
- ✅ Le backend répond
- ❌ Mais il y a une erreur côté serveur

## ✅ Solution : Vérifier les logs du backend

### Étape 1 : Accéder aux logs

1. **Allez sur Render.com**
2. **Ouvrez votre service backend** (`post-aypc`)
3. **Allez dans l'onglet "Logs"**
4. **Regardez les erreurs récentes**

### Étape 2 : Identifier l'erreur

Les logs vous diront exactement quel est le problème. Erreurs courantes :

#### Erreur 1 : Problème de connexion à la base de données

```
Error: could not connect to server
```

**Solution :**
- Vérifiez `DATABASE_URL` dans le backend
- Vérifiez que la base de données est "Available"

#### Erreur 2 : PostGIS non installé

```
function st_srid does not exist
```

**Solution :**
- PostGIS n'est pas activé dans la base de données
- Connectez-vous à la base et exécutez : `CREATE EXTENSION postgis;`

#### Erreur 3 : Table n'existe pas

```
relation "nom_table" does not exist
```

**Solution :**
- La table n'existe pas dans la base de données
- Vérifiez que vos données sont bien importées

#### Erreur 4 : Erreur Python

```
TypeError: ...
AttributeError: ...
```

**Solution :**
- Erreur dans le code Python
- Vérifiez les logs pour plus de détails

## 🔍 Diagnostic étape par étape

### 1. Vérifier les logs du backend

Dans Render → Backend → Logs, cherchez :
- Les lignes en rouge (erreurs)
- Les messages d'erreur Python
- Les erreurs de connexion à la base de données

### 2. Tester l'endpoint de santé

Testez d'abord :
```
https://post-aypc.onrender.com/api/health
```

**Si ça retourne :**
```json
{"status": "unhealthy", "database": "disconnected"}
```
→ Problème de connexion à la base de données

**Si ça retourne :**
```json
{"status": "healthy", "database": "connected"}
```
→ La connexion fonctionne, le problème est ailleurs

### 3. Tester les couches directement

Testez :
```
https://post-aypc.onrender.com/api/layers
```

**Si ça retourne une erreur 500 :**
- Regardez les logs pour voir l'erreur exacte
- Probablement un problème avec PostGIS ou les tables

## ✅ Solutions selon l'erreur

### Solution 1 : PostGIS non activé

Si les logs montrent des erreurs liées à PostGIS :

1. **Connectez-vous à la base de données** (SQL Shell ou pgAdmin)
2. **Exécutez :**
   ```sql
   CREATE EXTENSION IF NOT EXISTS postgis;
   CREATE EXTENSION IF NOT EXISTS postgis_topology;
   ```
3. **Vérifiez :**
   ```sql
   SELECT PostGIS_version();
   ```

### Solution 2 : Base de données vide

Si les logs montrent "table does not exist" :

1. **Vérifiez que vos tables existent** dans la base de données
2. **Importez vos données** si nécessaire
3. **Vérifiez que les tables ont des colonnes géométriques**

### Solution 3 : Problème de connexion

Si les logs montrent des erreurs de connexion :

1. **Vérifiez `DATABASE_URL`** dans le backend
2. **Vérifiez que la base de données est "Available"**
3. **Vérifiez les credentials** (user, password, database name)

### Solution 4 : Erreur dans le code

Si les logs montrent une erreur Python :

1. **Notez l'erreur exacte** des logs
2. **Vérifiez le code** à la ligne indiquée
3. **Corrigez l'erreur** et redéployez

## 📋 Checklist de diagnostic

- [ ] Logs du backend consultés
- [ ] Erreur exacte identifiée dans les logs
- [ ] Endpoint `/api/health` testé
- [ ] `DATABASE_URL` vérifiée dans le backend
- [ ] Base de données "Available" sur Render
- [ ] PostGIS activé dans la base de données
- [ ] Tables existent dans la base de données
- [ ] Tables ont des colonnes géométriques

## 🎯 Action immédiate

1. **Backend → Logs** sur Render
2. **Cherchez les erreurs en rouge**
3. **Copiez l'erreur exacte**
4. **Identifiez le type d'erreur** (connexion, PostGIS, table, etc.)
5. **Appliquez la solution correspondante**

## 💡 Test rapide

### Test 1 : Santé de la base de données

```
https://post-aypc.onrender.com/api/health
```

### Test 2 : Liste des couches

```
https://post-aypc.onrender.com/api/layers
```

### Test 3 : Vérifier PostGIS

Connectez-vous à la base de données et exécutez :
```sql
SELECT PostGIS_version();
```

Si ça retourne une erreur, PostGIS n'est pas activé.

## 🚨 Erreurs courantes et solutions

### "function st_srid does not exist"
→ PostGIS non activé → `CREATE EXTENSION postgis;`

### "relation does not exist"
→ Table n'existe pas → Importez vos données

### "could not connect to server"
→ Problème de connexion → Vérifiez `DATABASE_URL`

### "password authentication failed"
→ Credentials incorrects → Vérifiez `DATABASE_URL`

## 📝 Informations à partager

Pour mieux diagnostiquer, pouvez-vous me dire :
1. **Quelle erreur exacte voyez-vous dans les logs du backend ?**
2. **Que retourne `/api/health` ?**
3. **Que retourne `/api/layers` ?**


