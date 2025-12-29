# Debug : Erreur 500 sur l'endpoint Raster

## Problème

L'endpoint `/api/layers/dem/raster` retourne une erreur 500 (Internal Server Error).

## Solution : Vérifier les logs Render

### Étape 1 : Accéder aux logs

1. Allez sur https://dashboard.render.com
2. Ouvrez votre service backend (`post-aypc`)
3. Cliquez sur **"Logs"** dans le menu de gauche
4. Regardez les logs récents, cherchez les messages qui commencent par :
   - `❌ Raster dem:`
   - `⚠️ Raster dem:`
   - `✅ Raster dem:`

### Étape 2 : Identifier l'erreur

Les logs devraient contenir le message d'erreur exact. Exemples :

**Si vous voyez :**
```
❌ Raster dem: JPEG et PNG ont échoué
```

**Ou :**
```
❌ Erreur dans get_layer_raster pour dem: rt_raster_to_gdal : Impossible de charger le pilote GDAL
```

**Ou :**
```
❌ Erreur dans get_layer_raster pour dem: [message d'erreur SQL]
```

### Étape 3 : Solutions selon l'erreur

#### Erreur : "Impossible de charger le pilote GDAL"

**Solution :** Les pilotes JPEG/PNG ne sont pas disponibles dans GDAL.

**Vérifier les pilotes disponibles :**
Connectez-vous à votre base de données PostgreSQL et exécutez :
```sql
SELECT * FROM ST_GDALDrivers();
```

**Si JPEG/PNG n'apparaissent pas :**
GDAL n'a pas été compilé avec les pilotes JPEG/PNG. Vous devrez soit :
1. Recompiler PostGIS avec les pilotes GDAL
2. Utiliser une autre méthode pour servir les rasters

#### Erreur : Erreur SQL

**Solution :** Vérifiez la syntaxe SQL dans les logs. Le problème peut venir de :
- `ST_Reclass` avec une syntaxe incorrecte
- `ST_AsGDALRaster` avec des options incorrectes
- Problème avec les paramètres de la requête

#### Erreur : "Aucune donnée retournée"

**Solution :** La requête SQL ne retourne aucun résultat. Vérifiez :
- Que la table existe
- Que la colonne raster contient des données
- Que le bbox intersecte avec le raster

## Test manuel dans PostgreSQL

Pour tester directement dans PostgreSQL :

```sql
-- 1. Vérifier que la table existe
SELECT * FROM information_schema.tables WHERE table_name = 'dem';

-- 2. Vérifier la colonne raster
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'dem' AND udt_name = 'raster';

-- 3. Tester la conversion en JPEG (remplacez rast par le nom de votre colonne)
SELECT ST_AsGDALRaster(
    ST_Reclass(
        ST_Union(rast),
        1,
        '-1000000-1000000:0-255',
        '8BUI',
        0
    ),
    'JPEG',
    ARRAY['QUALITY=85']
) FROM dem LIMIT 1;
```

## Amélioration du code

Le code a été amélioré pour :
- ✅ Retourner des messages d'erreur plus détaillés
- ✅ Logger toutes les exceptions avec traceback complet
- ✅ Gérer les cas où les variables ne sont pas définies

## Prochaines étapes

1. **Consultez les logs Render** pour voir l'erreur exacte
2. **Testez la requête SQL directement** dans PostgreSQL
3. **Partagez l'erreur** des logs pour que je puisse vous aider à la résoudre


