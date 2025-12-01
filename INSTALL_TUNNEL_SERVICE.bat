@echo off
echo ===================================================
echo   INSTALLING CLOUDFLARE TUNNEL SERVICE
echo ===================================================
echo.
echo 1. Removing old service (if any)...
cloudflared.exe service uninstall

echo.
echo 2. Installing new service with YOUR token...
cloudflared.exe service install eyJhIjoiYWY5OGEyMmI3OTMzNmNjZDVmODUyZWM2MmVkZTJhN2YiLCJ0IjoiYTEzZjc4ZjgtOTk3Ni00ODRmLThjMTctMjRmYzE1ODAwNjU1IiwicyI6Ik56QTVNalU1WmpRdFl6aGlZUzAwT1RVd0xXSmtNVEl0TWpNeE16a3dZVFk1Tm1ReSJ9

echo.
echo 3. Starting the service...
net start cloudflared

echo.
echo ===================================================
echo   DONE!
echo   The tunnel is now running as a Windows Service.
echo   It will stay running even if you close this window.
echo ===================================================
pause
