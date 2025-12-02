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

Write-Host "Backing up PROD to DMS_BACKUP..."
if (Test-Path "DMS_BACKUP") { Remove-Item "DMS_BACKUP" -Recurse -Force }
New-Item -ItemType Directory -Path "DMS_BACKUP\DMS" | Out-Null
New-Item -ItemType Directory -Path "DMS_BACKUP\home" | Out-Null

Copy-Filtered -src "DMS" -dest "DMS_BACKUP\DMS"
Copy-Filtered -src "home" -dest "DMS_BACKUP\home"

Write-Host "Updating PROD from PRE_AMMED..."
Copy-Filtered -src "PRE_AMMED\DMS" -dest "DMS"
Copy-Filtered -src "PRE_AMMED\home" -dest "home"

Write-Host "Done. Please restart PROD containers if needed."
