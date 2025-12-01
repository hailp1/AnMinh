# 🔧 Cloudflare Tunnel - Troubleshooting Guide

## ❌ Current Issue: 502 Bad Gateway

The Cloudflare Tunnel is connecting successfully to Cloudflare's edge, but returning 502 errors when accessing https://dms.ammedtech.com.

### Symptoms:
- ✅ Docker frontend container running (http://localhost:3099 returns 200 OK)
- ✅ Cloudflare Tunnel connects to edge (sin06/sin09)
- ❌ https://dms.ammedtech.com returns 502 Bad Gateway

---

## 🔍 Root Cause Analysis

The issue is likely one of the following:

### 1. **Cloudflare Caching 502 Response**
Cloudflare may have cached the previous 502 error.

**Solution:**
- Go to Cloudflare Dashboard → Caching → Purge Cache
- Or wait 5-10 minutes for cache to expire

### 2. **Frontend Server Not Compatible with Tunnel**
The `serve` package may not handle requests from Cloudflare Tunnel properly.

**Solutions:**
- Use Nginx reverse proxy (recommended)
- Use Python HTTP server (quick test)
- Use a different static file server

### 3. **Network/Firewall Issues**
Windows Firewall or antivirus may be blocking cloudflared.exe from accessing localhost.

**Solution:**
- Run cloudflared.exe as Administrator
- Add firewall exception for cloudflared.exe
- Temporarily disable antivirus to test

### 4. **DNS Propagation**
DNS changes may not have propagated yet.

**Solution:**
- Check DNS with: `nslookup dms.ammedtech.com`
- Should show Cloudflare CNAME
- Wait up to 24 hours for full propagation

---

## 🚀 Recommended Solutions (In Order)

### **Solution 1: Purge Cloudflare Cache**
1. Go to https://dash.cloudflare.com
2. Select your domain `ammedtech.com`
3. Go to **Caching** → **Configuration**
4. Click **Purge Everything**
5. Wait 2-3 minutes
6. Test https://dms.ammedtech.com again

### **Solution 2: Use Nginx Reverse Proxy**
```bash
# Build nginx proxy
docker build -f Dockerfile.nginx-proxy -t dms_nginx_proxy .

# Add to docker-compose.dev.yml
# Then update tunnel to point to nginx proxy
```

### **Solution 3: Test with Python Server**
```bash
# Run the quick fix script
.\QUICK_FIX_PYTHON_SERVER.bat
```

### **Solution 4: Run Cloudflared as Administrator**
```bash
# Right-click on START_LOCAL_TUNNEL.bat
# Select "Run as Administrator"
```

### **Solution 5: Check Firewall**
```powershell
# Add firewall rule
New-NetFirewallRule -DisplayName "Cloudflared Tunnel" -Direction Inbound -Program "D:\newNCSKITORG\newNCSkit\AM_BS\cloudflared.exe" -Action Allow
```

---

## 🧪 Quick Tests

### Test 1: Verify Frontend is Accessible
```powershell
Invoke-WebRequest -Uri http://localhost:3099 -Method GET
# Should return 200 OK
```

### Test 2: Check Tunnel Status
```bash
.\cloudflared.exe tunnel info ebe58fd0-0808-4d20-849d-2656840fdf9b
```

### Test 3: Test Tunnel Connection
```bash
# Start tunnel
.\cloudflared.exe tunnel --config cloudflare-tunnel-local.yml run

# In another terminal, check logs for errors
# Look for "connection established" or error messages
```

### Test 4: Bypass Cloudflare Cache
```
# Add ?nocache=1 to URL
https://dms.ammedtech.com?nocache=1
```

---

## 📊 Current Setup

### Working Components:
- ✅ PostgreSQL: localhost:5433
- ✅ Backend API: http://localhost:5001/api (200 OK)
- ✅ Frontend: http://localhost:3099 (200 OK)
- ✅ Landing Page: http://localhost:3000 (Next.js dev)
- ✅ Cloudflare Tunnel: Connected to edge

### Not Working:
- ❌ Public access via https://dms.ammedtech.com (502)

---

## 🎯 Alternative: Deploy to Cloud

If local tunnel continues to have issues, consider deploying to a cloud provider:

### Option A: Deploy to Vercel (Frontend Only)
```bash
cd DMS/frontend
npm run build
vercel --prod
```

### Option B: Deploy to Railway/Render (Full Stack)
- Push code to GitHub
- Connect Railway/Render to repository
- Deploy backend + frontend + database

### Option C: Use VPS (DigitalOcean, Linode, etc.)
- Rent a small VPS ($5-10/month)
- Install Docker
- Run docker-compose
- Point Cloudflare Tunnel from VPS

---

## 📝 Next Steps

1. **Immediate**: Purge Cloudflare cache and test
2. **Short-term**: Try Python server workaround
3. **Long-term**: Set up Nginx reverse proxy or deploy to cloud

---

## 🆘 If Nothing Works

The local development setup is fully functional:
- Access DMS at: http://localhost:3099
- Access API at: http://localhost:5001/api
- Test login modal at: http://localhost:3000

For production access, consider deploying to a cloud platform instead of using local tunnel.

---

**Last Updated:** 2025-12-01 16:20
**Status:** Investigating 502 issue
