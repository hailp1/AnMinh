# 🔗 Các Cách Mở Tunnel Configuration

## 🎯 Cách 1: Từ Zero Trust Dashboard (Khuyến nghị)

👉 **https://one.dash.cloudflare.com/**

**Các bước:**
1. Đăng nhập Cloudflare
2. Click **"Zero Trust"** ở menu bên trái
3. Click **"Networks"** → **"Tunnels"**
4. Click vào tunnel **`ammedtech`**

---

## 🎯 Cách 2: Link Trực Tiếp đến Tunnels

👉 **https://one.dash.cloudflare.com/cloudflare-tunnels**

Sau đó click vào tunnel **`ammedtech`** hoặc Tunnel ID: `5c7e692e-7c62-44da-a003-5c0ebda13477`

---

## 🎯 Cách 3: Từ Domain Dashboard

👉 **https://dash.cloudflare.com/adb01423498179528120c1e99f492561/ammedtech.com**

1. Vào domain **`ammedtech.com`**
2. Click **"Zero Trust"** ở menu bên trái
3. Click **"Networks"** → **"Tunnels"**
4. Click vào tunnel **`ammedtech`**

---

## 🎯 Cách 4: Tìm Tunnel bằng Search

👉 **https://one.dash.cloudflare.com/cloudflare-tunnels**

1. Ở trang Tunnels, có ô **"Search by tunnel name"**
2. Gõ: `ammedtech`
3. Click vào kết quả tìm được

---

## 🎯 Cách 5: Dùng Tunnel ID trực tiếp

👉 **https://one.dash.cloudflare.com/cloudflare-tunnels**

Sau đó tìm tunnel có ID: `5c7e692e-7c62-44da-a003-5c0ebda13477`

---

## 📍 Sau khi vào Tunnel

### Các tab bạn sẽ thấy:

1. **Overview** - Tổng quan tunnel
2. **Public Hostnames** ← **Click vào đây để cấu hình!**
3. **Private Networks** - Mạng riêng
4. **Logs** - Xem logs

### Click tab "Public Hostnames"

Sau đó:
- **Nếu chưa có**: Click **"Add a public hostname"**
- **Nếu đã có**: Click **"Edit"** (icon bút chì)

---

## 🔧 Cấu hình Public Hostname

### Điền form:

```
Hostname: sales.ammedtech.com
Service: http://frontend:80
Description: Sales website (tùy chọn)
```

### Click "Save hostname"

---

## 🔍 Nếu không tìm thấy Tunnel

### Kiểm tra Account:

1. Đảm bảo bạn đang ở đúng Cloudflare account
2. Kiểm tra Zero Trust đã được kích hoạt chưa
3. Thử đăng xuất và đăng nhập lại

### Kiểm tra Tunnel Status:

```bash
docker-compose ps cloudflared
docker-compose logs cloudflared
```

Tunnel phải có status: **Up**

---

## 📋 Checklist

- [ ] Đã đăng nhập Cloudflare
- [ ] Đã vào Zero Trust → Networks → Tunnels
- [ ] Đã tìm thấy tunnel `ammedtech`
- [ ] Đã click vào tunnel
- [ ] Đã click tab "Public Hostnames"
- [ ] Đã thêm/sửa Public Hostname
- [ ] Đã click "Save hostname"

---

## 🔗 Links Tổng Hợp

| Mục đích | Link |
|----------|------|
| **Zero Trust Dashboard** | https://one.dash.cloudflare.com/ |
| **Tunnels List** | https://one.dash.cloudflare.com/cloudflare-tunnels |
| **Domain Dashboard** | https://dash.cloudflare.com/adb01423498179528120c1e99f492561/ammedtech.com |
| **DNS Records** | https://dash.cloudflare.com/adb01423498179528120c1e99f492561/ammedtech.com/dns |

---

## ✅ Kết quả

Sau khi cấu hình Public Hostname:
- ✅ DNS record tự động tạo
- ✅ Đợi 5-10 phút
- ✅ Website: https://sales.ammedtech.com
- ✅ Admin: https://sales.ammedtech.com/admin

