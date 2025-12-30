@echo off
REM Fix All Script - Batch version (chạy được mọi lúc)
echo.
echo ╔═══════════════════════════════════════════════════════════╗
echo ║     FIX ALL - FIX TẤT CẢ VẤN ĐỀ                          ║
echo ╚═══════════════════════════════════════════════════════════╝
echo.

cd /d "%~dp0\.."

echo === 1. DỪNG FRONTEND CŨ ===
echo.

REM Kill node processes on frontend ports
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":3099"') do (
    echo Dang dung process %%a...
    taskkill /F /PID %%a >nul 2>&1
)
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":3100"') do (
    taskkill /F /PID %%a >nul 2>&1
)
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":3101"') do (
    taskkill /F /PID %%a >nul 2>&1
)

timeout /t 2 /nobreak >nul

echo ✅ Đã dừng frontend cũ
echo.

echo === 2. XÓA CACHE ===
echo.

if exist "client\node_modules\.cache" (
    rmdir /s /q "client\node_modules\.cache" >nul 2>&1
    echo ✅ Đã xóa cache
) else (
    echo ✅ Không có cache
)

echo.

echo === 3. KIỂM TRA BACKEND ===
echo.

REM Check if backend is running
netstat -ano | findstr ":5000" >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Backend: RUNNING
) else (
    echo ❌ Backend: NOT RUNNING
    echo.
    echo 💡 Cần start backend:
    echo    node server.js
    echo.
)

echo.

echo === 4. KHỞI ĐỘNG FRONTEND ===
echo.

cd client
start "Frontend Server" cmd /k "echo === FRONTEND SERVER === && npm start"

cd ..

echo ✅ Frontend đã được khởi động
echo.

echo === 5. KIỂM TRA POSTGRESQL ===
echo.

sc query | findstr /i "postgres" >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Tìm thấy PostgreSQL service
    echo.
    echo 💡 Kiểm tra service có đang chạy:
    echo    services.msc
    echo    Tìm 'postgresql' service và Start nếu stopped
) else (
    echo ⚠️  Không tìm thấy PostgreSQL service
    echo.
    echo 💡 Có thể PostgreSQL chưa được cài đặt
    echo    Tải: https://www.postgresql.org/download/windows/
)

echo.

echo ╔═══════════════════════════════════════════════════════════╗
echo ║     FIX HOÀN TẤT!                                        ║
echo ╚═══════════════════════════════════════════════════════════╝
echo.

echo 📝 KIỂM TRA:
echo    1. Terminal frontend có log: '[Config] ✅ setupProxy.js loaded successfully'
echo    2. Backend có chạy: http://localhost:5000/api
echo    3. PostgreSQL có chạy: services.msc
echo.
echo 💡 SAU KHI COMPILE XONG:
echo    - Test login: http://localhost:3099
echo    - Hoặc test lại: node scripts/test-full-fix-all.js
echo.

pause

