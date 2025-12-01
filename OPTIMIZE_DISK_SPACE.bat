@echo off
setlocal
echo ===================================================
echo   AM Medtech DMS - DISK SPACE OPTIMIZER
echo ===================================================
echo.
echo This script helps reduce project size by cleaning up:
echo 1. node_modules (Dependencies) - Can be re-installed via 'npm install'
echo 2. Build Artifacts (.next, build, dist) - Re-created on build
echo 3. Docker System (Unused images/containers)
echo.
echo Current Sizes (Estimated):
echo - Root: ~340MB
echo - Client: ~450MB
echo - Landing: ~530MB
echo - WebApp: ~530MB
echo - Mobile: ~245MB
echo.
echo [WARNING] Deleting node_modules will break IDE Intellisense until you re-install.
echo.

:MENU
echo Choose an option:
echo 1. Clean Build Artifacts ONLY (Safe, saves ~200MB)
echo 2. Clean EVERYTHING (node_modules + artifacts) (Saves ~2GB)
echo 3. Prune Docker System (Frees space in Docker)
echo 4. Exit
echo.
set /p choice="Enter choice (1-4): "

if "%choice%"=="1" goto CLEAN_ARTIFACTS
if "%choice%"=="2" goto CLEAN_ALL
if "%choice%"=="3" goto PRUNE_DOCKER
if "%choice%"=="4" goto END

:CLEAN_ARTIFACTS
echo.
echo Cleaning build artifacts...
if exist ".next" rd /s /q ".next"
if exist "build" rd /s /q "build"
if exist "dist" rd /s /q "dist"

cd client
if exist "build" rd /s /q "build"
cd ..

cd am-medtech-landing
if exist ".next" rd /s /q ".next"
cd ..

cd am-medtech-web
if exist ".next" rd /s /q ".next"
cd ..

echo Done!
pause
goto MENU

:CLEAN_ALL
echo.
echo [WARNING] This will delete all node_modules. You will need to run 'npm install' again to develop locally.
set /p confirm="Are you sure? (y/n): "
if /i "%confirm%" neq "y" goto MENU

echo.
echo Deleting node_modules...
if exist "node_modules" rd /s /q "node_modules"
if exist "client\node_modules" rd /s /q "client\node_modules"
if exist "am-medtech-landing\node_modules" rd /s /q "am-medtech-landing\node_modules"
if exist "am-medtech-web\node_modules" rd /s /q "am-medtech-web\node_modules"
if exist "mobile\node_modules" rd /s /q "mobile\node_modules"

echo.
echo Deleting artifacts...
call :CLEAN_ARTIFACTS
echo.
echo All clean! Project size should be minimal now.
pause
goto MENU

:PRUNE_DOCKER
echo.
echo Pruning Docker system...
docker system prune -a -f
echo.
echo Done!
pause
goto MENU

:END
endlocal
