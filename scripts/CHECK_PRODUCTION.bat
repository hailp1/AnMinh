@echo off
chcp 65001 >nul
echo ========================================================
echo   📊 KIỂM TRA TRẠNG THÁI HỆ THỐNG PRODUCTION
echo ========================================================
echo.

echo 1️⃣  Trạng thái các containers:
echo ----------------------------------------
docker-compose -f "%~dp0..\docker-compose.yml" ps

echo.
echo 2️⃣  Kiểm tra kết nối Cloudflare Tunnel:
echo ----------------------------------------
docker logs dms_tunnel --tail 20

echo.
echo 3️⃣  Kiểm tra Backend API:
echo ----------------------------------------
curl -I http://localhost:5001/api 2>nul
if errorlevel 1 (
    echo ❌ Backend không phản hồi
) else (
    echo ✅ Backend đang hoạt động
)

echo.
echo 4️⃣  Kiểm tra Frontend:
echo ----------------------------------------
curl -I http://localhost:3099 2>nul
if errorlevel 1 (
    echo ❌ Frontend không phản hồi
) else (
    echo ✅ Frontend đang hoạt động
)

echo.
echo 5️⃣  Kiểm tra Database:
echo ----------------------------------------
docker exec dms_postgres pg_isready -U postgres 2>nul
if errorlevel 1 (
    echo ❌ Database không sẵn sàng
) else (
    echo ✅ Database đang hoạt động
)

echo.
echo 6️⃣  Kiểm tra domain public:
echo ----------------------------------------
echo Đang kiểm tra https://dms.ammedtech.com...
curl -I https://dms.ammedtech.com 2>nul
if errorlevel 1 (
    echo ⚠️  Không thể kết nối đến domain public
    echo    Kiểm tra Cloudflare Tunnel logs ở trên
) else (
    echo ✅ Domain public đang hoạt động
)

echo.
echo ========================================================
echo   📝 LỆNH HỮU ÍCH
echo ========================================================
echo.
echo   Xem logs realtime:
echo   - docker-compose -f docker-compose.yml logs -f
echo   - docker logs dms_tunnel -f
echo   - docker logs dms_backend -f
echo   - docker logs dms_frontend -f
echo.
echo   Restart service:
echo   - docker-compose -f docker-compose.yml restart [service_name]
echo.
echo   Rebuild service:
echo   - docker-compose -f docker-compose.yml up -d --build [service_name]
echo.
pause
