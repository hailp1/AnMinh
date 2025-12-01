@echo off
echo ===================================================
echo   STOPPING AM Medtech DMS Docker Environment
echo ===================================================
echo.
docker-compose down
echo.
echo ===================================================
echo   ALL SERVICES STOPPED
echo ===================================================
pause
