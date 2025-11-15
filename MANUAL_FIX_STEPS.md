# 🔧 Manual Fix Steps - DNS Error 1000

## ⚡ Quick Fix (2 minutes)

### Step 1: Delete Wrong DNS Record

👉 **https://dash.cloudflare.com**

1. Login with: **phuchai.le@gmail.com**
2. Select domain: **ammedtech.com**
3. Go to **DNS** → **Records**
4. Find record with **Name**: `sales`
5. If **Type: A** → **Click Delete** ✅
6. If **Type: CNAME** but not pointing to `...cfargotunnel.com` → **Click Delete** ✅

### Step 2: Configure Tunnel Public Hostname

👉 **https://one.dash.cloudflare.com/cloudflare-tunnels**

1. Click on tunnel **`sales-tunnel`**
2. Click tab **"Public Hostnames"**
3. Check if `sales.ammedtech.com` exists:
   - **If NOT EXISTS**: Click **"Add a public hostname"**
   - **If EXISTS**: Check Service = `http://frontend:80`
4. Fill in:
   ```
   Subdomain: sales
   Domain: ammedtech.com
   Service: http://frontend:80
   ```
5. Click **"Save hostname"**

### Step 3: Wait 5-10 minutes

DNS will automatically sync!

---

## ✅ Expected Result

After fix:
- ✅ DNS Record: CNAME → ...cfargotunnel.com
- ✅ Website: https://sales.ammedtech.com
- ✅ Admin: https://sales.ammedtech.com/admin

---

## 🔍 Verify

### Check DNS Record:
👉 **https://dash.cloudflare.com/[account-id]/ammedtech.com/dns**

Should see:
```
Type: CNAME
Name: sales
Content: [tunnel-id].cfargotunnel.com
Proxy: 🟠 Proxied
```

### Check Tunnel Status:
👉 **https://one.dash.cloudflare.com/cloudflare-tunnels**

- Tunnel status: 🟢 HEALTHY
- Public Hostname: sales.ammedtech.com → http://frontend:80

---

## 🚨 If Still Error

1. **Clear DNS cache**: `ipconfig /flushdns` (Windows)
2. **Wait longer**: DNS can take up to 10-15 minutes
3. **Check tunnel logs**: `docker-compose logs cloudflared`
4. **Restart tunnel**: `docker-compose restart cloudflared`

