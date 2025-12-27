# Tester la connexion à la base de données PostgreSQL

## 🔍 Commande de connexion

Vous pouvez tester la connexion à votre base de données avec cette commande :

```bash
PGPASSWORD=o421xTuVDOuHTogm2kVcYKo1VckB9ykM psql -h dpg-d57e3n0gjchc739i6de0-a.oregon-postgres.render.com -U backend backend_bzzj
```

## 📋 Détails de la commande

- `PGPASSWORD=...` : Définit le mot de passe (évite de le taper)
- `-h` : Host (adresse du serveur)
- `-U backend` : Utilisateur
- `backend_bzzj` : Nom de la base de données

## ✅ Utilisation

### Sur Windows (PowerShell)

```powershell
$env:PGPASSWORD="o421xTuVDOuHTogm2kVcYKo1VckB9ykM"
psql -h dpg-d57e3n0gjchc739i6de0-a.oregon-postgres.render.com -U backend backend_bzzj
```

### Sur Linux/Mac

```bash
PGPASSWORD=o421xTuVDOuHTogm2kVcYKo1VckB9ykM psql -h dpg-d57e3n0gjchc739i6de0-a.oregon-postgres.render.com -U backend backend_bzzj
```

## 🔧 Prérequis

Vous devez avoir `psql` installé :

### Windows
- Téléchargez PostgreSQL depuis : https://www.postgresql.org/download/windows/
- Ou utilisez WSL (Windows Subsystem for Linux)

### Linux
```bash
sudo apt-get install postgresql-client
```

### Mac
```bash
brew install postgresql
```

## 📝 Commandes utiles dans psql

Une fois connecté, vous pouvez exécuter :

```sql
-- Lister toutes les tables
\dt

-- Lister les tables avec des colonnes géométriques (PostGIS)
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

-- Vérifier que PostGIS est installé
SELECT PostGIS_version();

-- Quitter psql
\q
```

## 🧪 Tester depuis Python (localement)

Vous pouvez aussi tester la connexion depuis Python :

```python
import psycopg

# Utilisez votre URL complète
DATABASE_URL = "postgresql://backend:o421xTuVDOuHTogm2kVcYKo1VckB9ykM@dpg-d57e3n0gjchc739i6de0-a.oregon-postgres.render.com/backend_bzzj"

try:
    conn = psycopg.connect(DATABASE_URL)
    print("✅ Connexion réussie!")
    
    cursor = conn.cursor()
    cursor.execute("SELECT version();")
    version = cursor.fetchone()
    print(f"PostgreSQL version: {version[0]}")
    
    cursor.close()
    conn.close()
except Exception as e:
    print(f"❌ Erreur: {e}")
```

## 🌐 Tester depuis l'application déployée

Une fois votre application déployée sur Render avec `DATABASE_URL` configurée :

### Test 1 : Endpoint de santé
```
https://votre-service.onrender.com/api/health
```

Devrait retourner :
```json
{
  "status": "healthy",
  "database": "connected",
  "environment": "production"
}
```

### Test 2 : Liste des couches
```
https://votre-service.onrender.com/api/layers
```

Devrait retourner la liste des tables avec des colonnes géométriques.

## 🔐 Sécurité

⚠️ **Important :**
- Ne partagez jamais votre mot de passe publiquement
- Utilisez des variables d'environnement (comme vous le faites)
- Ne commitez jamais les credentials dans le code

## 📋 Checklist de connexion

- [ ] `psql` est installé sur votre machine
- [ ] La commande de connexion fonctionne
- [ ] Vous pouvez voir les tables avec `\dt`
- [ ] PostGIS est installé (vérifier avec `SELECT PostGIS_version();`)
- [ ] L'application sur Render se connecte (test `/api/health`)

## 🚨 Dépannage

### Erreur : "psql: command not found"
→ Installez le client PostgreSQL

### Erreur : "connection refused"
→ Vérifiez que la base de données est active sur Render

### Erreur : "password authentication failed"
→ Vérifiez le mot de passe dans l'URL

### Erreur : "database does not exist"
→ Vérifiez le nom de la base de données (`backend_bzzj`)



