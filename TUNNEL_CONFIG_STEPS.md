# 🔧 Cấu hình Tunnel - Bước tiếp theo

## ✅ Thông tin Tunnel của bạn

- **Tunnel Name**: `ammedtech`
- **Tunnel ID**: `5c7e692e-7c62-44da-a003-5c0ebda13477`
- **Connector ID**: `0e9795a7-119b-4e52-9b74-063566e100e6`
- **Status**: Đang chạy ✅

## 🎯 Bước tiếp theo: Cấu hình Public Hostname

### Bước 1: Click vào Tunnel

Trên trang hiện tại, **click vào tunnel name `ammedtech`** hoặc **click vào Tunnel ID `5c7e692e-7c62-44da-a003-5c0ebda13477`**

### Bước 2: Vào tab "Public Hostnames"

Sau khi vào trang chi tiết tunnel, bạn sẽ thấy các tab:
- Overview
- **Public Hostnames** ← Click vào đây
- Private Networks
- Logs

### Bước 3: Kiểm tra hoặc Thêm Public Hostname

**Nếu CHƯA CÓ hostname `sales.ammedtech.com`:**
1. Click **"Add a public hostname"**
2. Điền:
   ```
   Subdomain: sales
   Domain: ammedtech.com
   Service: http://frontend:80
   ```
3. Click **"Save hostname"**

**Nếu ĐÃ CÓ hostname `sales.ammedtech.com`:**
1. Click **"Edit"** (icon bút chì)
2. Kiểm tra **Service URL**:
   - ✅ Phải là: `http://frontend:80`
   - ❌ Nếu là: `https://sales.ammedtech.com` → Sửa ngay!
3. Sửa thành: `http://frontend:80`
4. Click **"Save hostname"**

## 🔗 Link trực tiếp

👉 **https://one.dash.cloudflare.com/cloudflare-tunnels**

Sau đó click vào tunnel `ammedtech` hoặc ID `5c7e692e-7c62-44da-a003-5c0ebda13477`

## ⚠️ QUAN TRỌNG

**Service URL phải là:**
- ✅ `http://frontend:80` (đúng - trong Docker network)
- ❌ `https://sales.ammedtech.com` (sai!)
- ❌ `http://localhost:80` (sai!)
- ❌ `http://127.0.0.1:80` (sai!)

## ✅ Sau khi cấu hình

1. **DNS record sẽ được tạo tự động** (CNAME → ...cfargotunnel.com)
2. **Đợi 5-10 phút** để DNS sync
3. **Truy cập**: https://sales.ammedtech.com
4. **Truy cập**: https://sales.ammedtech.com/admin

## 🔍 Kiểm tra

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

