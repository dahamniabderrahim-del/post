# Déployer les Modifications sur le Site Hébergé (Render)

## 🚀 Étapes pour Déployer les Nouvelles Fonctionnalités

### Étape 1 : Vérifier que les Modifications sont Committées

```bash
git status
```

Si vous voyez des fichiers non committés, ajoutez-les :
```bash
git add .
git commit -m "Feat: Ajouter basculement fond de carte et filtrage"
```

### Étape 2 : Pousser sur GitHub

```bash
git push origin main
```

### Étape 3 : Render Déploiera Automatiquement

Render détecte automatiquement les changements sur GitHub et redéploie :
- **Backend** : Redéploiement automatique (2-3 minutes)
- **Frontend** : Redéploiement automatique (2-3 minutes)

---

## ⏱️ Temps d'Attente

- **Backend** : 2-3 minutes pour redéployer
- **Frontend** : 2-3 minutes pour redéployer
- **Total** : 3-5 minutes

---

## ✅ Vérification du Déploiement

### 1. Vérifier le Statut sur Render

1. Allez sur [Render.com](https://render.com)
2. Connectez-vous à votre compte
3. Ouvrez votre service **backend** (`post-aypc`)
4. Vérifiez l'onglet **"Logs"** pour voir le déploiement en cours
5. Attendez que le statut soit **"Available"** (vert)

### 2. Vérifier le Frontend

1. Ouvrez votre service **frontend** (`sig-frontend`)
2. Vérifiez l'onglet **"Logs"**
3. Attendez que le statut soit **"Available"** (vert)

### 3. Tester les Nouvelles Fonctionnalités

1. Ouvrez votre site : `https://sig-frontend.onrender.com`
2. Rechargez la page (F5 ou Ctrl+R)
3. Vérifiez que vous voyez :
   - **🛰️/🗺️** en haut à gauche → Basculement de fond de carte
   - **🔍 Filtre** en haut à droite → Panneau de filtrage

---

## 🔄 Forcer un Redéploiement (si nécessaire)

Si Render ne détecte pas automatiquement les changements :

1. **Backend** :
   - Ouvrez votre service backend sur Render
   - Cliquez sur **"Manual Deploy"** → **"Deploy latest commit"**

2. **Frontend** :
   - Ouvrez votre service frontend sur Render
   - Cliquez sur **"Manual Deploy"** → **"Deploy latest commit"**

---

## 🐛 En Cas de Problème

### Le déploiement échoue

1. **Vérifiez les logs** sur Render (onglet "Logs")
2. **Vérifiez les erreurs** dans les logs
3. **Vérifiez que tous les fichiers sont bien poussés** sur GitHub

### Les fonctionnalités ne s'affichent pas

1. **Videz le cache du navigateur** (Ctrl+Shift+R)
2. **Vérifiez la console du navigateur** (F12) pour les erreurs
3. **Vérifiez que les fichiers CSS sont bien déployés**

### Erreur de build

**Backend** :
- Vérifiez que `requirements.txt` contient toutes les dépendances
- Vérifiez les logs de build sur Render

**Frontend** :
- Vérifiez que `package.json` contient toutes les dépendances
- Vérifiez les logs de build sur Render

---

## 📋 Checklist de Déploiement

- [ ] Modifications committées localement
- [ ] Modifications poussées sur GitHub (`git push`)
- [ ] Backend redéployé sur Render (statut "Available")
- [ ] Frontend redéployé sur Render (statut "Available")
- [ ] Site testé avec les nouvelles fonctionnalités
- [ ] Bouton de basculement de fond visible
- [ ] Panneau de filtrage visible

---

## 💡 Astuce

Pour suivre le déploiement en temps réel :
1. Ouvrez l'onglet **"Logs"** sur Render
2. Vous verrez le processus de build et de déploiement en direct

---

**Une fois le déploiement terminé, vos nouvelles fonctionnalités seront disponibles sur le site hébergé !**












