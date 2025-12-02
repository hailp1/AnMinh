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

Write-Host "Copying DMS..."
Copy-Filtered -src "DMS" -dest "PRE_AMMED\DMS"
Write-Host "Copying home..."
Copy-Filtered -src "home" -dest "PRE_AMMED\home"

# Do NOT overwrite docker-compose.yml if it exists, as it has custom PRE config
if (!(Test-Path "PRE_AMMED\docker-compose.yml")) {
    Write-Host "Copying docker-compose.yml..."
    Copy-Item "docker-compose.yml" "PRE_AMMED\"
}
else {
    Write-Host "Skipping docker-compose.yml (already exists)"
}

if (Test-Path ".env") { Copy-Item ".env" "PRE_AMMED\" -Force }
Write-Host "Done."
