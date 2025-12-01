@echo off
echo ========================================
echo Cloudflare Tunnel Diagnostics
echo ========================================
echo.

echo [1/5] Checking Docker Frontend Status...
docker ps --filter "name=dms_frontend" --format "{{.Names}}: {{.Status}}"
echo.

echo [2/5] Testing Frontend from Host...
powershell -Command "Invoke-WebRequest -Uri http://localhost:3099 -Method GET -UseBasicParsing -TimeoutSec 5 | Select-Object StatusCode, StatusDescription"
echo.

echo [3/5] Checking Tunnel Credentials...
if exist "tunnel-creds.json" (
    echo ✓ Tunnel credentials found
) else (
    echo ✗ Tunnel credentials NOT found
)
echo.

echo [4/5] Validating Tunnel with Cloudflare...
.\cloudflared.exe tunnel info ebe58fd0-0808-4d20-849d-2656840fdf9b
echo.

echo [5/5] Testing Tunnel Connection (dry-run)...
echo Starting tunnel for 15 seconds to test connection...
echo.

start /B .\cloudflared.exe tunnel --config cloudflare-tunnel-local.yml run
timeout /t 15 /nobreak

echo.
echo ========================================
echo Diagnostic Complete
echo ========================================
echo.
echo Please check the output above for any errors.
echo.
echo If tunnel connected successfully, try accessing:
echo   https://dms.ammedtech.com
echo.
pause

taskkill /F /IM cloudflared.exe 2>nul
