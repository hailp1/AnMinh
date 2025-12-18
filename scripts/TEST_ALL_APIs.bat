@echo off
echo ========================================
echo    TEST TOAN BO HE THONG DMS
echo ========================================
echo.

REM Get token first
echo [0/10] Dang nhap de lay token...
powershell -Command "$body = @{employeeCode='admin'; password='123456'} | ConvertTo-Json; $response = Invoke-WebRequest -Uri 'http://localhost:5555/api/auth/login' -Method POST -Body $body -ContentType 'application/json'; $data = $response.Content | ConvertFrom-Json; $data.token" > token.txt
set /p TOKEN=<token.txt
echo Token: %TOKEN:~0,50%...
echo.

echo [1/10] Test API Users...
curl -s -H "Authorization: Bearer %TOKEN%" http://localhost:5555/api/users | findstr /C:"username" && echo [OK] Users API || echo [FAIL] Users API
echo.

echo [2/10] Test API Customers...
curl -s -H "Authorization: Bearer %TOKEN%" http://localhost:5555/api/pharmacies | findstr /C:"name" && echo [OK] Customers API || echo [FAIL] Customers API
echo.

echo [3/10] Test API Products...
curl -s -H "Authorization: Bearer %TOKEN%" http://localhost:5555/api/products | findstr /C:"name" && echo [FAIL] Products API (chua co du lieu) || echo [OK] Products API
echo.

echo [4/10] Test API Orders...
curl -s -H "Authorization: Bearer %TOKEN%" http://localhost:5555/api/orders | findstr /C:"id" && echo [FAIL] Orders API (chua co du lieu) || echo [OK] Orders API
echo.

echo [5/10] Test API Routes...
curl -s -H "Authorization: Bearer %TOKEN%" http://localhost:5555/api/routes | findstr /C:"userId" && echo [FAIL] Routes API (chua co du lieu) || echo [OK] Routes API
echo.

echo [6/10] Test API Customer Assignments...
curl -s -H "Authorization: Bearer %TOKEN%" http://localhost:5555/api/customer-assignments | findstr /C:"userId" && echo [OK] Customer Assignments API || echo [FAIL] Customer Assignments API
echo.

echo [7/10] Test Frontend Landing...
curl -s http://localhost:3500 | findstr /C:"An Minh" && echo [OK] Landing Page || echo [FAIL] Landing Page
echo.

echo [8/10] Test Frontend Admin...
curl -s http://localhost:3599/Anminh/admin | findstr /C:"Admin" && echo [OK] Admin Panel || echo [FAIL] Admin Panel
echo.

echo [9/10] Test Database Connection...
docker exec preprod_postgres psql -U postgres -d anminh_db -c "SELECT COUNT(*) FROM \"User\";" | findstr /C:"count" && echo [OK] Database || echo [FAIL] Database
echo.

echo [10/10] Test Backend Health...
curl -s http://localhost:5555/health | findstr /C:"ok" && echo [OK] Backend Health || echo [FAIL] Backend Health
echo.

del token.txt

echo ========================================
echo    KET QUA TEST
echo ========================================
echo.
echo Xem ket qua o tren.
echo Neu co [FAIL], can kiem tra lai module do.
echo.
pause
