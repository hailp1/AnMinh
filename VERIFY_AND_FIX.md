# ✅ Verify Domain & Fix DNS - Hướng dẫn đầy đủ

## 🔗 Links Trực Tiếp

### 1. 🔧 Sửa Tunnel Configuration (BẮT BUỘC)

👉 **https://one.dash.cloudflare.com/cloudflare-tunnels**

**Các bước:**
1. **Click vào tunnel `ammedtech`** (hoặc Tunnel ID: `5c7e692e-7c62-44da-a003-5c0ebda13477`)
2. Click tab **"Public Hostnames"**
3. Tìm hostname `sales.ammedtech.com` (nếu có)
4. **Nếu CHƯA CÓ**: Click **"Add a public hostname"**
5. **Nếu ĐÃ CÓ**: Click **"Edit"** (icon bút chì)
6. Điền:
   ```
   Subdomain: sales
   Domain: ammedtech.com
   Service: http://frontend:80
   ```
7. Click **"Save hostname"**

**⚠️ QUAN TRỌNG:** Service URL phải là `http://frontend:80` (không phải `https://sales.ammedtech.com`)

---

### 2. 🌐 Xóa DNS Record Sai

👉 **https://dash.cloudflare.com/adb01423498179528120c1e99f492561/ammedtech.com/dns**

**Các bước:**
1. Tìm record có **Name**: `sales`
2. Nếu **Type: A** → Click **"Delete"** ✅
3. Nếu **Type: CNAME** nhưng Content không phải `...cfargotunnel.com` → Click **"Delete"** ✅

---

### 3. 📊 Zone Overview & Verify Domain

👉 **https://dash.cloudflare.com/adb01423498179528120c1e99f492561/ammedtech.com**

Xem tổng quan domain, verify domain nếu cần.

---

### 4. 🔍 Kiểm tra DNS Records

👉 **https://dash.cloudflare.com/adb01423498179528120c1e99f492561/ammedtech.com/dns**

Sau khi fix, bạn sẽ thấy:
```
Type: CNAME
Name: sales
Content: [tunnel-id].cfargotunnel.com
Proxy: 🟠 Proxied
TTL: Auto
```

---

## ⏳ Timeline

1. **Bây giờ**: Sửa Tunnel Configuration (Link #1)
2. **Bây giờ**: Xóa DNS record sai (Link #2)
3. **Đợi 5-10 phút**: DNS tự động sync
4. **Sau 10 phút**: Kiểm tra DNS record mới (Link #4)
5. **Sau 10 phút**: Truy cập https://sales.ammedtech.com

---

## ✅ Checklist

- [ ] Đã sửa Tunnel Service URL: `http://frontend:80`
- [ ] Đã xóa DNS record sai (A record)
- [ ] Đã đợi 5-10 phút
- [ ] DNS record mới: CNAME → ...cfargotunnel.com
- [ ] Tunnel status: 🟢 HEALTHY
- [ ] Website hoạt động: https://sales.ammedtech.com
- [ ] Admin hoạt động: https://sales.ammedtech.com/admin

---

## 🚨 Nếu vẫn lỗi

### Kiểm tra Tunnel Logs:
```bash
docker-compose logs cloudflared
```

### Kiểm tra Services:
```bash
docker-compose ps
```

Tất cả phải **Up**:
- ✅ postgres
- ✅ backend
- ✅ frontend
- ✅ cloudflared

### Restart nếu cần:
```bash
docker-compose restart cloudflared
```

---

## 🎯 Kết quả

Sau khi hoàn tất:
- ✅ DNS: CNAME → ...cfargotunnel.com
- ✅ Website: https://sales.ammedtech.com
- ✅ Admin: https://sales.ammedtech.com/admin
- ✅ SSL tự động (Cloudflare)
- ✅ Không còn Error 1000

