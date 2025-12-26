# Dépannage - Erreur Code 127 "gunicorn: commande introuvable"

## ⚠️ Si vous avez une erreur ImportError avec psycopg2

Si vous voyez une erreur `ImportError` avec `psycopg2` et Python 3.13, consultez **[DEPANNAGE_ERREUR_PSYCOPG2.md](DEPANNAGE_ERREUR_PSYCOPG2.md)**.

**Solution rapide :** Utilisez Python 3.11.9 en modifiant `backend/runtime.txt` :
```
python-3.11.9
```

---

# Dépannage - Erreur Code 127 "gunicorn: commande introuvable"

## 🔴 Erreur : "bash : ligne 1 : gunicorn : commande introuvable"

Si vous voyez cette erreur avec le code de sortie 127, cela signifie que `gunicorn` n'est pas installé.

### ✅ Solution Immédiate

**Option 1 : Modifier la commande de build (Recommandé)**

Dans Render.com → Settings de votre service :

**Build Command :**
```bash
pip install -r requirements-prod.txt
```

**OU**

```bash
pip install -r requirements-render.txt
```

**OU directement :**
```bash
pip install Flask==3.0.0 flask-cors==4.0.0 psycopg2-binary==2.9.9 gunicorn==21.2.0
```

**Option 2 : Ajouter gunicorn à requirements.txt**

Le fichier `requirements.txt` a été mis à jour pour inclure `gunicorn`. Si vous utilisez :
```bash
pip install -r requirements.txt
```

Cela devrait maintenant fonctionner.

### 🔍 Vérifications

1. **Vérifiez votre commande de build dans Render**
   - Elle doit installer `gunicorn`
   - Si vous utilisez `requirements.txt`, assurez-vous qu'il contient `gunicorn==21.2.0`

2. **Vérifiez les logs de build**
   - Cherchez "Installation réussie de gunicorn" dans les logs
   - Si vous ne voyez pas gunicorn dans les packages installés, la commande de build est incorrecte

3. **Commandes de build recommandées (dans l'ordre) :**

   **A. Utiliser requirements-prod.txt :**
   ```bash
   pip install -r requirements-prod.txt
   ```

   **B. Utiliser requirements-render.txt :**
   ```bash
   pip install -r requirements-render.txt
   ```

   **C. Installation directe :**
   ```bash
   pip install Flask==3.0.0 flask-cors==4.0.0 psycopg2-binary==2.9.9 gunicorn==21.2.0
   ```

### 📝 Configuration complète Render.com

**Settings :**
- **Root Directory** : `backend`
- **Build Command** : `pip install -r requirements-prod.txt`
- **Start Command** : `gunicorn app:app --bind 0.0.0.0:$PORT`

### ⚠️ Pourquoi cette erreur se produit

- `requirements.txt` ne contenait pas `gunicorn` (maintenant corrigé)
- La commande de build n'installe que `requirements.txt` qui ne contient pas gunicorn
- `gunicorn` est nécessaire pour la production mais pas pour le développement local

### ✅ Solution permanente

Le fichier `requirements.txt` a été mis à jour pour inclure `gunicorn`, donc si vous utilisez :
```bash
pip install -r requirements.txt
```

Cela devrait maintenant fonctionner. Cependant, pour la production, il est recommandé d'utiliser `requirements-prod.txt` qui inclut toutes les dépendances nécessaires.

