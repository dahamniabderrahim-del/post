# Guide de Débogage - Couches Raster

## Problème
La couche raster n'apparaît pas dans le site.

## Étapes de débogage

### 1. Vérifier que les rasters sont détectés par l'API

**Test dans le navigateur :**
```
http://localhost:5000/api/layers
```

**Résultat attendu :**
```json
[
  {
    "name": "nom_table_raster",
    "schema": "public",
    "type": "raster"
  },
  ...
]
```

**Si les rasters n'apparaissent pas :**
- Vérifiez que votre table a bien une colonne de type `raster`
- Vérifiez dans PostgreSQL :
  ```sql
  SELECT column_name, data_type, udt_name
  FROM information_schema.columns
  WHERE table_name = 'votre_table'
  AND (data_type LIKE '%raster%' OR udt_name = 'raster');
  ```

### 2. Vérifier l'endpoint des limites (bounds)

**Test dans le navigateur :**
```
http://localhost:5000/api/layers/nom_table_raster/raster/bounds
```

**Résultat attendu :**
```json
{
  "minx": -8.7,
  "miny": 19.0,
  "maxx": 11.9,
  "maxy": 37.1
}
```

**Si erreur :**
- Vérifiez les logs du backend pour voir l'erreur exacte
- Vérifiez que la requête SQL fonctionne dans PostgreSQL :
  ```sql
  SELECT 
      ST_XMin(ST_Envelope(ST_Union(raster_column))) as minx,
      ST_YMin(ST_Envelope(ST_Union(raster_column))) as miny,
      ST_XMax(ST_Envelope(ST_Union(raster_column))) as maxx,
      ST_YMax(ST_Envelope(ST_Union(raster_column))) as maxy
  FROM votre_table;
  ```

### 3. Vérifier l'endpoint d'image raster

**Test dans le navigateur :**
```
http://localhost:5000/api/layers/nom_table_raster/raster?bbox=-8.7,19.0,11.9,37.1&width=512&height=512
```

**Résultat attendu :**
- Une image PNG devrait s'afficher dans le navigateur

**Si erreur :**
- Vérifiez les logs du backend
- Vérifiez que PostGIS est bien installé avec support raster :
  ```sql
  SELECT PostGIS_version();
  SELECT PostGIS_Raster_Lib_Build_Date();
  ```

### 4. Vérifier la console du navigateur

**Ouvrez la console (F12) et cherchez :**
- `🗺️ Couche raster détectée: nom_table`
- `🖼️ Création d'une couche raster`
- `📡 Récupération des limites du raster...`
- `✅ Couche raster ajoutée à la carte`

**Erreurs possibles :**
- `❌ Impossible de récupérer les limites` : Problème avec l'endpoint `/raster/bounds`
- `❌ Erreur lors du chargement du raster` : Problème avec l'endpoint `/raster`
- `❌ Erreur de chargement de l'image raster` : Problème avec l'image PNG

### 5. Vérifier les logs du backend

**Dans les logs du serveur Flask, cherchez :**
- `📋 X couche(s) trouvée(s) (Y vectorielle(s), Z raster(s))`
- `✅ Raster nom_table: Colonne raster trouvée: nom_colonne`
- `✅ Raster nom_table: Image PNG générée (X bytes)`

**Erreurs possibles :**
- `❌ Aucune colonne raster trouvée` : La table n'a pas de colonne raster
- `❌ Impossible de générer l'image raster` : Problème avec la requête SQL
- Erreurs SQL : Vérifiez la syntaxe PostGIS

### 6. Vérifier la structure de la table raster

**Dans PostgreSQL :**
```sql
-- Vérifier que la table existe
SELECT * FROM information_schema.tables 
WHERE table_name = 'votre_table';

-- Vérifier les colonnes
SELECT column_name, data_type, udt_name
FROM information_schema.columns
WHERE table_name = 'votre_table';

-- Vérifier que la colonne raster contient des données
SELECT COUNT(*) FROM votre_table;
SELECT ST_Metadata(raster_column) FROM votre_table LIMIT 1;
```

