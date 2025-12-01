@echo off
echo ========================================
echo Testing Login Modal - Local Development
echo ========================================
echo.

echo Stopping any conflicting processes on port 3000...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000') do (
    echo Killing process %%a
    taskkill /F /PID %%a 2>nul
)

timeout /t 2 /nobreak >nul

echo.
echo Starting landing page in development mode...
cd home\landing

echo.
echo Installing dependencies (if needed)...
call npm install --silent

echo.
echo ========================================
echo Starting Next.js Development Server
echo ========================================
echo.
echo The landing page will be available at:
echo http://localhost:3000
echo.
echo.
echo TEST CHECKLIST:
echo ===============
echo [ ] 1. Click "CLIENT LOGIN" button in navbar
echo [ ] 2. Verify modal appears with smooth animation
echo [ ] 3. Enter "AM" and check console (should prepare redirect)
echo [ ] 4. Enter "TDV001" and check console
echo [ ] 5. Test mobile menu (resize browser)
echo [ ] 6. Verify modal close button works
echo [ ] 7. Verify clicking backdrop closes modal
echo.
echo Press Ctrl+C to stop the server when done testing
echo.

call npm run dev
