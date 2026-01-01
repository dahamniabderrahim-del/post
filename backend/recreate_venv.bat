@echo off
chcp 65001 >nul
echo ========================================
echo   Recréation de l'environnement virtuel
echo ========================================
cd /d "%~dp0"

REM Supprimer l'ancien venv
if exist venv (
    echo Suppression de l'ancien venv...
    rmdir /s /q venv
)

REM Créer un nouveau venv
echo Création d'un nouveau venv...
python -m venv venv
if errorlevel 1 (
    echo Erreur: Impossible de créer l'environnement virtuel
    pause
    exit /b 1
)

REM Activer le venv
call venv\Scripts\activate.bat
if errorlevel 1 (
    echo Erreur: Impossible d'activer l'environnement virtuel
    pause
    exit /b 1
)

REM Mettre à jour pip
echo Mise à jour de pip...
python -m pip install --upgrade pip -q

REM Installer les dépendances
echo Installation des dépendances...
pip install -q -r requirements.txt
if errorlevel 1 (
    echo Erreur: Impossible d'installer les dépendances
    pause
    exit /b 1
)

echo.
echo ✓ Environnement virtuel recréé avec succès
echo ✓ Dépendances installées
echo.
pause











