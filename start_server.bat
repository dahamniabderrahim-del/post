@echo off
chcp 65001 >nul
title Serveur Flask - SIG
color 0B

cls
echo.
echo ╔══════════════════════════════════════════════════════════╗
echo ║         DÉMARRAGE DU SERVEUR FLASK                        ║
echo ║         Système d'Information Géographique               ║
echo ╚══════════════════════════════════════════════════════════╝
echo.

REM Aller dans le dossier backend
cd /d "%~dp0backend"
if not exist "app.py" (
    echo ❌ Erreur: Fichier app.py introuvable dans le dossier backend
    echo    Répertoire actuel: %CD%
    echo.
    pause
    exit /b 1
)

REM Vérifier si Python est installé
echo [1/5] Vérification de Python...
python --version >nul 2>&1
if errorlevel 1 (
    echo    ❌ Python n'est pas installé ou n'est pas dans le PATH
    echo    Veuillez installer Python 3.11 ou supérieur depuis python.org
    echo.
    pause
    exit /b 1
)
python --version
echo    ✓ Python détecté
echo.

REM Vérifier et créer le venv
echo [2/5] Vérification de l'environnement virtuel...
if not exist venv (
    echo    Création de l'environnement virtuel...
    python -m venv venv
    if errorlevel 1 (
        echo    ❌ Erreur: Impossible de créer le venv
        pause
        exit /b 1
    )
    echo    ✓ Environnement virtuel créé
) else (
    echo    ✓ Environnement virtuel trouvé
)
echo.

REM Activer le venv
echo [3/5] Activation de l'environnement virtuel...
if exist venv\Scripts\activate.bat (
    call venv\Scripts\activate.bat
) else (
    echo    ❌ Script d'activation introuvable
    echo    Recréation du venv...
    rmdir /s /q venv 2>nul
    python -m venv venv
    call venv\Scripts\activate.bat
)

REM Utiliser directement le Python du venv
set PYTHON_EXE=%CD%\venv\Scripts\python.exe
if not exist "%PYTHON_EXE%" (
    echo    ❌ Python du venv introuvable
    pause
    exit /b 1
)
echo    ✓ Environnement virtuel activé
echo.

REM Mettre à jour pip
echo [4/5] Mise à jour de pip...
"%PYTHON_EXE%" -m pip install --upgrade pip --quiet >nul 2>&1
echo    ✓ pip à jour
echo.

REM Installer les dépendances
echo [5/5] Installation des dépendances...
if exist requirements.txt (
    echo    Installation depuis requirements.txt...
    "%PYTHON_EXE%" -m pip install -r requirements.txt --quiet
    if errorlevel 1 (
        echo    ⚠ Erreur lors de l'installation, tentative manuelle...
        "%PYTHON_EXE%" -m pip install Flask==3.0.0 flask-cors==4.0.0 "psycopg[binary]==3.3.2" gunicorn==21.2.0
        if errorlevel 1 (
            echo    ❌ Impossible d'installer les dépendances
            pause
            exit /b 1
        )
    )
) else (
    echo    Installation des dépendances de base...
    "%PYTHON_EXE%" -m pip install Flask==3.0.0 flask-cors==4.0.0 "psycopg[binary]==3.3.2" gunicorn==21.2.0
    if errorlevel 1 (
        echo    ❌ Impossible d'installer les dépendances
        pause
        exit /b 1
    )
)

REM Vérifier Flask
"%PYTHON_EXE%" -c "import flask" >nul 2>&1
if errorlevel 1 (
    echo    ❌ Flask non installé, réinstallation...
    "%PYTHON_EXE%" -m pip install Flask==3.0.0 --force-reinstall
    if errorlevel 1 (
        echo    ❌ Impossible d'installer Flask
        pause
        exit /b 1
    )
)
echo    ✓ Dépendances installées
echo.

REM Afficher les informations
echo ═══════════════════════════════════════════════════════════
echo.
echo ✓ Configuration terminée avec succès
echo.
echo 📍 Serveur Flask: http://localhost:5000
echo 📍 Health Check:  http://localhost:5000/api/health
echo 📍 API Layers:     http://localhost:5000/api/layers
echo.
echo ═══════════════════════════════════════════════════════════
echo.
echo Appuyez sur Ctrl+C pour arrêter le serveur
echo.
echo ═══════════════════════════════════════════════════════════
echo.

REM Démarrer Flask
"%PYTHON_EXE%" app.py

REM Gestion des erreurs
if errorlevel 1 (
    echo.
    echo ❌ Erreur lors du démarrage du serveur
    echo.
    echo Solutions possibles:
    echo - Vérifiez que le port 5000 n'est pas utilisé
    echo - Vérifiez la configuration de la base de données
    echo - Consultez les messages d'erreur ci-dessus
    echo.
)

pause



