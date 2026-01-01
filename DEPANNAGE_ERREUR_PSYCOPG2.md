# Dépannage - Erreur ImportError avec psycopg2

## 🔴 Erreur : "ImportError: /opt/render/project/src/.venv/lib/python3.13/site-packages/psycopg2/_psycopg.cpython-31..."

Cette erreur indique que `psycopg2` ne peut pas charger sa bibliothèque native. C'est souvent dû à une incompatibilité avec Python 3.13.

## ✅ Solutions (dans l'ordre de préférence)

### Solution 1 : Utiliser Python 3.11 ou 3.12 (Recommandé)

`psycopg2-binary` a des problèmes de compatibilité avec Python 3.13. Utilisez Python 3.11 ou 3.12.

**Étape 1 : Modifier `backend/runtime.txt`**
```
python-3.11.9
```

**OU**

```
python-3.12.7
```

**Étape 2 : Dans Render.com**
- Allez dans Settings de votre service
- Vérifiez que le fichier `runtime.txt` est bien dans le dossier `backend/`
- Redéployez

### Solution 2 : Utiliser psycopg (nouvelle version, compatible Python 3.13)

`psycopg` (sans le "2") est la nouvelle version qui fonctionne mieux avec Python 3.13.

**Étape 1 : Modifier `backend/requirements.txt`**

Remplacez :
```
psycopg2-binary==2.9.9
```

Par :
```
psycopg[binary]==3.2.0
```

**Étape 2 : Modifier `backend/app.py`**

Remplacez :
```python
import psycopg2
from psycopg2.extras import RealDictCursor
```

Par :
```python
import psycopg
from psycopg.rows import dict_row
```

**Étape 3 : Modifier la fonction `get_db_connection()`**

Remplacez :
```python
def get_db_connection():
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        return conn
    except Exception as e:
        print(f"Erreur de connexion à la base de données: {e}")
        return None
```

Par :
```python
def get_db_connection():
    try:
        conn = psycopg.connect(**DB_CONFIG)
        return conn
    except Exception as e:
        print(f"Erreur de connexion à la base de données: {e}")
        return None
```

**Étape 4 : Modifier les cursors**

Remplacez partout :
```python
cursor = conn.cursor(cursor_factory=RealDictCursor)
```

Par :
```python
cursor = conn.cursor(row_factory=dict_row)
```

### Solution 3 : Utiliser une version plus récente de psycopg2-binary

Essayez une version plus récente qui pourrait être compatible :

**Modifier `backend/requirements.txt` :**
```
psycopg2-binary==2.9.10
```

**OU la dernière version :**
```
psycopg2-binary>=2.9.10
```

### Solution 4 : Vérifier la commande de démarrage

**IMPORTANT :** Assurez-vous que la commande de démarrage dans Render est :

```
gunicorn app:app --bind 0.0.0.0:$PORT
```

**PAS :**
```
python app.py
```

## 🔍 Configuration complète recommandée

### Pour Python 3.11/3.12 (Solution la plus simple)

**`backend/runtime.txt` :**
```
python-3.11.9
```

**`backend/requirements.txt` :**
```
Flask==3.0.0
flask-cors==4.0.0
psycopg2-binary==2.9.9
gunicorn==21.2.0
```

**Render.com Settings :**
- Root Directory : `backend`
- Build Command : `pip install -r requirements.txt`
- Start Command : `gunicorn app:app --bind 0.0.0.0:$PORT`

### Pour Python 3.13 (avec psycopg)

**`backend/runtime.txt` :**
```
python-3.13.4
```

**`backend/requirements.txt` :**
```
Flask==3.0.0
flask-cors==4.0.0
psycopg[binary]==3.2.0
gunicorn==21.2.0
```

**Et modifier `app.py` comme indiqué dans Solution 2.**

## ⚠️ Pourquoi cette erreur se produit

1. **Python 3.13 est très récent** et `psycopg2-binary` n'a pas encore de wheels compilés pour cette version
2. **psycopg2-binary** nécessite des bibliothèques natives compilées pour chaque version de Python
3. **Python 3.11 et 3.12** sont bien supportés par `psycopg2-binary`

## ✅ Solution recommandée

**Utilisez Python 3.11.9** - c'est la solution la plus simple et la plus stable :

1. Modifiez `backend/runtime.txt` :
   ```
   python-3.11.9
   ```

2. Committez et poussez :
   ```bash
   git add backend/runtime.txt
   git commit -m "Fix: Utiliser Python 3.11.9 pour compatibilité psycopg2"
   git push
   ```

3. Redéployez sur Render

Cela devrait résoudre le problème immédiatement.














