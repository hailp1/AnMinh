@echo off
echo ========================================
echo RESTART FRONTEND - AN MINH BUSINESS
echo ========================================
echo.

echo [1/3] Stopping current frontend...
echo Please press Ctrl+C in the terminal running "npm start" in client folder
echo Then press Y to confirm
echo.
pause

echo.
echo [2/3] Starting frontend...
cd client
start cmd /k "npm start"
echo.
echo Waiting for frontend to compile...
timeout /t 15 /nobreak

echo.
echo [3/3] Frontend should be starting...
echo Wait for "Compiled successfully!" message
echo Then press any key to continue...
pause

echo.
echo ========================================
echo FRONTEND RESTARTED!
echo ========================================
echo.
echo Next steps:
echo 1. Wait for "Compiled successfully!"
echo 2. Open http://localhost:3100/
echo 3. Press Ctrl+Shift+R to hard refresh
echo 4. Login with TDV001 / 123456
echo 5. Should redirect to /home without error!
echo.
pause
