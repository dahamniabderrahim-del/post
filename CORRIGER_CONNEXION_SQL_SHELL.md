# Corriger l'erreur de connexion SQL Shell

## 🔴 Erreur

```
psql: erreur : la connexion au serveur sur « localhost » (::1), port 5432 a échoué
```

## ✅ Solution : Utiliser l'adresse du serveur Render

Vous avez probablement laissé "localhost" par défaut. Il faut utiliser l'adresse du serveur Render.

## 📝 Étapes correctes

Quand SQL Shell vous demande :

### 1. Server [localhost]:
**❌ Ne laissez PAS vide (ça utilise localhost)**
**✅ Tapez :**
```
dpg-d57e3n0gjchc739i6de0-a.oregon-postgres.render.com
```

### 2. Database [postgres]:
**✅ Tapez :**
```
backend_bzzj
```

### 3. Port [5432]:
**✅ Appuyez sur Entrée** (5432 est correct)

### 4. Username [postgres]:
**✅ Tapez :**
```
backend
```

### 5. Password for user backend:
**✅ Tapez :**
```
o421xTuVDOuHTogm2kVcYKo1VckB9ykM
```
(Le mot de passe ne s'affichera pas - c'est normal)

## 🎯 Résumé des réponses

```
Server [localhost]: dpg-d57e3n0gjchc739i6de0-a.oregon-postgres.render.com
Database [postgres]: backend_bzzj
Port [5432]: [Entrée]
Username [postgres]: backend
Password for user backend: o421xTuVDOuHTogm2kVcYKo1VckB9ykM
```

## 💡 Astuce : Connexion directe

Si vous préférez, vous pouvez aussi ouvrir SQL Shell et taper directement :

```sql
\c "host=dpg-d57e3n0gjchc739i6de0-a.oregon-postgres.render.com dbname=backend_bzzj user=backend"
```

Puis il vous demandera le mot de passe.

## 🔍 Vérification

Une fois connecté, vous devriez voir :
```
backend_bzzj=#
```

Testez ensuite :
```sql
SELECT current_database();
\dt
```

## 🚨 Si l'erreur persiste

### Vérifier que la base de données est active
- Allez sur Render.com
- Vérifiez que votre base de données PostgreSQL est "Available" (pas "Paused")

### Vérifier les identifiants
- Host : `dpg-d57e3n0gjchc739i6de0-a.oregon-postgres.render.com`
- Database : `backend_bzzj`
- Username : `backend`
- Password : `o421xTuVDOuHTogm2kVcYKo1VckB9ykM`

### Vérifier le port
- Port : `5432` (par défaut)

## ✅ Alternative : Utiliser l'URL complète

Si SQL Shell le supporte, vous pouvez aussi essayer de vous connecter directement avec l'URL :

Dans SQL Shell, après l'ouverture, tapez :
```
\c postgresql://backend:o421xTuVDOuHTogm2kVcYKo1VckB9ykM@dpg-d57e3n0gjchc739i6de0-a.oregon-postgres.render.com/backend_bzzj
```










