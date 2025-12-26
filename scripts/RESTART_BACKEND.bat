@echo off
chcp 65001 >nul
echo ========================================================
echo   🔄 RESTART BACKEND ĐỂ CẬP NHẬT DATA
echo ========================================================
echo.

echo Đang restart backend container...
docker-compose restart backend

echo.
echo Đang đợi backend khởi động...
timeout /t 5 /nobreak >nul

echo.
echo ========================================================
echo   ✅ HOÀN THÀNH!
echo ========================================================
echo.
echo 💡 Bây giờ:
echo   1. Mở browser
echo   2. Vào Product Catalog
echo   3. Hard refresh (Ctrl + F5)
echo   4. Danh mục sẽ xuất hiện!
echo.
pause
