# Utiliser SQL Shell (psql) pour se connecter

## 🚀 Démarrage

1. **Ouvrez "SQL Shell (psql)"** depuis le menu Démarrer
2. Vous verrez une série de questions

## 📝 Connexion étape par étape

Quand SQL Shell s'ouvre, il vous posera des questions :

### Question 1 : Server
```
Server [localhost]:
```
**Réponse :** Appuyez sur **Entrée** (laissez vide pour localhost, mais nous allons spécifier l'host plus tard)

**OU** tapez directement :
```
dpg-d57e3n0gjchc739i6de0-a.oregon-postgres.render.com
```

### Question 2 : Database
```
Database [postgres]:
```
**Réponse :** Tapez :
```
backend_bzzj
```

### Question 3 : Port
```
Port [5432]:
```
**Réponse :** Appuyez sur **Entrée** (5432 est correct)

### Question 4 : Username
```
Username [postgres]:
```
**Réponse :** Tapez :
```
backend
```

### Question 5 : Password
```
Password for user backend:
```
**Réponse :** Tapez :
```
o421xTuVDOuHTogm2kVcYKo1VckB9ykM
```

⚠️ **Note :** Le mot de passe ne s'affichera pas pendant que vous tapez (c'est normal pour la sécurité)

## ✅ Une fois connecté

Vous verrez :
```
backend_bzzj=#
```

Cela signifie que vous êtes connecté !

## 📋 Commandes utiles dans psql

### Commandes de base

```sql
-- Lister toutes les tables
\dt

-- Lister les tables avec description
\dt+

-- Vérifier que PostGIS est installé
SELECT PostGIS_version();

-- Lister les tables avec des colonnes géométriques
SELECT f.table_name
FROM information_schema.tables f
WHERE f.table_schema = 'public'
AND f.table_type = 'BASE TABLE'
AND EXISTS (
    SELECT 1 
    FROM information_schema.columns c
    WHERE c.table_schema = f.table_schema
    AND c.table_name = f.table_name
    AND (c.data_type LIKE '%geometry%' OR c.udt_name = 'geometry')
);

-- Voir les colonnes d'une table
\d nom_de_la_table

-- Compter les lignes d'une table
SELECT COUNT(*) FROM nom_de_la_table;

-- Quitter psql
\q
```

### Commandes psql (commencent par \)

```sql
-- Aide générale
\?

-- Aide sur les commandes SQL
\h

-- Aide sur une commande spécifique
\h SELECT

-- Lister toutes les bases de données
\l

-- Changer de base de données
\c nom_de_la_base

-- Afficher les informations de connexion
\conninfo

-- Afficher les variables
\set

-- Historique des commandes
\s

-- Exécuter un fichier SQL
\i chemin/vers/fichier.sql
```

## 🎯 Exemple complet de session

```
Server [localhost]: dpg-d57e3n0gjchc739i6de0-a.oregon-postgres.render.com
Database [postgres]: backend_bzzj
Port [5432]: 
Username [postgres]: backend
Password for user backend: o421xTuVDOuHTogm2kVcYKo1VckB9ykM

backend_bzzj=# \dt
                    List of relations
 Schema |      Name       | Type  | Owner  
--------+-----------------+-------+--------
 public | ma_table        | table | backend
(1 row)

backend_bzzj=# SELECT PostGIS_version();
            postgis_version            
---------------------------------------
 3.5.0 rXXXXX
(1 row)

backend_bzzj=# \q
```

## 🚨 Dépannage

### Erreur : "connection refused"
- Vérifiez que la base de données est active sur Render
- Vérifiez l'adresse du host

### Erreur : "password authentication failed"
- Vérifiez le mot de passe
- Assurez-vous de taper le bon nom d'utilisateur

### Erreur : "database does not exist"
- Vérifiez le nom de la base de données (`backend_bzzj`)

### Le mot de passe ne s'affiche pas
- C'est normal ! Tapez quand même et appuyez sur Entrée

## 💡 Astuce : Connexion directe depuis PowerShell

Si vous préférez, vous pouvez aussi utiliser SQL Shell depuis PowerShell avec la commande complète :

```powershell
& "C:\Program Files\PostgreSQL\16\bin\psql.exe" -h dpg-d57e3n0gjchc739i6de0-a.oregon-postgres.render.com -U backend -d backend_bzzj
```

(PowerShell vous demandera le mot de passe)

## ✅ Vérification rapide

Une fois connecté, testez :

```sql
-- Vérifier la connexion
SELECT current_database(), current_user;

-- Vérifier PostGIS
SELECT PostGIS_version();

-- Lister les tables
\dt
```

Si tout fonctionne, votre base de données est accessible et prête à être utilisée par votre application !







