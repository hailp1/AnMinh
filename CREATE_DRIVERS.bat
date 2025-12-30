@echo off
echo Creating Driver Users...
echo.

REM Get password hash from existing TDV user
echo Getting password hash...
docker exec dms_postgres psql -U postgres -d anminh_db -t -c "SELECT password FROM \"User\" WHERE \"employeeCode\" = 'TDV001' LIMIT 1;" > temp_pass.txt

REM Read password hash
set /p PASS_HASH=<temp_pass.txt

echo Password hash: %PASS_HASH%
echo.

REM Create TX001
echo Creating TX001...
docker exec dms_postgres psql -U postgres -d anminh_db -c "INSERT INTO \"User\" (id, \"employeeCode\", name, email, password, role, \"isActive\", \"createdAt\", \"updatedAt\") VALUES (gen_random_uuid()::text, 'TX001', 'Trần Văn B', 'tx001@anminh.com', '%PASS_HASH%', 'DRIVER', true, NOW(), NOW()) ON CONFLICT (\"employeeCode\") DO NOTHING;"

REM Create TX002
echo Creating TX002...
docker exec dms_postgres psql -U postgres -d anminh_db -c "INSERT INTO \"User\" (id, \"employeeCode\", name, email, password, role, \"isActive\", \"createdAt\", \"updatedAt\") VALUES (gen_random_uuid()::text, 'TX002', 'Nguyễn Văn C', 'tx002@anminh.com', '%PASS_HASH%', 'DRIVER', true, NOW(), NOW()) ON CONFLICT (\"employeeCode\") DO NOTHING;"

REM Create TX003
echo Creating TX003...
docker exec dms_postgres psql -U postgres -d anminh_db -c "INSERT INTO \"User\" (id, \"employeeCode\", name, email, password, role, \"isActive\", \"createdAt\", \"updatedAt\") VALUES (gen_random_uuid()::text, 'TX003', 'Lê Văn D', 'tx003@anminh.com', '%PASS_HASH%', 'DRIVER', true, NOW(), NOW()) ON CONFLICT (\"employeeCode\") DO NOTHING;"

echo.
echo Verifying...
docker exec dms_postgres psql -U postgres -d anminh_db -c "SELECT \"employeeCode\", name, email, role, \"isActive\" FROM \"User\" WHERE role = 'DRIVER' ORDER BY \"employeeCode\";"

REM Cleanup
del temp_pass.txt

echo.
echo Done! Driver users created.
echo Login: TX001, TX002, TX003
echo Password: Same as TDV001 (123456)
pause
