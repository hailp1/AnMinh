@echo off
REM DMS Project Cleanup - Remove temporary test files

echo ============================================
echo    DMS PROJECT CLEANUP
echo ============================================
echo.

set COUNT=0

echo Deleting temporary test files...
echo.

REM Backend test files
if exist "d:\AM_DMS\DMS\backend\assign_tdv020.js" (
    del "d:\AM_DMS\DMS\backend\assign_tdv020.js"
    echo [DELETED] assign_tdv020.js
    set /a COUNT+=1
)

if exist "d:\AM_DMS\DMS\backend\check_admin_role.js" (
    del "d:\AM_DMS\DMS\backend\check_admin_role.js"
    echo [DELETED] check_admin_role.js
    set /a COUNT+=1
)

if exist "d:\AM_DMS\DMS\backend\check_customers.js" (
    del "d:\AM_DMS\DMS\backend\check_customers.js"
    echo [DELETED] check_customers.js
    set /a COUNT+=1
)

if exist "d:\AM_DMS\DMS\backend\check_tdv020.js" (
    del "d:\AM_DMS\DMS\backend\check_tdv020.js"
    echo [DELETED] check_tdv020.js
    set /a COUNT+=1
)

if exist "d:\AM_DMS\DMS\backend\check_visits.js" (
    del "d:\AM_DMS\DMS\backend\check_visits.js"
    echo [DELETED] check_visits.js
    set /a COUNT+=1
)

if exist "d:\AM_DMS\DMS\backend\fix_admin.js" (
    del "d:\AM_DMS\DMS\backend\fix_admin.js"
    echo [DELETED] fix_admin.js
    set /a COUNT+=1
)

if exist "d:\AM_DMS\DMS\backend\fix_unassigned.js" (
    del "d:\AM_DMS\DMS\backend\fix_unassigned.js"
    echo [DELETED] fix_unassigned.js
    set /a COUNT+=1
)

if exist "d:\AM_DMS\DMS\backend\test_warehouse.js" (
    del "d:\AM_DMS\DMS\backend\test_warehouse.js"
    echo [DELETED] test_warehouse.js
    set /a COUNT+=1
)

if exist "d:\AM_DMS\DMS\backend\test_warehouse_api.js" (
    del "d:\AM_DMS\DMS\backend\test_warehouse_api.js"
    echo [DELETED] test_warehouse_api.js
    set /a COUNT+=1
)

REM Temp txt files
if exist "d:\AM_DMS\force_logout.js" (
    del "d:\AM_DMS\force_logout.js"
    echo [DELETED] force_logout.js
    set /a COUNT+=1
)

if exist "d:\AM_DMS\warehouse_test.txt" (
    del "d:\AM_DMS\warehouse_test.txt"
    echo [DELETED] warehouse_test.txt
    set /a COUNT+=1
)

if exist "d:\AM_DMS\visit_plans_report.txt" (
    del "d:\AM_DMS\visit_plans_report.txt"
    echo [DELETED] visit_plans_report.txt
    set /a COUNT+=1
)

if exist "d:\AM_DMS\tdv020_check.txt" (
    del "d:\AM_DMS\tdv020_check.txt"
    echo [DELETED] tdv020_check.txt
    set /a COUNT+=1
)

if exist "d:\AM_DMS\assign_result.txt" (
    del "d:\AM_DMS\assign_result.txt"
    echo [DELETED] assign_result.txt
    set /a COUNT+=1
)

if exist "d:\AM_DMS\critical_issues_report.txt" (
    del "d:\AM_DMS\critical_issues_report.txt"
    echo [DELETED] critical_issues_report.txt
    set /a COUNT+=1
)

echo.
echo ============================================
echo CLEANUP COMPLETE!
echo Files deleted: %COUNT%
echo ============================================
echo.
echo KEPT (Production Files):
echo   - server.js
echo   - verify_critical_issues.js
echo   - backup_database.bat
echo   - SYSTEM_AUDIT_REPORT.md
echo.
echo Project is now clean!
pause
