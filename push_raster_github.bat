@echo off
echo ========================================
echo  Deploiement du support des rasters
echo ========================================
echo.

cd /d "%~dp0"

echo [1/4] Ajout des fichiers modifies...
git add backend/app.py
git add frontend/src/components/Map.jsx
git add DEBUG_RASTER.md
git add DEPLOYER_RASTER_RENDER.md
echo OK
echo.

echo [2/4] Creation du commit...
git commit -m "Ajout du support des couches raster PostGIS - Backend et Frontend avec logs de debogage"
echo OK
echo.

echo [3/4] Push vers GitHub...
git push origin main
echo.

echo [4/4] Verification...
git status --short
echo.

echo ========================================
echo  Deploiement termine!
echo ========================================
echo.
echo Prochaines etapes:
echo 1. Allez sur Render.com
echo 2. Verifiez que le backend redemarre automatiquement
echo 3. Testez https://post-aypc.onrender.com/api/layers
echo 4. Verifiez que les couches raster apparaissent
echo.
pause


