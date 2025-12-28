# Problème : Les pilotes GDAL ne sont pas disponibles

## Message d'erreur

```
⚠️ Les pilotes GDAL ne sont pas disponibles. La couche raster ne peut pas être affichée.
```

## Explication

Les couches raster PostGIS nécessitent les pilotes GDAL (JPEG/PNG) pour convertir les données raster en images. Ces pilotes ne sont pas disponibles dans votre installation PostGIS actuelle.

## Impact

- ❌ Les couches raster ne peuvent pas être affichées sur la carte
- ✅ Les couches vectorielles fonctionnent normalement
- ✅ Le reste de l'application fonctionne correctement

## Solutions possibles

### Option 1 : Installer les pilotes GDAL (Recommandé pour la production)

**Si vous avez accès au serveur PostgreSQL :**

1. Vérifiez les pilotes disponibles :
   ```sql
   SELECT * FROM ST_GDALDrivers();
   ```

2. Installez les pilotes GDAL nécessaires :
   - Sur Linux/Debian : `sudo apt-get install gdal-bin libgdal-dev`
   - Sur Windows : Utilisez OSGeo4W ou conda
   - Sur macOS : `brew install gdal`

3. Recompilez PostGIS avec les pilotes GDAL activés

**Documentation complète :** Voir `INSTALLER_GDAL_POSTGIS.md`

### Option 2 : Utiliser une base de données avec GDAL pré-installé

- Utilisez une instance PostgreSQL/PostGIS avec GDAL déjà configuré
- Beaucoup d'hébergeurs cloud (AWS RDS, Google Cloud SQL, etc.) incluent GDAL

### Option 3 : Désactiver temporairement les rasters

Si vous ne pouvez pas installer GDAL pour l'instant, vous pouvez :

1. Ne pas sélectionner les couches raster dans l'interface
2. Ou modifier le code pour filtrer les couches raster de la liste

### Option 4 : Utiliser un service externe

- **GeoServer** : Serveur cartographique qui peut servir des rasters PostGIS
- **MapServer** : Alternative à GeoServer
- **TileServer** : Serveur de tuiles léger

## État actuel du code

Le code gère maintenant correctement les erreurs GDAL :

- ✅ Détecte automatiquement les erreurs GDAL
- ✅ Arrête les tentatives de chargement après 3 erreurs
- ✅ Affiche des messages d'erreur clairs dans la console
- ✅ Désactive la couche raster automatiquement

## Vérification

Pour vérifier si les pilotes GDAL sont disponibles :

```sql
-- Se connecter à PostgreSQL
psql -U votre_utilisateur -d votre_base

-- Vérifier les pilotes disponibles
SELECT short_name, long_name 
FROM ST_GDALDrivers() 
WHERE short_name IN ('JPEG', 'PNG');
```

Si cette requête retourne des résultats, les pilotes sont disponibles.

## Prochaines étapes

1. **Si vous pouvez installer GDAL** : Suivez `INSTALLER_GDAL_POSTGIS.md`
2. **Si vous ne pouvez pas installer GDAL** : Utilisez uniquement les couches vectorielles pour l'instant
3. **Si vous avez besoin des rasters immédiatement** : Considérez une solution externe (GeoServer, etc.)

## Support

Pour plus d'aide sur l'installation de GDAL, consultez :
- La documentation PostGIS : https://postgis.net/docs/RT_ST_GDALDrivers.html
- Le guide `INSTALLER_GDAL_POSTGIS.md` dans ce projet

