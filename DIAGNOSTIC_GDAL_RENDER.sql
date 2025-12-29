-- ============================================
-- Diagnostic complet GDAL dans Render.com
-- ============================================

-- 1. Vérifier la version complète de PostGIS
--    (devrait mentionner GDAL si disponible)
SELECT PostGIS_Full_Version();

-- 2. Vérifier la version de PostGIS
SELECT PostGIS_Version();

-- 3. Vérifier les extensions PostGIS installées
SELECT 
    extname as extension,
    extversion as version
FROM pg_extension 
WHERE extname LIKE '%postgis%'
ORDER BY extname;

-- 4. Compter les pilotes GDAL disponibles
--    (devrait retourner un nombre > 0 si GDAL est configuré)
SELECT COUNT(*) as nombre_pilotes_gdal 
FROM ST_GDALDrivers();

-- 5. Lister tous les pilotes GDAL disponibles
--    (devrait retourner des lignes si GDAL est configuré)
SELECT 
    idx,
    short_name,
    long_name,
    can_read,
    can_write,
    create_options
FROM ST_GDALDrivers()
ORDER BY short_name
LIMIT 20;

-- 6. Vérifier spécifiquement les pilotes JPEG et PNG
--    (ceux dont nous avons besoin)
SELECT 
    short_name,
    long_name,
    can_read,
    can_write
FROM ST_GDALDrivers()
WHERE short_name IN ('JPEG', 'PNG', 'JPEG2000', 'PNG_JPEG')
ORDER BY short_name;

-- 7. Vérifier les pilotes qui peuvent écrire
--    (nécessaires pour ST_AsGDALRaster)
SELECT 
    COUNT(*) as pilotes_ecriture
FROM ST_GDALDrivers()
WHERE can_write = true;

-- 8. Lister les pilotes qui peuvent écrire
SELECT 
    short_name,
    long_name,
    can_write
FROM ST_GDALDrivers()
WHERE can_write = true
ORDER BY short_name
LIMIT 10;

-- ============================================
-- Interprétation des résultats
-- ============================================
-- 
-- Si toutes les requêtes retournent 0 ou aucune ligne :
--   → GDAL n'est pas configuré pour PostGIS
--   → Contactez le support Render
--
-- Si certaines requêtes retournent des résultats mais pas JPEG/PNG :
--   → GDAL est configuré mais les pilotes JPEG/PNG ne sont pas disponibles
--   → Il faut installer les pilotes JPEG/PNG
--
-- Si JPEG/PNG sont présents avec can_write = true :
--   → GDAL est correctement configuré
--   → Le problème vient peut-être du code ou d'une autre configuration


