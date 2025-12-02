@echo off
chcp 65001 >nul 2>&1
echo.
echo ========================================
echo   DUNG TAT CA SERVERS
echo ========================================
echo.

echo Dang dung tat ca Node.js processes...
taskkill /F /IM node.exe >nul 2>&1

if %errorlevel% equ 0 (
    echo Da dung tat ca Node.js processes
) else (
    echo Khong co Node.js process nao dang chay
)

echo.
echo Hoan thanh!
echo.
pause


