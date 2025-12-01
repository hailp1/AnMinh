@echo off
echo ========================================
echo Starting Cloudflare Tunnel (Local Mode)
echo ========================================
echo.

echo [1/3] Checking Docker Frontend...
docker ps --filter "name=dms_frontend" --format "{{.Names}}: {{.Status}}" | findstr "dms_frontend"
if errorlevel 1 (
    echo.
    echo WARNING: Frontend container is not running!
    echo Please start it first with:
    echo   docker-compose -f docker-compose.dev.yml up -d frontend
    echo.
    pause
    exit /b 1
)

echo.
echo [2/3] Checking Port 3099...
netstat -an | find "3099" | find "LISTENING" >nul
if errorlevel 1 (
    echo WARNING: Port 3099 does not seem to be open.
    echo However, Docker says the container is healthy.
    echo We will attempt to proceed...
) else (
    echo Success: Port 3099 is active.
)

echo.
echo [3/3] Starting Cloudflare Tunnel...
echo ========================================
echo IMPORTANT: Ensure your Cloudflare Dashboard is configured as:
echo Hostname: dms.ammedtech.com  --^>  Service: http://localhost:3099
echo ========================================
echo.
echo Tunnel is starting... Press Ctrl+C to stop.
echo.

.\cloudflared.exe tunnel --config cloudflare-tunnel-local.yml run

pause
