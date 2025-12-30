@echo off
chcp 65001 >nul 2>&1
echo.
echo ========================================
echo   FIX ALL - FIX TAT CA VAN DE
echo ========================================
echo.

cd /d "%~dp0\.."

echo === 1. DUNG FRONTEND CU ===
echo.

REM Kill all node processes (simple way)
taskkill /F /IM node.exe >nul 2>&1
if %errorlevel% equ 0 (
    echo Da dung tat ca node processes
) else (
    echo Khong co node process nao dang chay
)

echo.
echo === 2. XOA CACHE ===
echo.

if exist "client\node_modules\.cache" (
    rmdir /s /q "client\node_modules\.cache" >nul 2>&1
    echo Da xoa cache
) else (
    echo Khong co cache
)

echo.
echo === 3. KHOI DONG FRONTEND ===
echo.

cd client
start "Frontend Server" cmd /k "echo === FRONTEND SERVER === && npm start"

cd ..

echo Da khoi dong frontend
echo.

echo ========================================
echo   FIX HOAN TAT!
echo ========================================
echo.

echo Kiem tra terminal frontend co log:
echo   [Config] setupProxy.js loaded successfully
echo.
echo Sau do test login: http://localhost:3099
echo.

pause

