@echo off
echo ===================================================
echo   FINAL FIX - SWITCHING TO LOCAL TUNNEL
echo ===================================================
echo.
echo 1. Stopping Docker Tunnel (to avoid conflicts)...
docker-compose stop cloudflared

echo.
echo 2. Verifying Local DMS is running...
curl -I http://localhost:3099
if %errorlevel% neq 0 (
    echo [ERROR] Local DMS is NOT running at localhost:3099.
    echo Please run START_FULL_DOCKER.bat first.
    pause
    exit /b
)

echo.
echo 3. STARTING LOCAL TUNNEL...
echo.
echo   IMPORTANT:
echo   Please go to Cloudflare Dashboard NOW.
echo   Set Service URL to: http://localhost:3099
echo   (Type: HTTP)
echo.
pause
echo.
cloudflared.exe tunnel run
pause
