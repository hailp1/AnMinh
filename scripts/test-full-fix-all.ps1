# Full System Test & Fix All Script
# Test toàn diện và fix tất cả lỗi

$ErrorActionPreference = "Continue"
$rootDir = $PSScriptRoot

Write-Host "`n╔═══════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║     FULL SYSTEM TEST & FIX ALL - KIỂM TRA TOÀN DIỆN      ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

$issues = @()
$fixed = @()

# 1. Test Backend
Write-Host "=== 1. KIỂM TRA BACKEND ===" -ForegroundColor Yellow
$backendRunning = $false
try {
    $response = Invoke-RestMethod -Uri "http://localhost:5000/api" -Method GET -TimeoutSec 3 -ErrorAction Stop
    $backendRunning = $true
    Write-Host "✅ Backend: RUNNING" -ForegroundColor Green
    Write-Host "   Message: $($response.message)" -ForegroundColor White
} catch {
    Write-Host "❌ Backend: NOT RUNNING" -ForegroundColor Red
    $issues += "Backend không chạy trên port 5000"
    Write-Host "   → Cần start: node server.js" -ForegroundColor Yellow
}

Write-Host ""

# 2. Test Frontend
Write-Host "=== 2. KIỂM TRA FRONTEND ===" -ForegroundColor Yellow
$frontendRunning = $false
$frontendPort = $null
$ports = @(3099, 3100, 3101, 3000)
foreach ($port in $ports) {
    $conn = Get-NetTCPConnection -State Listen -ErrorAction SilentlyContinue | Where-Object { $_.LocalPort -eq $port }
    if ($conn) {
        $frontendRunning = $true
        $frontendPort = $port
        Write-Host "✅ Frontend: RUNNING on port $port" -ForegroundColor Green
        break
    }
}
if (-not $frontendRunning) {
    Write-Host "❌ Frontend: NOT RUNNING" -ForegroundColor Red
    $issues += "Frontend không chạy"
    Write-Host "   → Cần start: cd client && npm start" -ForegroundColor Yellow
}

Write-Host ""

# 3. Test Proxy
Write-Host "=== 3. KIỂM TRA PROXY ===" -ForegroundColor Yellow
if ($frontendRunning) {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:$frontendPort/api" -Method GET -TimeoutSec 3 -UseBasicParsing -ErrorAction Stop
        if ($response.StatusCode -eq 200) {
            Write-Host "✅ Proxy: HOẠT ĐỘNG" -ForegroundColor Green
        } else {
            Write-Host "⚠️  Proxy: Response status $($response.StatusCode)" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "❌ Proxy: KHÔNG HOẠT ĐỘNG (404)" -ForegroundColor Red
        $issues += "Proxy không hoạt động - setupProxy.js chưa được load"
        Write-Host "   → Cần restart frontend" -ForegroundColor Yellow
    }
} else {
    Write-Host "⚠️  Proxy: Không thể test (frontend chưa chạy)" -ForegroundColor Yellow
}

Write-Host ""

# 4. Test Database Connection
Write-Host "=== 4. KIỂM TRA DATABASE ===" -ForegroundColor Yellow
$envFile = Join-Path $rootDir ".." ".env"
if (Test-Path $envFile) {
    $envContent = Get-Content $envFile -Raw
    if ($envContent -match 'DATABASE_URL') {
        Write-Host "✅ DATABASE_URL: DEFINED" -ForegroundColor Green
    } else {
        Write-Host "❌ DATABASE_URL: NOT DEFINED" -ForegroundColor Red
        $issues += "DATABASE_URL chưa được define trong .env"
    }
    if ($envContent -match 'JWT_SECRET') {
        Write-Host "✅ JWT_SECRET: DEFINED" -ForegroundColor Green
    } else {
        Write-Host "❌ JWT_SECRET: NOT DEFINED" -ForegroundColor Red
        $issues += "JWT_SECRET chưa được define trong .env"
    }
} else {
    Write-Host "❌ .env file: NOT FOUND" -ForegroundColor Red
    $issues += ".env file không tồn tại"
}

Write-Host ""

