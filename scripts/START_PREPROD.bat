@echo off
echo ========================================================
echo   STARTING AM MEDTECH PREPRODUCTION ENVIRONMENT
echo ========================================================
echo.

echo 1. Stopping any existing Preprod containers...
docker-compose -f docker-compose.preprod.yml down

echo.
echo 2. Building and Starting Preprod containers...
docker-compose -f docker-compose.preprod.yml up -d --build

echo.
echo ========================================================
echo   PREPRODUCTION ENVIRONMENT STARTED
echo ========================================================
echo.
echo   - Landing Page: http://localhost:3500
echo   - DMS Frontend: http://localhost:3599
echo   - Web App:      http://localhost:3501
echo   - Backend API:  http://localhost:5555
echo   - Database:     localhost:5455
echo.
echo   Note: This environment runs independently of the main system.
echo.
pause
