@echo off
echo ========================================
echo   Push vers GitHub
echo ========================================
echo.

REM Vérifier si Git est installé
git --version >nul 2>&1
if errorlevel 1 (
    echo [ERREUR] Git n'est pas installe ou n'est pas dans le PATH
    pause
    exit /b 1
)

echo [1/4] Verification de l'etat du depot...
git status --short
echo.

echo [2/4] Ajout de tous les fichiers modifies...
git add .
if errorlevel 1 (
    echo [ERREUR] Echec de l'ajout des fichiers
    pause
    exit /b 1
)
echo [OK] Fichiers ajoutes avec succes
echo.

echo [3/4] Creation du commit...
set /p COMMIT_MSG="Message du commit (ou appuyez sur Entree pour utiliser le message par defaut): "
if "%COMMIT_MSG%"=="" (
    set COMMIT_MSG="Mise a jour complete du site SIG avec toutes les fonctionnalites"
)
git commit -m %COMMIT_MSG%
if errorlevel 1 (
    echo [ERREUR] Echec de la creation du commit
    echo Peut-etre qu'il n'y a pas de modifications a commiter?
    pause
    exit /b 1
)
echo [OK] Commit cree avec succes
echo.

echo [4/4] Push vers GitHub...
echo.
echo ATTENTION: Vous devrez peut-etre vous authentifier
echo - Si demande, utilisez votre nom d'utilisateur GitHub
echo - Pour le mot de passe, utilisez un token d'acces personnel (pas votre mot de passe)
echo.
git push origin main
if errorlevel 1 (
    echo.
    echo [ERREUR] Echec du push vers GitHub
    echo.
    echo Solutions possibles:
    echo 1. Verifiez votre connexion Internet
    echo 2. Verifiez que vous avez les droits d'ecriture sur le depot
    echo 3. Utilisez un token d'acces personnel GitHub au lieu du mot de passe
    echo 4. Essayez: git pull origin main (pour recuperer les dernieres modifications)
    pause
    exit /b 1
)

echo.
echo ========================================
echo   [SUCCES] Code pousse vers GitHub!
echo ========================================
echo.
echo Votre code est maintenant disponible sur:
echo https://github.com/dahamniabderrahim-del/post
echo.
pause


