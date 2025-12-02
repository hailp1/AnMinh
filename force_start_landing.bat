@echo off
echo Checking Docker...
docker ps >nul 2>&1
if %errorlevel% equ 0 goto run_app

echo Docker is not running. Attempting to start...
start "" "C:\Program Files\Docker\Docker\Docker Desktop.exe"
echo Waiting for Docker to start...

:waitloop
timeout /t 5 /nobreak >nul
docker ps >nul 2>&1
if %errorlevel% neq 0 goto waitloop

:run_app
echo Docker is running.
echo Starting Landing Page...
cd /d d:\newNCSKITORG\newNCSkit\AM_BS
docker-compose up -d landing
echo Done.
