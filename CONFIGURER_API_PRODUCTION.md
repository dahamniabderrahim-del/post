# Configuration de l'API pour la Production

## Problème résolu

Le frontend déployé sur Render (https://sig-frontend.onrender.com) essayait d'accéder à `http://localhost:5000`, ce qui ne fonctionne pas en production. Les modifications suivantes ont été apportées :

## Modifications effectuées

### 1. Fichier de configuration (`frontend/src/config.js`)

Un nouveau fichier de configuration a été créé qui :
- Utilise la variable d'environnement `VITE_API_URL` si elle est définie
- Détecte automatiquement l'URL du backend en production (remplace 'frontend' par 'backend' dans l'URL)
- Utilise `localhost:5000` en développement local

### 2. Mise à jour des fichiers frontend

Tous les fichiers qui utilisaient `http://localhost:5000` ont été mis à jour pour utiliser `API_URL` depuis `config.js` :
- `frontend/src/App.jsx`
- `frontend/src/components/Map.jsx`
- `frontend/src/components/FilterPanel.jsx`

### 3. Configuration CORS dans le backend

Le backend (`backend/app.py`) a été mis à jour pour :
- Autoriser les requêtes depuis `https://sig-frontend.onrender.com`
- Autoriser toutes les origines Render (pattern `https://*.onrender.com`)
- Autoriser localhost en développement

## Configuration sur Render

### Option 1 : Configuration automatique (recommandée)

Le code détecte automatiquement l'URL du backend en production. Si votre backend est déployé sur `https://sig-backend.onrender.com`, le frontend le détectera automatiquement.

**Important** : Assurez-vous que votre backend Render s'appelle `sig-backend` (ou modifiez la logique de détection dans `config.js`).

### Option 2 : Variable d'environnement explicite

Si vous préférez définir explicitement l'URL de l'API :

1. Dans votre service frontend sur Render, allez dans **Environment**
2. Ajoutez une variable d'environnement :
   - **Key**: `VITE_API_URL`
   - **Value**: `https://sig-backend.onrender.com` (remplacez par l'URL réelle de votre backend)

3. Redéployez le service frontend

### Vérification du backend

Assurez-vous que votre backend est bien déployé et accessible. L'URL devrait ressembler à :
- `https://sig-backend.onrender.com` (ou le nom que vous avez donné)

Testez l'endpoint :
```bash
curl https://sig-backend.onrender.com/api/layers
```

## Test local

En développement local, le code utilise automatiquement `http://localhost:5000`. Aucune configuration supplémentaire n'est nécessaire.

## Dépannage

### Les couches n'apparaissent pas

1. **Vérifiez l'URL du backend** :
   - Ouvrez la console du navigateur (F12)
   - Regardez les erreurs réseau
   - Vérifiez que les requêtes pointent vers la bonne URL

2. **Vérifiez CORS** :
   - Les erreurs CORS apparaîtront dans la console du navigateur
   - Assurez-vous que le backend autorise bien votre frontend

3. **Vérifiez que le backend est en ligne** :
   - Testez l'URL du backend directement dans le navigateur
   - Vérifiez les logs Render du backend

### Erreur CORS persistante

Si vous avez encore des erreurs CORS après ces modifications :

1. Vérifiez que le backend a bien été redéployé avec les nouvelles modifications CORS
2. Vérifiez que l'URL du frontend dans la configuration CORS correspond exactement à votre URL Render
3. Vous pouvez temporairement autoriser toutes les origines en modifiant `backend/app.py` :
   ```python
   CORS(app)  # Autorise toutes les origines (à utiliser avec précaution)
   ```

## Prochaines étapes

1. Redéployez le frontend sur Render
2. Redéployez le backend sur Render (pour appliquer les modifications CORS)
3. Testez l'application sur https://sig-frontend.onrender.com
4. Vérifiez que les couches se chargent correctement








