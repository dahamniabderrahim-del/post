# Vérification Complète - Déploiement Render

Ce guide vous permet de vérifier que tout est correctement configuré avant de déployer.

## ✅ Checklist de Vérification

### 1. Fichier `backend/requirements.txt`

**Doit contenir :**
```
Flask==3.0.0
flask-cors==4.0.0
psycopg2-binary==2.9.9
gunicorn==21.2.0
```

**⚠️ Points importants :**
- ✅ Utilisez `psycopg2-binary` (PAS `psycopg2` seul)
- ✅ Incluez `gunicorn` pour la production
- ✅ Ne mettez PAS les deux (`psycopg2` ET `psycopg2-binary`) en même temps

### 2. Fichier `backend/runtime.txt`

**Doit contenir :**
```
python-3.11.9
```

**⚠️ Points importants :**
- ✅ Utilisez Python 3.11.9 (compatible avec psycopg2-binary)
- ❌ Évitez Python 3.13 (pas encore compatible)
- ❌ Évitez Python 3.12 si vous avez des problèmes

### 3. Fichier `backend/Procfile`

**Doit contenir :**
```
web: gunicorn app:app --bind 0.0.0.0:$PORT
```

**⚠️ Points importants :**
- ✅ Utilisez `gunicorn` (PAS `python app.py`)
- ✅ Le fichier doit être dans le dossier `backend/`

### 4. Configuration Render.com

#### Settings du Web Service :

**Root Directory :**
```
backend
```
⚠️ CRITIQUE : Doit être `backend` (pas vide, pas `./backend`)

**Build Command :**
```bash
pip install -r requirements.txt
```
OU
```bash
pip install -r requirements-prod.txt
```

**Start Command :**
```bash
gunicorn app:app --bind 0.0.0.0:$PORT
```
⚠️ CRITIQUE : PAS `python app.py`

**Environment Variables :**
- `DATABASE_URL` : URL complète de votre base de données PostgreSQL
  - Format : `postgresql://user:password@host:port/database`
  - Vous la trouvez dans votre base de données Render

#### Variables optionnelles :
- `FLASK_ENV` : `production`
- `ALLOWED_ORIGINS` : URL de votre frontend (ex: `https://votre-frontend.onrender.com`)

## 🔍 Vérification Rapide

### Commande pour vérifier votre requirements.txt

```bash
# Depuis le dossier backend/
cat requirements.txt | grep psycopg
```

**Résultat attendu :**
```
psycopg2-binary==2.9.9
```

**Si vous voyez `psycopg2` (sans -binary), c'est le problème !**

### Commande pour vérifier votre runtime.txt

```bash
# Depuis le dossier backend/
cat runtime.txt
```

**Résultat attendu :**
```
python-3.11.9
```

## 🚨 Problèmes Courants et Solutions

### Problème 1 : "ImportError avec psycopg2"

**Cause :** Python 3.13 ou `psycopg2` (sans -binary)

**Solution :**
1. Vérifiez `runtime.txt` = `python-3.11.9`
2. Vérifiez `requirements.txt` = `psycopg2-binary==2.9.9`
3. Committez et redéployez

### Problème 2 : "gunicorn: commande introuvable"

**Cause :** `gunicorn` n'est pas dans `requirements.txt`

**Solution :**
1. Ajoutez `gunicorn==21.2.0` à `requirements.txt`
2. OU utilisez `pip install -r requirements-prod.txt` dans Build Command

### Problème 3 : "requirements.txt not found"

**Cause :** Root Directory incorrect dans Render

**Solution :**
1. Dans Render → Settings → Root Directory = `backend`
2. Redéployez

### Problème 4 : Application démarre avec `python app.py`

**Cause :** Start Command incorrect dans Render

**Solution :**
1. Dans Render → Settings → Start Command
2. Changez pour : `gunicorn app:app --bind 0.0.0.0:$PORT`
3. Redéployez

## 📝 Configuration Recommandée Complète

### Fichiers Locaux

**`backend/requirements.txt` :**
```
Flask==3.0.0
flask-cors==4.0.0
psycopg2-binary==2.9.9
gunicorn==21.2.0
```

**`backend/runtime.txt` :**
```
python-3.11.9
```

**`backend/Procfile` :**
```
web: gunicorn app:app --bind 0.0.0.0:$PORT
```

### Render.com Settings

- **Root Directory** : `backend`
- **Build Command** : `pip install -r requirements.txt`
- **Start Command** : `gunicorn app:app --bind 0.0.0.0:$PORT`
- **Environment Variable** : `DATABASE_URL` = (votre URL PostgreSQL)

## ✅ Après Vérification

1. Committez tous les fichiers :
   ```bash
   git add backend/requirements.txt backend/runtime.txt backend/Procfile
   git commit -m "Fix: Configuration production complète"
   git push
   ```

2. Vérifiez dans Render que les settings sont corrects

3. Redéployez

4. Vérifiez les logs pour confirmer que tout fonctionne

## 📚 Guides de Référence

- `SOLUTION_RAPIDE_PSYCOPG2.md` - Solution rapide pour l'erreur psycopg2
- `DEPANNAGE_ERREUR_PSYCOPG2.md` - Guide détaillé psycopg2
- `DEPANNAGE_ERREUR_CODE_127.md` - Guide erreur gunicorn
- `DEPANNAGE_ERREUR_CODE_2.md` - Guide erreur requirements.txt










