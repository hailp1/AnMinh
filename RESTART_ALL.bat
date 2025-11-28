@echo off
echo.
echo ===============================================================
echo     RESTART TAT CA SERVERS
echo ===============================================================
echo.

echo Buoc 1: Dung cac process Node.js cu...
echo.
taskkill /F /IM node.exe >nul 2>&1
timeout /t 2 /nobreak >nul
echo    [OK] Da dung cac process cu
echo.

echo Buoc 2: Xoa cache Frontend...
echo.
if exist "client\node_modules\.cache" (
    rmdir /s /q "client\node_modules\.cache" 2>nul
    echo    [OK] Da xoa cache
) else (
    echo    [INFO] Khong co cache de xoa
)
echo.

echo Buoc 3: Start Backend Server...
echo.
start "Backend Server - Port 5000" cmd /k "cd /d %~dp0 && echo === BACKEND SERVER === && node server.js"
timeout /t 2 /nobreak >nul
echo    [OK] Da mo terminal Backend
echo.

echo Buoc 4: Start Frontend Server...
echo.
start "Frontend Server - Port 3099" cmd /k "cd /d %~dp0\client && echo === FRONTEND SERVER === && npm start"
timeout /t 2 /nobreak >nul
echo    [OK] Da mo terminal Frontend
echo.

echo ===============================================================
echo     KET QUA
echo ===============================================================
echo.
echo [OK] Da restart tat ca servers!
echo.
echo Kiem tra:
echo   1. Terminal Backend: Tim dong "Server dang chay tren port 5000"
echo   2. Terminal Frontend: Tim dong "Compiled successfully!"
echo   3. Frontend: http://localhost:3099
echo.
echo Dang cho 10 giay de servers khoi dong...
timeout /t 10 /nobreak >nul
echo.
echo Ban co the test login ngay:
echo   - URL: http://localhost:3099/admin/login
echo   - Employee Code: admin
echo   - Password: admin
echo.
pause

