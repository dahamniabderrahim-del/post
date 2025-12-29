# Comment interpréter les résultats de ST_GDALDrivers()

## Structure des colonnes

- **idx** : Index du pilote
- **short_name** : Nom court du pilote (ex: "JPEG", "PNG", "GTiff")
- **long_name** : Nom complet du pilote
- **can_read** : `true` si le pilote peut lire ce format
- **can_write** : `true` si le pilote peut écrire ce format (nécessaire pour ST_AsGDALRaster)
- **create_options** : Options de création disponibles

## Scénarios possibles

### ✅ Scénario 1 : Des pilotes sont disponibles

Si vous voyez des lignes avec des données :

1. **Recherchez JPEG et PNG** :
   ```sql
   SELECT * FROM ST_GDALDrivers()
   WHERE short_name IN ('JPEG', 'PNG')
   ORDER BY short_name;
   ```

2. **Vérifiez que can_write = true** :
   - Si `can_write = false` : Le pilote peut lire mais pas écrire → ne fonctionnera pas pour ST_AsGDALRaster
   - Si `can_write = true` : Le pilote peut écrire → devrait fonctionner

3. **Si JPEG/PNG sont présents avec can_write = true** :
   - ✅ Les pilotes sont installés
   - ❓ Le problème vient peut-être du code ou de la configuration
   - Vérifiez les logs du serveur pour plus de détails

### ❌ Scénario 2 : Aucun résultat (table vide)

Si la requête ne retourne aucune ligne :

- ❌ GDAL n'est pas installé ou configuré dans PostGIS
- ✅ Cela confirme pourquoi les rasters ne fonctionnent pas
- ➡️ Vous devez installer GDAL (voir `INSTALLER_GDAL_POSTGIS.md`)

### ⚠️ Scénario 3 : JPEG/PNG absents mais d'autres pilotes présents

Si vous voyez d'autres pilotes (comme GTiff, BMP, etc.) mais pas JPEG/PNG :

- ⚠️ GDAL est installé mais les pilotes JPEG/PNG ne sont pas compilés
- ➡️ Options :
  1. Installer les pilotes JPEG/PNG manquants
  2. Modifier le code pour utiliser un autre format disponible (ex: GTiff)

## Requêtes utiles

### Voir tous les pilotes qui peuvent écrire :
```sql
SELECT short_name, long_name, can_write
FROM ST_GDALDrivers()
WHERE can_write = true
ORDER BY short_name;
```

### Vérifier spécifiquement JPEG et PNG :
```sql
SELECT short_name, long_name, can_read, can_write
FROM ST_GDALDrivers()
WHERE short_name IN ('JPEG', 'PNG', 'PNG_JPEG', 'JPEG2000')
ORDER BY short_name;
```

### Compter le nombre total de pilotes :
```sql
SELECT COUNT(*) as total_drivers,
       COUNT(*) FILTER (WHERE can_write = true) as writable_drivers
FROM ST_GDALDrivers();
```

## Prochaines étapes selon les résultats

1. **Si aucun pilote n'apparaît** :
   - Consultez `INSTALLER_GDAL_POSTGIS.md` pour installer GDAL

2. **Si JPEG/PNG sont absents** :
   - Option A : Installer les pilotes JPEG/PNG manquants
   - Option B : Modifier le code pour utiliser un format disponible

3. **Si JPEG/PNG sont présents avec can_write = true** :
   - Le problème vient peut-être d'ailleurs
   - Vérifiez les logs du serveur backend
   - Vérifiez que la syntaxe SQL est correcte

## Astuce

Si vous avez beaucoup de résultats, utilisez cette requête pour filtrer :
```sql
SELECT short_name, long_name, can_read, can_write
FROM ST_GDALDrivers()
WHERE short_name LIKE '%JPEG%' 
   OR short_name LIKE '%PNG%'
   OR can_write = true
ORDER BY can_write DESC, short_name;
```


