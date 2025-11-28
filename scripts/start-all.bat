@echo off
REM Start All Script - Batch version
echo.
echo ╔═══════════════════════════════════════════════════════════╗
echo ║     START ALL SERVERS                                     ║
echo ╚═══════════════════════════════════════════════════════════╝
echo.

cd /d "%~dp0\.."

echo === 1. DỪNG CÁC SERVER CŨ ===
echo.

REM Kill backend (port 5000)
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":5000"') do (
    echo Dang dung backend process %%a...
    taskkill /F /PID %%a >nul 2>&1
)

REM Kill frontend (ports 3099, 3100, 3101, 3000)
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":3099 :3100 :3101 :3000"') do (
    echo Dang dung frontend process %%a...
    taskkill /F /PID %%a >nul 2>&1
)

timeout /t 2 /nobreak >nul

echo ✅ Đã dừng servers cũ
echo.

echo === 2. KIỂM TRA .env ===
echo.

if not exist ".env" (
    echo ❌ .env file không tồn tại!
    echo    Tạo file .env với DATABASE_URL và JWT_SECRET
    pause
    exit /b 1
)

echo ✅ .env file: EXISTS
echo.

echo === 3. KHỞI ĐỘNG BACKEND ===
echo.

start "Backend Server" cmd /k "cd /d %~dp0\.. && echo === BACKEND SERVER (Port 5000) === && node server.js"

timeout /t 5 /nobreak >nul

echo ✅ Backend đã được khởi động
echo.

echo === 4. KHỞI ĐỘNG FRONTEND ===
echo.

cd client
start "Frontend Server" cmd /k "cd /d %~dp0 && echo === FRONTEND SERVER === && npm start"

cd ..

echo ✅ Frontend đã được khởi động
echo.

echo ╔═══════════════════════════════════════════════════════════╗
echo ║     SERVERS ĐANG KHỞI ĐỘNG...                            ║
echo ╚═══════════════════════════════════════════════════════════╝
echo.

echo ✅ Backend:  http://localhost:5000
echo ✅ Frontend: http://localhost:3099 (hoặc port khác)
echo.

echo 📝 Đợi compile xong:
echo    - Backend: Tìm dòng 'Server đang chạy trên port 5000'
echo    - Frontend: Tìm dòng 'Compiled successfully!'
echo    - Frontend: Tìm dòng '[Config] ✅ setupProxy.js loaded successfully'
echo.

echo 🔑 Test login:
echo    Employee Code: AM01
echo    Password: admin123
echo.

pause
