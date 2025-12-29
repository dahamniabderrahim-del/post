# Solution Simple : Docker avec PostGIS + GDAL sur Windows

## ✅ Solution Recommandée

La **solution la plus simple** pour avoir PostGIS avec GDAL sur Windows est d'utiliser **Docker**.

## Étape 1 : Installer Docker Desktop

1. Téléchargez **Docker Desktop pour Windows** : https://www.docker.com/products/docker-desktop
2. Installez Docker Desktop
3. Démarrez Docker Desktop
4. Vérifiez que Docker fonctionne :

```bash
docker --version
```

## Étape 2 : Lancer PostgreSQL/PostGIS avec GDAL

Exécutez cette commande dans PowerShell ou CMD :

```bash
docker run -d \
  --name postgis-gdal \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=votre_mot_de_passe \
  -e POSTGRES_DB=backend \
  -p 5432:5432 \
  postgis/postgis:16-3.4
```

**Explication :**
- `--name postgis-gdal` : Nom du conteneur
- `-e POSTGRES_USER=postgres` : Utilisateur PostgreSQL
- `-e POSTGRES_PASSWORD=...` : Mot de passe (changez-le !)
- `-e POSTGRES_DB=backend` : Nom de la base de données
- `-p 5432:5432` : Port (5432 local → 5432 conteneur)
- `postgis/postgis:16-3.4` : Image PostGIS avec GDAL (généralement inclus)

## Étape 3 : Vérifier que GDAL est disponible

1. Connectez-vous à PostgreSQL dans le conteneur :

```bash
docker exec -it postgis-gdal psql -U postgres -d backend
```

2. Dans PostgreSQL, exécutez :

```sql
SELECT * FROM ST_GDALDrivers();
```

Si vous voyez des lignes, GDAL est disponible ! ✅

## Étape 4 : Configurer votre application

Dans votre fichier de configuration (variables d'environnement), utilisez :

```
DATABASE_URL=postgresql://postgres:votre_mot_de_passe@localhost:5432/backend
```

## Vérifier les pilotes JPEG/PNG

Dans PostgreSQL, exécutez :

```sql
SELECT short_name, long_name, can_write
FROM ST_GDALDrivers()
WHERE short_name IN ('JPEG', 'PNG')
ORDER BY short_name;
```

## Commandes Docker utiles

**Voir les conteneurs en cours :**
```bash
docker ps
```

**Arrêter le conteneur :**
```bash
docker stop postgis-gdal
```

**Démarrer le conteneur :**
```bash
docker start postgis-gdal
```

**Voir les logs :**
```bash
docker logs postgis-gdal
```

**Supprimer le conteneur :**
```bash
docker rm -f postgis-gdal
```

## Si GDAL n'est pas disponible dans l'image

Si `ST_GDALDrivers()` retourne vide, vous pouvez créer votre propre image Docker avec GDAL :

**Dockerfile :**
```dockerfile
FROM postgis/postgis:16-3.4

# Installer GDAL (déjà inclus généralement, mais au cas où)
RUN apt-get update && \
    apt-get install -y gdal-bin libgdal-dev && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Redémarrer PostgreSQL pour charger GDAL
USER postgres
CMD ["postgres"]
```

**Construire l'image :**
```bash
docker build -t postgis-gdal-custom .
```

**Lancer le conteneur :**
```bash
docker run -d \
  --name postgis-gdal \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=votre_mot_de_passe \
  -e POSTGRES_DB=backend \
  -p 5432:5432 \
  postgis-gdal-custom
```

## Avantages de Docker

✅ **Simple** : Pas besoin de compiler PostGIS  
✅ **Isolé** : N'affecte pas votre installation Windows  
✅ **Portable** : Fonctionne de la même façon sur Windows, Mac, Linux  
✅ **GDAL pré-configuré** : Les images PostGIS incluent généralement GDAL  
✅ **Facile à supprimer** : `docker rm -f postgis-gdal` si besoin

## Migration des données existantes

Si vous avez déjà une base de données PostgreSQL avec des données :

1. **Exporter les données :**
```bash
pg_dump -U postgres -h localhost -d votre_base > backup.sql
```

2. **Créer le conteneur Docker** (voir Étape 2)

3. **Importer les données :**
```bash
docker exec -i postgis-gdal psql -U postgres -d backend < backup.sql
```

## Conclusion

✅ **Docker est la solution la plus simple** pour avoir PostGIS + GDAL sur Windows.  
✅ Pas besoin de compiler quoi que ce soit.  
✅ GDAL est généralement inclus dans les images PostGIS officielles.

