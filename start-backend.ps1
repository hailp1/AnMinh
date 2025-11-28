# Backend Server Startup Script
cd $PSScriptRoot
Write-Host "=== BACKEND SERVER (Port 5000) ===" -ForegroundColor Green
Write-Host ""
Write-Host "Starting backend server..." -ForegroundColor Yellow
Write-Host ""

# Check .env file
if (Test-Path .env) {
    Write-Host "✅ .env file: EXISTS" -ForegroundColor Green
} else {
    Write-Host "❌ .env file: NOT FOUND" -ForegroundColor Red
    Write-Host "   ➜ Tạo file .env với DATABASE_URL và JWT_SECRET" -ForegroundColor Yellow
}

Write-Host ""
node server.js

