@echo off
title AM MEDTECH - Clean and Rebuild
color 0E

echo.
echo ============================================================
echo    CLEANING AND REBUILDING PROJECT
echo ============================================================
echo.

cd /d "%~dp0"

echo [1/4] Stopping services...
call STOP_ALL_SIMPLE.bat

echo.
echo [2/4] Cleaning build artifacts...
if exist "am-medtech-web\.next" (
    echo   - Removing .next folder...
    rmdir /s /q "am-medtech-web\.next"
)
if exist "am-medtech-web\node_modules\.cache" (
    echo   - Removing node_modules cache...
    rmdir /s /q "am-medtech-web\node_modules\.cache"
)

echo.
echo [3/4] Rebuilding project...
cd am-medtech-web
call npm run build
cd ..

echo.
echo [4/4] Starting services...
call START_ALL_SIMPLE.bat

echo.
echo ============================================================
echo    DONE! PLEASE TRY AGAIN.
echo ============================================================
pause
