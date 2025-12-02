@echo off
echo ========================================
echo Stopping All Services
echo ========================================
echo.

REM Step 1: Stop Cloudflare Tunnel
echo [1/2] Stopping Cloudflare Tunnel...
taskkill /F /IM cloudflared.exe >nul 2>&1
if errorlevel 1 (
    echo    No tunnel running
) else (
    echo ✓ Tunnel stopped
)
echo.

REM Step 2: Stop Docker Containers
echo [2/2] Stopping Docker containers...
docker-compose down
echo ✓ Docker containers stopped
echo.

echo ========================================
echo All services stopped successfully!
echo ========================================
echo.
pause
