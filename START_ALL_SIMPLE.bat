@echo off
echo ========================================
echo Starting All Services (Simple Mode)
echo ========================================
echo.

REM Step 1: Start Docker Containers
echo [1/3] Starting Docker containers...
docker-compose up -d postgres backend frontend
timeout /t 5 /nobreak >nul
echo ✓ Docker containers started
echo.

REM Step 2: Wait for Backend to be healthy
echo [2/3] Waiting for backend to be healthy...
:wait_backend
docker ps --filter "name=dms_backend" --format "{{.Status}}" | findstr /C:"healthy" >nul
if errorlevel 1 (
    echo    Backend not ready yet, waiting...
    timeout /t 3 /nobreak >nul
    goto wait_backend
)
echo ✓ Backend is healthy
echo.

REM Step 3: Start Cloudflare Tunnel
echo [3/3] Starting Cloudflare Tunnel...
start "Cloudflare Tunnel" /MIN cloudflared tunnel --config cloudflare-tunnel-local.yml run
timeout /t 3 /nobreak >nul
echo ✓ Tunnel started
echo.

echo ========================================
echo All services started successfully!
echo ========================================
echo.
echo Services running:
echo   - Backend:  http://localhost:5001
echo   - Database: localhost:5432
echo   - Tunnel:   https://dms.ammedtech.com
echo.
echo Press any key to exit...
pause >nul