### 7. Problèmes courants et solutions

#### Problème : Les rasters ne sont pas détectés dans `/api/layers`
**Solution :**
- Vérifiez que la colonne est bien de type `raster` (pas `geometry`)
- Vérifiez que la table est dans le schéma `public`
- Vérifiez que PostGIS est installé avec support raster

#### Problème : Erreur "Aucune colonne raster trouvée"
**Solution :**
- Vérifiez le nom exact de la colonne raster
- Vérifiez que le type est bien `raster` dans `information_schema.columns`

#### Problème : Erreur SQL avec ST_Clip ou ST_Union
**Solution :**
- Vérifiez que PostGIS est à jour
- Vérifiez que les rasters ont le bon SRID (4326)
- Essayez de simplifier la requête :
  ```sql
  SELECT ST_AsPNG(ST_Union(raster_column)) FROM votre_table;
  ```

#### Problème : L'image ne s'affiche pas dans le navigateur
**Solution :**
- Vérifiez que l'URL est correcte
- Vérifiez les en-têtes CORS
- Vérifiez que l'image PNG est valide (essayez de la sauvegarder et l'ouvrir)

#### Problème : La couche apparaît dans la liste mais pas sur la carte
**Solution :**
- Vérifiez la console du navigateur pour les erreurs JavaScript
- Vérifiez que `ImageLayer` est bien importé
- Vérifiez que l'extent est correct (pas NaN ou Infinity)
- Vérifiez que la projection est correcte (EPSG:3857)

### 8. Test manuel dans PostgreSQL

**Testez directement dans PostgreSQL :**
```sql
-- 1. Vérifier la colonne raster
SELECT column_name FROM information_schema.columns
WHERE table_name = 'votre_table' 
AND udt_name = 'raster';

-- 2. Vérifier les limites
SELECT 
    ST_XMin(ST_Envelope(ST_Union(raster_column))) as minx,
    ST_YMin(ST_Envelope(ST_Union(raster_column))) as miny,
    ST_XMax(ST_Envelope(ST_Union(raster_column))) as maxx,
    ST_YMax(ST_Envelope(ST_Union(raster_column))) as maxy
FROM votre_table;

-- 3. Tester la génération PNG (peut être long)
SELECT ST_AsPNG(ST_Union(raster_column)) FROM votre_table;
```

### 9. Vérifier la configuration CORS

**Si l'image ne charge pas depuis le frontend :**
- Vérifiez que CORS est configuré pour autoriser les requêtes d'images
- Vérifiez que l'URL de l'API est correcte dans `config.js`

### 10. Logs à vérifier

**Backend (Flask) :**
- `📋 X couche(s) trouvée(s) (Y vectorielle(s), Z raster(s))`
- `✅ Raster nom_table: Colonne raster trouvée: nom_colonne`
- `✅ Raster nom_table: Image PNG générée (X bytes)`

**Frontend (Console navigateur) :**
- `🗺️ Couche raster détectée: nom_table`
- `🖼️ Création d'une couche raster`
- `📡 Récupération des limites du raster...`
- `✅ Couche raster ajoutée à la carte`

## Commandes utiles

**Vérifier PostGIS raster :**
```sql
SELECT PostGIS_version();
SELECT PostGIS_Raster_Lib_Build_Date();
```

**Lister toutes les tables raster :**
```sql
SELECT f.table_name
FROM information_schema.tables f
WHERE f.table_schema = 'public'
AND f.table_type = 'BASE TABLE'
AND EXISTS (
    SELECT 1 
    FROM information_schema.columns c
    WHERE c.table_schema = f.table_schema
    AND c.table_name = f.table_name
    AND (c.data_type LIKE '%raster%' OR c.udt_name = 'raster')
);
```

**Vérifier les métadonnées d'un raster :**
```sql
SELECT ST_Metadata(raster_column) FROM votre_table LIMIT 1;
```


