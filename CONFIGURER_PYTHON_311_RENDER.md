# Comment Configurer Python 3.11 sur Render

## Option 1 : Via runtime.txt (Recommandé - Automatique)

Le fichier `backend/runtime.txt` contient déjà `python-3.11.9`. Render devrait le détecter automatiquement.

**Vérifiez que :**
1. Le fichier `backend/runtime.txt` existe et contient `python-3.11.9`
2. Dans Render, le **Root Directory** est défini à `backend` (pas vide, pas `/`, mais `backend`)

## Option 2 : Via les Settings Render (Si l'option existe)

### Étapes détaillées :

1. Allez sur https://dashboard.render.com
2. Cliquez sur votre service backend (probablement `post-aypc`)
3. Dans le menu de gauche, cliquez sur **"Settings"** (ou **"Paramètres"**)
4. Cherchez dans les sections suivantes :
   - **"Build & Deploy"** ou **"Build Settings"**
   - **"Environment"** ou **"Environment Variables"**
   - **"Build Command"** ou **"Build Settings"**

5. Cherchez une option qui mentionne :
   - "Python Version"
   - "Python Runtime"
   - "Runtime Version"
   - "Buildpack" ou "Buildpack Version"

### Si vous ne trouvez pas l'option :

Render peut ne pas afficher cette option dans l'interface. Dans ce cas, **utilisez uniquement `runtime.txt`**.

## Option 3 : Vérifier le Root Directory (CRITIQUE)

Le **Root Directory** doit être correctement configuré pour que `runtime.txt` soit lu :

1. Allez dans **Settings** de votre service
2. Cherchez **"Root Directory"** ou **"Base Directory"**
3. Assurez-vous qu'il est défini à : `backend` (sans slash, juste `backend`)
4. **PAS** `/backend` ou `/` ou vide

## Option 4 : Créer un fichier .python-version

Si `runtime.txt` ne fonctionne pas, créez aussi un fichier `.python-version` :

**Dans `backend/.python-version` :**
```
3.11.9
```

## Vérification après déploiement

Après avoir poussé les modifications et redéployé, vérifiez les logs de build. Vous devriez voir :

```
==> Installation de Python version 3.11.9...
```

Si vous voyez toujours :
```
==> Installation de Python version 3.13.4...
```

Alors `runtime.txt` n'est pas détecté. Vérifiez le **Root Directory**.

## Solution de contournement : Mettre à jour requirements.txt

Si Python 3.13 continue d'être utilisé, vous pouvez essayer de mettre à jour `psycopg2-binary` vers une version compatible avec Python 3.13, mais cela peut ne pas exister encore.

## Checklist

- [ ] Fichier `backend/runtime.txt` existe avec `python-3.11.9`
- [ ] Root Directory dans Render est défini à `backend`
- [ ] Modifications poussées sur GitHub
- [ ] Service redéployé sur Render
- [ ] Logs de build montrent Python 3.11.9






