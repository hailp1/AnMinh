@echo off
echo ========================================
echo    TU DONG FIX TAT CA
echo    Quan ly Lo trinh
echo ========================================
echo.

echo [1/6] Dung tat ca container...
docker-compose -f docker-compose.preprod.yml stop

echo.
echo [2/6] Tao lai user admin...
cd DMS\backend
set DATABASE_URL=postgresql://postgres:postgres@localhost:5455/anminh_db?schema=public
node create_admin_proper.js
cd ..\..

echo.
echo [3/6] Tao du lieu test...
call SETUP_ROUTE_DATA.bat

echo.
echo [4/6] Khoi dong lai services...
docker-compose -f docker-compose.preprod.yml up -d

echo.
echo [5/6] Cho services khoi dong (30 giay)...
timeout /t 30 /nobreak

echo.
echo [6/6] Kiem tra trang thai...
docker ps --filter "name=preprod" --format "table {{.Names}}\t{{.Status}}"

echo.
echo ========================================
echo    HOAN TAT!
echo ========================================
echo.
echo BAY GIO HAY:
echo   1. Mo trinh duyet: http://localhost:3599/Anminh/admin
echo   2. Nhan Ctrl + Shift + R (clear cache)
echo   3. Dang nhap: admin / 123456
echo   4. Vao "Quan ly lo trinh"
echo   5. Chon TDV001
echo.
echo LUU Y:
echo   - Neu van trong, mo Console (F12) va go: localStorage.clear()
echo   - Sau do tai lai trang va dang nhap lai
echo.
pause
