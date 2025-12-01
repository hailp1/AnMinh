@echo off
title AM MEDTECH - Build and Run Docker
color 0B

echo.
echo ============================================================
echo    AM MEDTECH - DOCKER BUILD & RUN
echo ============================================================
echo.

cd /d "%~dp0"

echo [1/3] Stopping existing services...
call STOP_ALL_SIMPLE.bat
docker-compose down

echo.
echo [2/3] Building Docker images (this may take a while)...
docker-compose build

echo.
echo [3/3] Starting services...
docker-compose up -d

echo.
echo ============================================================
echo    SERVICES STARTED IN DOCKER!
echo ============================================================
echo.
echo Services running:
echo   - Landing Page:     http://localhost:3000
echo   - DMS Client:       http://localhost:3099
echo   - Backend API:      http://localhost:5001 (Mapped from 5000)
echo   - Database:         Port 5433
echo.
echo Check status with: docker-compose ps
echo View logs with:    docker-compose logs -f
echo.
pause
