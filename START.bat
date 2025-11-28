@echo off
title Start An Minh Business System
echo.
echo ========================================
echo   KHOI CHAY DU AN
echo ========================================
echo.

cd /d "%~dp0"

echo [1/4] Dung process cu...
taskkill /F /IM node.exe >nul 2>&1
echo OK

echo.
echo [2/4] Khoi dong Backend...
start "Backend - Port 5000" cmd /k "cd /d %~dp0 && echo === BACKEND SERVER === && node server.js"
timeout /t 3 /nobreak >nul
echo OK

echo.
echo [3/4] Xoa cache frontend...
if exist "client\node_modules\.cache" rmdir /s /q "client\node_modules\.cache" >nul 2>&1
echo OK

echo.
echo [4/4] Khoi dong Frontend...
cd client
start "Frontend Server" cmd /k "cd /d %~dp0 && echo === FRONTEND SERVER === && npm start"
cd ..
echo OK

echo.
echo ========================================
echo   DA KHOI CHAY XONG!
echo ========================================
echo.
echo Backend:  http://localhost:5000
echo Frontend: http://localhost:3099
echo.
echo Doi Frontend compile (30-60 giay)...
echo Sau do mo browser: http://localhost:3099
echo.
pause

