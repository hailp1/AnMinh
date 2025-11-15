# 🔄 Từ Connector Details → Cấu hình Public Hostname

## 📍 Bạn đang ở: Connector Details

Thông tin connector:
- **Connector ID**: `0e9795a7-119b-4e52-9b74-063566e100e6`
- **Tunnel ID**: `5c7e692e-7c62-44da-a003-5c0ebda13477`
- **Status**: Đang chạy ✅

## 🎯 Bước tiếp theo: Quay lại Tunnel và cấu hình Public Hostname

### Cách 1: Dùng Breadcrumb Navigation

Ở đầu trang, bạn sẽ thấy breadcrumb như:
```
Zero Trust > Networks > Tunnels > ammedtech > Connector details
```

**Click vào `ammedtech`** để quay lại trang tunnel.

### Cách 2: Dùng Link trực tiếp

👉 **https://one.dash.cloudflare.com/cloudflare-tunnels**

Sau đó click vào tunnel **`ammedtech`** (Tunnel ID: `5c7e692e-7c62-44da-a003-5c0ebda13477`)

### Cách 3: Dùng Menu

1. Click **"Tunnels"** ở menu bên trái
2. Click vào tunnel **`ammedtech`**

---

## 🔧 Sau khi vào trang Tunnel

### Bước 1: Click tab "Public Hostnames"

Bạn sẽ thấy các tab:
- Overview
- **Public Hostnames** ← Click vào đây
- Private Networks
- Logs

### Bước 2: Kiểm tra hoặc Thêm Public Hostname

**Nếu CHƯA CÓ hostname `sales.ammedtech.com`:**
1. Click **"Add a public hostname"** (nút màu xanh)
2. Điền form:
   ```
   Subdomain: sales
   Domain: ammedtech.com
   Service: http://frontend:80
   ```
3. Click **"Save hostname"**

**Nếu ĐÃ CÓ hostname `sales.ammedtech.com`:**
1. Tìm dòng có `sales.ammedtech.com`
2. Click **"Edit"** (icon bút chì ở cuối dòng)
3. Kiểm tra **Service URL**:
   - ✅ Phải là: `http://frontend:80`
   - ❌ Nếu là: `https://sales.ammedtech.com` → Sửa ngay!
4. Sửa thành: `http://frontend:80`
5. Click **"Save hostname"**

---

## ⚠️ QUAN TRỌNG

**Service URL phải là:**
- ✅ `http://frontend:80` (đúng - trong Docker network)
- ❌ `https://sales.ammedtech.com` (sai!)
- ❌ `http://localhost:80` (sai!)
- ❌ `http://127.0.0.1:80` (sai!)

---

## 🔗 Link trực tiếp đến Public Hostnames

👉 **https://one.dash.cloudflare.com/cloudflare-tunnels**

Sau đó:
1. Click vào tunnel `ammedtech`
2. Click tab "Public Hostnames"

---

## ✅ Sau khi cấu hình

1. **DNS record sẽ được tạo tự động** (CNAME → ...cfargotunnel.com)
2. **Đợi 5-10 phút** để DNS sync
3. **Truy cập**: https://sales.ammedtech.com
4. **Truy cập**: https://sales.ammedtech.com/admin

---

## 🔍 Kiểm tra sau khi fix

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

## 📋 Checklist

- [ ] Đã quay lại trang Tunnel
- [ ] Đã click tab "Public Hostnames"
- [ ] Đã thêm/sửa Public Hostname
- [ ] Service URL: `http://frontend:80`
- [ ] Đã click "Save hostname"
- [ ] Đã đợi 5-10 phút
- [ ] DNS record mới đã xuất hiện
- [ ] Website hoạt động: https://sales.ammedtech.com

