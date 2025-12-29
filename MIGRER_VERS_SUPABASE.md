# Guide complet : Migrer vers Supabase pour avoir GDAL

## Pourquoi Supabase ?

✅ **PostGIS avec GDAL généralement inclus**  
✅ **Gratuit pour les petits projets** (500 MB base de données, 2 GB bandwidth)  
✅ **Interface moderne et facile à utiliser**  
✅ **Migration simple depuis Render**

---

## Étape 1 : Créer un compte et un projet Supabase

### 1.1 Créer un compte

1. Allez sur **https://supabase.com**
2. Cliquez sur **"Start your project"** ou **"Sign Up"**
3. Créez un compte avec :
   - GitHub (recommandé)
   - Email
   - Google

### 1.2 Créer un nouveau projet

1. Une fois connecté, cliquez sur **"New Project"**
2. Remplissez les informations :
   - **Name** : Nom de votre projet (ex: `sig-project`)
   - **Database Password** : Mot de passe fort pour PostgreSQL (⚠️ **SAVEZ-LE BIEN !**)
   - **Region** : Choisissez la région la plus proche (ex: Europe West pour l'Europe)
   - **Pricing Plan** : Free (pour commencer)

3. Cliquez sur **"Create new project"**
4. Attendez 1-2 minutes que le projet soit créé

---

## Étape 2 : Activer PostGIS

### 2.1 Accéder à l'éditeur SQL

1. Dans votre projet Supabase, cliquez sur **"SQL Editor"** dans le menu de gauche
2. Cliquez sur **"New query"**

### 2.2 Activer PostGIS

Exécutez cette requête :

```sql
-- Activer l'extension PostGIS
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS postgis_topology;

-- Vérifier que PostGIS est activé
SELECT PostGIS_Version();
```

Vous devriez voir la version de PostGIS (ex: `3.4 USE_GEOS=1 USE_PROJ=1 USE_STATS=1`)

### 2.3 Vérifier GDAL

Exécutez cette requête pour vérifier que GDAL est disponible :

```sql
-- Vérifier les pilotes GDAL disponibles
SELECT COUNT(*) as nombre_pilotes FROM ST_GDALDrivers();

-- Vérifier spécifiquement JPEG et PNG
SELECT short_name, long_name, can_read, can_write
FROM ST_GDALDrivers()
WHERE short_name IN ('JPEG', 'PNG')
ORDER BY short_name;
```

**Si vous voyez des lignes avec JPEG et PNG avec `can_write = true` :** ✅ GDAL est disponible !

**Si la table est vide :** ⚠️ GDAL n'est pas disponible, essayez une autre solution.

---

## Étape 3 : Exporter les données depuis Render

### 3.1 Préparer pg_dump

Sur votre machine Windows, vous devez avoir `pg_dump` installé. Options :

**Option A : Installer PostgreSQL localement**
- Téléchargez PostgreSQL depuis https://www.postgresql.org/download/windows/
- `pg_dump` sera inclus

**Option B : Utiliser Docker**
```bash
docker run --rm -e PGPASSWORD=votre_mot_de_passe postgres:16 \
  pg_dump -h votre-render-db.onrender.com \
  -U votre_utilisateur \
  -d votre_base \
  -F c \
  -f backup.dump
```

**Option C : Utiliser un outil graphique**
- **pgAdmin** : https://www.pgadmin.org/download/
- **DBeaver** : https://dbeaver.io/download/
- Exportez votre base de données via l'interface

### 3.2 Exporter depuis Render

**Avec pg_dump en ligne de commande :**

```bash
pg_dump -h votre-render-db.onrender.com \
  -U votre_utilisateur \
  -d votre_base \
  -F c \
  -f backup.dump \
  --no-owner \
  --no-acl
```

**Récupérer les identifiants Render :**
- Allez sur votre dashboard Render.com
- Ouvrez votre base de données PostgreSQL
- Dans "Connections", vous trouverez :
  - Host
  - Port
  - Database
  - User
  - Password (cliquez sur "Show" pour le voir)

---

## Étape 4 : Importer les données dans Supabase

### 4.1 Récupérer les identifiants Supabase

1. Dans Supabase, allez dans **"Settings"** → **"Database"**
2. Trouvez **"Connection string"**
3. Copiez la **"Connection pooling"** ou **"Direct connection"** URI
4. Notez aussi :
   - **Host** : `db.votre-projet.supabase.co`
   - **Database** : `postgres` (toujours `postgres` dans Supabase)
   - **User** : `postgres`
   - **Password** : Le mot de passe que vous avez créé à l'étape 1.2

### 4.2 Importer avec pg_restore

**Avec pg_restore en ligne de commande :**

```bash
pg_restore -h db.votre-projet.supabase.co \
  -U postgres \
  -d postgres \
  --clean \
  --if-exists \
  --no-owner \
  --no-acl \
  backup.dump
```

Vous serez invité à entrer le mot de passe.

**Avec un outil graphique (pgAdmin/DBeaver) :**
1. Connectez-vous à Supabase
2. Utilisez l'outil d'importation
3. Sélectionnez votre fichier `backup.dump`

### 4.3 Vérifier l'importation

Dans Supabase SQL Editor :

```sql
-- Lister toutes les tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- Vérifier que vos données sont présentes
SELECT COUNT(*) FROM votre_table;
```

---

## Étape 5 : Vérifier PostGIS et GDAL dans Supabase

### 5.1 Vérifier PostGIS

```sql
-- Version PostGIS
SELECT PostGIS_Version();

-- Extensions installées
SELECT extname, extversion 
FROM pg_extension 
WHERE extname LIKE '%postgis%';
```

### 5.2 Vérifier GDAL (IMPORTANT)

```sql
-- Compter les pilotes GDAL
SELECT COUNT(*) as nombre_pilotes FROM ST_GDALDrivers();

-- Vérifier JPEG et PNG
SELECT short_name, long_name, can_read, can_write
FROM ST_GDALDrivers()
WHERE short_name IN ('JPEG', 'PNG')
ORDER BY short_name;

-- Si JPEG/PNG sont présents avec can_write = true → ✅ GDAL fonctionne !
```

**Si GDAL est disponible :** ✅ Vous pouvez continuer !

**Si GDAL n'est pas disponible :** ⚠️ Contactez le support Supabase ou essayez une autre solution.

---

## Étape 6 : Mettre à jour votre application Render

### 6.1 Récupérer la nouvelle DATABASE_URL

Dans Supabase :
1. Allez dans **"Settings"** → **"Database"**
2. Trouvez **"Connection string"**
3. Sélectionnez **"URI"** ou **"Connection pooling"**
4. Copiez l'URI, elle ressemble à :
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.votre-projet.supabase.co:5432/postgres
   ```
5. Remplacez `[YOUR-PASSWORD]` par votre mot de passe

### 6.2 Mettre à jour Render.com

1. Allez sur votre dashboard Render.com
2. Ouvrez votre service backend (celui qui exécute Flask)
3. Allez dans **"Environment"**
4. Trouvez la variable `DATABASE_URL`
5. Cliquez sur **"Edit"** et remplacez l'ancienne URL par la nouvelle URL Supabase
6. Cliquez sur **"Save Changes"**
7. Render redéploiera automatiquement votre service

### 6.3 Vérifier la connexion

Après le redéploiement, vérifiez les logs Render :
1. Allez dans **"Logs"** de votre service backend
2. Vérifiez qu'il n'y a pas d'erreur de connexion
3. Testez votre application

---

## Étape 7 : Tester les rasters

### 7.1 Tester dans l'application

1. Ouvrez votre application
2. Sélectionnez une couche raster
3. Vérifiez qu'elle se charge correctement
4. Vérifiez la console du navigateur (F12) pour voir s'il y a des erreurs

### 7.2 Tester directement dans PostgreSQL

```sql
-- Tester la génération d'une image raster
-- (Remplacez 'dem' par le nom de votre table raster)
SELECT 
    ST_AsGDALRaster(
        ST_Reclass(
            ST_Union(rast),
            1,
            '-1000000-1000000:0-255',
            '8BUI',
            0
        ),
        'JPEG',
        ARRAY['QUALITY=85']
    )
FROM dem
LIMIT 1;
```

Si cette requête retourne des données (bytes), GDAL fonctionne ! ✅

---

## Résolution de problèmes

### Problème : pg_dump ne fonctionne pas

**Solution :**
- Utilisez pgAdmin ou DBeaver pour exporter
- Ou utilisez Docker pour avoir pg_dump

### Problème : Erreur de connexion à Supabase

**Solution :**
- Vérifiez que vous utilisez le bon host : `db.votre-projet.supabase.co`
- Vérifiez le mot de passe
- Vérifiez que votre IP n'est pas bloquée (Supabase peut bloquer certaines IP)

### Problème : GDAL toujours vide dans Supabase

**Solution :**
- Contactez le support Supabase
- Ou essayez AWS RDS (garantit GDAL)

### Problème : Les rasters ne se chargent toujours pas

**Solution :**
- Vérifiez les logs du backend Render
- Vérifiez la console du navigateur
- Vérifiez que GDAL est bien disponible : `SELECT COUNT(*) FROM ST_GDALDrivers();`

---

## Checklist de migration

- [ ] Compte Supabase créé
- [ ] Projet Supabase créé
- [ ] PostGIS activé
- [ ] GDAL vérifié (JPEG et PNG présents avec can_write = true)
- [ ] Données exportées depuis Render
- [ ] Données importées dans Supabase
- [ ] Données vérifiées dans Supabase
- [ ] DATABASE_URL mis à jour dans Render
- [ ] Service backend redéployé
- [ ] Connexion vérifiée (pas d'erreur dans les logs)
- [ ] Rasters testés dans l'application
- [ ] Tout fonctionne ! ✅

---

## Coûts

**Supabase Free Tier :**
- ✅ 500 MB de base de données
- ✅ 2 GB de bandwidth par mois
- ✅ Illimité d'API requests
- ✅ Support communauté

**Si vous dépassez les limites :**
- Pro Plan : $25/mois
- Team Plan : $599/mois

---

## Conclusion

Si tout se passe bien, vous devriez maintenant avoir :
- ✅ PostGIS avec GDAL disponible
- ✅ Pilotes JPEG et PNG fonctionnels
- ✅ Rasters qui se chargent correctement
- ✅ Application fonctionnelle

Bon courage avec la migration ! 🚀


