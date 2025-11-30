@echo off
title AM MEDTECH - Stop All Services
color 0C
echo.
echo ============================================================
echo    AM MEDTECH - DUNG TAT CA SERVICES
echo ============================================================
echo.

cd /d "%~dp0"

echo Dang dung Node.js processes...
taskkill /F /IM node.exe >nul 2>&1
echo OK
echo.

echo Dang dung Cloudflare Tunnel...
taskkill /F /IM cloudflared.exe >nul 2>&1
echo OK
echo.

timeout /t 2 /nobreak >nul

echo ============================================================
echo    DA DUNG TAT CA SERVICES!
echo ============================================================
echo.