# 5. Test Login Endpoint
Write-Host "=== 5. KIỂM TRA LOGIN ENDPOINT ===" -ForegroundColor Yellow
if ($backendRunning) {
    try {
        $body = @{
            employeeCode = "AM01"
            password = "admin123"
        } | ConvertTo-Json
        
        $response = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" -Method POST -Body $body -ContentType "application/json" -TimeoutSec 5 -ErrorAction Stop
        Write-Host "✅ Login Endpoint: HOẠT ĐỘNG" -ForegroundColor Green
        Write-Host "   User: $($response.user.name)" -ForegroundColor White
        Write-Host "   Role: $($response.user.role)" -ForegroundColor White
    } catch {
        $statusCode = if ($_.Exception.Response) { 
            $_.Exception.Response.StatusCode.value__ 
        } else { 
            "Connection Failed" 
        }
        Write-Host "❌ Login Endpoint: FAILED" -ForegroundColor Red
        Write-Host "   Status: $statusCode" -ForegroundColor White
        if ($statusCode -eq 404) {
            $issues += "Route /api/auth/login không tìm thấy"
        } elseif ($statusCode -eq 400) {
            Write-Host "   → Có thể user AM01 không tồn tại hoặc password sai" -ForegroundColor Yellow
        }
    }
} else {
    Write-Host "⚠️  Login Endpoint: Không thể test (backend chưa chạy)" -ForegroundColor Yellow
}

Write-Host ""

# 6. Check Files
Write-Host "=== 6. KIỂM TRA FILES ===" -ForegroundColor Yellow
$setupProxyPath = Join-Path $rootDir ".." "client" "src" "setupProxy.js"
if (Test-Path $setupProxyPath) {
    Write-Host "✅ setupProxy.js: EXISTS" -ForegroundColor Green
} else {
    Write-Host "❌ setupProxy.js: NOT FOUND" -ForegroundColor Red
    $issues += "setupProxy.js không tồn tại"
}

$configOverridesPath = Join-Path $rootDir ".." "client" "config-overrides.js"
if (Test-Path $configOverridesPath) {
    Write-Host "✅ config-overrides.js: EXISTS" -ForegroundColor Green
} else {
    Write-Host "❌ config-overrides.js: NOT FOUND" -ForegroundColor Red
    $issues += "config-overrides.js không tồn tại"
}

Write-Host ""

# Summary
Write-Host "╔═══════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║                    TỔNG KẾT                               ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

if ($issues.Count -eq 0) {
    Write-Host "✅ TẤT CẢ ĐỀU OK! Hệ thống sẵn sàng!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📝 Hướng dẫn login:" -ForegroundColor Cyan
    if ($frontendPort) {
        Write-Host "   1. Mở browser: http://localhost:$frontendPort" -ForegroundColor White
    } else {
        Write-Host "   1. Start frontend: cd client && npm start" -ForegroundColor White
    }
    Write-Host "   2. Login với: AM01 / admin123" -ForegroundColor White
    exit 0
} else {
    Write-Host "❌ TÌM THẤY $($issues.Count) VẤN ĐỀ:" -ForegroundColor Red
    for ($i = 0; $i -lt $issues.Count; $i++) {
        Write-Host "   $($i + 1). $($issues[$i])" -ForegroundColor Yellow
    }
    Write-Host ""
    Write-Host "💡 GIẢI PHÁP:" -ForegroundColor Cyan
    Write-Host ""
    
    if ($issues -contains "Backend không chạy trên port 5000") {
        Write-Host "1. START BACKEND:" -ForegroundColor Yellow
        Write-Host "   cd D:\newNCSKITORG\newNCSkit\AM_BS" -ForegroundColor Cyan
        Write-Host "   node server.js" -ForegroundColor Cyan
        Write-Host ""
    }
    
    if ($issues -contains "Frontend không chạy") {
        Write-Host "2. START FRONTEND:" -ForegroundColor Yellow
        Write-Host "   cd client" -ForegroundColor Cyan
        Write-Host "   npm start" -ForegroundColor Cyan
        Write-Host ""
    }
    
    if ($issues -contains "Proxy không hoạt động - setupProxy.js chưa được load") {
        Write-Host "3. FIX PROXY:" -ForegroundColor Yellow
        Write-Host "   - Dừng frontend (Ctrl+C)" -ForegroundColor White
        Write-Host "   - Xóa cache: Remove-Item -Recurse -Force node_modules\.cache" -ForegroundColor White
        Write-Host "   - Restart: npm start" -ForegroundColor White
        Write-Host ""
    }
    
    Write-Host "HOẶC dùng script start cả hai:" -ForegroundColor Yellow
    Write-Host "   .\scripts\start-all.ps1" -ForegroundColor Cyan
    Write-Host ""
    
    exit 1
}

