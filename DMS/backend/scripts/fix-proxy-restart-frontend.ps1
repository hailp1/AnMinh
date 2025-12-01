# Fix Proxy - Restart Frontend Script
param(
    [switch]$Force
)

$rootDir = Split-Path -Parent $PSScriptRoot
$clientDir = Join-Path $rootDir "client"

Write-Host "`n╔═══════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║     FIX PROXY - RESTART FRONTEND                          ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

# Stop existing frontend
Write-Host "[1/4] Dừng frontend cũ..." -ForegroundColor Yellow
$frontendPorts = @(3099, 3100, 3101, 3000)
$frontendProcesses = Get-Process -Name node -ErrorAction SilentlyContinue | Where-Object {
    $processPorts = Get-NetTCPConnection -OwningProcess $_.Id -State Listen -ErrorAction SilentlyContinue | 
                     Select-Object -ExpandProperty LocalPort
    ($processPorts | Where-Object { $_ -in $frontendPorts }).Count -gt 0
}

if ($frontendProcesses) {
    Write-Host "   Đang dừng $($frontendProcesses.Count) process(es)..." -ForegroundColor Gray
    $frontendProcesses | Stop-Process -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 2
    Write-Host "   ✅ Đã dừng xong" -ForegroundColor Green
} else {
    Write-Host "   ✅ Không có process nào đang chạy" -ForegroundColor Green
}

Write-Host ""

# Clear cache
Write-Host "[2/4] Xóa cache..." -ForegroundColor Yellow
$cacheDir = Join-Path $clientDir "node_modules\.cache"
if (Test-Path $cacheDir) {
    try {
        Remove-Item -Path $cacheDir -Recurse -Force -ErrorAction Stop
        Write-Host "   ✅ Đã xóa cache" -ForegroundColor Green
    } catch {
        Write-Host "   ⚠️  Không thể xóa cache: $($_.Exception.Message)" -ForegroundColor Yellow
    }
} else {
    Write-Host "   ✅ Không có cache" -ForegroundColor Green
}

Write-Host ""

# Check files
Write-Host "[3/4] Kiểm tra files..." -ForegroundColor Yellow
$setupProxyPath = Join-Path $clientDir "src\setupProxy.js"
$configOverridesPath = Join-Path $clientDir "config-overrides.js"

if (Test-Path $setupProxyPath) {
    Write-Host "   ✅ setupProxy.js: EXISTS" -ForegroundColor Green
} else {
    Write-Host "   ❌ setupProxy.js: NOT FOUND" -ForegroundColor Red
    Write-Host "   → Tạo file setupProxy.js?" -ForegroundColor Yellow
}

if (Test-Path $configOverridesPath) {
    Write-Host "   ✅ config-overrides.js: EXISTS" -ForegroundColor Green
} else {
    Write-Host "   ❌ config-overrides.js: NOT FOUND" -ForegroundColor Red
    Write-Host "   → Tạo file config-overrides.js?" -ForegroundColor Yellow
}

Write-Host ""

# Start frontend
Write-Host "[4/4] Khởi động Frontend Server..." -ForegroundColor Yellow
Set-Location $clientDir
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$clientDir'; Write-Host '=== FRONTEND SERVER (FIX PROXY) ===' -ForegroundColor Green; Write-Host ''; npm start" -WindowStyle Normal

Write-Host ""
Write-Host "╔═══════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║     FIX HOÀN TẤT!                                        ║" -ForegroundColor Green
Write-Host "╚═══════════════════════════════════════════════════════════╝`n" -ForegroundColor Green

Write-Host "✅ Frontend đã được khởi động lại" -ForegroundColor Green
Write-Host ""
Write-Host "📝 KIỂM TRA TRONG TERMINAL FRONTEND:" -ForegroundColor Cyan
Write-Host "   - Tìm log: '[Config] ✅ setupProxy.js loaded successfully'" -ForegroundColor White
Write-Host "   - Tìm log: '[Config] 📡 Proxy configured: /api -> http://localhost:5000'" -ForegroundColor White
Write-Host ""
Write-Host "🔍 NẾU KHÔNG THẤY LOGS:" -ForegroundColor Yellow
Write-Host "   1. Đợi compile xong (30-60 giây)" -ForegroundColor White
Write-Host "   2. Restart lại một lần nữa" -ForegroundColor White
Write-Host ""
Write-Host "💡 SAU KHI COMPILE XONG:" -ForegroundColor Cyan
Write-Host "   - Test login trong browser: http://localhost:3099" -ForegroundColor White
Write-Host "   - Hoặc test lại: node scripts/test-full-fix-all.js" -ForegroundColor White
Write-Host ""

