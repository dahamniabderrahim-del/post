# Dépannage - Erreur Code 2 lors du déploiement

L'erreur code 2 lors de la création d'un web service indique généralement un problème avec la commande de build ou de démarrage.

## 🔴 Erreur Code 127 : "gunicorn: commande introuvable"

Si vous voyez l'erreur **code 127** avec `gunicorn: commande introuvable`, consultez **[DEPANNAGE_ERREUR_CODE_127.md](DEPANNAGE_ERREUR_CODE_127.md)**.

**Solution rapide :** Changez votre Build Command pour utiliser `requirements-prod.txt` :
```bash
pip install -r requirements-prod.txt
```

## 🔴 Erreur la plus courante : "Impossible d'ouvrir le fichier : requirements.txt"

Si vous voyez cette erreur :
```
ERREUR : Impossible d'ouvrir le fichier de configuration : [Errno 2] Aucun fichier ou répertoire de ce type : 'requirements.txt'
```

**Cela signifie que le Root Directory n'est pas correctement configuré dans Render.**

### ✅ Solution Immédiate

1. **Allez dans les paramètres de votre service Render**
2. **Trouvez "Root Directory"**
3. **Changez-le en : `backend`** (sans guillemets)
4. **Sauvegardez et redéployez**

Le Root Directory doit pointer vers le dossier qui contient `requirements.txt` et `app.py`.

## ✅ Solutions

### Solution 1 : Vérifier que app.py utilise les variables d'environnement

Le fichier `app.py` a été mis à jour pour utiliser les variables d'environnement. Assurez-vous que :
- ✅ Les modifications ont été sauvegardées
- ✅ Le fichier est commité dans votre repository Git

### Solution 2 : Vérifier la commande de build

Sur **Render.com**, la commande de build doit être :

**Option A (recommandée) :**
```bash
pip install -r requirements-prod.txt
```

**Option B (si Option A ne fonctionne pas) :**
```bash
pip install -r requirements-render.txt
```

**Option C (alternative simple) :**
```bash
pip install Flask==3.0.0 flask-cors==4.0.0 psycopg2-binary==2.9.9 gunicorn==21.2.0
```

### Solution 3 : Vérifier la commande de démarrage

Sur **Render.com**, la commande de démarrage doit être :
```bash
gunicorn app:app --bind 0.0.0.0:$PORT
```

**Vérifications :**
- ✅ Le fichier `Procfile` existe dans le dossier `backend/`
- ✅ Le contenu du Procfile est correct
- ✅ Le Root Directory est bien `backend`

### Solution 4 : Vérifier les variables d'environnement

Assurez-vous d'avoir configuré ces variables dans votre service Render :

**Variables obligatoires :**
- `DATABASE_URL` : L'URL complète de votre base de données PostgreSQL
  - Format : `postgresql://user:password@host:port/database`
  - Vous pouvez la copier depuis votre base de données Render

**Variables optionnelles mais recommandées :**
- `FLASK_ENV` : `production`
- `ALLOWED_ORIGINS` : L'URL de votre frontend (ex: `https://votre-frontend.onrender.com`)
- `PORT` : Généralement géré automatiquement par Render

### Solution 5 : Vérifier les logs de build

1. Allez dans votre service Render
2. Cliquez sur l'onglet "Logs"
3. Vérifiez les erreurs dans les logs de build

**Erreurs communes :**

#### Erreur : "gunicorn: command not found"
**Solution :** Assurez-vous que `requirements-prod.txt` inclut gunicorn, ou utilisez :
```bash
pip install -r requirements.txt && pip install gunicorn
```

#### Erreur : "ModuleNotFoundError: No module named 'app'"
**Solution :** Vérifiez que le Root Directory est bien `backend`

#### Erreur : "Connection refused" ou erreur de base de données
**Solution :** Vérifiez que `DATABASE_URL` est correctement configurée

### Solution 6 : Vérifier le Root Directory (CRITIQUE)

**C'est la cause la plus fréquente de l'erreur code 2 !**

Dans Render.com :
1. Allez dans votre service
2. Cliquez sur "Settings"
3. Trouvez "Root Directory"
4. **Assurez-vous qu'il est configuré sur : `backend`**
5. Sauvegardez

**Structure attendue :**
```
votre-repo/
├── backend/          ← Root Directory doit pointer ici
│   ├── app.py
│   ├── requirements.txt
│   └── Procfile
└── frontend/
```

Si le Root Directory est vide ou incorrect, Render cherchera `requirements.txt` à la racine du repo au lieu de dans `backend/`.

### Solution 7 : Alternative - Utiliser requirements.txt directement

Si `requirements-prod.txt` cause des problèmes, modifiez votre commande de build :

```bash
pip install Flask==3.0.0 flask-cors==4.0.0 psycopg2-binary==2.9.9 gunicorn==21.2.0
```

### Solution 7 : Vérifier la structure du projet

Votre structure doit être :
```
votre-repo/
├── backend/
│   ├── app.py          ← Doit utiliser les variables d'environnement
│   ├── requirements.txt
│   ├── requirements-prod.txt
│   ├── Procfile        ← Important pour Render
│   └── runtime.txt    ← Optionnel mais recommandé
└── frontend/
    └── ...
```

## 🔍 Checklist de vérification

Avant de redéployer, vérifiez :

- [ ] **🔴 CRITIQUE : Le Root Directory dans Render est `backend`** (pas vide, pas `./backend`, juste `backend`)
- [ ] `app.py` utilise `os.getenv()` pour la configuration de la base de données
- [ ] `Procfile` existe dans `backend/` avec le contenu correct
- [ ] `requirements.txt` existe dans `backend/`
- [ ] `requirements-prod.txt` ou `requirements-render.txt` existe et inclut gunicorn
- [ ] La commande de build est correcte
- [ ] La commande de démarrage est correcte
- [ ] `DATABASE_URL` est configurée dans les variables d'environnement
- [ ] Les modifications sont commitées et poussées sur Git

## 📝 Configuration Render.com complète

### Web Service - Backend

**Settings :**
- **Name** : `sig-backend`
- **Root Directory** : `backend`
- **Environment** : `Python 3`
- **Build Command** : `pip install -r requirements-prod.txt`
- **Start Command** : `gunicorn app:app --bind 0.0.0.0:$PORT`

**Environment Variables :**
```
DATABASE_URL=postgresql://user:password@host:port/database
FLASK_ENV=production
ALLOWED_ORIGINS=https://votre-frontend.onrender.com
```

## 🆘 Si le problème persiste

1. **Vérifier les logs détaillés** dans Render
2. **Tester localement** avec les mêmes variables d'environnement
3. **Vérifier que PostGIS est activé** dans votre base de données :
   ```sql
   CREATE EXTENSION IF NOT EXISTS postgis;
   ```

4. **Tester la connexion à la base de données** :
   ```python
   # Créer un fichier test_db.py dans backend/
   import os
   from urllib.parse import urlparse
   import psycopg2
   
   DATABASE_URL = os.getenv('DATABASE_URL')
   result = urlparse(DATABASE_URL)
   
   try:
       conn = psycopg2.connect(
           host=result.hostname,
           port=result.port or 5432,
           database=result.path[1:],
           user=result.username,
           password=result.password
       )
       print("✅ Connexion réussie!")
       conn.close()
   except Exception as e:
       print(f"❌ Erreur: {e}")
   ```

