# Configuration Gunicorn pour la production
# Ce fichier est utilisé pour servir l'application Flask en production

import multiprocessing
import os

# Adresse et port d'écoute
bind = os.getenv('BIND', "127.0.0.1:5000")

# Nombre de workers (généralement 2-4 x nombre de CPUs)
workers = int(os.getenv('WORKERS', multiprocessing.cpu_count() * 2 + 1))

# Classe de worker
worker_class = "sync"

# Timeout pour les requêtes (en secondes)
timeout = int(os.getenv('TIMEOUT', 120))

# Keep-alive
keepalive = int(os.getenv('KEEPALIVE', 5))

# Logging
accesslog = "-"  # stdout
errorlog = "-"  # stderr
loglevel = os.getenv('LOG_LEVEL', 'info')

# Nom du processus
proc_name = "sig-backend"

# Préchargement de l'application (améliore les performances)
preload_app = True

# Nombre maximum de requêtes par worker avant redémarrage
max_requests = 1000
max_requests_jitter = 50









