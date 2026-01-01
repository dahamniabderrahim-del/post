# Fix : Problème Python 3.13 sur Render

## Problème actuel

Render utilise Python 3.13.4 par défaut, ce qui cause des problèmes avec :
- `psycopg2-binary==2.9.10` (non compatible avec Python 3.13)
- `Pillow==10.1.0` (ne peut pas être compilé avec Python 3.13)

## Solution : Forcer Python 3.11 dans Render

### Étape 1 : Configurer Python 3.11 dans Render Dashboard

1. Allez sur https://dashboard.render.com
2. Ouvrez votre service backend (`post-aypc`)
3. Cliquez sur **Settings** (Paramètres)
4. Dans la section **"Build & Deploy"**, trouvez **"Python Version"**
5. Sélectionnez **"Python 3.11"** ou **"3.11.9"** dans le menu déroulant
6. Cliquez sur **"Save Changes"**

### Étape 2 : Vérifier le Root Directory

Assurez-vous que :
- **Root Directory** est défini à `backend` (pas vide)
- Le fichier `runtime.txt` est dans `backend/runtime.txt`

### Étape 3 : Redéployer

1. Cliquez sur **Manual Deploy** → **Deploy latest commit**
2. Attendez que le build se termine

### Vérification

Les logs de build devraient maintenant montrer :
```
==> Installation de Python version 3.11.9...
```

Au lieu de :
```
==> Installation de Python version 3.13.4...
```

## Fichiers modifiés

- ✅ `backend/runtime.txt` : Contient `python-3.11.9`
- ✅ `backend/requirements.txt` : Pillow et numpy retirés (non utilisés)
- ✅ `backend/app.py` : Imports PIL/numpy retirés

## Si le problème persiste

Si Render continue d'utiliser Python 3.13 malgré `runtime.txt` :

1. Vérifiez que le **Root Directory** est bien `backend`
2. Vérifiez que `backend/runtime.txt` existe et contient `python-3.11.9`
3. Forcez Python 3.11 dans les **Settings** du dashboard Render (Option 1 ci-dessus)






