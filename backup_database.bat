@echo off
REM Database Backup Script for DMS System (Windows)
REM Run this daily via Task Scheduler

SET BACKUP_DIR=d:\AM_DMS\backups
SET TIMESTAMP=%date:~10,4%%date:~4,2%%date:~7,2%_%time:~0,2%%time:~3,2%%time:~6,2%
SET TIMESTAMP=%TIMESTAMP: =0%
SET BACKUP_FILE=%BACKUP_DIR%\dms_backup_%TIMESTAMP%.sql

REM Create backup directory
if not exist "%BACKUP_DIR%" mkdir "%BACKUP_DIR%"

echo === DMS Database Backup ===
echo Started at: %date% %time%
echo Backup file: %BACKUP_FILE%

REM Perform backup
docker exec dms_postgres pg_dump -U postgres anminh_db > "%BACKUP_FILE%"

if %ERRORLEVEL% EQU 0 (
    echo ✅ Backup successful!
    
    REM Show file size
    for %%A in ("%BACKUP_FILE%") do echo 📦 Backup size: %%~zA bytes
    
    REM Delete old backups (older than 7 days)
    echo 🗑️ Cleaning old backups...
    forfiles /P "%BACKUP_DIR%" /M dms_backup_*.sql /D -7 /C "cmd /c del @path" 2>nul
    
    echo ✅ Backup completed successfully!
) else (
    echo ❌ Backup failed!
    exit /b 1
)

echo Finished at: %date% %time%
