# 🔧 Fix DNS Error 1000 - DNS points to prohibited IP

## ❌ Lỗi hiện tại

```
Error 1000
DNS points to prohibited IP
```

## 🔍 Nguyên nhân

Lỗi này xảy ra khi:
- DNS record đang trỏ đến **IP address** (A record) thay vì dùng **CNAME** với Cloudflare Tunnel
- DNS record trỏ đến IP private/localhost (127.0.0.1, 192.168.x.x, etc.)
- Public Hostname chưa được cấu hình đúng trong tunnel

## ✅ Giải pháp

### Cách 1: Sử dụng Script tự động (Khuyến nghị)

1. **Lấy Cloudflare API Key:**
   👉 https://dash.cloudflare.com/profile/api-tokens

2. **Chạy script fix:**
   ```powershell
   .\fix-dns-error.ps1 `
       -CloudflareEmail "your-email@example.com" `
       -CloudflareAPIKey "your-api-key-here"
   ```

Script sẽ:
- ✅ Xóa DNS record sai (A record hoặc CNAME sai)
- ✅ Kiểm tra và cấu hình Public Hostname trong tunnel
- ✅ Đảm bảo DNS trỏ đúng đến tunnel

### Cách 2: Sửa thủ công qua Dashboard

#### Bước 1: Xóa DNS record sai

👉 https://dash.cloudflare.com/[account-id]/ammedtech.com/dns

1. Tìm record có **Name**: `sales`
2. Nếu là **Type: A** (trỏ đến IP) → **Xóa ngay!**
3. Nếu là **Type: CNAME** nhưng không trỏ đến `...cfargotunnel.com` → **Xóa ngay!**

#### Bước 2: Cấu hình Public Hostname trong Tunnel

👉 https://one.dash.cloudflare.com/cloudflare-tunnels

1. Click vào tunnel **`sales-tunnel`**
2. Click tab **"Public Hostnames"**
3. Kiểm tra xem đã có hostname `sales.ammedtech.com` chưa:
   - **Nếu CHƯA CÓ**: Click **"Add a public hostname"** và điền:
     ```
     Subdomain: sales
     Domain: ammedtech.com
     Service: http://frontend:80
     ```
   - **Nếu ĐÃ CÓ**: Kiểm tra Service phải là `http://frontend:80`

4. Click **"Save hostname"**

#### Bước 3: Đợi DNS sync

- Đợi **5-10 phút** để DNS sync
- Xóa DNS cache: `ipconfig /flushdns` (Windows)

#### Bước 4: Kiểm tra DNS record mới

👉 https://dash.cloudflare.com/[account-id]/ammedtech.com/dns

Bạn sẽ thấy record mới:
```
Type: CNAME
Name: sales
Content: [tunnel-id].cfargotunnel.com
Proxy: 🟠 Proxied
```

## 🔍 Kiểm tra nhanh

### 1. Kiểm tra DNS record hiện tại

```powershell
# Windows
nslookup sales.ammedtech.com

# Hoặc
Resolve-DnsName sales.ammedtech.com
```

**Kết quả đúng** phải là:
- Type: CNAME
- Name: sales.ammedtech.com
- Points to: ...cfargotunnel.com

**Kết quả sai** (gây lỗi):
- Type: A
- Points to: IP address (192.168.x.x, 127.0.0.1, etc.)

### 2. Kiểm tra Tunnel status

👉 https://one.dash.cloudflare.com/cloudflare-tunnels

- Tunnel phải có status: **🟢 HEALTHY**
- Public Hostname phải có: `sales.ammedtech.com`

### 3. Kiểm tra Docker services

```bash
docker-compose ps
```

Tất cả services phải **Up**:
- ✅ postgres
- ✅ backend
- ✅ frontend
- ✅ cloudflared

## 📋 Checklist

- [ ] Đã xóa DNS record sai (A record hoặc CNAME sai)
- [ ] Đã cấu hình Public Hostname trong tunnel
- [ ] Tunnel status: 🟢 HEALTHY
- [ ] DNS record mới: CNAME → ...cfargotunnel.com
- [ ] Đợi 5-10 phút để DNS propagate
- [ ] Đã xóa DNS cache
- [ ] Đã thử truy cập lại: https://sales.ammedtech.com

## 🚨 Nếu vẫn còn lỗi

### Kiểm tra Service URL trong Tunnel

Service URL phải là:
- ✅ `http://frontend:80` (trong Docker network)
- ❌ `http://localhost:80` (sai)
- ❌ `http://127.0.0.1:80` (sai)
- ❌ IP address (sai)

### Kiểm tra Docker network

```bash
# Kiểm tra frontend container
docker-compose ps frontend

# Kiểm tra logs
docker-compose logs frontend

# Kiểm tra network
docker network inspect am_bs_ambs_network
```

### Restart services

```bash
docker-compose restart
```

## ✅ Kết quả mong đợi

Sau khi fix:
- ✅ DNS record: CNAME → ...cfargotunnel.com
- ✅ Website: https://sales.ammedtech.com (hoạt động)
- ✅ Admin: https://sales.ammedtech.com/admin (hoạt động)
- ✅ Không còn Error 1000

## 📚 Links hữu ích

- **Cloudflare Tunnels**: https://one.dash.cloudflare.com/cloudflare-tunnels
- **DNS Records**: https://dash.cloudflare.com/[account-id]/ammedtech.com/dns
- **API Tokens**: https://dash.cloudflare.com/profile/api-tokens

