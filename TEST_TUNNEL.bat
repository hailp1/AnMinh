@echo off
echo ========================================
echo Testing Cloudflare Tunnel Configuration
echo ========================================
echo.

echo [1/4] Checking tunnel credentials...
if exist "tunnel-creds.json" (
    echo ✓ Tunnel credentials file found
) else (
    echo ✗ Tunnel credentials file NOT found
    exit /b 1
)

echo.
echo [2/4] Checking tunnel configuration...
if exist "cloudflare-tunnel.yml" (
    echo ✓ Tunnel config file found
) else (
    echo ✗ Tunnel config file NOT found
    exit /b 1
)

echo.
echo [3/4] Validating tunnel configuration...
cloudflared.exe tunnel info ebe58fd0-0808-4d20-849d-2656840fdf9b

echo.
echo [4/4] Testing tunnel connectivity...
echo Starting tunnel in test mode (will run for 10 seconds)...
timeout /t 2 /nobreak >nul

start /B cloudflared.exe tunnel --config cloudflare-tunnel.yml run
timeout /t 10 /nobreak

echo.
echo ========================================
echo Test Complete!
echo ========================================
echo.
echo Next steps:
echo 1. Check if tunnel is running: docker-compose ps
echo 2. Test DMS access: https://dms.ammedtech.com
echo 3. Test login modal on landing page
echo.
pause
