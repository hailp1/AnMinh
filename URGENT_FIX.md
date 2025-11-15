# 🚨 URGENT FIX - DNS Error 1000

## ⚠️ Vấn đề hiện tại

1. **Tunnel đang cố kết nối đến `https://sales.ammedtech.com`** (SAI!)
2. **Service URL phải là `http://frontend:80`** (trong Docker network)

## ✅ Fix ngay (2 phút)

### Bước 1: Sửa Tunnel Configuration

👉 **https://one.dash.cloudflare.com/cloudflare-tunnels**

1. **Click vào tunnel `sales-tunnel`**
2. **Click tab "Public Hostnames"**
3. **Tìm hostname `sales.ammedtech.com`**
4. **Click "Edit" hoặc "Delete" rồi tạo lại**

5. **Điền chính xác:**
   ```
   Subdomain: sales
   Domain: ammedtech.com
   Service: http://frontend:80
   ```
   
   **⚠️ QUAN TRỌNG:**
   - ✅ `http://frontend:80` (đúng - trong Docker network)
   - ❌ `https://sales.ammedtech.com` (sai!)
   - ❌ `http://localhost:80` (sai!)
   - ❌ `http://127.0.0.1:80` (sai!)

6. **Click "Save hostname"**

### Bước 2: Xóa DNS record sai (nếu có)

👉 **https://dash.cloudflare.com/[account-id]/ammedtech.com/dns**

1. Tìm record **Name**: `sales`
2. Nếu **Type: A** → **Delete**
3. Nếu **Type: CNAME** nhưng không trỏ đến `...cfargotunnel.com` → **Delete**

### Bước 3: Đợi 5-10 phút

DNS sẽ tự động tạo lại đúng!

---

## 🔍 Kiểm tra

### Tunnel Logs:
```bash
docker-compose logs cloudflared
```

Sau khi fix, logs sẽ không còn lỗi "context canceled".

### DNS Record:
👉 **https://dash.cloudflare.com/[account-id]/ammedtech.com/dns**

Phải thấy:
```
Type: CNAME
Name: sales
Content: [tunnel-id].cfargotunnel.com
Proxy: 🟠 Proxied
```

---

## ✅ Kết quả

Sau khi fix:
- ✅ Tunnel kết nối đúng: `http://frontend:80`
- ✅ DNS: CNAME → ...cfargotunnel.com
- ✅ Website: https://sales.ammedtech.com
- ✅ Admin: https://sales.ammedtech.com/admin

