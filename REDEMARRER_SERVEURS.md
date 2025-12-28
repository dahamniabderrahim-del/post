# Comment Redémarrer les Serveurs

## 🚀 Méthode Rapide (Fichiers Batch)

### Windows

1. **Arrêter les serveurs en cours** :
   - Appuyez sur `Ctrl + C` dans les terminaux où les serveurs tournent
   - Ou fermez les fenêtres de terminal

2. **Redémarrer le Backend (Flask)** :
   - Double-cliquez sur `start_flask.bat` dans le dossier racine
   - Ou ouvrez un terminal et exécutez :
     ```bash
     start_flask.bat
     ```

3. **Redémarrer le Frontend (React)** :
   - Double-cliquez sur `start_react.bat` dans le dossier racine
   - Ou ouvrez un terminal et exécutez :
     ```bash
     start_react.bat
     ```

---

## 📝 Méthode Manuelle (Terminal)

### Terminal 1 - Backend (Flask)

1. **Ouvrir un terminal PowerShell ou CMD**

2. **Naviguer vers le dossier backend** :
   ```bash
   cd backend
   ```

3. **Activer l'environnement virtuel** (si vous en avez un) :
   ```bash
   .\venv\Scripts\activate
   ```
   Ou sur Linux/Mac :
   ```bash
   source venv/bin/activate
   ```

4. **Démarrer le serveur Flask** :
   ```bash
   python app.py
   ```

5. **Vous devriez voir** :
   ```
   * Running on http://127.0.0.1:5000
   ```

### Terminal 2 - Frontend (React/Vite)

1. **Ouvrir un NOUVEAU terminal PowerShell ou CMD**

2. **Naviguer vers le dossier frontend** :
   ```bash
   cd frontend
   ```

3. **Démarrer le serveur de développement** :
   ```bash
   npm run dev
   ```

4. **Vous devriez voir** :
   ```
   VITE v5.x.x  ready in xxx ms
   
   ➜  Local:   http://localhost:5173/
   ➜  Network: use --host to expose
   ```

---

## 🔄 Pour Redémarrer

### Si les serveurs sont déjà en cours d'exécution :

1. **Arrêter les serveurs** :
   - Dans chaque terminal, appuyez sur `Ctrl + C`
   - Attendez que les serveurs s'arrêtent complètement

2. **Redémarrer** :
   - Suivez les étapes ci-dessus pour redémarrer chaque serveur

---

## ✅ Vérification

### Backend
- Ouvrez votre navigateur et allez sur : `http://localhost:5000/api/health`
- Vous devriez voir : `{"status":"healthy","database":"connected"}`

### Frontend
- Ouvrez votre navigateur et allez sur : `http://localhost:5173` (ou le port indiqué)
- Vous devriez voir l'interface de la carte

---

## 🛠️ En Cas de Problème

### Le port est déjà utilisé

**Backend (port 5000)** :
```bash
# Windows - Trouver et tuer le processus
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:5000 | xargs kill -9
```

**Frontend (port 5173)** :
```bash
# Windows
netstat -ano | findstr :5173
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:5173 | xargs kill -9
```

### Erreur "module not found"

**Backend** :
```bash
cd backend
pip install -r requirements.txt
```

**Frontend** :
```bash
cd frontend
npm install
```

### Erreur de connexion à la base de données

- Vérifiez que PostgreSQL est démarré
- Vérifiez les identifiants dans `backend/app.py` ou les variables d'environnement

---

## 📋 Checklist de Démarrage

- [ ] PostgreSQL est démarré
- [ ] Backend Flask est démarré (port 5000)
- [ ] Frontend React est démarré (port 5173)
- [ ] Les deux serveurs fonctionnent sans erreur
- [ ] Le navigateur affiche la carte correctement

---

## 💡 Astuce

Pour éviter de redémarrer manuellement, vous pouvez utiliser des outils comme :
- **PM2** (Node.js) pour le frontend
- **Gunicorn** avec auto-reload pour le backend en production
- **Docker Compose** pour gérer les deux serveurs ensemble

---

**Une fois les serveurs redémarrés, rechargez la page dans votre navigateur (F5) pour voir les nouvelles fonctionnalités !**







