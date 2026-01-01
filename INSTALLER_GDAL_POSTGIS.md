# Installation de GDAL pour PostGIS

## Problème

L'erreur `rt_raster_to_gdal : Impossible de charger le pilote GDAL de sortie` indique que PostGIS n'a pas accès aux pilotes GDAL nécessaires pour convertir les rasters en images (JPEG/PNG).

## Solution

### Sur un serveur Linux (Ubuntu/Debian)

```bash
# Installer GDAL et les pilotes
sudo apt-get update
sudo apt-get install gdal-bin libgdal-dev

# Installer les pilotes JPEG et PNG
sudo apt-get install gdal-bin libgdal-dev libgdal-java

# Redémarrer PostgreSQL pour que PostGIS détecte GDAL
sudo systemctl restart postgresql
```

### Sur Render.com

Render utilise des conteneurs Docker. GDAL doit être installé dans l'image Docker ou dans le système.

**Option 1 : Utiliser une image Docker avec GDAL**

Modifiez votre `Dockerfile` (si vous en avez un) :

```dockerfile
FROM python:3.11

# Installer GDAL
RUN apt-get update && apt-get install -y \
    gdal-bin \
    libgdal-dev \
    python3-gdal \
    && rm -rf /var/lib/apt/lists/*

# Installer les dépendances Python
COPY backend/requirements.txt .
RUN pip install -r requirements.txt

COPY backend/ /app/
WORKDIR /app
```

**Option 2 : Utiliser une base de données PostgreSQL avec GDAL pré-installé**

Sur Render, vous pouvez utiliser une base de données PostgreSQL qui a GDAL pré-installé. Vérifiez les options disponibles.

### Vérifier que GDAL est disponible

Dans PostgreSQL, exécutez :

```sql
-- Vérifier la version de GDAL
SELECT PostGIS_GDAL_Version();

-- Vérifier les pilotes disponibles
SELECT * FROM ST_GDALDrivers();
```

Si ces requêtes retournent des erreurs, GDAL n'est pas disponible.

### Alternative : Utiliser une autre méthode

Si GDAL n'est pas disponible, vous pouvez :

1. **Utiliser un service externe** : Servir les rasters via GeoServer ou MapServer
2. **Convertir les rasters en images** : Utiliser un script Python avec `rasterio` pour convertir les rasters en images avant de les servir
3. **Utiliser des tuiles** : Générer des tuiles raster avec `gdal2tiles.py` et les servir comme tuiles statiques

## Configuration PostGIS avec GDAL

Après avoir installé GDAL, vous devez vous assurer que PostGIS peut le détecter :

```sql
-- Vérifier la configuration PostGIS
SELECT PostGIS_version();
SELECT PostGIS_GDAL_Version();

-- Si GDAL n'est pas détecté, vous devrez peut-être recompiler PostGIS
```

## Note importante

Sur Render.com, il peut être difficile d'installer GDAL car vous n'avez pas un accès root complet. Dans ce cas, vous devrez peut-être :

1. Utiliser une base de données PostgreSQL externe qui a GDAL
2. Utiliser un service de tuiles externe (comme MapTiler, Mapbox, etc.)
3. Pré-générer les images raster et les servir comme fichiers statiques

## Test

Après avoir installé/configuré GDAL, testez :

```sql
-- Tester la conversion en JPEG
SELECT ST_AsJPEG(
    ST_Reclass(
        ST_Union(rast),
        1,
        '0-1000:0-255',
        '8BUI',
        0
    )
) FROM votre_table LIMIT 1;
```

Si cette requête fonctionne, GDAL est correctement configuré.






