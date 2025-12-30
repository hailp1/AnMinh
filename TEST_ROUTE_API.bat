@echo off
echo Testing Route Creation API...
echo.

REM Test visit plan generation
curl -X POST "http://localhost:5001/api/visit-plans/generate" ^
  -H "Content-Type: application/json" ^
  -H "x-auth-token: dummy" ^
  -d "{\"userId\":\"58250b02-3171-4b4d-a466-8ed77e39e22b\",\"pharmacyIds\":[\"b7c26a0e-a3da-44c8-a99a-d2137a215f0e\"],\"startDate\":\"2025-12-27\",\"endDate\":\"2026-01-03\",\"daysOfWeek\":[1,3,5],\"frequency\":\"WEEKLY\"}"

echo.
echo.
echo Test completed!
pause
