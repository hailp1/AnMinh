@echo off
title AM MEDTECH - Backup Project
color 0E
echo.
echo ============================================================
echo    AM MEDTECH - SAO LUU DU AN (BACKUP)
echo ============================================================
echo.

REM Lay thoi gian hien tai de dat ten thu muc
for /f "tokens=2 delims==" %%I in ('wmic os get localdatetime /value') do set datetime=%%I
set year=%datetime:~0,4%
set month=%datetime:~4,2%
set day=%datetime:~6,2%
set hour=%datetime:~8,2%
set minute=%datetime:~10,2%
set second=%datetime:~12,2%

set BACKUP_NAME=Backup_%year%-%month%-%day%_%hour%-%minute%-%second%
set SOURCE_DIR=%~dp0
set DEST_DIR=%~dp0Backups\%BACKUP_NAME%

echo Dang tao ban sao luu tai: Backups\%BACKUP_NAME%...
echo Vui long cho (dang bo qua node_modules va thu muc build)...

REM Tao thu muc backup
mkdir "%DEST_DIR%"

REM Copy file va thu muc (loai bo cac thu muc nang)
robocopy "%SOURCE_DIR%." "%DEST_DIR%" /E /XD node_modules .next build .git Backups /XF *.log /R:0 /W:0 >nul

echo.
echo ============================================================
echo    SAO LUU THANH CONG!
echo ============================================================
echo Du lieu da duoc luu tai: %DEST_DIR%
echo.
echo Ban co the yen tam sua code. Neu loi, hay copy lai tu thu muc Backup.
echo.
pause
