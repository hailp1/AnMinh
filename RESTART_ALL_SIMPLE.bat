@echo off
echo ========================================
echo Restarting All Services
echo ========================================
echo.

REM Stop all services
echo Stopping services...
call STOP_ALL_SIMPLE.bat

echo.
echo Waiting 5 seconds before restart...
timeout /t 5 /nobreak >nul
echo.

REM Start all services
echo Starting services...
call START_ALL_SIMPLE.bat
