# Solution : Python 3.11 sur Render (Sans Option dans l'Interface)

## ✅ Bonne nouvelle

Vous n'avez **PAS BESOIN** de trouver l'option dans l'interface Render ! Le fichier `runtime.txt` devrait fonctionner automatiquement.

## Vérifications importantes

### 1. Root Directory (CRITIQUE)

C'est la chose la plus importante à vérifier :

1. Allez sur https://dashboard.render.com
2. Cliquez sur votre service backend (`post-aypc`)
3. Cliquez sur **Settings** (Paramètres) dans le menu de gauche
4. Cherchez **"Root Directory"** ou **"Base Directory"**
5. Il DOIT être défini à : `backend` (juste le mot, sans slash)

**Si c'est vide ou `/` ou autre chose, changez-le en `backend`**

### 2. Fichier runtime.txt

Le fichier `backend/runtime.txt` existe déjà et contient `python-3.11.9`. ✅

### 3. Pousser les modifications sur GitHub

Assurez-vous que les modifications sont bien poussées :

```powershell
cd "C:\Users\daham\OneDrive\Desktop\site_webing - Copie"
git add backend/runtime.txt backend/requirements.txt backend/app.py
git commit -m "Fix: Python 3.11 et retrait de Pillow/numpy"
git push origin main
```

## Après avoir poussé sur GitHub

1. Render devrait automatiquement redéployer
2. Ou allez dans Render → **Manual Deploy** → **Deploy latest commit**

## Vérification dans les logs

Après le redéploiement, regardez les **premiers logs de build**. Vous devriez voir :

```
==> Installation de Python version 3.11.9...
```

Si vous voyez toujours :
```
==> Installation de Python version 3.13.4...
```

Alors le **Root Directory** n'est probablement pas correct. Vérifiez qu'il est bien défini à `backend`.

## Si ça ne fonctionne toujours pas

Créez aussi un fichier `.python-version` :

**Créez `backend/.python-version` :**
```
3.11.9
```

Puis poussez sur GitHub et redéployez.

## Résumé

- ✅ `backend/runtime.txt` existe avec `python-3.11.9`
- ⚠️ **Vérifiez que Root Directory = `backend` dans Render**
- ✅ Poussez les modifications sur GitHub
- ✅ Redéployez sur Render
- ✅ Vérifiez les logs pour confirmer Python 3.11.9


