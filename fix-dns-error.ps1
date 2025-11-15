# Fix DNS Error 1000 - DNS points to prohibited IP
# This script fixes the DNS configuration to use Cloudflare Tunnel

param(
    [Parameter(Mandatory=$true)]
    [string]$CloudflareEmail,
    
    [Parameter(Mandatory=$true)]
    [string]$CloudflareAPIKey,
    
    [Parameter(Mandatory=$false)]
    [string]$Subdomain = "sales",
    
    [Parameter(Mandatory=$false)]
    [string]$Domain = "ammedtech.com"
)

Write-Host "=== Fixing DNS Error 1000 ===" -ForegroundColor Cyan
Write-Host ""

# Step 1: Get Zone ID
Write-Host "Step 1: Getting Zone ID..." -ForegroundColor Yellow
try {
    $zoneResponse = Invoke-RestMethod -Uri "https://api.cloudflare.com/client/v4/zones?name=$Domain" `
        -Method GET `
        -Headers @{
            "X-Auth-Email" = $CloudflareEmail
            "X-Auth-Key" = $CloudflareAPIKey
            "Content-Type" = "application/json"
        }
    
    if ($zoneResponse.success -and $zoneResponse.result.Count -gt 0) {
        $zoneID = $zoneResponse.result[0].id
        Write-Host "✓ Zone ID: $zoneID" -ForegroundColor Green
    } else {
        Write-Host "✗ Failed to get Zone ID" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "✗ Error getting Zone ID: $_" -ForegroundColor Red
    exit 1
}

# Step 2: Check existing DNS records
Write-Host ""
Write-Host "Step 2: Checking existing DNS records..." -ForegroundColor Yellow
try {
    $dnsResponse = Invoke-RestMethod -Uri "https://api.cloudflare.com/client/v4/zones/$zoneID/dns_records?name=$Subdomain.$Domain" `
        -Method GET `
        -Headers @{
            "X-Auth-Email" = $CloudflareEmail
            "X-Auth-Key" = $CloudflareAPIKey
            "Content-Type" = "application/json"
        }
    
    if ($dnsResponse.success -and $dnsResponse.result.Count -gt 0) {
        Write-Host "Found $($dnsResponse.result.Count) DNS record(s):" -ForegroundColor Yellow
        foreach ($record in $dnsResponse.result) {
            Write-Host "  - Type: $($record.type), Name: $($record.name), Content: $($record.content)" -ForegroundColor Gray
            
            # Delete if it's A record or wrong CNAME
            if ($record.type -eq "A" -or ($record.type -eq "CNAME" -and $record.content -notlike "*.cfargotunnel.com")) {
                Write-Host "  ✗ Deleting incorrect record..." -ForegroundColor Red
                try {
                    $deleteResponse = Invoke-RestMethod -Uri "https://api.cloudflare.com/client/v4/zones/$zoneID/dns_records/$($record.id)" `
                        -Method DELETE `
                        -Headers @{
                            "X-Auth-Email" = $CloudflareEmail
                            "X-Auth-Key" = $CloudflareAPIKey
                            "Content-Type" = "application/json"
                        }
                    if ($deleteResponse.success) {
                        Write-Host "  ✓ Deleted" -ForegroundColor Green
                    }
                } catch {
                    Write-Host "  ✗ Error deleting: $_" -ForegroundColor Red
                }
            } else {
                Write-Host "  ✓ Correct CNAME record found" -ForegroundColor Green
            }
        }
    } else {
        Write-Host "No DNS records found for $Subdomain.$Domain" -ForegroundColor Yellow
    }
} catch {
    Write-Host "✗ Error checking DNS records: $_" -ForegroundColor Red
}

# Step 3: Get Account ID and Tunnel ID
Write-Host ""
Write-Host "Step 3: Getting Tunnel information..." -ForegroundColor Yellow
try {
    $accountResponse = Invoke-RestMethod -Uri "https://api.cloudflare.com/client/v4/accounts" `
        -Method GET `
        -Headers @{
            "X-Auth-Email" = $CloudflareEmail
            "X-Auth-Key" = $CloudflareAPIKey
            "Content-Type" = "application/json"
        }
    
    if ($accountResponse.success -and $accountResponse.result.Count -gt 0) {
        $accountID = $accountResponse.result[0].id
        Write-Host "✓ Account ID: $accountID" -ForegroundColor Green
        
        # Get tunnels
        $tunnelsResponse = Invoke-RestMethod -Uri "https://api.cloudflare.com/client/v4/accounts/$accountID/cfd_tunnel" `
            -Method GET `
            -Headers @{
                "X-Auth-Email" = $CloudflareEmail
                "X-Auth-Key" = $CloudflareAPIKey
                "Content-Type" = "application/json"
            }
        
        if ($tunnelsResponse.success -and $tunnelsResponse.result.Count -gt 0) {
            $tunnel = $tunnelsResponse.result | Where-Object { $_.name -like "*sales*" -or $_.id -eq "5c7e692e-7c62-44da-a003-5c0ebda13477" } | Select-Object -First 1
            if ($tunnel) {
                $tunnelID = $tunnel.id
                Write-Host "✓ Tunnel ID: $tunnelID" -ForegroundColor Green
                
                # Get tunnel configuration
                $tunnelConfigResponse = Invoke-RestMethod -Uri "https://api.cloudflare.com/client/v4/accounts/$accountID/cfd_tunnel/$tunnelID/configurations" `
                    -Method GET `
                    -Headers @{
                        "X-Auth-Email" = $CloudflareEmail
                        "X-Auth-Key" = $CloudflareAPIKey
                        "Content-Type" = "application/json"
                    }
                
                if ($tunnelConfigResponse.success) {
                    $config = $tunnelConfigResponse.result.config
                    Write-Host "✓ Tunnel configuration retrieved" -ForegroundColor Green
                    
                    # Check if hostname exists
                    $hostnameExists = $false
                    if ($config.ingress) {
                        foreach ($ingress in $config.ingress) {
                            if ($ingress.hostname -eq "$Subdomain.$Domain") {
                                $hostnameExists = $true
                                Write-Host "✓ Public Hostname already configured" -ForegroundColor Green
                                break
                            }
                        }
                    }
                    
                    # Add hostname if not exists
                    if (-not $hostnameExists) {
                        Write-Host ""
                        Write-Host "Step 4: Adding Public Hostname to tunnel..." -ForegroundColor Yellow
                        
                        $newIngress = @(
                            @{
                                hostname = "$Subdomain.$Domain"
                                service = "http://frontend:80"
                            }
                        )
                        
                        # Add catch-all if not exists
                        $hasCatchAll = $false
                        if ($config.ingress) {
                            foreach ($ingress in $config.ingress) {
                                if ($ingress.service -eq "http_status:404") {
                                    $hasCatchAll = $true
                                    break
                                }
                            }
                            if (-not $hasCatchAll) {
                                $newIngress += @{
                                    service = "http_status:404"
                                }
                            }
                        } else {
                            $newIngress += @{
                                service = "http_status:404"
                            }
                        }
                        
                        $updateBody = @{
                            config = @{
                                ingress = $newIngress
                            }
                        } | ConvertTo-Json -Depth 10
                        
                        $updateResponse = Invoke-RestMethod -Uri "https://api.cloudflare.com/client/v4/accounts/$accountID/cfd_tunnel/$tunnelID/configurations" `
                            -Method PUT `
                            -Headers @{
                                "X-Auth-Email" = $CloudflareEmail
                                "X-Auth-Key" = $CloudflareAPIKey
                                "Content-Type" = "application/json"
                            } `
                            -Body $updateBody
                        
                        if ($updateResponse.success) {
                            Write-Host "✓ Public Hostname added successfully!" -ForegroundColor Green
                            Write-Host "✓ DNS record will be created automatically" -ForegroundColor Green
                        } else {
                            Write-Host "✗ Failed to add Public Hostname" -ForegroundColor Red
                            Write-Host "  Errors: $($updateResponse.errors | ConvertTo-Json)" -ForegroundColor Red
                        }
                    }
                }
            } else {
                Write-Host "⚠ Tunnel not found" -ForegroundColor Yellow
            }
        }
    }
} catch {
    Write-Host "✗ Error: $_" -ForegroundColor Red
}

Write-Host ""
Write-Host "=== Fix Complete ===" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Wait 5-10 minutes for DNS to propagate" -ForegroundColor White
Write-Host "2. Clear DNS cache: ipconfig /flushdns" -ForegroundColor White
Write-Host "3. Try accessing: https://$Subdomain.$Domain" -ForegroundColor White
Write-Host ""
Write-Host "If still having issues, check:" -ForegroundColor Yellow
Write-Host "  - Tunnel status: https://one.dash.cloudflare.com/cloudflare-tunnels" -ForegroundColor Gray
Write-Host "  - DNS records: https://dash.cloudflare.com/$zoneID/$Domain/dns" -ForegroundColor Gray

