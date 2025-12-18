@echo off
echo ========================================
echo    SEED FULL DATA - Dashboard, Reports, Settings
echo ========================================
echo.

cd DMS\backend
set DATABASE_URL=postgresql://postgres:postgres@localhost:5455/anminh_db?schema=public

echo [1/8] Tao Regions...
docker exec preprod_postgres psql -U postgres -d anminh_db -c "INSERT INTO \"Region\" (id, code, name, \"createdAt\", \"updatedAt\") VALUES (gen_random_uuid(), 'HN', 'Ha Noi', NOW(), NOW()) ON CONFLICT (code) DO NOTHING;"
docker exec preprod_postgres psql -U postgres -d anminh_db -c "INSERT INTO \"Region\" (id, code, name, \"createdAt\", \"updatedAt\") VALUES (gen_random_uuid(), 'DN', 'Da Nang', NOW(), NOW()) ON CONFLICT (code) DO NOTHING;"

echo [2/8] Tao Customer Segments...
docker exec preprod_postgres psql -U postgres -d anminh_db -c "INSERT INTO \"CustomerSegment\" (id, code, name, \"minOrderAmount\", \"createdAt\", \"updatedAt\") VALUES (gen_random_uuid(), 'VIP', 'VIP', 50000000, NOW(), NOW()) ON CONFLICT (code) DO NOTHING;"
docker exec preprod_postgres psql -U postgres -d anminh_db -c "INSERT INTO \"CustomerSegment\" (id, code, name, \"minOrderAmount\", \"createdAt\", \"updatedAt\") VALUES (gen_random_uuid(), 'GOLD', 'Gold', 20000000, NOW(), NOW()) ON CONFLICT (code) DO NOTHING;"

echo [3/8] Tao Products...
docker exec preprod_postgres psql -U postgres -d anminh_db -c "INSERT INTO \"Product\" (id, code, name, unit, price, \"createdAt\", \"updatedAt\") VALUES (gen_random_uuid(), 'SP001', 'Amoxicillin 500mg', 'Vien', 2000, NOW(), NOW()) ON CONFLICT (code) DO NOTHING;"
docker exec preprod_postgres psql -U postgres -d anminh_db -c "INSERT INTO \"Product\" (id, code, name, unit, price, \"createdAt\", \"updatedAt\") VALUES (gen_random_uuid(), 'SP002', 'Paracetamol 500mg', 'Vien', 500, NOW(), NOW()) ON CONFLICT (code) DO NOTHING;"
docker exec preprod_postgres psql -U postgres -d anminh_db -c "INSERT INTO \"Product\" (id, code, name, unit, price, \"createdAt\", \"updatedAt\") VALUES (gen_random_uuid(), 'SP003', 'Vitamin C 1000mg', 'Vien', 1500, NOW(), NOW()) ON CONFLICT (code) DO NOTHING;"

echo [4/8] Dem so luong du lieu...
docker exec preprod_postgres psql -U postgres -d anminh_db -c "SELECT COUNT(*) as regions FROM \"Region\";"
docker exec preprod_postgres psql -U postgres -d anminh_db -c "SELECT COUNT(*) as segments FROM \"CustomerSegment\";"
docker exec preprod_postgres psql -U postgres -d anminh_db -c "SELECT COUNT(*) as products FROM \"Product\";"
docker exec preprod_postgres psql -U postgres -d anminh_db -c "SELECT COUNT(*) as pharmacies FROM \"Pharmacy\";"
docker exec preprod_postgres psql -U postgres -d anminh_db -c "SELECT COUNT(*) as users FROM \"User\";"

echo.
echo ========================================
echo    HOAN TAT!
echo ========================================
echo.
echo Da tao du lieu cho:
echo   - Regions (HCM, HN, DN)
echo   - Customer Segments (VIP, GOLD)
echo   - Products (SP001-SP003)
echo.
echo Bay gio co the test:
echo   1. Dashboard - Co du lieu stats
echo   2. Settings - Regions, Segments
echo   3. Products - Co san pham
echo.
pause
