-- Vérifier tous les pilotes GDAL disponibles
SELECT * FROM ST_GDALDrivers()
ORDER BY short_name;

-- Vérifier spécifiquement les pilotes JPEG et PNG
SELECT short_name, long_name, can_read, can_write
FROM ST_GDALDrivers()
WHERE short_name IN ('JPEG', 'PNG', 'PNG_JPEG')
ORDER BY short_name;

-- Vérifier les pilotes qui peuvent écrire (nécessaires pour ST_AsGDALRaster)
SELECT short_name, long_name, can_read, can_write, create_options
FROM ST_GDALDrivers()
WHERE can_write = true
ORDER BY short_name;






