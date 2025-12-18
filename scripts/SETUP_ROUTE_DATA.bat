@echo off
echo ========================================
echo    TU DONG TAO DU LIEU TEST
echo    Quan ly Lo trinh (Route Management)
echo ========================================
echo.

echo [1/5] Ket noi database...
set DATABASE_URL=postgresql://postgres:postgres@localhost:5455/anminh_db?schema=public

echo [2/5] Tao Region va Territory...
docker exec preprod_postgres psql -U postgres -d anminh_db -c "INSERT INTO \"Region\" (id, code, name, description, \"createdAt\", \"updatedAt\") VALUES (gen_random_uuid(), 'HCM', 'Ho Chi Minh', 'Khu vuc TP.HCM', NOW(), NOW()) ON CONFLICT (code) DO NOTHING;"

docker exec preprod_postgres psql -U postgres -d anminh_db -c "INSERT INTO \"Territory\" (id, code, name, description, \"regionId\", \"createdAt\", \"updatedAt\") SELECT gen_random_uuid(), 'HCM_Q1', 'Quan 1', 'Quan 1, TP.HCM', r.id, NOW(), NOW() FROM \"Region\" r WHERE r.code = 'HCM' ON CONFLICT (code) DO NOTHING;"

echo [3/5] Tao TDV users (TDV001, TDV002)...
docker exec preprod_postgres psql -U postgres -d anminh_db -c "INSERT INTO \"User\" (id, username, \"employeeCode\", password, name, email, role, \"regionId\", \"isActive\", \"createdAt\", \"updatedAt\") SELECT gen_random_uuid(), 'TDV001', 'TDV001', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Nguyen Van A', 'tdv001@ammedtech.com', 'TDV', r.id, true, NOW(), NOW() FROM \"Region\" r WHERE r.code = 'HCM' AND NOT EXISTS (SELECT 1 FROM \"User\" WHERE \"employeeCode\" = 'TDV001');"

docker exec preprod_postgres psql -U postgres -d anminh_db -c "INSERT INTO \"User\" (id, username, \"employeeCode\", password, name, email, role, \"regionId\", \"isActive\", \"createdAt\", \"updatedAt\") SELECT gen_random_uuid(), 'TDV002', 'TDV002', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Tran Thi B', 'tdv002@ammedtech.com', 'TDV', r.id, true, NOW(), NOW() FROM \"Region\" r WHERE r.code = 'HCM' AND NOT EXISTS (SELECT 1 FROM \"User\" WHERE \"employeeCode\" = 'TDV002');"

echo [4/5] Tao 5 Pharmacies voi GPS...
docker exec preprod_postgres psql -U postgres -d anminh_db -c "INSERT INTO \"Pharmacy\" (id, code, name, address, latitude, longitude, tier, \"territoryId\", \"isActive\", \"createdAt\", \"updatedAt\") SELECT gen_random_uuid(), 'KH001', 'Nha thuoc An Khang', '123 Nguyen Hue, Q1, TP.HCM', 10.762622, 106.660172, 'A', t.id, true, NOW(), NOW() FROM \"Territory\" t WHERE t.code = 'HCM_Q1' AND NOT EXISTS (SELECT 1 FROM \"Pharmacy\" WHERE code = 'KH001');"

docker exec preprod_postgres psql -U postgres -d anminh_db -c "INSERT INTO \"Pharmacy\" (id, code, name, address, latitude, longitude, tier, \"territoryId\", \"isActive\", \"createdAt\", \"updatedAt\") SELECT gen_random_uuid(), 'KH002', 'Nha thuoc Binh An', '456 Le Loi, Q1, TP.HCM', 10.772622, 106.670172, 'B', t.id, true, NOW(), NOW() FROM \"Territory\" t WHERE t.code = 'HCM_Q1' AND NOT EXISTS (SELECT 1 FROM \"Pharmacy\" WHERE code = 'KH002');"

docker exec preprod_postgres psql -U postgres -d anminh_db -c "INSERT INTO \"Pharmacy\" (id, code, name, address, latitude, longitude, tier, \"territoryId\", \"isActive\", \"createdAt\", \"updatedAt\") SELECT gen_random_uuid(), 'KH003', 'Nha thuoc Cam Tu', '789 Pasteur, Q1, TP.HCM', 10.752622, 106.650172, 'C', t.id, true, NOW(), NOW() FROM \"Territory\" t WHERE t.code = 'HCM_Q1' AND NOT EXISTS (SELECT 1 FROM \"Pharmacy\" WHERE code = 'KH003');"

docker exec preprod_postgres psql -U postgres -d anminh_db -c "INSERT INTO \"Pharmacy\" (id, code, name, address, latitude, longitude, tier, \"territoryId\", \"isActive\", \"createdAt\", \"updatedAt\") SELECT gen_random_uuid(), 'KH004', 'Nha thuoc Duc Tin', '321 Hai Ba Trung, Q1, TP.HCM', 10.782622, 106.680172, 'A', t.id, true, NOW(), NOW() FROM \"Territory\" t WHERE t.code = 'HCM_Q1' AND NOT EXISTS (SELECT 1 FROM \"Pharmacy\" WHERE code = 'KH004');"

docker exec preprod_postgres psql -U postgres -d anminh_db -c "INSERT INTO \"Pharmacy\" (id, code, name, address, latitude, longitude, tier, \"territoryId\", \"isActive\", \"createdAt\", \"updatedAt\") SELECT gen_random_uuid(), 'KH005', 'Nha thuoc Gia Phuc', '654 Tran Hung Dao, Q1, TP.HCM', 10.742622, 106.640172, 'B', t.id, true, NOW(), NOW() FROM \"Territory\" t WHERE t.code = 'HCM_Q1' AND NOT EXISTS (SELECT 1 FROM \"Pharmacy\" WHERE code = 'KH005');"

echo [5/5] Gan khach hang cho TDV001...
docker exec preprod_postgres psql -U postgres -d anminh_db -c "INSERT INTO \"CustomerAssignment\" (id, \"userId\", \"pharmacyId\", \"territoryId\", \"isActive\", \"createdAt\", \"updatedAt\") SELECT gen_random_uuid(), u.id, p.id, t.id, true, NOW(), NOW() FROM \"User\" u CROSS JOIN \"Pharmacy\" p CROSS JOIN \"Territory\" t WHERE u.\"employeeCode\" = 'TDV001' AND t.code = 'HCM_Q1' AND NOT EXISTS (SELECT 1 FROM \"CustomerAssignment\" ca WHERE ca.\"userId\" = u.id AND ca.\"pharmacyId\" = p.id);"

echo.
echo ========================================
echo    HOAN TAT!
echo ========================================
echo.
echo Da tao thanh cong:
echo   - 1 Region: Ho Chi Minh
echo   - 1 Territory: Quan 1
echo   - 2 TDV: TDV001, TDV002 (password: 123456)
echo   - 5 Pharmacies voi GPS
echo   - 5 Customer Assignments
echo.
echo Bay gio ban co the:
echo   1. Truy cap: http://localhost:3599/Anminh/admin/routes
echo   2. Chon TDV001 tu dropdown
echo   3. Xem khach hang tren ban do
echo   4. Click nut "Toi uu" de test
echo.
pause
