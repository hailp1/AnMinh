@echo off
chcp 65001 >nul
echo ========================================================
echo   🚀 PUBLISH AM MEDTECH DMS TO PRODUCTION
echo   Domain: https://dms.ammedtech.com
echo ========================================================
echo.

echo 📋 Kiểm tra yêu cầu hệ thống...
echo.

REM Check Docker
docker --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker chưa được cài đặt hoặc chưa chạy!
    echo    Vui lòng cài đặt Docker Desktop và khởi động.
    pause
    exit /b 1
)
echo ✅ Docker: OK

REM Check tunnel credentials
if not exist "%~dp0..\tunnel-creds.json" (
    echo ❌ Không tìm thấy file tunnel-creds.json!
    echo    Vui lòng đảm bảo file credentials của Cloudflare Tunnel đã được tạo.
    pause
    exit /b 1
)
echo ✅ Cloudflare Tunnel Credentials: OK

echo.
echo ========================================================
echo   🛑 DỪNG CÁC CONTAINER CŨ (nếu có)
echo ========================================================
echo.

docker-compose -f "%~dp0..\docker-compose.yml" down

echo.
echo ========================================================
echo   🏗️  BUILD VÀ KHỞI ĐỘNG HỆ THỐNG
echo ========================================================
echo.

echo 1️⃣  Building Backend...
docker-compose -f "%~dp0..\docker-compose.yml" build backend

echo.
echo 2️⃣  Building Frontend...
docker-compose -f "%~dp0..\docker-compose.yml" build frontend

echo.
echo 3️⃣  Building Landing Page...
docker-compose -f "%~dp0..\docker-compose.yml" build landing

echo.
echo 4️⃣  Building Web App...
docker-compose -f "%~dp0..\docker-compose.yml" build webapp

echo.
echo 5️⃣  Khởi động tất cả services...
docker-compose -f "%~dp0..\docker-compose.yml" up -d

echo.
echo ========================================================
echo   ⏳ CHỜ CÁC SERVICE KHỞI ĐỘNG...
echo ========================================================
echo.

echo Đang chờ Database khởi động...
timeout /t 10 /nobreak >nul

echo Đang chờ Backend khởi động...
timeout /t 15 /nobreak >nul

echo Đang chờ Frontend khởi động...
timeout /t 10 /nobreak >nul

echo Đang chờ Cloudflare Tunnel kết nối...
timeout /t 5 /nobreak >nul

echo.
echo ========================================================
echo   📊 TRẠNG THÁI CÁC CONTAINER
echo ========================================================
echo.

docker-compose -f "%~dp0..\docker-compose.yml" ps

echo.
echo ========================================================
echo   ✅ HỆ THỐNG ĐÃ ĐƯỢC PUBLISH!
echo ========================================================
echo.
echo 🌐 URL Truy cập:
echo.
echo   📱 Landing Page:    https://ammedtech.com (Vercel)
echo   💼 DMS System:      https://dms.ammedtech.com
echo   🔧 Backend API:     https://dms.ammedtech.com/api
echo.
echo 🔍 URL Local (để test):
echo.
echo   - Landing Page:     http://localhost:3000
echo   - DMS Frontend:     http://localhost:3099
echo   - Web App:          http://localhost:3001
echo   - Backend API:      http://localhost:5001
echo   - Database:         localhost:5433
echo.
echo 📝 Lưu ý:
echo   - Cloudflare Tunnel đang chạy và kết nối đến dms.ammedtech.com
echo   - Tất cả traffic HTTPS được xử lý bởi Cloudflare
echo   - Để xem logs: docker-compose -f docker-compose.yml logs -f [service_name]
echo   - Để dừng: scripts\STOP_PRODUCTION.bat
echo.
echo ========================================================
pause
