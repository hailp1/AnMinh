@echo off
chcp 65001 >nul
echo ========================================================
echo   🛑 STOP AM MEDTECH DMS PRODUCTION
echo ========================================================
echo.

echo Đang dừng tất cả containers...
docker-compose -f "%~dp0..\docker-compose.yml" down

echo.
echo ========================================================
echo   ✅ ĐÃ DỪNG TẤT CẢ SERVICES
echo ========================================================
echo.
echo Để khởi động lại, chạy: scripts\PUBLISH_PRODUCTION.bat
echo.
pause
