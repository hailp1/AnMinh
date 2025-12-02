$exclude = @('node_modules', '.next', 'build', 'dist', 'coverage', '.git')

function Copy-Filtered {
    param($src, $dest)
    if (!(Test-Path $dest)) { New-Item -ItemType Directory -Path $dest | Out-Null }
    Get-ChildItem $src | ForEach-Object {
        if ($exclude -notcontains $_.Name) {
            if ($_.PSIsContainer) {
                Copy-Filtered -src $_.FullName -dest (Join-Path $dest $_.Name)
            }
            else {
                Copy-Item $_.FullName -Destination $dest -Force
            }
        }
    }
}

Write-Host "Restoring PROD from DMS_BACKUP..."
if (!(Test-Path "DMS_BACKUP")) {
    Write-Error "No backup found!"
    exit 1
}

Copy-Filtered -src "DMS_BACKUP\DMS" -dest "DMS"
Copy-Filtered -src "DMS_BACKUP\home" -dest "home"

Write-Host "Done. Please restart PROD containers."
