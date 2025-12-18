@echo off
echo ========================================
echo    TAO LAI USER ADMIN
echo ========================================
echo.

echo [1/2] Xoa user admin cu (neu co)...
docker exec preprod_postgres psql -U postgres -d anminh_db -c "DELETE FROM \"User\" WHERE username = 'admin';"

echo [2/2] Tao user admin moi...
docker exec preprod_postgres psql -U postgres -d anminh_db -c "INSERT INTO \"User\" (id, username, password, name, email, role, \"isActive\", \"createdAt\", \"updatedAt\") VALUES (gen_random_uuid(), 'admin', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'System Admin', 'admin@ammedtech.com', 'ADMIN', true, NOW(), NOW());"

echo.
echo ========================================
echo    HOAN TAT!
echo ========================================
echo.
echo User admin da duoc tao lai:
echo   Username: admin
echo   Password: 123456
echo   Role: ADMIN
echo.
echo Bay gio ban co the dang nhap tai:
echo   http://localhost:3599/Anminh/admin
echo.
pause
