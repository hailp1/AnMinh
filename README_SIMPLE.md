# 🚀 Simple Startup Guide

## Quick Start

### Start All Services
```bash
START_ALL_SIMPLE.bat
```

This will:
1. ✅ Start PostgreSQL database
2. ✅ Start Backend API (port 5001)
3. ✅ Start Cloudflare Tunnel
4. ✅ Wait for services to be healthy

### Stop All Services
```bash
STOP_ALL_SIMPLE.bat
```

### Restart All Services
```bash
RESTART_ALL_SIMPLE.bat
```

## Access Points

After starting:
- **Backend API**: http://localhost:5001
- **Frontend**: http://localhost:3099
- **Database**: localhost:5432
- **Public URL**: https://dms.ammedtech.com

## ⚠️ Important Configuration
Ensure your **Cloudflare Dashboard** (Zero Trust > Access > Tunnels) is configured as:
- **Hostname**: `dms.ammedtech.com`
- **Service**: `http://localhost:3099` (or `http://127.0.0.1:3099`)

## Troubleshooting

### If tunnel shows 502 error:
1. Wait 30-60 seconds for services to fully start
2. Check backend health: `docker ps`
3. Restart: `RESTART_ALL_SIMPLE.bat`

### If backend keeps restarting:
1. Check logs: `docker logs dms_backend`
2. Check schema: `DMS\backend\prisma\schema.prisma`
3. Regenerate: `cd DMS\backend && npx prisma generate`

## Manual Commands

### Check service status:
```bash
docker ps
```

### View backend logs:
```bash
docker logs dms_backend -f
```

### Check tunnel status:
```bash
tasklist | findstr cloudflared
```

## Notes

- Backend must be healthy before tunnel will work
- Tunnel runs in minimized window
- All services auto-restart on failure (except tunnel)
