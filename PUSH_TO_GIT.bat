@echo off
echo.
echo ===============================================================
echo     PUSH CODE LEN GIT
echo ===============================================================
echo.

echo Buoc 1: Kiem tra git status...
git status
echo.

echo Buoc 2: Add tat ca file thay doi...
git add .
echo    [OK] Da add files
echo.

echo Buoc 3: Commit...
git commit -m "Fix: Resolve 404 route error - Improve middleware order, add route logging, create auto-test scripts"
echo    [OK] Da commit
echo.

echo Buoc 4: Push len remote...
git push
echo.

echo ===============================================================
echo     KET QUA
echo ===============================================================
echo.
echo [OK] Da push code len git!
echo.
pause

