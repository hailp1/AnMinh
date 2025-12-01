# Test Backend API Direct
Write-Host "`n=== TEST BACKEND API DIRECT ===" -ForegroundColor Cyan
Write-Host ""

# Test 1: GET /api
Write-Host "1. Test GET /api:" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:5000/api" -Method GET -TimeoutSec 3 -ErrorAction Stop
    Write-Host "   ✅ SUCCESS" -ForegroundColor Green
    Write-Host "   Message: $($response.message)" -ForegroundColor White
} catch {
    Write-Host "   ❌ FAILED: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test 2: POST /api/auth/login
Write-Host "2. Test POST /api/auth/login:" -ForegroundColor Yellow
try {
    $body = @{
        employeeCode = "AM01"
        password = "admin123"
    } | ConvertTo-Json
    
    $response = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" -Method POST -Body $body -ContentType "application/json" -TimeoutSec 10 -ErrorAction Stop
    Write-Host "   ✅ SUCCESS" -ForegroundColor Green
    Write-Host "   User: $($response.user.name)" -ForegroundColor White
    Write-Host "   Token: $($response.token.Substring(0, 20))..." -ForegroundColor Gray
} catch {
    $statusCode = if ($_.Exception.Response) { 
        $_.Exception.Response.StatusCode.value__ 
    } else { 
        "Connection Failed" 
    }
    Write-Host "   ❌ FAILED" -ForegroundColor Red
    Write-Host "   Status: $statusCode" -ForegroundColor White
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor White
    
    if ($statusCode -eq 404) {
        Write-Host "   → Route /api/auth/login khong tim thay" -ForegroundColor Yellow
    } elseif ($statusCode -eq "Connection Failed") {
        Write-Host "   → Backend khong chay hoac timeout" -ForegroundColor Yellow
        Write-Host "   → Kiem tra backend logs" -ForegroundColor Yellow
    }
}

Write-Host ""

