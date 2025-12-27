# Connexion PostgreSQL depuis PowerShell (Windows)

## ✅ Syntaxe correcte pour PowerShell

Dans PowerShell, la syntaxe est différente de Linux/Bash. Voici les méthodes :

### Méthode 1 : Variable d'environnement PowerShell (Recommandée)

```powershell
$env:PGPASSWORD="o421xTuVDOuHTogm2kVcYKo1VckB9ykM"
psql -h dpg-d57e3n0gjchc739i6de0-a.oregon-postgres.render.com -U backend backend_bzzj
```

### Méthode 2 : Utiliser l'URL complète (Plus simple)

```powershell
psql "postgresql://backend:o421xTuVDOuHTogm2kVcYKo1VckB9ykM@dpg-d57e3n0gjchc739i6de0-a.oregon-postgres.render.com/backend_bzzj"
```

### Méthode 3 : Demander le mot de passe interactivement

```powershell
psql -h dpg-d57e3n0gjchc739i6de0-a.oregon-postgres.render.com -U backend -d backend_bzzj
```

(PowerShell vous demandera le mot de passe)

## 🔧 Prérequis

### Vérifier que psql est installé

```powershell
psql --version
```

Si vous obtenez une erreur "psql n'est pas reconnu", vous devez installer PostgreSQL :

1. **Téléchargez PostgreSQL** : https://www.postgresql.org/download/windows/
2. **Installez-le** (inclut psql)
3. **Ajoutez au PATH** (généralement fait automatiquement)
   - Par défaut : `C:\Program Files\PostgreSQL\XX\bin`

### Vérifier le PATH

Si psql n'est pas trouvé après installation :

```powershell
# Ajouter au PATH (remplacez XX par votre version)
$env:Path += ";C:\Program Files\PostgreSQL\16\bin"
```

## 📝 Commandes utiles dans psql

Une fois connecté :

```sql
-- Lister toutes les tables
\dt

-- Vérifier PostGIS
SELECT PostGIS_version();

-- Lister les tables avec géométrie
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

-- Quitter
\q
```

## 🚨 Dépannage

### Erreur : "psql n'est pas reconnu"

**Solution :**
1. Installez PostgreSQL
2. Ou ajoutez le chemin au PATH :
   ```powershell
   $env:Path += ";C:\Program Files\PostgreSQL\16\bin"
   ```

### Erreur : "connection refused"

**Solution :**
- Vérifiez que la base de données est active sur Render
- Vérifiez l'adresse du host

### Erreur : "password authentication failed"

**Solution :**
- Vérifiez le mot de passe
- Utilisez la méthode 2 (URL complète) pour éviter les problèmes de syntaxe

## 🎯 Commande complète (Copier-coller)

**Option A - Variable d'environnement :**
```powershell
$env:PGPASSWORD="o421xTuVDOuHTogm2kVcYKo1VckB9ykM"; psql -h dpg-d57e3n0gjchc739i6de0-a.oregon-postgres.render.com -U backend backend_bzzj
```

**Option B - URL complète (Plus simple) :**
```powershell
psql "postgresql://backend:o421xTuVDOuHTogm2kVcYKo1VckB9ykM@dpg-d57e3n0gjchc739i6de0-a.oregon-postgres.render.com/backend_bzzj"
```

## ✅ Alternative : Utiliser pgAdmin

Si vous préférez une interface graphique :

1. **Téléchargez pgAdmin** : https://www.pgadmin.org/download/
2. **Créez une nouvelle connexion** avec :
   - Host : `dpg-d57e3n0gjchc739i6de0-a.oregon-postgres.render.com`
   - Port : `5432`
   - Database : `backend_bzzj`
   - Username : `backend`
   - Password : `o421xTuVDOuHTogm2kVcYKo1VckB9ykM`







