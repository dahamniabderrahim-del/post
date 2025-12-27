# Où ajouter les variables d'environnement ?

## ✅ Réponse : Dans le SERVICE WEB (Backend)

Les variables d'environnement doivent être ajoutées dans votre **service web backend**, **PAS** dans la base de données PostgreSQL.

## 📍 Pourquoi ?

- **Base de données PostgreSQL** : C'est juste la base de données, elle stocke les données
- **Service Web (Backend)** : C'est votre application Flask qui a besoin de savoir comment se connecter à la base de données

Les variables d'environnement sont utilisées par votre **application** pour se connecter à la base de données.

## 🎯 Étapes dans Render.com

### 1. Allez dans votre SERVICE WEB (Backend)

1. Dans Render.com, allez dans votre **service web backend** (pas la base de données)
2. C'est le service qui exécute votre application Flask

### 2. Ajoutez les variables d'environnement

1. **Settings** → **Environment**
2. Cliquez sur **"Add Environment Variable"**

### 3. Ajoutez DATABASE_URL

**Key :**
```
DATABASE_URL
```

**Value :**
```
postgresql://backend:o421xTuVDOuHTogm2kVcYKo1VckB9ykM@dpg-d57e3n0gjchc739i6de0-a.oregon-postgres.render.com/backend_bzzj
```

### 4. Sauvegarder

1. Cliquez sur **"Save Changes"**
2. Render redéploiera automatiquement votre service

## 📊 Schéma

```
┌─────────────────────┐
│  Service Web        │  ← Ajoutez DATABASE_URL ICI
│  (Backend Flask)    │
│                     │
│  Variables d'env:   │
│  - DATABASE_URL     │
└──────────┬──────────┘
           │
           │ Utilise DATABASE_URL pour se connecter
           │
           ▼
┌─────────────────────┐
│  Base PostgreSQL    │  ← PAS de variables d'env ici
│  (Stocke les données)│
└─────────────────────┘
```

## 🔍 Comment identifier le bon service ?

Dans Render.com, vous devriez avoir :

1. **Service Web** (Backend) :
   - Type : "Web Service"
   - Nom : probablement "sig-backend" ou similaire
   - C'est celui qui exécute `gunicorn app:app`
   - **← Ajoutez DATABASE_URL ICI**

2. **Base de données PostgreSQL** :
   - Type : "PostgreSQL"
   - Nom : probablement "backend" ou similaire
   - C'est juste la base de données
   - **← PAS de variables d'env ici**

## ✅ Checklist

- [ ] Je suis dans le **service web backend** (pas la base de données)
- [ ] Settings → Environment
- [ ] Variable `DATABASE_URL` ajoutée
- [ ] URL copiée correctement
- [ ] Service redéployé automatiquement

## 🚨 Erreur commune

❌ **Ne pas ajouter dans la base de données PostgreSQL**
- La base de données n'a pas de section "Environment Variables"
- Même si elle en avait, ça ne servirait à rien

✅ **Ajouter dans le service web backend**
- C'est votre application qui a besoin de cette information
- C'est là que Render cherche les variables d'environnement

## 📝 Résumé

**Où ?** → **Service Web Backend** (votre application Flask)  
**Quoi ?** → Variable `DATABASE_URL`  
**Pourquoi ?** → Pour que votre application sache comment se connecter à la base de données







