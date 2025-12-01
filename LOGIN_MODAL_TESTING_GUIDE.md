# 🔐 Login Modal & Cloudflare Tunnel - Testing Guide

## ✅ Completed Improvements

### 1. **Login Modal Enhancements**
- ✅ Added loading state with visual feedback
- ✅ Added console logging for debugging
- ✅ Improved error handling
- ✅ Added smooth redirect with 500ms delay
- ✅ Disabled button during submission
- ✅ Better UX with "Redirecting..." message

### 2. **Cloudflare Tunnel Configuration**
- ✅ Fixed tunnel ID (removed trailing 'b')
- ✅ Updated credentials file path to match docker-compose volume mount
- ✅ Configured ingress for `dms.ammedtech.com` → `http://localhost:3099`

---

## 🧪 Testing Instructions

### **Option 1: Test Login Modal Locally (Recommended for Development)**

```bash
# Run this script to test the login modal in development mode
.\TEST_LOGIN_LOCAL.bat
```

**What it does:**
1. Kills any process using port 3000
2. Installs npm dependencies
3. Starts Next.js dev server on http://localhost:3000

**Test Checklist:**
- [ ] Open http://localhost:3000
- [ ] Click "CLIENT LOGIN" button in navbar
- [ ] Verify modal appears with smooth animation
- [ ] Open browser console (F12)
- [ ] Enter "AM" and check console logs:
  ```
  🔐 Login Modal - Customer ID entered: AM
  ✅ Login Modal - Redirecting to Admin Panel: https://dms.ammedtech.com/Anminh/admin
  ```
- [ ] Enter "TDV001" and check console logs:
  ```
  🔐 Login Modal - Customer ID entered: TDV001
  ✅ Login Modal - Redirecting to DMS: https://dms.ammedtech.com
  ```
- [ ] Verify "Redirecting..." message appears
- [ ] Test mobile menu (resize browser to mobile width)
- [ ] Verify modal close button (X) works
- [ ] Verify clicking backdrop closes modal

---

### **Option 2: Test Complete Docker System**

```bash
# Run this script to test the entire system with Docker
.\TEST_COMPLETE_SYSTEM.bat
```

**What it does:**
1. Checks Docker services status
2. Tests Cloudflare Tunnel connectivity
3. Starts all services (postgres, backend, frontend, landing, cloudflared)
4. Provides service URLs and manual test checklist

**Service URLs:**
- **Frontend (DMS):** http://localhost:3099
- **Backend API:** http://localhost:5001
- **Landing Page:** http://localhost:3000
- **Portal:** http://localhost:3001
- **PostgreSQL:** localhost:5433
- **Redis:** localhost:6379

**Production URLs:**
- **DMS:** https://dms.ammedtech.com
- **Landing:** https://ammedtech.com

---

### **Option 3: Test Cloudflare Tunnel Only**

```bash
# Run this script to test tunnel configuration
.\TEST_TUNNEL.bat
```

**What it does:**
1. Checks tunnel credentials file
2. Checks tunnel configuration file
3. Validates tunnel info with Cloudflare
4. Runs tunnel in test mode for 10 seconds

---

## 🔍 Troubleshooting

### **Port Already in Use**
If you see "port is already allocated" error:

```bash
# Check what's using the port
netstat -ano | findstr :3000

# Kill the process (replace PID with actual process ID)
taskkill /F /PID <PID>
```

### **Cloudflare Tunnel Not Working**

1. **Check tunnel status:**
   ```bash
   docker-compose logs cloudflared
   ```

2. **Verify tunnel credentials:**
   ```bash
   cloudflared.exe tunnel info ebe58fd0-0808-4d20-849d-2656840fdf9b
   ```

3. **Check DNS configuration:**
   - Go to Cloudflare Dashboard
   - Verify `dms.ammedtech.com` CNAME points to tunnel

4. **Restart tunnel:**
   ```bash
   docker-compose restart cloudflared
   ```

### **Login Modal Not Appearing**

1. **Check browser console for errors**
2. **Verify Navbar.tsx imports LoginModal correctly**
3. **Check z-index conflicts** (modal uses z-[110] and z-[120])
4. **Clear browser cache and hard refresh** (Ctrl+Shift+R)

---

## 📝 Login Flow Logic

### **Customer ID: "AM"**
```
Input: "AM"
↓
Redirect to: https://dms.ammedtech.com/Anminh/admin
↓
Admin Panel Login
```

### **Customer ID: Other (e.g., "TDV001")**
```
Input: "TDV001"
↓
Redirect to: https://dms.ammedtech.com
↓
TDV/Sales Rep Login
```

---

## 🚀 Deployment Checklist

### **Before Deploying to Production:**

- [ ] Test login modal locally
- [ ] Verify Cloudflare Tunnel is running
- [ ] Check all Docker services are healthy
- [ ] Test both redirect paths (AM and TDV)
- [ ] Test mobile responsiveness
- [ ] Verify production URLs are accessible
- [ ] Check SSL certificates are valid
- [ ] Test from different devices/browsers

### **Deploy Landing Page to Vercel:**

```bash
cd home/landing
vercel --prod
```

### **Start Docker Services:**

```bash
docker-compose up -d
```

---

## 📊 Current Configuration

### **Docker Compose Services:**
- `postgres` - PostgreSQL database (port 5433)
- `backend` - Node.js API (port 5001)
- `frontend` - React DMS app (port 3099)
- `landing` - Next.js landing page (port 3000)
- `webapp` - Portal app (port 3001)
- `cloudflared` - Cloudflare Tunnel
- `redis` - Cache service (port 6379)

### **Cloudflare Tunnel:**
- **Tunnel ID:** `ebe58fd0-0808-4d20-849d-2656840fdf9b`
- **Hostname:** `dms.ammedtech.com`
- **Service:** `http://frontend:80` (internal Docker network)
- **Public Port:** `3099` (mapped to host)

---

## 🎯 Next Steps

1. **Test Login Modal** using `TEST_LOGIN_LOCAL.bat`
2. **Verify Cloudflare Tunnel** using `TEST_TUNNEL.bat`
3. **Test Complete System** using `TEST_COMPLETE_SYSTEM.bat`
4. **Deploy to Production** if all tests pass

---

## 📞 Support

If you encounter any issues:
1. Check the troubleshooting section above
2. Review Docker logs: `docker-compose logs [service-name]`
3. Check browser console for JavaScript errors
4. Verify network connectivity to Cloudflare

---

**Last Updated:** 2025-12-01
**Version:** 1.0.0
