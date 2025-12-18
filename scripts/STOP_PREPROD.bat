@echo off
echo ========================================================
echo   STOPPING AM MEDTECH PREPRODUCTION ENVIRONMENT
echo ========================================================
echo.

docker-compose -f docker-compose.preprod.yml down

echo.
echo   All Preproduction containers have been stopped.
echo.
pause
