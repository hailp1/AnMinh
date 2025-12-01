@echo off
title AM MEDTECH - Start DEV Environment
color 0B
echo.
echo ============================================================
echo    AM MEDTECH - KHOI DONG MOI TRUONG DEV (HOT RELOAD)
echo ============================================================
echo.

cd /d "%~dp0"

REM Dung tat ca process cu
echo [1/4] Dung cac process cu...
taskkill /F /IM node.exe >nul 2>&1
timeout /t 2 /nobreak >nul
echo OK
echo.

REM Khoi dong Backend (Dev Mode)
echo [2/4] Khoi dong Backend API (Port 5000)...
set NODE_ENV=development
start "Backend API (DEV)" cmd /k "cd /d %~dp0 && node server.js"
timeout /t 3 /nobreak >nul
echo OK
echo.

REM Khoi dong DMS Client (Dev Mode)
echo [3/4] Khoi dong DMS Client (Port 3099)...
start "DMS Client (DEV)" cmd /k "cd /d %~dp0\client && npm start"
timeout /t 3 /nobreak >nul
echo OK
echo.

REM Khoi dong Landing Page (Dev Mode)
echo [4/4] Khoi dong Landing Page (Port 3000)...
start "Landing Page (DEV)" cmd /k "cd /d %~dp0\am-medtech-web && npm run dev"
timeout /t 5 /nobreak >nul
echo OK
echo.

echo ============================================================
echo    MOI TRUONG DEV DA KHOI DONG!
echo ============================================================
echo.
echo Services dang chay (Hot Reload):
echo   - Backend API:      http://localhost:5000
echo   - DMS Client:       http://localhost:3099
echo   - Landing Page:     http://localhost:3000
echo.
echo Luu y: Moi thay doi trong code se duoc cap nhat ngay lap tuc.
echo Khong co Cloudflare Tunnel trong che do nay (chi chay local).
echo.
echo De dung tat ca, chay: STOP_ALL_SIMPLE.bat
echo.
pause
