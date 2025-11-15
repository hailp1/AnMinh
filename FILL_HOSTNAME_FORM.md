# 📝 Điền Form Public Hostname

## 🎯 Bạn đang ở: Form "Configure your route"

### Điền thông tin như sau:

#### 1. Hostname (Required)

**Xóa** `www.example.local` và điền:

```
sales.ammedtech.com
```

**Hoặc điền riêng:**
- **Subdomain**: `sales`
- **Domain**: `ammedtech.com` (chọn từ dropdown)

#### 2. Service (Required)

**Điền:**

```
http://frontend:80
```

**⚠️ QUAN TRỌNG:**
- ✅ `http://frontend:80` (đúng - trong Docker network)
- ❌ `https://sales.ammedtech.com` (sai!)
- ❌ `http://localhost:80` (sai!)
- ❌ `http://127.0.0.1:80` (sai!)

#### 3. Description (Optional)

Có thể điền:
```
Sales website for An Minh Business System
```

Hoặc để trống cũng được.

---

## ✅ Sau khi điền xong

1. **Click "Save hostname"** hoặc **"Add hostname"**
2. **Đợi vài giây** để Cloudflare xử lý
3. **DNS record sẽ được tạo tự động**

---

## 🔍 Kiểm tra sau khi save

### Kiểm tra DNS Record:
👉 **https://dash.cloudflare.com/adb01423498179528120c1e99f492561/ammedtech.com/dns**

Sau 5-10 phút, bạn sẽ thấy:
```
Type: CNAME
Name: sales
Content: [tunnel-id].cfargotunnel.com
Proxy: 🟠 Proxied
```

### Kiểm tra Tunnel Logs:
```bash
docker-compose logs cloudflared
```

Sau khi fix, logs sẽ không còn lỗi "context canceled".

---

## ✅ Kết quả

Sau khi save:
- ✅ DNS record tự động tạo
- ✅ Đợi 5-10 phút
- ✅ Truy cập: https://sales.ammedtech.com
- ✅ Truy cập: https://sales.ammedtech.com/admin

