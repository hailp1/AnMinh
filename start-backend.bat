@echo off
echo === BACKEND SERVER (Port 5000) ===
echo.
cd /d "%~dp0"
echo Starting backend server...
echo.
node server.js
pause

