# Configuration du Backend - post-aypc.onrender.com

## Modifications effectuées

### 1. Route racine ajoutée

Une route racine (`/`) a été ajoutée au backend pour confirmer que le serveur fonctionne. Vous pouvez maintenant accéder à :
- `https://post-aypc.onrender.com/` - Retourne les informations sur l'API
- `https://post-aypc.onrender.com/api/health` - Vérifie la santé de l'API et de la base de données
- `https://post-aypc.onrender.com/api/layers` - Liste toutes les couches disponibles

### 2. Configuration du frontend

Le frontend a été configuré pour utiliser automatiquement `https://post-aypc.onrender.com` comme URL du backend lorsque le frontend est déployé sur Render.

## Vérification

### Tester le backend

1. **Route racine** :
   ```bash
   curl https://post-aypc.onrender.com/
   ```
   Devrait retourner :
   ```json
   {
     "status": "ok",
     "message": "API backend is running",
     "endpoints": { ... }
   }
   ```

2. **Health check** :
   ```bash
   curl https://post-aypc.onrender.com/api/health
   ```
   Devrait retourner :
   ```json
   {
     "status": "healthy",
     "database": "connected"
   }
   ```

3. **Liste des couches** :
   ```bash
   curl https://post-aypc.onrender.com/api/layers
   ```
   Devrait retourner un tableau de couches.

### Si vous obtenez toujours une erreur 404

1. **Vérifiez que le backend est bien déployé** :
   - Allez sur votre dashboard Render
   - Vérifiez que le service `post-aypc` est en ligne
   - Vérifiez les logs pour voir s'il y a des erreurs

2. **Vérifiez la configuration du service** :
   - Le service doit utiliser `gunicorn` pour démarrer
   - Le fichier `Procfile` doit contenir : `web: gunicorn app:app`
   - Le répertoire de travail doit être `backend/`

3. **Vérifiez les variables d'environnement** :
   - Assurez-vous que les variables d'environnement pour la base de données sont correctement configurées sur Render

## Prochaines étapes

1. **Redéployez le backend** sur Render pour appliquer les modifications (route racine)
2. **Testez l'URL** : `https://post-aypc.onrender.com/`
3. **Redéployez le frontend** pour qu'il utilise la nouvelle configuration
4. **Testez le frontend** : Les couches devraient maintenant se charger depuis `https://post-aypc.onrender.com`

## Configuration CORS

Le backend autorise maintenant :
- Toutes les origines Render (`https://*.onrender.com`)
- Localhost en développement
- `https://sig-frontend.onrender.com` spécifiquement

Si votre frontend a une URL différente, vous pouvez l'ajouter dans `backend/app.py` dans la liste `allowed_origins`.




