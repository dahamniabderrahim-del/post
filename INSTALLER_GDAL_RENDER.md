# Installation de GDAL sur Render.com pour PostGIS

## ⚠️ Situation

Votre base de données PostgreSQL est sur **Render.com**, ce qui signifie :

- ❌ **Installer GDAL sur Windows ne résoudra pas le problème**
- ✅ GDAL doit être installé **sur le serveur Render.com**
- ⚠️ Render.com est un service géré, l'accès root est limité

## Problème

Render.com propose des bases de données PostgreSQL gérées où vous n'avez pas un accès root complet pour installer des packages système comme GDAL.

## Solutions possibles

### Option 1 : Utiliser une base de données externe avec GDAL (Recommandé)

**Migrer vers un service qui inclut GDAL pré-installé :**

#### A. Supabase

1. Créez un compte sur https://supabase.com
2. Créez un nouveau projet
3. Activez PostGIS dans les extensions
4. Vérifiez GDAL :

```sql
SELECT * FROM ST_GDALDrivers();
```

**Avantages :**
- ✅ PostGIS avec GDAL généralement inclus
- ✅ Gratuit pour les petits projets
- ✅ Interface moderne
- ✅ Migration simple depuis Render

**Inconvénients :**
- ⚠️ Vérifiez que GDAL est disponible (certains plans peuvent ne pas l'inclure)

#### B. AWS RDS avec PostGIS

1. Créez une instance RDS PostgreSQL
2. Activez l'extension PostGIS
3. GDAL est généralement inclus dans les instances RDS PostGIS

**Avantages :**
- ✅ GDAL pré-installé
- ✅ Service fiable et évolutif
- ✅ Support professionnel

**Inconvénients :**
- ⚠️ Peut être plus cher que Render
- ⚠️ Configuration plus complexe

#### C. Google Cloud SQL

1. Créez une instance Cloud SQL PostgreSQL
2. Activez l'extension PostGIS
3. GDAL est généralement inclus

#### D. Railway.app

1. Créez un projet sur https://railway.app
2. Ajoutez PostgreSQL + PostGIS
3. Vérifiez GDAL (peut nécessiter configuration)

### Option 2 : Docker PostgreSQL sur Render (si disponible)

Si Render.com permet de déployer des conteneurs Docker :

1. Créez un nouveau **Web Service** sur Render
2. Utilisez une image Docker PostGIS avec GDAL :

**Dockerfile :**
```dockerfile
FROM postgis/postgis:16-3.4

# GDAL est généralement inclus, mais on peut l'installer explicitement
RUN apt-get update && \
    apt-get install -y gdal-bin libgdal-dev && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Configuration PostgreSQL
ENV POSTGRES_USER=postgres
ENV POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
ENV POSTGRES_DB=backend

EXPOSE 5432

CMD ["postgres"]
```

**Avantages :**
- ✅ Contrôle total sur l'environnement
- ✅ GDAL peut être installé

**Inconvénients :**
- ⚠️ Plus complexe à configurer
- ⚠️ Vous devez gérer les backups et la maintenance
- ⚠️ Peut être plus cher

### Option 3 : Contacter le support Render

1. Contactez le support Render.com
2. Demandez si GDAL peut être installé sur votre instance PostgreSQL
3. Expliquez que vous avez besoin de GDAL pour les fonctions PostGIS raster

**Message type :**
```
Bonjour,

J'utilise une base de données PostgreSQL avec PostGIS sur Render.com.
J'ai besoin d'accéder aux fonctions GDAL de PostGIS (notamment ST_GDALDrivers() et ST_AsGDALRaster()).

Actuellement, la requête SELECT * FROM ST_GDALDrivers() retourne aucune ligne, ce qui indique que GDAL n'est pas installé.

Pouvez-vous installer GDAL sur mon instance PostgreSQL, ou me dire si c'est possible ?

Merci,
```

### Option 4 : Utiliser un service externe pour les rasters (GeoServer/MapServer)

Au lieu d'utiliser PostGIS pour servir les rasters, utilisez un service externe :

#### A. GeoServer

1. Déployez GeoServer sur Render.com (nouveau Web Service)
2. Connectez GeoServer à votre base de données Render
3. Configurez les stores PostGIS dans GeoServer
4. GeoServer peut servir les rasters PostGIS sans GDAL dans PostGIS

**Avantages :**
- ✅ Pas besoin de GDAL dans PostGIS
- ✅ Solution standard pour servir des données géospatiales
- ✅ Supporte WMS, WMTS, etc.

**Inconvénients :**
- ⚠️ Service supplémentaire à maintenir
- ⚠️ Plus de complexité

### Option 5 : Continuer sans les rasters (Temporaire)

**Si vous ne pouvez pas installer GDAL maintenant :**

- ✅ Utilisez uniquement les couches vectorielles
- ✅ L'application fonctionne déjà correctement
- ✅ Vous pouvez ajouter le support raster plus tard

## Recommandation

**Selon votre situation :**

1. **Si vous avez besoin des rasters immédiatement** :
   - ➡️ **Option 1** : Migrez vers Supabase ou AWS RDS (plus rapide)
   - ➡️ **Option 4** : Utilisez GeoServer (si vous voulez rester sur Render)

2. **Si vous pouvez attendre** :
   - ➡️ **Option 3** : Contactez le support Render
   - ➡️ **Option 5** : Continuez avec les vectorielles pour l'instant

3. **Si vous avez un budget** :
   - ➡️ **Option 1 (B)** : AWS RDS (plus fiable)

## Migration vers Supabase (Exemple)

### Étape 1 : Créer le projet Supabase

1. Allez sur https://supabase.com
2. Créez un compte et un nouveau projet
3. Notez vos identifiants de connexion

### Étape 2 : Exporter les données depuis Render

Sur votre machine Windows, utilisez `pg_dump` :

```bash
# Si vous avez PostgreSQL installé localement ou utilisez Docker
pg_dump -h votre-render-db.onrender.com \
  -U votre_utilisateur \
  -d votre_base \
  -F c \
  -f backup.dump
```

### Étape 3 : Importer dans Supabase

```bash
pg_restore -h db.votre-projet.supabase.co \
  -U postgres \
  -d postgres \
  --clean \
  --if-exists \
  backup.dump
```

### Étape 4 : Activer PostGIS et vérifier GDAL

Dans Supabase SQL Editor :

```sql
-- Activer PostGIS (si pas déjà activé)
CREATE EXTENSION IF NOT EXISTS postgis;

-- Vérifier GDAL
SELECT * FROM ST_GDALDrivers();
```

### Étape 5 : Mettre à jour votre application

Dans Render.com, mettez à jour la variable d'environnement `DATABASE_URL` :

```
DATABASE_URL=postgresql://postgres:votre_mot_de_passe@db.votre-projet.supabase.co:5432/postgres
```

## Vérification finale

Quelle que soit la solution choisie, vérifiez toujours :

```sql
SELECT * FROM ST_GDALDrivers();
```

Si cette requête retourne des lignes, GDAL est disponible ! ✅

## Conclusion

**Sur Render.com, la solution la plus simple est souvent de migrer vers un service qui inclut GDAL pré-installé**, comme Supabase ou AWS RDS.

Si vous voulez rester sur Render.com, contactez le support pour voir si GDAL peut être installé, ou utilisez un service externe comme GeoServer pour servir les rasters.

