@echo off
echo ========================================
echo    KIEM TRA DU LIEU
echo ========================================
echo.

echo Checking TDV users...
docker exec preprod_postgres psql -U postgres -d anminh_db -t -c "SELECT username, name FROM \"User\" WHERE role = 'TDV' LIMIT 5;"

echo.
echo Checking Pharmacies...
docker exec preprod_postgres psql -U postgres -d anminh_db -t -c "SELECT code, name, tier FROM \"Pharmacy\" LIMIT 5;"

echo.
echo Checking Customer Assignments...
docker exec preprod_postgres psql -U postgres -d anminh_db -t -c "SELECT COUNT(*) FROM \"CustomerAssignment\";"

echo.
echo ========================================
pause
