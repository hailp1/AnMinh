@echo off
echo ===================================================
echo   STARTING CLOUDFLARE TUNNEL (MANUAL MODE)
echo ===================================================
echo.
echo 1. Stopping any existing cloudflared processes...
taskkill /F /IM cloudflared.exe >nul 2>&1

echo.
echo 2. Starting Tunnel with NEW TOKEN...
echo    Token: eyJhIjoiYWY5OGEyMmI3OTMzNmNjZDVmODUyZWM2MmVkZTJhN2YiLCJ0IjoiYTEzZjc4ZjgtOTk3Ni00ODRmLThjMTctMjRmYzE1ODAwNjU1IiwicyI6Ik56QTVNalU1WmpRdFl6aGlZUzAwT1RVd0xXSmtNVEl0TWpNeE16a3dZVFk1Tm1ReSJ9
echo.
echo    IMPORTANT:
echo    Ensure Cloudflare Dashboard is set to:
echo    Service: http://localhost:3099
echo.
cloudflared.exe tunnel run --token eyJhIjoiYWY5OGEyMmI3OTMzNmNjZDVmODUyZWM2MmVkZTJhN2YiLCJ0IjoiYTEzZjc4ZjgtOTk3Ni00ODRmLThjMTctMjRmYzE1ODAwNjU1IiwicyI6Ik56QTVNalU1WmpRdFl6aGlZUzAwT1RVd0xXSmtNVEl0TWpNeE16a3dZVFk1Tm1ReSJ9
pause
