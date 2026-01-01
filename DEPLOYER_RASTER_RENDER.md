# Guide pour Déployer le Support des Rasters sur Render

## 🎯 Objectif
Déployer les modifications du support des rasters PostGIS sur votre site hébergé sur Render.

## 📋 Étapes de déploiement

### 1. Pousser les modifications sur GitHub

**Ouvrez PowerShell dans le dossier du projet :**

```powershell
cd "C:\Users\daham\OneDrive\Desktop\site_webing - Copie"

# Vérifier l'état des modifications
git status

# Ajouter tous les fichiers modifiés
git add .

# Créer un commit avec un message descriptif
git commit -m "Ajout du support des couches raster PostGIS - Backend et Frontend"

# Pousser vers GitHub
git push origin main
```

**Si vous êtes demandé pour l'authentification :**
- **Username** : votre nom d'utilisateur GitHub
- **Password** : votre token d'accès personnel GitHub (pas votre mot de passe)

### 2. Vérifier que Render détecte les modifications

1. Allez sur votre dashboard Render : https://dashboard.render.com
2. Ouvrez votre service backend (`post-aypc`)
3. Render devrait automatiquement détecter le nouveau commit et commencer un redéploiement
4. Si ce n'est pas le cas, cliquez sur **Manual Deploy** → **Deploy latest commit**

### 3. Vérifier les variables d'environnement sur Render

**Dans votre service backend sur Render :**

1. Allez dans **Environment**
2. Vérifiez que `DATABASE_URL` est bien configurée avec l'URL de votre base de données PostgreSQL
3. Si ce n'est pas le cas, ajoutez-la :
   - **Key** : `DATABASE_URL`
   - **Value** : L'URL complète de votre base de données (trouvée dans votre service PostgreSQL sur Render)

### 4. Vérifier que le redéploiement est réussi

**Dans les logs du backend sur Render, cherchez :**
- ✅ `📋 X couche(s) trouvée(s) (Y vectorielle(s), Z raster(s))`
- ✅ Pas d'erreurs d'import ou de syntaxe

**Si vous voyez des erreurs :**
- Vérifiez que `psycopg2-binary` est dans `requirements.txt`
- Vérifiez que Python 3.11 est configuré (pas 3.13)
- Consultez `FIX_PYTHON_313_RENDER.md` si nécessaire

### 5. Tester les endpoints raster

**Une fois le backend redéployé, testez :**

1. **Liste des couches** :
   ```
   https://post-aypc.onrender.com/api/layers
   ```
   Vérifiez que les couches raster apparaissent avec `"type": "raster"`

2. **Limites d'une couche raster** :
   ```
   https://post-aypc.onrender.com/api/layers/NOM_TABLE/raster/bounds
   ```
   Remplacez `NOM_TABLE` par le nom de votre table raster

3. **Image raster** :
   ```
   https://post-aypc.onrender.com/api/layers/NOM_TABLE/raster?bbox=-8.7,19.0,11.9,37.1&width=512&height=512
   ```
   Une image PNG devrait s'afficher

### 6. Redéployer le frontend

**Si le frontend est aussi sur Render :**

1. Allez sur votre service frontend (`sig-frontend`)
2. Cliquez sur **Manual Deploy** → **Deploy latest commit**
3. Attendez que le build soit terminé

**Si le frontend est sur Netlify ou Vercel :**
- Ces plateformes redéploient automatiquement quand vous poussez sur GitHub
- Vérifiez que le build est réussi dans leur dashboard

### 7. Tester le site en production

**Ouvrez votre site :**
```
https://sig-frontend.onrender.com
```

**Vérifiez :**
1. Les couches raster apparaissent dans la liste des couches
2. Quand vous sélectionnez une couche raster, elle s'affiche sur la carte
3. Ouvrez la console du navigateur (F12) et cherchez :
   - `🗺️ Couche raster détectée: nom_table`
   - `✅ Couche raster ajoutée à la carte`

## 🔍 Vérifications importantes

### Backend
- ✅ `DATABASE_URL` est configurée dans Render
- ✅ Python 3.11 est utilisé (pas 3.13)
- ✅ `psycopg2-binary==2.9.10` est dans `requirements.txt`
- ✅ `gunicorn==21.2.0` est dans `requirements.txt`
- ✅ Les logs montrent que les rasters sont détectés

### Frontend
- ✅ `VITE_API_URL` est configurée si nécessaire (ou détection automatique)
- ✅ Le build se termine sans erreurs
- ✅ Les couches raster apparaissent dans la liste

### Base de données
- ✅ Les tables raster existent dans PostgreSQL
- ✅ Les colonnes sont bien de type `raster` (pas `geometry`)
- ✅ Les rasters contiennent des données

## 🐛 Résolution de problèmes

### Les rasters n'apparaissent pas dans `/api/layers`

**Vérifiez dans PostgreSQL :**
```sql
-- Vérifier que la colonne est bien de type raster
SELECT column_name, data_type, udt_name
FROM information_schema.columns
WHERE table_name = 'votre_table'
AND (data_type LIKE '%raster%' OR udt_name = 'raster');
```

**Vérifiez les logs du backend sur Render :**
- Cherchez les erreurs SQL
- Vérifiez que PostGIS est installé avec support raster

### Erreur "Aucune colonne raster trouvée"

**Cause :** La requête SQL ne trouve pas la colonne raster

**Solution :**
1. Vérifiez que le nom de la table est correct
2. Vérifiez que la colonne est bien de type `raster` dans PostgreSQL
3. Vérifiez que la table est dans le schéma `public`

### L'image raster ne s'affiche pas

**Vérifiez :**
1. L'URL de l'endpoint est correcte
2. Les paramètres `bbox`, `width`, `height` sont valides
3. Les logs du backend pour voir les erreurs SQL
4. Que PostGIS peut générer des PNG :
   ```sql
   SELECT ST_AsPNG(ST_Union(raster_column)) FROM votre_table;
   ```

### CORS Error

**Si vous voyez des erreurs CORS :**
- Vérifiez que `https://sig-frontend.onrender.com` est dans `allowed_origins`
- Vérifiez que le regex `https://.*\.onrender\.com` est actif
- Vérifiez que CORS est configuré pour les routes `/api/*`

## 📝 Checklist de déploiement

- [ ] Modifications poussées sur GitHub
- [ ] Backend redéployé sur Render
- [ ] `DATABASE_URL` configurée sur Render
- [ ] Backend redéployé avec succès (pas d'erreurs dans les logs)
- [ ] `/api/layers` retourne les couches raster avec `"type": "raster"`
- [ ] `/api/layers/NOM_TABLE/raster/bounds` fonctionne
- [ ] `/api/layers/NOM_TABLE/raster?bbox=...` retourne une image PNG
- [ ] Frontend redéployé
- [ ] Les couches raster apparaissent dans la liste sur le site
- [ ] Les couches raster s'affichent sur la carte
- [ ] Pas d'erreurs dans la console du navigateur

## 🎉 Une fois tout déployé

Votre site devrait maintenant :
- ✅ Détecter automatiquement les tables raster dans PostgreSQL
- ✅ Afficher les couches raster dans la liste des couches
- ✅ Afficher les rasters sur la carte quand ils sont sélectionnés
- ✅ Mettre à jour les rasters lors du zoom et du pan

## 📞 Support

Si vous rencontrez des problèmes :
1. Consultez `DEBUG_RASTER.md` pour plus de détails
2. Vérifiez les logs du backend sur Render
3. Vérifiez la console du navigateur (F12)
4. Testez les endpoints directement dans le navigateur






