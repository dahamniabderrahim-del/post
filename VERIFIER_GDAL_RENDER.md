# Vérifier GDAL dans Render.com

## Si GDAL est installé mais ST_GDALDrivers() retourne vide

Cela peut indiquer que :
- ✅ GDAL est installé sur le système
- ❌ PostGIS n'est pas configuré pour utiliser GDAL
- ❌ Les pilotes GDAL ne sont pas accessibles à PostGIS

## Vérifications à faire

### 1. Vérifier la version de GDAL dans PostgreSQL

Exécutez dans PostgreSQL :

```sql
-- Vérifier si PostGIS peut détecter GDAL
SELECT PostGIS_Full_Version();
```

Cette requête devrait afficher la version de PostGIS et peut-être mentionner GDAL.

### 2. Vérifier les variables d'environnement GDAL

Si vous avez accès au shell de Render (via SSH ou console), vérifiez :

```bash
# Vérifier si GDAL est dans le PATH
which gdalinfo

# Vérifier la version
gdalinfo --version

# Vérifier les pilotes disponibles
gdalinfo --formats | grep -i jpeg
gdalinfo --formats | grep -i png
```

### 3. Vérifier la configuration PostGIS

Dans PostgreSQL, exécutez :

```sql
-- Vérifier la version PostGIS
SELECT PostGIS_Version();

-- Vérifier les extensions installées
SELECT * FROM pg_extension WHERE extname LIKE '%postgis%';

-- Vérifier si PostGIS peut accéder à GDAL
SELECT * FROM ST_GDALDrivers();
```

### 4. Vérifier les pilotes GDAL spécifiques

```sql
-- Vérifier spécifiquement JPEG et PNG
SELECT short_name, long_name, can_read, can_write
FROM ST_GDALDrivers()
WHERE short_name IN ('JPEG', 'PNG', 'JPEG2000', 'PNG_JPEG')
ORDER BY short_name;
```

## Solutions possibles

### Solution 1 : Recharger l'extension PostGIS

Parfois, PostGIS doit être rechargé pour détecter GDAL :

```sql
-- Désactiver et réactiver PostGIS (ATTENTION : peut affecter les données)
-- NE FAITES PAS CECI EN PRODUCTION SANS BACKUP

-- Vérifier d'abord les dépendances
SELECT * FROM pg_depend 
WHERE refobjid = (SELECT oid FROM pg_extension WHERE extname = 'postgis');

-- Si aucune dépendance critique, vous pouvez essayer :
-- ALTER EXTENSION postgis UPDATE;
```

### Solution 2 : Vérifier les chemins GDAL dans PostGIS

PostGIS doit savoir où trouver les bibliothèques GDAL. Vérifiez :

```sql
-- Vérifier les chemins de bibliothèques (si disponible)
SHOW shared_preload_libraries;
```

### Solution 3 : Contacter le support Render

Si GDAL est installé mais que PostGIS ne le détecte pas, c'est probablement un problème de configuration système. Contactez le support Render avec :

**Message type :**
```
Bonjour,

J'ai une base de données PostgreSQL avec PostGIS sur Render.com.
GDAL semble être installé sur le système (je peux voir la version),
mais la fonction PostGIS ST_GDALDrivers() retourne aucune ligne.

Cela indique que PostGIS n'arrive pas à se connecter aux bibliothèques GDAL.

Pouvez-vous vérifier :
1. Si GDAL est correctement installé
2. Si les bibliothèques GDAL sont accessibles à PostgreSQL
3. Si PostGIS est configuré pour utiliser GDAL

Merci,
```

### Solution 4 : Vérifier les permissions

Parfois, PostgreSQL n'a pas les permissions pour accéder aux bibliothèques GDAL. C'est un problème système que seul Render peut résoudre.

## Diagnostic complet

Exécutez ces requêtes et partagez les résultats :

```sql
-- 1. Version PostGIS
SELECT PostGIS_Full_Version();

-- 2. Extensions PostGIS
SELECT extname, extversion FROM pg_extension WHERE extname LIKE '%postgis%';

-- 3. Pilotes GDAL (devrait retourner des lignes)
SELECT COUNT(*) as nombre_pilotes FROM ST_GDALDrivers();

-- 4. Pilotes JPEG/PNG spécifiquement
SELECT short_name, long_name, can_write 
FROM ST_GDALDrivers() 
WHERE short_name IN ('JPEG', 'PNG');
```

## Si GDAL est installé mais non détecté

**Causes possibles :**
1. PostGIS n'a pas été compilé avec le support GDAL
2. Les bibliothèques GDAL ne sont pas dans le LD_LIBRARY_PATH de PostgreSQL
3. Les permissions ne permettent pas à PostgreSQL d'accéder aux bibliothèques GDAL
4. Version incompatible entre GDAL et PostGIS

**Solutions :**
- Contactez le support Render (le plus probable)
- Ou migrez vers un service qui garantit PostGIS + GDAL (Supabase, AWS RDS)


