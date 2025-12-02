@echo off
echo Restoring PROD from DMS_BACKUP...
if not exist DMS_BACKUP (
    echo No backup found!
    exit /b 1
)
xcopy DMS_BACKUP DMS /E /I /Q /Y /EXCLUDE:exclude.txt
echo Done. Please restart PROD containers.
