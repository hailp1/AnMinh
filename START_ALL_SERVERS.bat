@echo off
chcp 65001 >nul 2>&1
echo.
echo ========================================
echo   KHOI DONG TAT CA SERVERS
echo ========================================
echo.

cd /d "%~dp0"

echo === 1. KIEM TRA PACKAGE.JSON ===
echo.

if not exist "package.json" (
    echo LOI: package.json khong ton tai trong thu muc root!
    pause
    exit /b 1
)

echo package.json: EXISTS
echo.

echo === 2. CAI DAT DEPENDENCIES (neu can) ===
echo.

if not exist "node_modules" (
    echo Dang cai dat dependencies cho root...
    call npm install
)

echo.

echo === 3. KHOI DONG SERVERS ===
echo.

echo Dang khoi dong:
echo   - HOME LANDING SERVER (Port 3000)
echo   - DMS FRONTEND SERVER (Port 3099)
echo   - DMS PORTAL SERVER (Port 3001)
echo   - BACKEND API SERVER (Port 5000)
echo.

start "HOME LANDING SERVER (Port 3000)" cmd /k "cd /d %~dp0home\landing && echo === HOME LANDING SERVER (Port 3000) === && npm run dev"

timeout /t 2 /nobreak >nul

start "DMS FRONTEND SERVER (Port 3099)" cmd /k "cd /d %~dp0DMS\frontend && echo === DMS FRONTEND SERVER (Port 3099) === && npm start"

timeout /t 2 /nobreak >nul

start "DMS PORTAL SERVER (Port 3001)" cmd /k "cd /d %~dp0DMS\portal && echo === DMS PORTAL SERVER (Port 3001) === && npm run dev"

timeout /t 2 /nobreak >nul

start "BACKEND API SERVER (Port 5000)" cmd /k "cd /d %~dp0DMS\backend && echo === BACKEND API SERVER (Port 5000) === && npm start"

echo.
echo ========================================
echo   SERVERS DANG KHOI DONG...
echo ========================================
echo.
echo Doi compile xong:
echo   - Landing: http://localhost:3000
echo   - Frontend: http://localhost:3099
echo   - Portal: http://localhost:3001
echo   - Backend: http://localhost:5000
echo.
echo Test login DMS:
echo   Employee Code: AM01
echo   Password: admin123
echo.
pause

