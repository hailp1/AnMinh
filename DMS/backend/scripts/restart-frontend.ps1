Write-Host "`n=== RESTART FRONTEND ===" -ForegroundColor Cyan
Write-Host ""

# 1. Dừng các process Node.js liên quan đến Frontend
Write-Host "1. Dừng các process Frontend cũ..." -ForegroundColor Yellow
$nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object {
    $_.Path -like "*node.exe*"
}
if ($nodeProcesses) {
    Write-Host "   Tìm thấy $($nodeProcesses.Count) process Node.js" -ForegroundColor Gray
    foreach ($proc in $nodeProcesses) {
        try {
            Stop-Process -Id $proc.Id -Force -ErrorAction SilentlyContinue
            Write-Host "   ✅ Đã dừng process: $($proc.Id)" -ForegroundColor Green
        } catch {
            # Ignore errors
        }
    }
    Start-Sleep -Seconds 2
} else {
    Write-Host "   ℹ️  Không có process Frontend nào đang chạy" -ForegroundColor Gray
}

# 2. Xóa cache
Write-Host "`n2. Xóa cache Frontend..." -ForegroundColor Yellow
$cachePath = "client\node_modules\.cache"
if (Test-Path $cachePath) {
    try {
        Remove-Item -Path $cachePath -Recurse -Force -ErrorAction Stop
        Write-Host "   ✅ Đã xóa cache" -ForegroundColor Green
    } catch {
        Write-Host "   ⚠️  Không thể xóa cache: $($_.Exception.Message)" -ForegroundColor Yellow
    }
} else {
    Write-Host "   ℹ️  Không có cache để xóa" -ForegroundColor Gray
}

# 3. Start Frontend
Write-Host "`n3. Khởi động Frontend..." -ForegroundColor Yellow
Write-Host "   📍 Đang chuyển đến thư mục client..." -ForegroundColor Gray

Set-Location -Path "client"

Write-Host "   🚀 Chạy: npm start" -ForegroundColor Cyan
Write-Host ""
Write-Host "   ⏳ Đợi Frontend compile (30-60 giây)..." -ForegroundColor Yellow
Write-Host "   📋 Tìm dòng: 'Compiled successfully!'" -ForegroundColor Yellow
Write-Host "   📋 Tìm dòng: '[Config] ✅✅✅ setupProxy.js loaded'" -ForegroundColor Yellow
Write-Host ""

# Start Frontend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm start" -WorkingDirectory (Get-Location)

Set-Location -Path ".."

Write-Host "✅ Đã mở terminal mới để chạy Frontend!" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Kiểm tra:" -ForegroundColor Cyan
Write-Host "   1. Terminal mới sẽ hiển thị logs của Frontend" -ForegroundColor White
Write-Host "   2. Đợi 'Compiled successfully!'" -ForegroundColor White
Write-Host "   3. Mở browser: http://localhost:3099" -ForegroundColor White
Write-Host ""
