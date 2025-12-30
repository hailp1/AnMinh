# Start All Servers Script
param(
    [switch]$Wait
)

# Get the root directory (parent of scripts/)
$rootDir = Split-Path -Parent $PSScriptRoot
cd $rootDir

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  AN MINH BUSINESS SYSTEM - START ALL" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Stop existing backend if running
Write-Host "Kiểm tra backend cũ..." -ForegroundColor Gray
$backendProcesses = Get-Process -Name node -ErrorAction SilentlyContinue | Where-Object {
    (Get-NetTCPConnection -OwningProcess $_.Id -State Listen -ErrorAction SilentlyContinue | 
     Where-Object { $_.LocalPort -eq 5000 }).Count -gt 0
}
if ($backendProcesses) {
    Write-Host "🛑 Dừng backend cũ..." -ForegroundColor Yellow
    $backendProcesses | Stop-Process -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 2
}

# Check .env file
if (!(Test-Path .env)) {
    Write-Host "❌ .env file không tồn tại!" -ForegroundColor Red
    Write-Host "   Tạo file .env với DATABASE_URL và JWT_SECRET" -ForegroundColor Yellow
    exit 1
}

Write-Host "[1/2] Starting Backend Server (Port 5000)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$rootDir'; Write-Host '=== BACKEND SERVER (Port 5000) ===' -ForegroundColor Green; Write-Host ''; node server.js" -WindowStyle Normal

Write-Host ""
Write-Host "Đợi backend khởi động (5 giây)..." -ForegroundColor Gray
Start-Sleep -Seconds 5

# Check backend health
Write-Host ""
Write-Host "Đang kiểm tra backend..." -ForegroundColor Cyan
try {
    $response = Invoke-RestMethod -Uri "http://localhost:5000/api" -Method GET -TimeoutSec 3 -ErrorAction Stop
    Write-Host "✅ Backend: RUNNING" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Backend: Chưa sẵn sàng (vẫn đang khởi động)" -ForegroundColor Yellow
    Write-Host "   Đợi thêm vài giây..." -ForegroundColor Gray
    Start-Sleep -Seconds 3
}

# Stop existing frontend if running
Write-Host ""
Write-Host "Kiểm tra frontend cũ..." -ForegroundColor Gray
$frontendPorts = @(3099, 3100, 3101, 3000)
$frontendProcesses = Get-Process -Name node -ErrorAction SilentlyContinue | Where-Object {
    $processPorts = Get-NetTCPConnection -OwningProcess $_.Id -State Listen -ErrorAction SilentlyContinue | 
                     Select-Object -ExpandProperty LocalPort
    ($processPorts | Where-Object { $_ -in $frontendPorts }).Count -gt 0
}
if ($frontendProcesses) {
    Write-Host "🛑 Dừng frontend cũ..." -ForegroundColor Yellow
    $frontendProcesses | Stop-Process -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 2
}

Write-Host ""
Write-Host "[2/2] Starting Frontend Server (Port 3099)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$rootDir\client'; Write-Host '=== FRONTEND SERVER (Port 3099) ===' -ForegroundColor Green; Write-Host ''; npm start" -WindowStyle Normal

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Servers đang khởi động..." -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "✅ Backend:  http://localhost:5000" -ForegroundColor Green
Write-Host "✅ Frontend: http://localhost:3099" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Đợi compile xong:" -ForegroundColor Cyan
Write-Host "   - Backend: Tìm dòng 'Server đang chạy trên port 5000'" -ForegroundColor White
Write-Host "   - Frontend: Tìm dòng 'Compiled successfully!'" -ForegroundColor White
Write-Host ""
Write-Host "🔑 Sau đó test login:" -ForegroundColor Cyan
Write-Host "   Employee Code: AM01" -ForegroundColor White
Write-Host "   Password: admin123" -ForegroundColor White
Write-Host ""

if ($Wait) {
    Write-Host "Nhấn phím bất kỳ để thoát..." -ForegroundColor Gray
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
}

