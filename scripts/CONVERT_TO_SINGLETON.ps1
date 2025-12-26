# Script to convert all Prisma files to use singleton pattern
# This replaces "const prisma = new PrismaClient()" with singleton import

$files = @()

# Get all JS files in prisma/ and scripts/ directories
$files += Get-ChildItem -Path "DMS\backend\prisma\*.js" -File
$files += Get-ChildItem -Path "DMS\backend\scripts\*.js" -File

$totalFiles = $files.Count
$updatedFiles = 0
$skippedFiles = 0

Write-Host "Found $totalFiles files to process..." -ForegroundColor Cyan
Write-Host ""

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    
    # Check if file already uses singleton
    if ($content -match "from ['\`"]\.\.\/lib\/prisma\.js['\`"]" -or 
        $content -match "from ['\`"]\.\.\/\.\.\/lib\/prisma\.js['\`"]") {
        Write-Host "SKIP: $($file.Name) - Already using singleton" -ForegroundColor Yellow
        $skippedFiles++
        continue
    }
    
    # Check if file creates new PrismaClient
    if ($content -notmatch "const prisma = new PrismaClient\(\)") {
        Write-Host "SKIP: $($file.Name) - No PrismaClient instantiation found" -ForegroundColor Gray
        $skippedFiles++
        continue
    }
    
    # Determine correct import path based on directory
    $importPath = if ($file.DirectoryName -like "*\prisma") {
        "../lib/prisma.js"
    } else {
        "../lib/prisma.js"
    }
    
    # Replace PrismaClient import
    $content = $content -replace "import \{ PrismaClient \} from '@prisma/client';", "import { prisma } from '$importPath';"
    $content = $content -replace 'import \{ PrismaClient \} from "@prisma/client";', "import { prisma } from '$importPath';"
    $content = $content -replace "const \{ PrismaClient \} = require\('@prisma/client'\);", "const { prisma } = require('$importPath');"
    
    # Remove the line creating new PrismaClient
    $content = $content -replace "const prisma = new PrismaClient\(\);[\r\n]*", ""
    
    # Write back to file
    Set-Content -Path $file.FullName -Value $content -NoNewline
    
    Write-Host "UPDATE: $($file.Name)" -ForegroundColor Green
    $updatedFiles++
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Conversion Complete!" -ForegroundColor Green
Write-Host "Total files: $totalFiles" -ForegroundColor White
Write-Host "Updated: $updatedFiles" -ForegroundColor Green
Write-Host "Skipped: $skippedFiles" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
