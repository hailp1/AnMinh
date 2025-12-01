@echo off
title AM MEDTECH - Deploy to Production
color 0A
echo.
echo ============================================================
echo    AM MEDTECH - DEPLOY TO PRODUCTION
echo ============================================================
echo.
echo Ban dang chuan bi build va deploy len Production (ammedtech.com).
echo Qua trinh nay se:
echo   1. Dung tat ca services hien tai.
echo   2. Xoa cache va build lai toan bo (Clean Build).
echo   3. Khoi dong lai services o che do Production.
echo   4. Ket noi Cloudflare Tunnel de public ra internet.
echo.
set /p confirm="Ban co chac chan muon tiep tuc? (y/n): "
if /i "%confirm%" neq "y" exit

echo.
echo [1/4] Stopping services...
call STOP_ALL_SIMPLE.bat

echo.
echo [2/4] Cleaning and Rebuilding...
call CLEAN_AND_REBUILD.bat

echo.
echo [3/4] Starting Production Services...
call START_ALL_SIMPLE.bat

echo.
echo ============================================================
echo    DEPLOY HOAN TAT!
echo ============================================================
echo Kiem tra lai tai: https://ammedtech.com
echo.
pause
