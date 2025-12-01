@echo off
echo ===================================================
echo   AM Medtech DMS - Cloudflare Tunnel Check
echo ===================================================
echo.
echo Checking if Cloudflare Tunnel container is running...
docker-compose ps cloudflared
echo.
echo Checking logs for errors...
docker-compose logs cloudflared
echo.
echo ===================================================
echo   TROUBLESHOOTING
echo ===================================================
echo If the logs say "Token is required" or "invalid token":
echo   1. Open the file .env
echo   2. Paste your Cloudflare Tunnel Token into CLOUDFLARE_TUNNEL_TOKEN=...
echo   3. Run START_FULL_DOCKER.bat again.
echo.
echo If the logs say "Cannot connect to upstream":
echo   1. Go to Cloudflare Dashboard.
echo   2. Change the Service URL to "http://frontend:80" (for DMS) or "http://landing:3000" (for Landing).
echo.
pause
