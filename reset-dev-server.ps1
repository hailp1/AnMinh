# Script to reset dev server and clear localStorage
Write-Host "🔄 Resetting Dev Server and Clearing localStorage..." -ForegroundColor Yellow

# Step 1: Clear localStorage (via browser console command)
Write-Host "`n📋 Hướng dẫn xóa localStorage:" -ForegroundColor Cyan
Write-Host "1. Mở trình duyệt và vào trang admin: http://localhost:3099/admin/reset" -ForegroundColor White
Write-Host "2. Hoặc mở Console (F12) và chạy lệnh:" -ForegroundColor White
Write-Host "   localStorage.clear()" -ForegroundColor Green
Write-Host "   location.reload()" -ForegroundColor Green

# Step 2: Stop any running Node processes
Write-Host "`n🛑 Đang dừng các process Node.js..." -ForegroundColor Yellow
$nodeProcesses = Get-Process | Where-Object {$_.ProcessName -like "*node*"}
if ($nodeProcesses) {
    $nodeProcesses | ForEach-Object {
        Write-Host "   Đang dừng process: $($_.ProcessName) (ID: $($_.Id))" -ForegroundColor Gray
        Stop-Process -Id $_.Id -Force -ErrorAction SilentlyContinue
    }
    Start-Sleep -Seconds 2
    Write-Host "✅ Đã dừng tất cả Node.js processes" -ForegroundColor Green
} else {
    Write-Host "ℹ️  Không có Node.js process nào đang chạy" -ForegroundColor Gray
}

# Step 3: Clear npm cache (optional)
Write-Host "`n🧹 Đang xóa npm cache..." -ForegroundColor Yellow
Set-Location client
npm cache clean --force 2>&1 | Out-Null
Write-Host "✅ Đã xóa npm cache" -ForegroundColor Green

# Step 4: Start dev server
Write-Host "`n🚀 Đang khởi động lại dev server..." -ForegroundColor Yellow
Write-Host "   Port: 3099" -ForegroundColor Gray
Start-Sleep -Seconds 1

# Start server in background
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; npm start" -WindowStyle Normal

Write-Host "`n✅ Hoàn tất!" -ForegroundColor Green
Write-Host "`n📝 Lưu ý:" -ForegroundColor Cyan
Write-Host "   - Dev server đang chạy trên port 3099" -ForegroundColor White
Write-Host "   - Vào http://localhost:3099/admin/reset để xóa localStorage" -ForegroundColor White
Write-Host "   - Hoặc mở Console (F12) và chạy: localStorage.clear()" -ForegroundColor White

Set-Location ..

