# Auto Setup DNS for sales.ammedtech.com using Cloudflare API
# This script automatically creates Public Hostname in Cloudflare Tunnel

param(
    [Parameter(Mandatory=$true)]
    [string]$CloudflareEmail,
    
    [Parameter(Mandatory=$true)]
    [string]$CloudflareAPIKey,
    
    [Parameter(Mandatory=$false)]
    [string]$TunnelID = "5c7e692e-7c62-44da-a003-5c0ebda13477",
    
    [Parameter(Mandatory=$false)]
    [string]$Subdomain = "sales",
    
    [Parameter(Mandatory=$false)]
    [string]$Domain = "ammedtech.com",
    
    [Parameter(Mandatory=$false)]
    [string]$Service = "http://frontend:80"
)

Write-Host "=== Auto Setup DNS for Cloudflare Tunnel ===" -ForegroundColor Cyan
Write-Host ""

# Step 1: Get Account ID
Write-Host "Step 1: Getting Account ID..." -ForegroundColor Yellow
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
    } else {
        Write-Host "✗ Failed to get Account ID" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "✗ Error getting Account ID: $_" -ForegroundColor Red
    exit 1
}

# Step 2: Get Zone ID
Write-Host ""
Write-Host "Step 2: Getting Zone ID for $Domain..." -ForegroundColor Yellow
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

# Step 3: Create Public Hostname using Cloudflare Tunnel API
Write-Host ""
Write-Host "Step 3: Creating Public Hostname..." -ForegroundColor Yellow
Write-Host "  Subdomain: $Subdomain" -ForegroundColor Gray
Write-Host "  Domain: $Domain" -ForegroundColor Gray
Write-Host "  Service: $Service" -ForegroundColor Gray

$hostnameBody = @{
    hostname = "$Subdomain.$Domain"
    service = $Service
} | ConvertTo-Json

try {
    $hostnameResponse = Invoke-RestMethod -Uri "https://api.cloudflare.com/client/v4/accounts/$accountID/cfd_tunnel/$TunnelID/configurations" `
        -Method PUT `
        -Headers @{
            "X-Auth-Email" = $CloudflareEmail
            "X-Auth-Key" = $CloudflareAPIKey
            "Content-Type" = "application/json"
        } `
        -Body @{
            config = @{
                ingress = @(
                    @{
                        hostname = "$Subdomain.$Domain"
                        service = $Service
                    },
                    @{
                        service = "http_status:404"
                    }
                )
            }
        } | ConvertTo-Json -Depth 10
    
    if ($hostnameResponse.success) {
        Write-Host "✓ Public Hostname created successfully!" -ForegroundColor Green
        Write-Host "✓ DNS record will be created automatically" -ForegroundColor Green
    } else {
        Write-Host "✗ Failed to create Public Hostname" -ForegroundColor Red
        Write-Host "  Errors: $($hostnameResponse.errors | ConvertTo-Json)" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "✗ Error creating Public Hostname: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "Note: You may need to create it manually via:" -ForegroundColor Yellow
    Write-Host "  https://one.dash.cloudflare.com/cloudflare-tunnels" -ForegroundColor Cyan
    exit 1
}

# Step 4: Verify DNS Record
Write-Host ""
Write-Host "Step 4: Verifying DNS Record..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

try {
    $dnsResponse = Invoke-RestMethod -Uri "https://api.cloudflare.com/client/v4/zones/$zoneID/dns_records?name=$Subdomain.$Domain" `
        -Method GET `
        -Headers @{
            "X-Auth-Email" = $CloudflareEmail
            "X-Auth-Key" = $CloudflareAPIKey
            "Content-Type" = "application/json"
        }
    
    if ($dnsResponse.success -and $dnsResponse.result.Count -gt 0) {
        $dnsRecord = $dnsResponse.result[0]
        Write-Host "✓ DNS Record found:" -ForegroundColor Green
        Write-Host "  Type: $($dnsRecord.type)" -ForegroundColor Gray
        Write-Host "  Name: $($dnsRecord.name)" -ForegroundColor Gray
        Write-Host "  Content: $($dnsRecord.content)" -ForegroundColor Gray
        Write-Host "  Proxied: $($dnsRecord.proxied)" -ForegroundColor Gray
    } else {
        Write-Host "⚠ DNS Record not found yet (may take a few minutes)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "⚠ Could not verify DNS Record: $_" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "=== Setup Complete ===" -ForegroundColor Green
Write-Host ""
Write-Host "Your website will be available at:" -ForegroundColor Cyan
Write-Host "  https://$Subdomain.$Domain" -ForegroundColor Green
Write-Host "  https://$Subdomain.$Domain/admin" -ForegroundColor Green
Write-Host ""
Write-Host "Note: DNS may take 5-10 minutes to propagate" -ForegroundColor Yellow

