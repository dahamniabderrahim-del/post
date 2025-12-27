# Fix : Problème Python 3.13 avec psycopg2-binary sur Render

## Problème

Render utilise Python 3.13 par défaut, mais `psycopg2-binary==2.9.10` n'est pas compatible avec Python 3.13.

Erreur :
```
ImportError : symbole non défini : _PyInterpreterState_Get
```

## Solution : Forcer Python 3.11 dans Render

### Option 1 : Via le Dashboard Render (Recommandé)

1. Allez sur votre service web dans le dashboard Render
2. Cliquez sur **"Settings"** (Paramètres)
3. Dans la section **"Build & Deploy"**, trouvez **"Python Version"**
4. Sélectionnez **"Python 3.11"** ou **"3.11.9"** dans le menu déroulant
5. Cliquez sur **"Save Changes"**
6. Redéployez votre service

### Option 2 : Via runtime.txt (si Render le lit)

Le fichier `backend/runtime.txt` contient déjà `python-3.11.9`, mais Render peut l'ignorer si le root directory n'est pas correctement configuré.

**Vérifiez dans Render :**
- **Root Directory** : Doit être `backend` (pas vide)
- Le fichier `runtime.txt` doit être dans le root directory (`backend/runtime.txt`)

### Option 3 : Mettre à jour vers psycopg (psycopg3)

Si vous voulez utiliser Python 3.13, vous devez migrer vers `psycopg` (psycopg3) qui supporte Python 3.13.

**Modifications nécessaires dans `backend/app.py` :**

```python
# Remplacer :
import psycopg2
from psycopg2.extras import RealDictCursor

# Par :
import psycopg
from psycopg.rows import dict_row

# Et modifier les connexions :
conn = psycopg.connect(...)
cursor = conn.cursor(row_factory=dict_row)
```

**Et dans `requirements.txt` :**
```
psycopg[binary]==3.2.0
```

## Solution recommandée : Option 1

La solution la plus simple est de forcer Python 3.11 dans les paramètres Render.

## Vérification

Après avoir configuré Python 3.11, les logs de build devraient montrer :
```
==> Installation de Python version 3.11.9...
```

Au lieu de :
```
==> Installation de Python version 3.13.4...
```
