@echo off
title AM MEDTECH - Start All Services
color 0A
echo.
echo ============================================================
echo    AM MEDTECH - KHOI DONG TAT CA SERVICES
echo ============================================================
echo.

cd /d "%~dp0"

REM Dung tat ca process cu
echo [1/5] Dung cac process cu...
taskkill /F /IM node.exe >nul 2>&1
timeout /t 2 /nobreak >nul
echo OK
echo.

REM Kiem tra build am-medtech-web
echo [2/5] Kiem tra build am-medtech-web...
if not exist "am-medtech-web\.next" (
    echo Dang build production am-medtech-web...
    cd am-medtech-web
    call npm run build
    cd ..
    echo OK - Build hoan thanh
) else (
    echo OK - Build da ton tai (Chay CLEAN_AND_REBUILD.bat neu muon build lai)
)
echo.

REM Kiem tra build client
echo [2b/5] Kiem tra build client...
if not exist "client\build" (
    echo Dang build production client...
    cd client
    call npm run build
    cd ..
    echo OK - Build client hoan thanh
) else (
    echo OK - Build client da ton tai
)
echo.

REM Khoi dong Backend
echo [3/6] Khoi dong Backend API (Port 5000)...
set FRONTEND_ORIGIN=https://dms.ammedtech.com
start "Backend API - Port 5000" cmd /k "cd /d %~dp0 && node server.js"
timeout /t 3 /nobreak >nul
echo OK
echo.

REM Khoi dong DMS Client
echo [4/6] Khoi dong DMS Client (Port 3099)...
start "DMS Client - Port 3099" cmd /k "cd /d %~dp0\client && npx -y serve -s build -l 3099"
timeout /t 3 /nobreak >nul
echo OK
echo.

REM Khoi dong Landing Page
echo [5/6] Khoi dong Landing Page (Port 3000)...
start "Landing Page - Port 3000" cmd /k "cd /d %~dp0\am-medtech-web && npm start"
timeout /t 5 /nobreak >nul
echo OK
echo.

REM Khoi dong Cloudflare Named Tunnel (Production)
echo [6/6] Khoi dong Cloudflare Tunnel (ammedtech.com & dms)...
start "Cloudflare Tunnel - Production" cmd /k "cd /d %~dp0 && cloudflared.exe tunnel --config production-config.yml run ammedtech-production"
timeout /t 3 /nobreak >nul
echo OK
echo.

echo ============================================================
echo    TAT CA SERVICES DA KHOI DONG THANH CONG!
echo ============================================================
echo.
echo Services dang chay:
echo   - Backend API:      http://localhost:5000
echo   - DMS Client:       http://localhost:3099
echo   - Landing Page:     http://localhost:3000
echo.
echo Public Domains (Named Tunnel):
echo   - Landing Page:     https://ammedtech.com
echo   - DMS Client:       https://dms.ammedtech.com
echo.
echo Cac terminal da chay trong background (cmd /k de debug)
echo Doi 30-60 giay de cac service khoi dong hoan toan
echo.
echo De dung tat ca, chay: STOP_ALL_SIMPLE.bat
echo.
