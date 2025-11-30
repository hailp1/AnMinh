# Cloudflare Tunnel Configuration for AM Medtech

## Quick Start

### Option 1: Quick Tunnel (Temporary URL)
Run the batch file:
```bash
START_TUNNEL.bat
```

This will give you a temporary URL like: `https://xxxxx.trycloudflare.com`

### Option 2: Named Tunnel (Permanent with ammedtech.com)

#### Step 1: Login to Cloudflare
```bash
cloudflared.exe tunnel login
```

#### Step 2: Create a Named Tunnel
```bash
cloudflared.exe tunnel create ammedtech
```

This will create a tunnel and give you a Tunnel ID. Save this ID!

#### Step 3: Create Configuration File
Create `tunnel-config.yml` with:

```yaml
url: http://localhost:3000
tunnel: <YOUR-TUNNEL-ID>
credentials-file: C:\Users\OWNER\.cloudflared\<YOUR-TUNNEL-ID>.json
```

#### Step 4: Route Your Domain
```bash
cloudflared.exe tunnel route dns ammedtech ammedtech.com
```

#### Step 5: Run the Tunnel
```bash
cloudflared.exe tunnel run ammedtech
```

## DNS Configuration

In your Cloudflare Dashboard (ammedtech.com):

1. Go to DNS settings
2. Add CNAME record:
   - Name: `@` (or `www`)
   - Target: `<TUNNEL-ID>.cfargotunnel.com`
   - Proxy status: Proxied (orange cloud)

## Running as a Service

To run the tunnel permanently in the background, you can:

1. Use PM2 (already installed):
```bash
pm2 start cloudflared.exe --name "CF-Tunnel" -- tunnel run ammedtech
pm2 save
```

2. Or use Windows Task Scheduler to run on startup

## Troubleshooting

- **Port already in use**: Make sure your services are running on the correct ports
- **Tunnel not accessible**: Check Cloudflare DNS settings
- **SSL errors**: Cloudflare automatically handles SSL certificates

## Current Setup

- Landing Page: Port 3000 → ammedtech.com
- DMS Client: Port 3099 → dms.ammedtech.com (optional subdomain)
- Backend API: Port 5000 (internal only, accessed via DMS Client)
