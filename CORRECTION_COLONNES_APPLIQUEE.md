# Correction de l'Endpoint des Colonnes - site_webing - Copie

## ✅ Corrections Appliquées

### Endpoint `/api/layers/<layer_name>/columns`

**Problème** : Utilisation de `LIKE '%geometry%'` directement dans la chaîne SQL avec des paramètres, ce qui cause l'erreur de placeholder.

**Solution** : Utiliser des paramètres séparés pour le pattern LIKE.

#### Avant (incorrect) :
```python
find_geom_query = """
SELECT column_name 
FROM information_schema.columns 
WHERE table_schema = 'public'
AND table_name = %s 
AND (data_type LIKE '%geometry%' OR udt_name = 'geometry')
LIMIT 1;
"""
cursor.execute(find_geom_query, (layer_name,))
```

#### Après (correct) :
```python
find_geom_query = """
SELECT column_name 
FROM information_schema.columns 
WHERE table_schema = 'public'
AND table_name = %s 
AND (data_type LIKE %s OR udt_name = 'geometry')
LIMIT 1;
"""
cursor.execute(find_geom_query, (layer_name, '%geometry%'))
```

### Même correction pour NOT LIKE :

```python
columns_query = """
SELECT column_name 
FROM information_schema.columns 
WHERE table_schema = 'public'
AND table_name = %s 
AND column_name != %s
AND data_type NOT LIKE %s
AND udt_name != 'geometry'
ORDER BY column_name;
"""
cursor.execute(columns_query, (layer_name, geom_column, '%geometry%'))
```

## 🚀 Test

1. **Redémarrer le serveur Flask** :
   ```bash
   cd "C:\Users\daham\OneDrive\Desktop\site_webing - Copie\backend"
   python app.py
   ```

2. **Tester l'endpoint** :
   ```
   http://localhost:5000/api/layers/espace_vert/columns
   ```

3. **Vous devriez voir** :
   ```json
   ["colonne1", "colonne2", "colonne3"]
   ```

4. **Tester dans le frontend** :
   - Ouvrez le panneau de filtrage
   - Sélectionnez une couche
   - Les colonnes devraient se charger automatiquement

## ✅ Résultat

L'endpoint des colonnes devrait maintenant fonctionner correctement sans erreur de placeholder !

---

**Les corrections ont été appliquées avec succès !**












