# Fix DNS Error 1000 - Final Version
$apiToken = "2qEWzGYrM1YzZRsedlgmNb08ITIL06Ft46JAK1bB"
$Subdomain = "sales"
$Domain = "ammedtech.com"

Write-Host "=== Auto Fix DNS Error 1000 ===" -ForegroundColor Cyan
Write-Host ""

$headers = @{
    "Authorization" = "Bearer $apiToken"
    "Content-Type" = "application/json"
}

# Get Zone ID
Write-Host "Getting Zone ID..." -ForegroundColor Yellow
$zoneResponse = Invoke-RestMethod -Uri "https://api.cloudflare.com/client/v4/zones?name=$Domain" -Method GET -Headers $headers

if ($zoneResponse.success -and $zoneResponse.result.Count -gt 0) {
    $zoneID = $zoneResponse.result[0].id
    Write-Host "Zone ID: $zoneID" -ForegroundColor Green
} else {
    Write-Host "Failed to get Zone ID" -ForegroundColor Red
    exit 1
}

# Delete wrong DNS records
Write-Host ""
Write-Host "Checking DNS records..." -ForegroundColor Yellow
$dnsResponse = Invoke-RestMethod -Uri "https://api.cloudflare.com/client/v4/zones/$zoneID/dns_records?name=$Subdomain.$Domain" -Method GET -Headers $headers

if ($dnsResponse.success -and $dnsResponse.result.Count -gt 0) {
    foreach ($record in $dnsResponse.result) {
        Write-Host "Found: $($record.type) - $($record.name) -> $($record.content)" -ForegroundColor Gray
        
        $shouldDelete = $false
        if ($record.type -eq "A") {
            $shouldDelete = $true
        }
        if ($record.type -eq "CNAME" -and $record.content -notlike "*.cfargotunnel.com") {
            $shouldDelete = $true
        }
        
        if ($shouldDelete) {
            Write-Host "Deleting..." -ForegroundColor Red
            $deleteResponse = Invoke-RestMethod -Uri "https://api.cloudflare.com/client/v4/zones/$zoneID/dns_records/$($record.id)" -Method DELETE -Headers $headers
            if ($deleteResponse.success) {
                Write-Host "Deleted successfully" -ForegroundColor Green
            }
        }
    }
}

# Configure Tunnel
Write-Host ""
Write-Host "Configuring Tunnel..." -ForegroundColor Yellow
$accountResponse = Invoke-RestMethod -Uri "https://api.cloudflare.com/client/v4/accounts" -Method GET -Headers $headers

if ($accountResponse.success -and $accountResponse.result.Count -gt 0) {
    $accountID = $accountResponse.result[0].id
    Write-Host "Account ID: $accountID" -ForegroundColor Green
    
    $tunnelsResponse = Invoke-RestMethod -Uri "https://api.cloudflare.com/client/v4/accounts/$accountID/cfd_tunnel" -Method GET -Headers $headers
    
    if ($tunnelsResponse.success -and $tunnelsResponse.result.Count -gt 0) {
        $tunnel = $tunnelsResponse.result | Where-Object { $_.name -like "*sales*" -or $_.id -eq "5c7e692e-7c62-44da-a003-5c0ebda13477" } | Select-Object -First 1
        
        if ($tunnel) {
            $tunnelID = $tunnel.id
            Write-Host "Found tunnel: $($tunnel.name)" -ForegroundColor Green
            
            $configResponse = Invoke-RestMethod -Uri "https://api.cloudflare.com/client/v4/accounts/$accountID/cfd_tunnel/$tunnelID/configurations" -Method GET -Headers $headers
            
            if ($configResponse.success) {
                $config = $configResponse.result.config
                $hostnameExists = $false
                $ingressArray = @()
                
                if ($config.ingress) {
                    foreach ($ingress in $config.ingress) {
                        if ($ingress.hostname -eq "$Subdomain.$Domain") {
                            $hostnameExists = $true
                            Write-Host "Public Hostname already configured" -ForegroundColor Green
                            break
                        }
                        if ($ingress.service -ne "http_status:404") {
                            $ingressArray += $ingress
                        }
                    }
                }
                
                if (-not $hostnameExists) {
                    Write-Host "Adding Public Hostname..." -ForegroundColor Yellow
                    
                    $newHostname = @{
                        hostname = "$Subdomain.$Domain"
                        service = "http://frontend:80"
                    }
                    $ingressArray += $newHostname
                    
                    $catchAll = @{
                        service = "http_status:404"
                    }
                    $ingressArray += $catchAll
                    
                    $updateBody = @{
                        config = @{
                            ingress = $ingressArray
                        }
                    } | ConvertTo-Json -Depth 10
                    
                    $updateResponse = Invoke-RestMethod -Uri "https://api.cloudflare.com/client/v4/accounts/$accountID/cfd_tunnel/$tunnelID/configurations" -Method PUT -Headers $headers -Body $updateBody
                    
                    if ($updateResponse.success) {
                        Write-Host "Public Hostname configured successfully!" -ForegroundColor Green
                        Write-Host "DNS record will be created automatically" -ForegroundColor Green
                    } else {
                        Write-Host "Failed: $($updateResponse.errors | ConvertTo-Json)" -ForegroundColor Red
                    }
                }
            }
        }
    }
}

Write-Host ""
Write-Host "=== Complete ===" -ForegroundColor Green
Write-Host "Wait 5-10 minutes, then try: https://sales.ammedtech.com" -ForegroundColor Cyan

