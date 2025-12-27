# Solution Rapide - Erreur ImportError psycopg2

## 🔴 Problème

Vous voyez cette erreur :
```
ImportError: /opt/render/project/src/.venv/lib/python3.13/site-packages/psycopg2/_psycopg.cpython-31...
```

## ✅ Solution en 2 étapes

### Étape 1 : Modifier `backend/runtime.txt`

Changez le contenu pour :
```
python-3.11.9
```

### Étape 2 : Vérifier la commande de démarrage

Dans Render.com → Settings, assurez-vous que :
- **Start Command** = `gunicorn app:app --bind 0.0.0.0:$PORT`
- **PAS** `python app.py`

### Étape 3 : Committez et redéployez

```bash
git add backend/runtime.txt
git commit -m "Fix: Utiliser Python 3.11.9 pour compatibilité psycopg2"
git push
```

Redéployez sur Render. C'est tout !

## 📝 Pourquoi ?

Python 3.13 est très récent et `psycopg2-binary` n'a pas encore de wheels compilés pour cette version. Python 3.11.9 est stable et bien supporté.






