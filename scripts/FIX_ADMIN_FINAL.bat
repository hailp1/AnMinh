@echo off
echo ========================================
echo    FIX USER ADMIN - PHIEN BAN MOI
echo ========================================
echo.

cd DMS\backend

echo [1/1] Tao lai user admin...
set DATABASE_URL=postgresql://postgres:postgres@localhost:5455/anminh_db?schema=public
node create_admin_proper.js

echo.
echo ========================================
echo    HOAN TAT!
echo ========================================
echo.
echo User admin da duoc tao lai:
echo   Username: admin (hoac ADMIN)
echo   Password: 123456
echo   Role: ADMIN
echo.
echo Bay gio ban co the dang nhap tai:
echo   http://localhost:3599/Anminh/admin
echo.
echo Luu y: Nhap "admin" hoac "ADMIN" deu duoc!
echo.
pause
