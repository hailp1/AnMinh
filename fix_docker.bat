@echo off
echo ==========================================
echo FIXING DOCKER LINGERING PROCESSES
echo ==========================================

echo Killing Docker Desktop processes...
taskkill /F /IM "Docker Desktop.exe" >nul 2>&1
taskkill /F /IM "com.docker.build.exe" >nul 2>&1
taskkill /F /IM "com.docker.backend.exe" >nul 2>&1
taskkill /F /IM "com.docker.service.exe" >nul 2>&1

echo Killing WSL processes (this is necessary to clear the lock)...
taskkill /F /IM "wsl.exe" >nul 2>&1

echo.
echo All lingering processes should be dead.
echo.
echo Starting Docker Desktop cleanly...
start "" "C:\Program Files\Docker\Docker\Docker Desktop.exe"

echo.
echo Waiting 30 seconds for Docker to initialize...
timeout /t 30

echo.
echo Checking status...
docker ps
if %errorlevel% equ 0 (
    echo Docker is UP! Starting Landing Page...
    cd /d d:\newNCSKITORG\newNCSkit\AM_BS
    docker-compose up -d landing
) else (
    echo Docker still seems down. Please check the Docker icon in your tray.
)
pause
