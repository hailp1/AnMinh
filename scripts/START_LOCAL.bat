@echo off
chcp 65001 >nul
echo ========================================================
echo   🖥️  KHỞI ĐỘNG HỆ THỐNG TRÊN LOCAL
echo ========================================================
echo.

echo 📋 Kiểm tra Docker...
docker --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker chưa được cài đặt hoặc chưa chạy!
    echo    Vui lòng khởi động Docker Desktop.
    pause
    exit /b 1
)
echo ✅ Docker: OK

echo.
echo ========================================================
echo   🚀 KHỞI ĐỘNG SERVICES
echo ========================================================
echo.

docker-compose up -d

echo.
echo ⏳ Đang đợi services khởi động...
timeout /t 10 /nobreak >nul

echo.
echo ========================================================
echo   📊 TRẠNG THÁI CONTAINERS
echo ========================================================
echo.

docker-compose ps

echo.
echo ========================================================
echo   ✅ HỆ THỐNG ĐÃ KHỞI ĐỘNG!
echo ========================================================
echo.
echo 🌐 Truy cập hệ thống tại:
echo.
echo   📱 Landing Page:    http://localhost:3000
echo   💼 DMS Frontend:    http://localhost:3099
echo   🔧 Backend API:     http://localhost:5001
echo   📊 Web App:         http://localhost:3001
echo   🗄️  Database:        localhost:5433
echo.
echo 👤 Đăng nhập:
echo   Username: admin
echo   Password: 123456
echo.
echo 📝 Lệnh hữu ích:
echo   Xem logs:    docker-compose logs -f
echo   Restart:     docker-compose restart
echo   Stop:        docker-compose down
echo   Rebuild:     docker-compose up -d --build
echo.
echo ========================================================
pause
