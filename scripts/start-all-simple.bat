@echo off
chcp 65001 >nul 2>&1
echo.
echo ========================================
echo   START ALL SERVERS
echo ========================================
echo.

cd /d "%~dp0\.."

echo === 1. DUNG CAC SERVER CU ===
echo.

REM Kill all node processes
taskkill /F /IM node.exe >nul 2>&1
if %errorlevel% equ 0 (
    echo Da dung tat ca node processes
) else (
    echo Khong co process nao dang chay
)

echo.
echo === 2. KIEM TRA .env ===
echo.

if not exist ".env" (
    echo LOI: .env file khong ton tai!
    echo Tao file .env voi DATABASE_URL va JWT_SECRET
    pause
    exit /b 1
)

echo .env file: EXISTS
echo.

echo === 3. KHOI DONG BACKEND ===
echo.

start "Backend Server" cmd /k "cd /d %~dp0\.. && echo === BACKEND SERVER (Port 5000) === && node server.js"

echo Da khoi dong backend
echo Doi 5 giay de backend start...
ping 127.0.0.1 -n 6 >nul

echo.
echo === 4. KHOI DONG FRONTEND ===
echo.

cd client
start "Frontend Server" cmd /k "cd /d %~dp0 && echo === FRONTEND SERVER === && npm start"

cd ..

echo Da khoi dong frontend
echo.

echo ========================================
echo   SERVERS DANG KHOI DONG...
echo ========================================
echo.

echo Backend:  http://localhost:5000
echo Frontend: http://localhost:3099
echo.

echo Doi compile xong:
echo   - Backend: Tim dong 'Server dang chay tren port 5000'
echo   - Frontend: Tim dong 'Compiled successfully!'
echo   - Frontend: Tim dong '[Config] setupProxy.js loaded successfully'
echo.

echo Test login:
echo   Employee Code: AM01
echo   Password: admin123
echo.

pause

