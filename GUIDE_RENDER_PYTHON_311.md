# Guide : Forcer Python 3.11 sur Render

## ✅ Solution Simple : Utiliser runtime.txt (Recommandé)

Le fichier `backend/runtime.txt` contient déjà `python-3.11.9`. Render devrait le détecter automatiquement.

### Vérifications importantes :

1. **Root Directory dans Render** :
   - Allez dans **Settings** de votre service
   - Cherchez **"Root Directory"** ou **"Base Directory"**
   - Il DOIT être défini à : `backend` (sans slash, juste le mot `backend`)
   - ❌ PAS `/backend` ou `/` ou vide

2. **Fichier runtime.txt** :
   - Le fichier doit être dans `backend/runtime.txt`
   - Il doit contenir exactement : `python-3.11.9`

### Si runtime.txt ne fonctionne pas :

Render peut parfois ignorer `runtime.txt`. Dans ce cas, essayez :

## Alternative : Créer .python-version

Créez un fichier `backend/.python-version` avec :
```
3.11.9
```

## Vérification après déploiement

Après avoir poussé sur GitHub et redéployé, vérifiez les **premiers logs de build**. Vous devriez voir :

```
==> Installation de Python version 3.11.9...
```

Si vous voyez toujours :
```
==> Installation de Python version 3.13.4...
```

Alors le Root Directory n'est probablement pas correct.

## Où trouver Root Directory dans Render

1. Allez sur https://dashboard.render.com
2. Cliquez sur votre service backend
3. Cliquez sur **Settings** (Paramètres) dans le menu de gauche
4. Faites défiler jusqu'à **"Build & Deploy"** ou **"Build Settings"**
5. Cherchez **"Root Directory"** ou **"Base Directory"**

## Si vous ne trouvez toujours pas

Essayez de :
1. Supprimer le service et le recréer avec Root Directory = `backend`
2. Ou contactez le support Render

## Fichiers à pousser sur GitHub

Assurez-vous que ces fichiers sont bien dans le dépôt :
- ✅ `backend/runtime.txt` (avec `python-3.11.9`)
- ✅ `backend/requirements.txt` (sans Pillow/numpy)
- ✅ `backend/Procfile`

Puis poussez sur GitHub et redéployez.

