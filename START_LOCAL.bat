@echo off
chcp 65001 >nul 2>&1
echo.
echo ========================================
echo   KHOI CHAY DU AN - XEM HIEN TRANG
echo ========================================
echo.

cd /d "%~dp0"

echo [1/4] Dung cac process cu...
taskkill /F /IM node.exe >nul 2>&1
echo OK - Da dung cac process cu
echo.

echo [2/4] Khoi dong Backend Server...
start "Backend Server - Port 5000" cmd /k "cd /d %~dp0 && echo === BACKEND SERVER === && echo && node server.js"
echo OK - Backend da duoc khoi dong (terminal moi)
echo Doi 5 giay...
timeout /t 5 /nobreak >nul
echo.

echo [3/4] Xoa cache frontend...
if exist "client\node_modules\.cache" (
    rmdir /s /q "client\node_modules\.cache" >nul 2>&1
    echo OK - Da xoa cache
) else (
    echo OK - Khong co cache
)
echo.

echo [4/4] Khoi dong Frontend Server...
cd client
start "Frontend Server" cmd /k "cd /d %~dp0 && echo === FRONTEND SERVER === && echo && npm start"
cd ..
echo OK - Frontend da duoc khoi dong (terminal moi)
echo.

echo ========================================
echo   DA KHOI CHAY XONG!
echo ========================================
echo.
echo THONG TIN:
echo.
echo Backend Server:
echo   URL: http://localhost:5000
echo   API: http://localhost:5000/api
echo   Terminal: Xem cua so "Backend Server"
echo.
echo Frontend Server:
echo   URL: http://localhost:3099 (hoac port khac)
echo   Terminal: Xem cua so "Frontend Server"
echo.
echo CHO COMPILE:
echo   - Backend: Tim dong "Server dang chay tren port 5000"
echo   - Frontend: Tim dong "Compiled successfully!"
echo   - Frontend: Tim dong "[Config] setupProxy.js loaded"
echo.
echo TEST LOGIN:
echo   1. Mo browser: http://localhost:3099
echo   2. Employee Code: AM01
echo   3. Password: admin123
echo.
echo LUU Y:
echo   - Kiem tra PostgreSQL co chay khong (services.msc)
echo   - Neu backend loi database, start PostgreSQL service
echo   - Xem logs trong 2 terminal de debug
echo.
pause

