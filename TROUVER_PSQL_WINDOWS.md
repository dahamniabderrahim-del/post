# Trouver et utiliser psql sur Windows

## 🔍 Méthode 1 : Trouver psql manuellement

### Étape 1 : Chercher psql.exe

Ouvrez l'Explorateur Windows et cherchez `psql.exe` dans :
- `C:\Program Files\PostgreSQL\[version]\bin\`
- `C:\Program Files (x86)\PostgreSQL\[version]\bin\`

### Étape 2 : Utiliser le chemin complet

Une fois trouvé, utilisez le chemin complet dans PowerShell :

```powershell
# Remplacez [version] par votre version (ex: 16, 15, 14, etc.)
& "C:\Program Files\PostgreSQL\16\bin\psql.exe" -h dpg-d57e3n0gjchc739i6de0-a.oregon-postgres.render.com -U backend backend_bzzj
```

Avec le mot de passe :
```powershell
$env:PGPASSWORD="o421xTuVDOuHTogm2kVcYKo1VckB9ykM"
& "C:\Program Files\PostgreSQL\16\bin\psql.exe" -h dpg-d57e3n0gjchc739i6de0-a.oregon-postgres.render.com -U backend backend_bzzj
```

## 🔍 Méthode 2 : Ajouter au PATH pour cette session

Si vous trouvez le chemin, ajoutez-le au PATH pour cette session PowerShell :

```powershell
# Remplacez [version] par votre version
$env:Path += ";C:\Program Files\PostgreSQL\16\bin"
psql --version
```

Puis utilisez normalement :
```powershell
$env:PGPASSWORD="o421xTuVDOuHTogm2kVcYKo1VckB9ykM"
psql -h dpg-d57e3n0gjchc739i6de0-a.oregon-postgres.render.com -U backend backend_bzzj
```

## 🔍 Méthode 3 : Utiliser pgAdmin (Interface graphique)

Si vous avez installé PostgreSQL, vous avez probablement aussi **pgAdmin** :

1. **Cherchez "pgAdmin"** dans le menu Démarrer
2. **Ouvrez pgAdmin**
3. **Clic droit sur "Servers"** → **Create** → **Server**
4. **Configurez :**
   - **Name** : `Render Database`
   - **Connection tab :**
     - **Host** : `dpg-d57e3n0gjchc739i6de0-a.oregon-postgres.render.com`
     - **Port** : `5432`
     - **Database** : `backend_bzzj`
     - **Username** : `backend`
     - **Password** : `o421xTuVDOuHTogm2kVcYKo1VckB9ykM`
5. **Save**

## 🔍 Méthode 4 : Utiliser Python (Plus simple)

Si vous avez Python installé, testez la connexion avec Python :

```powershell
cd backend
python -c "import psycopg; conn = psycopg.connect('postgresql://backend:o421xTuVDOuHTogm2kVcYKo1VckB9ykM@dpg-d57e3n0gjchc739i6de0-a.oregon-postgres.render.com/backend_bzzj'); print('✅ Connexion réussie!'); cursor = conn.cursor(); cursor.execute('SELECT version()'); print(cursor.fetchone()[0]); conn.close()"
```

## 📝 Script PowerShell pour trouver psql

Exécutez ce script dans PowerShell pour trouver psql :

```powershell
$paths = @(
    "C:\Program Files\PostgreSQL",
    "C:\Program Files (x86)\PostgreSQL",
    "$env:LOCALAPPDATA\Programs\PostgreSQL"
)

foreach ($basePath in $paths) {
    if (Test-Path $basePath) {
        $psql = Get-ChildItem -Path $basePath -Recurse -Filter "psql.exe" -ErrorAction SilentlyContinue | Select-Object -First 1
        if ($psql) {
            Write-Host "✅ Trouvé: $($psql.FullName)"
            Write-Host "Utilisez: & '$($psql.FullName)' -h dpg-d57e3n0gjchc739i6de0-a.oregon-postgres.render.com -U backend backend_bzzj"
            break
        }
    }
}
```

## ✅ Solution la plus simple : Tester depuis l'application

Au lieu de tester avec psql, testez directement depuis votre application déployée sur Render :

1. **Ajoutez `DATABASE_URL` dans Render** (comme expliqué précédemment)
2. **Testez l'endpoint** :
   ```
   https://votre-service.onrender.com/api/health
   ```

Si ça retourne `"database": "connected"`, tout fonctionne !

## 🎯 Recommandation

**Pour tester rapidement :** Utilisez Python (Méthode 4) ou testez directement depuis l'application déployée.

**Pour une interface graphique :** Utilisez pgAdmin (Méthode 3).

**Pour la ligne de commande :** Trouvez le chemin complet de psql.exe et utilisez-le avec le chemin complet.






