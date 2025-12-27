# Guide d'Hébergement - Site Web SIG

Ce guide vous explique étape par étape comment héberger votre application SIG (Flask + React + PostgreSQL/PostGIS) en production.

## 📋 Table des Matières

1. [Option 1 : Hébergement sur VPS (Serveur Dédié)](#option-1--hébergement-sur-vps-serveur-dédié)
2. [Option 2 : Hébergement Cloud (Render/Railway)](#option-2--hébergement-cloud-renderrailway)
3. [Option 3 : Hébergement Séparé (Frontend + Backend)](#option-3--hébergement-séparé-frontend--backend)
4. [Configuration de la Base de Données](#configuration-de-la-base-de-données)

---

## Option 1 : Hébergement sur VPS (Serveur Dédié)

### Étape 1 : Préparer le Serveur

1. **Acheter un VPS** (DigitalOcean, AWS EC2, OVH, etc.)
   - Minimum recommandé : 2GB RAM, 1 CPU, 20GB SSD
   - OS : Ubuntu 22.04 LTS (recommandé)

2. **Se connecter au serveur via SSH**
   ```bash
   ssh root@votre_ip_serveur
   ```

3. **Mettre à jour le système**
   ```bash
   sudo apt update && sudo apt upgrade -y
   ```

### Étape 2 : Installer les Dépendances Système

1. **Installer Python 3.11+**
   ```bash
   sudo apt install python3.11 python3.11-venv python3-pip -y
   ```

2. **Installer Node.js 18+**
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt install -y nodejs
   ```

3. **Installer PostgreSQL et PostGIS**
   ```bash
   sudo apt install postgresql postgresql-contrib postgis -y
   ```

4. **Installer Nginx (serveur web)**
   ```bash
   sudo apt install nginx -y
   ```

5. **Installer PM2 (gestionnaire de processus Node.js)**
   ```bash
   sudo npm install -g pm2
   ```

### Étape 3 : Configurer PostgreSQL

1. **Créer un utilisateur et une base de données**
   ```bash
   sudo -u postgres psql
   ```

2. **Dans le terminal PostgreSQL, exécutez :**
   ```sql
   CREATE DATABASE pos;
   CREATE USER postgres WITH PASSWORD 'votre_mot_de_passe_securise';
   ALTER ROLE postgres SET client_encoding TO 'utf8';
   ALTER ROLE postgres SET default_transaction_isolation TO 'read committed';
   ALTER ROLE postgres SET timezone TO 'UTC';
   GRANT ALL PRIVILEGES ON DATABASE pos TO postgres;
   \c pos
   CREATE EXTENSION postgis;
   \q
   ```

3. **Configurer l'accès distant (optionnel)**
   ```bash
   sudo nano /etc/postgresql/*/main/postgresql.conf
   ```
   Décommentez la ligne : `listen_addresses = '*'`

   ```bash
   sudo nano /etc/postgresql/*/main/pg_hba.conf
   ```
   Ajoutez : `host all all 0.0.0.0/0 md5`

   ```bash
   sudo systemctl restart postgresql
   ```

### Étape 4 : Déployer le Backend Flask

1. **Créer un utilisateur pour l'application**
   ```bash
   sudo adduser sigapp
   sudo usermod -aG sudo sigapp
   su - sigapp
   ```

2. **Cloner ou transférer votre code**
   ```bash
   cd /home/sigapp
   # Option A : Si vous utilisez Git
   git clone votre_repo_url
   cd site_webing
   
   # Option B : Si vous transférez via SCP
   # Depuis votre machine locale :
   # scp -r backend/ sigapp@votre_ip:/home/sigapp/site_webing/
   ```

3. **Configurer l'environnement virtuel**
   ```bash
   cd backend
   python3.11 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   pip install gunicorn  # Serveur WSGI pour production
   ```

4. **Modifier app.py pour la production**
   - Créer un fichier de configuration séparé
   - Utiliser des variables d'environnement pour les secrets

5. **Créer un fichier de configuration Gunicorn**
   ```bash
   nano /home/sigapp/site_webing/backend/gunicorn_config.py
   ```
   Contenu :
   ```python
   bind = "127.0.0.1:5000"
   workers = 4
   worker_class = "sync"
   timeout = 120
   keepalive = 5
   ```

6. **Créer un service systemd pour Flask**
   ```bash
   sudo nano /etc/systemd/system/sig-backend.service
   ```
   Contenu :
   ```ini
   [Unit]
   Description=SIG Backend Flask App
   After=network.target

   [Service]
   User=sigapp
   Group=sigapp
   WorkingDirectory=/home/sigapp/site_webing/backend
   Environment="PATH=/home/sigapp/site_webing/backend/venv/bin"
   ExecStart=/home/sigapp/site_webing/backend/venv/bin/gunicorn --config gunicorn_config.py app:app

   [Install]
   WantedBy=multi-user.target
   ```

7. **Démarrer le service**
   ```bash
   sudo systemctl daemon-reload
   sudo systemctl enable sig-backend
   sudo systemctl start sig-backend
   sudo systemctl status sig-backend
   ```

### Étape 5 : Déployer le Frontend React

1. **Construire l'application React**
   ```bash
   cd /home/sigapp/site_webing/frontend
   npm install
   npm run build
   ```

2. **Modifier vite.config.js pour la production**
   - Changer l'URL de l'API de `localhost:5000` vers votre domaine/IP

3. **Servir avec Nginx**
   ```bash
   sudo nano /etc/nginx/sites-available/sig-app
   ```
   Contenu :
   ```nginx
   server {
       listen 80;
       server_name votre_domaine.com www.votre_domaine.com;

       # Frontend React
       location / {
           root /home/sigapp/site_webing/frontend/dist;
           try_files $uri $uri/ /index.html;
           index index.html;
       }

       # Backend API
       location /api {
           proxy_pass http://127.0.0.1:5000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

4. **Activer le site**
   ```bash
   sudo ln -s /etc/nginx/sites-available/sig-app /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

### Étape 6 : Configurer SSL avec Let's Encrypt (HTTPS)

1. **Installer Certbot**
   ```bash
   sudo apt install certbot python3-certbot-nginx -y
   ```

2. **Obtenir un certificat SSL**
   ```bash
   sudo certbot --nginx -d votre_domaine.com -d www.votre_domaine.com
   ```

3. **Renouvellement automatique**
   ```bash
   sudo certbot renew --dry-run
   ```

### Étape 7 : Configurer le Firewall

```bash
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

---

## Option 2 : Hébergement Cloud (Render/Railway)

### Option 2A : Render.com

#### Backend Flask sur Render

1. **Créer un compte sur Render.com**

2. **Créer un nouveau Web Service**
   - Connecter votre repository Git
   - Nom : `sig-backend`
   - Root Directory : `backend`
   - Environment : `Python 3`
   - Build Command : `pip install -r requirements.txt`
   - Start Command : `gunicorn app:app --bind 0.0.0.0:$PORT`

3. **Ajouter des Variables d'Environnement**
   ```
   DATABASE_URL=postgresql://user:password@host:5432/dbname
   FLASK_ENV=production
   PORT=5000
   ```

4. **Créer une Base de Données PostgreSQL**
   - Dans Render Dashboard : New > PostgreSQL
   - Choisir un nom et une région
   - Noter les informations de connexion

5. **Modifier app.py pour utiliser les variables d'environnement**
   ```python
   import os
   from urllib.parse import urlparse
   
   # Configuration depuis variable d'environnement
   DATABASE_URL = os.getenv('DATABASE_URL')
   if DATABASE_URL:
       result = urlparse(DATABASE_URL)
       DB_CONFIG = {
           'host': result.hostname,
           'port': result.port or 5432,
           'database': result.path[1:],
           'user': result.username,
           'password': result.password
       }
   else:
       # Configuration par défaut pour développement
       DB_CONFIG = {
           'host': 'localhost',
           'port': 5432,
           'database': 'pos',
           'user': 'postgres',
           'password': 'Admin123'
       }
   ```

#### Frontend React sur Render

1. **Créer un nouveau Static Site**
   - Root Directory : `frontend`
   - Build Command : `npm install && npm run build`
   - Publish Directory : `dist`

2. **Modifier vite.config.js**
   ```javascript
   export default defineConfig({
     plugins: [react()],
     server: {
       port: 3000,
       proxy: {
         '/api': {
           target: 'https://votre-backend.onrender.com',
           changeOrigin: true
         }
       }
     },
     build: {
       outDir: 'dist',
     }
   })
   ```

3. **Créer un fichier _redirects dans public/**
   ```
   /*    /index.html   200
   ```

### Option 2B : Railway.app

1. **Créer un compte sur Railway.app**

2. **Créer un nouveau projet**
   - Connecter votre repository Git

3. **Ajouter PostgreSQL**
   - New > Database > PostgreSQL
   - Railway créera automatiquement une variable `DATABASE_URL`

4. **Déployer le Backend**
   - New > Service > GitHub Repo
   - Root Directory : `backend`
   - Railway détectera automatiquement Python
   - Variables d'environnement : Utiliser `DATABASE_URL`

5. **Déployer le Frontend**
   - New > Service > GitHub Repo
   - Root Directory : `frontend`
   - Build Command : `npm install && npm run build`
   - Start Command : `npx serve -s dist -l 3000`

---

## Option 3 : Hébergement Séparé (Frontend + Backend)

### Frontend sur Netlify/Vercel

#### Netlify

1. **Créer un compte sur Netlify.com**

2. **Déployer depuis Git**
   - New site from Git
   - Sélectionner votre repository
   - Base directory : `frontend`
   - Build command : `npm install && npm run build`
   - Publish directory : `frontend/dist`

3. **Ajouter une variable d'environnement**
   - Site settings > Environment variables
   - `VITE_API_URL` = `https://votre-backend-url.com`

4. **Créer netlify.toml**
   ```toml
   [build]
     command = "npm run build"
     publish = "dist"
   
   [[redirects]]
     from = "/*"
     to = "/index.html"
     status = 200
   ```

#### Vercel

1. **Créer un compte sur Vercel.com**

2. **Déployer depuis Git**
   - Import Project
   - Root Directory : `frontend`
   - Framework Preset : Vite
   - Build Command : `npm run build`
   - Output Directory : `dist`

3. **Ajouter une variable d'environnement**
   - Settings > Environment Variables
   - `VITE_API_URL` = `https://votre-backend-url.com`

### Backend sur Render/Railway/Heroku

Suivez les instructions de l'Option 2 pour déployer le backend.

---

## Configuration de la Base de Données

### Migrer vos données vers la production

1. **Exporter depuis votre base locale**
   ```bash
   pg_dump -U postgres -h localhost -d pos > backup.sql
   ```

2. **Importer vers la base de production**
   ```bash
   psql -U postgres -h votre_host -d pos < backup.sql
   ```

### Vérifier PostGIS

```sql
SELECT PostGIS_version();
```

### Créer les extensions nécessaires

```sql
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS postgis_topology;
```

---

## Checklist de Déploiement

- [ ] Serveur/VPS configuré avec toutes les dépendances
- [ ] PostgreSQL installé et configuré avec PostGIS
- [ ] Base de données créée et migrée
- [ ] Backend Flask déployé et fonctionnel
- [ ] Frontend React construit et déployé
- [ ] Variables d'environnement configurées
- [ ] Nginx/Proxy configuré correctement
- [ ] SSL/HTTPS configuré
- [ ] Firewall configuré
- [ ] Tests de l'API effectués
- [ ] Tests du frontend effectués
- [ ] Monitoring configuré (optionnel)

---

## Dépannage

### Le backend ne démarre pas
- Vérifier les logs : `sudo journalctl -u sig-backend -f`
- Vérifier la connexion à la base de données
- Vérifier les variables d'environnement

### Le frontend ne charge pas les données
- Vérifier l'URL de l'API dans vite.config.js
- Vérifier les CORS dans app.py
- Vérifier la console du navigateur pour les erreurs

### Erreurs de connexion à la base de données
- Vérifier les credentials
- Vérifier que PostgreSQL écoute sur le bon port
- Vérifier les règles de firewall

---

## Sécurité

1. **Ne jamais commiter les mots de passe**
   - Utiliser des variables d'environnement
   - Utiliser un fichier `.env` (non versionné)

2. **Configurer CORS correctement**
   ```python
   CORS(app, resources={
       r"/api/*": {
           "origins": ["https://votre-domaine.com"]
       }
   })
   ```

3. **Utiliser HTTPS en production**

4. **Limiter les accès à la base de données**

5. **Mettre à jour régulièrement les dépendances**

---

## Support

Pour toute question ou problème, consultez :
- Documentation Flask : https://flask.palletsprojects.com/
- Documentation React : https://react.dev/
- Documentation PostGIS : https://postgis.net/documentation/



