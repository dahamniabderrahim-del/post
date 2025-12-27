# Solution : Forcer Python 3.11.9 sur Render

## 🔴 Problème

Render utilise Python 3.13 malgré `runtime.txt` qui spécifie Python 3.11.9.

**Erreur dans les logs :**
```
/opt/render/project/src/.venv/lib/python3.13/site-packages/psycopg2/
python3.13/importlib/__init__.py
```

## ✅ Solution : Forcer Python 3.11.9 dans Render

### Méthode 1 : Vérifier le Root Directory (CRITIQUE)

Le fichier `runtime.txt` doit être dans le **Root Directory** que Render utilise.

1. **Dans Render.com → Settings de votre service**
2. **Vérifiez "Root Directory"** = `backend`
3. **Vérifiez que le fichier est bien détecté** :
   - Le fichier doit être à : `backend/runtime.txt`
   - Render doit le voir comme : `runtime.txt` (relatif au Root Directory)

### Méthode 2 : Spécifier Python dans Build Command

Si `runtime.txt` n'est pas détecté, forcez Python 3.11 dans la commande de build :

**Dans Render → Settings → Build Command, changez pour :**

```bash
python3.11 -m venv .venv && .venv/bin/pip install -r requirements.txt
```

**OU plus simple :**

```bash
pip install -r requirements.txt
```

Et ajoutez une variable d'environnement :

**Dans Render → Settings → Environment Variables :**
- **Key** : `PYTHON_VERSION`
- **Value** : `3.11.9`

### Méthode 3 : Vérifier que runtime.txt est au bon endroit

Le fichier `runtime.txt` doit être **à la racine du Root Directory**.

Si Root Directory = `backend`, alors :
- ✅ `backend/runtime.txt` (correct)
- ❌ `runtime.txt` à la racine du repo (incorrect si Root Directory = backend)

### Méthode 4 : Utiliser une version spécifique de psycopg2-binary

Essayez une version plus récente qui pourrait être compatible :

**Modifiez `backend/requirements.txt` :**
```
psycopg2-binary>=2.9.10
```

Puis committez et poussez :
```bash
git add backend/requirements.txt
git commit -m "Fix: Version psycopg2-binary pour Python 3.13"
git push
```

## 🎯 Solution Recommandée (Étape par étape)

### Étape 1 : Vérifier la structure dans GitHub

1. Allez sur votre dépôt GitHub : `https://github.com/dahamniabderrahim-del/post`
2. Vérifiez que le fichier existe : `backend/runtime.txt`
3. Ouvrez-le et vérifiez qu'il contient : `python-3.11.9`

### Étape 2 : Dans Render.com

1. **Settings → General**
   - Root Directory : `backend` (doit être exactement `backend`, pas vide)
   
2. **Settings → Build & Deploy**
   - Build Command : `pip install -r requirements.txt`
   - **Important** : Ne mettez pas de chemin complet, Render utilise le Root Directory

3. **Settings → Environment**
   - Ajoutez (optionnel mais recommandé) :
     - **Key** : `PYTHON_VERSION`
     - **Value** : `3.11.9`

### Étape 3 : Forcer un redéploiement

1. Dans Render, allez dans "Manual Deploy"
2. Cliquez sur "Clear build cache & deploy"
3. Cela forcera Render à re-détecter tous les fichiers

### Étape 4 : Vérifier les logs de build

Dans les logs de build, cherchez :
```
==> Installation de Python version 3.11.9...
```

Si vous voyez toujours `3.13.4`, alors `runtime.txt` n'est pas détecté.

## 🔍 Diagnostic

### Vérifier dans les logs de build

Cherchez cette ligne dans les logs :
```
==> Installation de Python version X.X.X...
```

- ✅ Si vous voyez `3.11.9` → Le problème est ailleurs
- ❌ Si vous voyez `3.13.4` → `runtime.txt` n'est pas détecté

### Vérifier le Root Directory

Le Root Directory doit être **exactement** `backend` :
- ✅ `backend` (correct)
- ❌ `./backend` (incorrect)
- ❌ Vide (incorrect)
- ❌ `/backend` (incorrect)

## 🚨 Solution Alternative : Utiliser psycopg (nouvelle version)

Si Python 3.13 persiste, utilisez `psycopg` (sans le "2") qui est compatible avec Python 3.13.

Voir `DEPANNAGE_ERREUR_PSYCOPG2.md` → Solution 2 pour les instructions complètes.

## ✅ Checklist

- [ ] `backend/runtime.txt` existe et contient `python-3.11.9`
- [ ] Le fichier est commité et poussé sur GitHub
- [ ] Root Directory dans Render = `backend` (exactement)
- [ ] Build cache cleared et redéployé
- [ ] Logs de build montrent Python 3.11.9 (pas 3.13)






