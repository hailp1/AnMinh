@echo off
echo ========================================
echo AM Medtech DMS - Complete System Test
echo ========================================
echo.

echo This script will test:
echo 1. Login Modal functionality
echo 2. Cloudflare Tunnel connectivity
echo 3. Docker services status
echo.
echo Press any key to continue...
pause >nul

echo.
echo ========================================
echo STEP 1: Checking Docker Services
echo ========================================
echo.
docker-compose ps

echo.
echo ========================================
echo STEP 2: Testing Cloudflare Tunnel
echo ========================================
echo.

echo Checking tunnel status...
docker-compose logs cloudflared --tail=20

echo.
echo Testing DMS endpoint...
curl -I https://dms.ammedtech.com 2>nul || echo Note: Tunnel may not be running or domain not configured

echo.
echo ========================================
echo STEP 3: Testing Landing Page
echo ========================================
echo.

echo Starting landing page in Docker...
docker-compose up -d landing

timeout /t 5 /nobreak >nul

echo.
echo Landing page should be available at:
echo - Local: http://localhost:3000
echo - Production: https://ammedtech.com (if deployed to Vercel)
echo.

echo.
echo ========================================
echo STEP 4: Manual Test Checklist
echo ========================================
echo.
echo Please test the following manually:
echo.
echo [ ] Open http://localhost:3000
echo [ ] Click "CLIENT LOGIN" button
echo [ ] Verify modal appears with smooth animation
echo [ ] Test with Customer ID "AM":
echo     - Should redirect to: https://dms.ammedtech.com/Anminh/admin
echo [ ] Test with other ID (e.g., "TDV001"):
echo     - Should redirect to: https://dms.ammedtech.com
echo [ ] Test mobile menu (resize to mobile view)
echo [ ] Verify all navigation links work
echo.

echo.
echo ========================================
echo STEP 5: Service URLs
echo ========================================
echo.
echo Frontend (DMS):     http://localhost:3099
echo Backend API:        http://localhost:5001
echo Landing Page:       http://localhost:3000
echo Portal:             http://localhost:3001
echo PostgreSQL:         localhost:5433
echo Redis:              localhost:6379
echo.
echo Production URLs:
echo DMS:                https://dms.ammedtech.com
echo Landing:            https://ammedtech.com
echo.

echo.
echo ========================================
echo Test Complete!
echo ========================================
echo.
echo To view logs for specific services:
echo   docker-compose logs [service-name]
echo.
echo To restart a service:
echo   docker-compose restart [service-name]
echo.
pause
