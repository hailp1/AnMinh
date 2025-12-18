@echo off
echo ========================================
echo    KIEM TRA DU LIEU CHI TIET
echo ========================================
echo.

echo [1/5] Checking Regions...
docker exec preprod_postgres psql -U postgres -d anminh_db -c "SELECT code, name FROM \"Region\" WHERE code = 'HCM';"
echo.

echo [2/5] Checking Territories...
docker exec preprod_postgres psql -U postgres -d anminh_db -c "SELECT code, name FROM \"Territory\" WHERE code = 'HCM_Q1';"
echo.

echo [3/5] Checking TDV Users...
docker exec preprod_postgres psql -U postgres -d anminh_db -c "SELECT username, \"employeeCode\", name, role FROM \"User\" WHERE role = 'TDV';"
echo.

echo [4/5] Checking Pharmacies...
docker exec preprod_postgres psql -U postgres -d anminh_db -c "SELECT code, name, tier, latitude, longitude FROM \"Pharmacy\" LIMIT 5;"
echo.

echo [5/5] Checking Customer Assignments...
docker exec preprod_postgres psql -U postgres -d anminh_db -c "SELECT COUNT(*) as total FROM \"CustomerAssignment\";"
echo.

echo ========================================
echo    KET THUC KIEM TRA
echo ========================================
pause
