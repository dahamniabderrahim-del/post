# Résolution Rapide - Erreurs de Déploiement

## 🔴 Erreur ImportError avec psycopg2 (Python 3.13)

**Si vous voyez : `ImportError: /opt/render/project/src/.venv/lib/python3.13/site-packages/psycopg2/_psycopg.cpython-31...`**

### ✅ Solution en 1 étape :

Modifiez `backend/runtime.txt` pour utiliser Python 3.11 :
```
python-3.11.9
```

Commettez, poussez et redéployez. C'est tout !

📚 Pour plus de détails : Consultez `DEPANNAGE_ERREUR_PSYCOPG2.md`

---

## 🔴 Erreur Code 127 : "gunicorn: commande introuvable"

**Si vous voyez : `bash : ligne 1 : gunicorn : commande introuvable`**

### ✅ Solution en 1 étape :

Dans Render.com → Settings → **Build Command**, changez pour :
```bash
pip install -r requirements-prod.txt
```

**OU**

```bash
pip install -r requirements-render.txt
```

Redéployez. C'est tout !

📚 Pour plus de détails : Consultez `DEPANNAGE_ERREUR_CODE_127.md`

---

## 🔴 Solution Immédiate - Erreur Code 2 "requirements.txt not found"

**Si vous voyez : `ERREUR : Impossible d'ouvrir le fichier : 'requirements.txt'`**

### ✅ Solution en 2 étapes :

1. **Dans Render.com → Settings de votre service**
   - Trouvez **"Root Directory"**
   - Changez-le en : **`backend`** (sans guillemets, sans slash)
   - Sauvegardez

2. **Redéployez votre service**

C'est tout ! Le Root Directory doit pointer vers le dossier qui contient `requirements.txt`.

---

## 🔧 Solution si l'erreur persiste

L'erreur code 2 peut aussi être causée par `app.py` qui n'utilise pas les variables d'environnement.

### ✅ Ce qui a été corrigé

1. **`app.py` a été mis à jour** pour utiliser les variables d'environnement
2. **Fichier `requirements-render.txt` créé** comme alternative

### 📋 Étapes pour résoudre

1. **Vérifiez que les modifications sont sauvegardées**
   - Le fichier `backend/app.py` doit maintenant utiliser `os.getenv()`

2. **Dans Render.com, configurez :**

   **Build Command :**
   ```
   pip install -r requirements-render.txt
   ```
   
   **OU si ça ne fonctionne pas :**
   ```
   pip install Flask==3.0.0 flask-cors==4.0.0 psycopg2-binary==2.9.9 gunicorn==21.2.0
   ```

   **Start Command :**
   ```
   gunicorn app:app --bind 0.0.0.0:$PORT
   ```

3. **Variables d'environnement obligatoires :**
   - `DATABASE_URL` : URL de votre base de données PostgreSQL
     - Format : `postgresql://user:password@host:port/database`
     - Vous la trouvez dans votre base de données Render

4. **Committez et poussez vos modifications :**
   ```bash
   git add backend/app.py backend/requirements-render.txt
   git commit -m "Fix: Ajout support variables d'environnement pour production"
   git push
   ```

5. **Redéployez sur Render**

### 🔍 Vérifications (dans l'ordre d'importance)

- [ ] **🔴 CRITIQUE : Root Directory = `backend`** (vérifiez dans Settings)
- [ ] Build Command utilise `requirements.txt` ou `requirements-render.txt`
- [ ] Start Command = `gunicorn app:app --bind 0.0.0.0:$PORT`
- [ ] `DATABASE_URL` est configurée dans les variables d'environnement
- [ ] Les modifications sont poussées sur Git

### 📚 Pour plus de détails

Consultez `DEPANNAGE_ERREUR_CODE_2.md` pour un guide complet de dépannage.

