@echo off
echo ========================================
echo Quick Fix: Using Python HTTP Server
echo ========================================
echo.

echo This script will:
echo 1. Extract build files from Docker container
echo 2. Serve them with Python HTTP server
echo 3. Point Cloudflare Tunnel to Python server
echo.

echo Extracting build files from container...
if not exist "temp_build" mkdir temp_build
docker cp dms_frontend:/app/build/. temp_build/

echo.
echo Starting Python HTTP server on port 8080...
cd temp_build
start "Python HTTP Server" python -m http.server 8080

timeout /t 3 /nobreak >nul

echo.
echo Updating tunnel config to point to port 8080...
powershell -Command "(Get-Content ../cloudflare-tunnel-local.yml) -replace 'localhost:3099', 'localhost:8080' | Set-Content ../cloudflare-tunnel-local-python.yml"

echo.
echo Starting Cloudflare Tunnel...
cd ..
.\cloudflared.exe tunnel --config cloudflare-tunnel-local-python.yml run

echo.
echo Cleaning up...
taskkill /F /FI "WINDOWTITLE eq Python HTTP Server*" 2>nul
pause
