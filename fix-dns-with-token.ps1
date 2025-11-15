# Fix DNS using Cloudflare API Token
$apiToken = "2qEWzGYrM1YzZRsedlgmNb08ITIL06Ft46JAK1bB"
$Subdomain = "sales"
$Domain = "ammedtech.com"

Write-Host "=== Auto Fix DNS Error 1000 ===" -ForegroundColor Cyan
Write-Host ""

$headers = @{
    "Authorization" = "Bearer $apiToken"
    "Content-Type" = "application/json"
}

# Step 1: Get Zone ID
Write-Host "Step 1: Getting Zone ID..." -ForegroundColor Yellow
try {
    $zoneResponse = Invoke-RestMethod -Uri "https://api.cloudflare.com/client/v4/zones?name=$Domain" -Method GET -Headers $headers
    
    if ($zoneResponse.success -and $zoneResponse.result.Count -gt 0) {
        $zoneID = $zoneResponse.result[0].id
        Write-Host "✓ Zone ID: $zoneID" -ForegroundColor Green
    } else {
        Write-Host "✗ Failed to get Zone ID" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "✗ Error: $_" -ForegroundColor Red
    exit 1
}

# Step 2: Delete incorrect DNS records
Write-Host ""
Write-Host "Step 2: Checking and fixing DNS records..." -ForegroundColor Yellow
try {
    $dnsResponse = Invoke-RestMethod -Uri "https://api.cloudflare.com/client/v4/zones/$zoneID/dns_records?name=$Subdomain.$Domain" -Method GET -Headers $headers
    
    if ($dnsResponse.success -and $dnsResponse.result.Count -gt 0) {
        foreach ($record in $dnsResponse.result) {
            Write-Host "  Found: Type=$($record.type), Name=$($record.name), Content=$($record.content)" -ForegroundColor Gray
            
            if ($record.type -eq "A" -or ($record.type -eq "CNAME" -and $record.content -notlike "*.cfargotunnel.com")) {
                Write-Host "  ✗ Deleting incorrect record..." -ForegroundColor Red
                try {
                    $deleteResponse = Invoke-RestMethod -Uri "https://api.cloudflare.com/client/v4/zones/$zoneID/dns_records/$($record.id)" -Method DELETE -Headers $headers
                    if ($deleteResponse.success) {
                        Write-Host "  ✓ Deleted successfully" -ForegroundColor Green
                    }
                } catch {
                    Write-Host "  ✗ Error deleting: $_" -ForegroundColor Red
                }
            } else {
                Write-Host "  ✓ Correct CNAME record" -ForegroundColor Green
            }
        }
    } else {
        Write-Host "  No existing DNS records found" -ForegroundColor Yellow
    }
} catch {
    Write-Host "  ✗ Error: $_" -ForegroundColor Red
}

# Step 3: Configure Tunnel Public Hostname
Write-Host ""
Write-Host "Step 3: Configuring Tunnel Public Hostname..." -ForegroundColor Yellow
try {
    $accountResponse = Invoke-RestMethod -Uri "https://api.cloudflare.com/client/v4/accounts" -Method GET -Headers $headers
    
    if ($accountResponse.success -and $accountResponse.result.Count -gt 0) {
        $accountID = $accountResponse.result[0].id
        Write-Host "  ✓ Account ID: $accountID" -ForegroundColor Green
        
        $tunnelsResponse = Invoke-RestMethod -Uri "https://api.cloudflare.com/client/v4/accounts/$accountID/cfd_tunnel" -Method GET -Headers $headers
        
        if ($tunnelsResponse.success -and $tunnelsResponse.result.Count -gt 0) {
            $tunnel = $tunnelsResponse.result | Where-Object { $_.name -like "*sales*" -or $_.id -eq "5c7e692e-7c62-44da-a003-5c0ebda13477" } | Select-Object -First 1
            
            if ($tunnel) {
                $tunnelID = $tunnel.id
                Write-Host "  ✓ Found tunnel: $($tunnel.name) ($tunnelID)" -ForegroundColor Green
                
                $configResponse = Invoke-RestMethod -Uri "https://api.cloudflare.com/client/v4/accounts/$accountID/cfd_tunnel/$tunnelID/configurations" -Method GET -Headers $headers
                
                if ($configResponse.success) {
                    $config = $configResponse.result.config
                    $hostnameExists = $false
                    $ingressArray = @()
                    
                    if ($config.ingress) {
                        foreach ($ingress in $config.ingress) {
                            if ($ingress.hostname -eq "$Subdomain.$Domain") {
                                $hostnameExists = $true
                                Write-Host "  ✓ Public Hostname already configured" -ForegroundColor Green
                                break
                            }
                            if ($ingress.service -ne "http_status:404") {
                                $ingressArray += $ingress
                            }
                        }
                    }
                    
                    if (-not $hostnameExists) {
                        Write-Host "  Adding Public Hostname..." -ForegroundColor Yellow
                        
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
                            Write-Host "  ✓ Public Hostname configured successfully!" -ForegroundColor Green
                            Write-Host "  ✓ DNS record will be created automatically" -ForegroundColor Green
                        } else {
                            Write-Host "  ✗ Failed: $($updateResponse.errors | ConvertTo-Json)" -ForegroundColor Red
                        }
                    }
                }
            } else {
                Write-Host "  ⚠ Tunnel not found" -ForegroundColor Yellow
            }
        }
    }
} catch {
    Write-Host "  ✗ Error: $_" -ForegroundColor Red
}

Write-Host ""
Write-Host "=== Fix Complete ===" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Wait 5-10 minutes for DNS to propagate" -ForegroundColor White
Write-Host "2. Clear DNS cache: ipconfig /flushdns" -ForegroundColor White
Write-Host "3. Try: https://sales.ammedtech.com" -ForegroundColor White
Write-Host ""

