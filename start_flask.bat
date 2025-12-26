@echo off
chcp 65001 >nul
echo ========================================
echo   Démarrage du serveur Flask
echo ========================================
cd /d "%~dp0backend"
if not exist venv (
    echo Création de l'environnement virtuel...
    python -m venv venv
)
call venv\Scripts\activate.bat
if errorlevel 1 (
    echo Erreur: Impossible d'activer l'environnement virtuel
    pause
    exit /b 1
)
echo Installation des dépendances...
pip install -q -r requirements.txt
if errorlevel 1 (
    echo Erreur: Impossible d'installer les dépendances
    pause
    exit /b 1
)
echo.
echo ✓ Serveur Flask démarré sur http://localhost:5000
echo.
python app.py
if errorlevel 1 (
    echo.
    echo Erreur lors du démarrage du serveur
    pause
)

