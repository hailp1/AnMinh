@echo off
chcp 65001 >nul
echo ========================================================
echo   🛑 DỪNG HỆ THỐNG LOCAL
echo ========================================================
echo.

echo Đang dừng tất cả containers...
docker-compose down

echo.
echo ========================================================
echo   ✅ ĐÃ DỪNG HỆ THỐNG
echo ========================================================
echo.
echo 💾 Lưu ý: Data trong database vẫn được giữ nguyên
echo.
echo Để khởi động lại: scripts\START_LOCAL.bat
echo.
pause
