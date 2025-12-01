# Check and Start PostgreSQL Service Script

Write-Host "`n╔═══════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║     CHECK & START POSTGRESQL SERVICE                      ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

Write-Host "=== 1. KIỂM TRA POSTGRESQL SERVICE ===" -ForegroundColor Yellow
Write-Host ""

$postgresServices = Get-Service | Where-Object { $_.Name -like '*postgres*' }

if ($postgresServices.Count -eq 0) {
    Write-Host "❌ Không tìm thấy PostgreSQL service" -ForegroundColor Red
    Write-Host ""
    Write-Host "💡 PostgreSQL chưa được cài đặt hoặc tên service khác" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "GIẢI PHÁP:" -ForegroundColor Cyan
    Write-Host "1. Kiểm tra PostgreSQL đã được cài đặt chưa" -ForegroundColor White
    Write-Host "2. HOẶC kiểm tra tên service khác:" -ForegroundColor White
    Write-Host "   Get-Service | Where-Object {`$_.DisplayName -like '*PostgreSQL*'}" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "3. Nếu chưa cài, tải PostgreSQL:" -ForegroundColor White
    Write-Host "   https://www.postgresql.org/download/windows/" -ForegroundColor Cyan
    Write-Host ""
    exit 1
}

Write-Host "✅ Tìm thấy $($postgresServices.Count) PostgreSQL service(s):" -ForegroundColor Green
$postgresServices | ForEach-Object {
    $status = if ($_.Status -eq 'Running') { 'RUNNING' } else { 'STOPPED' }
    $color = if ($_.Status -eq 'Running') { 'Green' } else { 'Red' }
    Write-Host "   - $($_.Name): $status" -ForegroundColor $color
    Write-Host "     DisplayName: $($_.DisplayName)" -ForegroundColor Gray
}

Write-Host ""

# Check if any is running
$runningServices = $postgresServices | Where-Object { $_.Status -eq 'Running' }

if ($runningServices.Count -eq 0) {
    Write-Host "=== 2. START POSTGRESQL SERVICE ===" -ForegroundColor Yellow
    Write-Host ""
    
    $serviceToStart = $postgresServices[0]
    Write-Host "⚠️  Tất cả PostgreSQL services đang STOPPED" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Đang start service: $($serviceToStart.Name)..." -ForegroundColor Cyan
    
    try {
        Start-Service -Name $serviceToStart.Name -ErrorAction Stop
        Start-Sleep -Seconds 3
        
        # Check again
        $service = Get-Service -Name $serviceToStart.Name
        if ($service.Status -eq 'Running') {
            Write-Host "✅ Service đã được start thành công!" -ForegroundColor Green
            Write-Host "   Service: $($service.Name)" -ForegroundColor White
            Write-Host "   Status: $($service.Status)" -ForegroundColor White
        } else {
            Write-Host "❌ Service vẫn chưa chạy (Status: $($service.Status))" -ForegroundColor Red
            Write-Host "   → Kiểm tra logs hoặc start thủ công" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "❌ Không thể start service: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host ""
        Write-Host "💡 Có thể cần quyền Administrator:" -ForegroundColor Yellow
        Write-Host "   - Chạy PowerShell as Administrator" -ForegroundColor White
        Write-Host "   - HOẶC start thủ công từ Services (services.msc)" -ForegroundColor White
        Write-Host ""
    }
} else {
    Write-Host "✅ PostgreSQL service đang RUNNING!" -ForegroundColor Green
    Write-Host "   Service: $($runningServices[0].Name)" -ForegroundColor White
}

Write-Host ""

# Test connection
Write-Host "=== 3. TEST DATABASE CONNECTION ===" -ForegroundColor Yellow
Write-Host ""
Write-Host "Đang test connection..." -ForegroundColor Cyan
Start-Sleep -Seconds 2

try {
    $result = node scripts/check-user-am01.js 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Database connection: SUCCESS!" -ForegroundColor Green
        Write-Host $result -ForegroundColor White
    } else {
        Write-Host "❌ Database connection: FAILED" -ForegroundColor Red
        Write-Host $result -ForegroundColor Red
        Write-Host ""
        Write-Host "💡 Có thể:" -ForegroundColor Yellow
        Write-Host "   1. Database chưa được tạo" -ForegroundColor White
        Write-Host "   2. Username/password sai trong DATABASE_URL" -ForegroundColor White
        Write-Host "   3. Database name sai" -ForegroundColor White
        Write-Host ""
    }
} catch {
    Write-Host "❌ Lỗi khi test connection: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

