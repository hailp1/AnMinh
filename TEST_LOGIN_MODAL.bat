@echo off
echo ========================================
echo Testing Login Modal and Landing Page
echo ========================================
echo.

echo [1/3] Checking landing page files...
if exist "home\landing\app\components\LoginModal.tsx" (
    echo ✓ LoginModal.tsx found
) else (
    echo ✗ LoginModal.tsx NOT found
    exit /b 1
)

if exist "home\landing\app\components\Navbar.tsx" (
    echo ✓ Navbar.tsx found
) else (
    echo ✗ Navbar.tsx NOT found
    exit /b 1
)

echo.
echo [2/3] Building landing page...
cd home\landing
call npm install
call npm run build

echo.
echo [3/3] Starting development server...
echo Landing page will be available at: http://localhost:3000
echo.
echo Test checklist:
echo [ ] Click "CLIENT LOGIN" button in navbar
echo [ ] Login modal should appear with animation
echo [ ] Enter "AM" and verify redirect to: https://dms.ammedtech.com/Anminh/admin
echo [ ] Enter other ID and verify redirect to: https://dms.ammedtech.com
echo [ ] Test mobile menu (resize browser to mobile view)
echo.
call npm run dev
