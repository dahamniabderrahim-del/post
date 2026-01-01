@echo off
echo ========================================
echo  Fix Python 3.11 pour Render
echo ========================================
echo.

cd /d "%~dp0"

echo [1/3] Ajout des fichiers modifies...
git add backend/runtime.txt
git add backend/requirements.txt
git add backend/app.py
echo OK
echo.

echo [2/3] Creation du commit...
git commit -m "Fix: Python 3.11.9 via runtime.txt et retrait Pillow/numpy"
echo OK
echo.

echo [3/3] Push vers GitHub...
git push origin main
echo.

echo ========================================
echo  Modifications poussees!
echo ========================================
echo.
echo IMPORTANT: Verifiez dans Render:
echo 1. Settings - Root Directory = "backend"
echo 2. Redemarrez le service ou attendez le redepoiement automatique
echo 3. Verifiez les logs: devrait voir "Python version 3.11.9"
echo.
pause






