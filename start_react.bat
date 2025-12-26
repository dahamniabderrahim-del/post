@echo off
chcp 65001 >nul
echo ========================================
echo   Démarrage du serveur React
echo ========================================
cd /d "%~dp0frontend"
if not exist node_modules (
    echo Installation des dépendances...
    call npm install
    if errorlevel 1 (
        echo Erreur: Impossible d'installer les dépendances
        pause
        exit /b 1
    )
)
echo.
echo ✓ Serveur React démarré sur http://localhost:3000
echo.
call npm run dev
if errorlevel 1 (
    echo.
    echo Erreur lors du démarrage du serveur
    pause
)

