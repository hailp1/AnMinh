# DMS Project Cleanup Script
# Removes temporary, test, and debug files

Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║         DMS PROJECT CLEANUP UTILITY                       ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

$deletedCount = 0
$totalSize = 0

# Files to delete (test/debug scripts)
$filesToDelete = @(
    "d:\AM_DMS\DMS\backend\assign_tdv020.js",
    "d:\AM_DMS\DMS\backend\check_admin_role.js",
    "d:\AM_DMS\DMS\backend\check_customers.js",
    "d:\AM_DMS\DMS\backend\check_tdv020.js",
    "d:\AM_DMS\DMS\backend\check_visits.js",
    "d:\AM_DMS\DMS\backend\fix_admin.js",
    "d:\AM_DMS\DMS\backend\fix_unassigned.js",
    "d:\AM_DMS\DMS\backend\test_warehouse.js",
    "d:\AM_DMS\DMS\backend\test_warehouse_api.js",
    "d:\AM_DMS\force_logout.js",
    "d:\AM_DMS\warehouse_test.txt",
    "d:\AM_DMS\visit_plans_report.txt",
    "d:\AM_DMS\tdv020_check.txt",
    "d:\AM_DMS\assign_result.txt",
    "d:\AM_DMS\critical_issues_report.txt"
)

Write-Host "🗑️  Scanning for temporary files..." -ForegroundColor Yellow
Write-Host ""

foreach ($file in $filesToDelete) {
    if (Test-Path $file) {
        $size = (Get-Item $file).Length
        $totalSize += $size
        $sizeKB = [math]::Round($size / 1KB, 2)
        
        Write-Host "  Deleting: $file ($sizeKB KB)" -ForegroundColor Gray
        Remove-Item $file -Force
        $deletedCount++
    }
}

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "✅ CLEANUP COMPLETE!" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  Files deleted: $deletedCount" -ForegroundColor White
Write-Host "  Space freed: $([math]::Round($totalSize / 1KB, 2)) KB" -ForegroundColor White
Write-Host ""

# Keep these important files
Write-Host "📝 KEPT (Production Files):" -ForegroundColor Green
$keepFiles = @(
    "server.js",
    "verify_critical_issues.js",
    "backup_database.bat",
    "SYSTEM_AUDIT_REPORT.md"
)
foreach ($file in $keepFiles) {
    Write-Host "  ✓ $file" -ForegroundColor Gray
}

Write-Host ""
Write-Host "Project is now clean! 🎉" -ForegroundColor Green
