# 🔗 Links để Click và Verify

## ⚡ Links Trực Tiếp - Click ngay!

### 1. 🔧 Sửa Tunnel Configuration (QUAN TRỌNG NHẤT)

👉 **https://one.dash.cloudflare.com/cloudflare-tunnels**

**Các bước:**
1. Click vào tunnel **`sales-tunnel`**
2. Click tab **"Public Hostnames"**
3. Tìm `sales.ammedtech.com` → Click **"Edit"**
4. **Sửa Service URL thành:** `http://frontend:80`
5. Click **"Save hostname"**

---

### 2. 🌐 Xóa DNS Record Sai

👉 **https://dash.cloudflare.com/adb01423498179528120c1e99f492561/ammedtech.com/dns**

**Các bước:**
1. Tìm record có **Name**: `sales`
2. Nếu **Type: A** → Click **"Delete"**
3. Nếu **Type: CNAME** nhưng không trỏ đến `...cfargotunnel.com` → Click **"Delete"**

---

### 3. 📊 Kiểm tra Zone Overview

👉 **https://dash.cloudflare.com/adb01423498179528120c1e99f492561/ammedtech.com**

Xem tổng quan domain và DNS records.

---

### 4. ✅ Verify Domain (Nếu cần)

👉 **https://dash.cloudflare.com/adb01423498179528120c1e99f492561/ammedtech.com/overview**

Nếu domain chưa được verify, bạn sẽ thấy thông báo ở đây.

---

## 🎯 Thứ tự thực hiện

1. ✅ **Bước 1**: Sửa Tunnel Configuration (Link #1)
2. ✅ **Bước 2**: Xóa DNS record sai (Link #2)
3. ⏳ **Bước 3**: Đợi 5-10 phút
4. ✅ **Bước 4**: Kiểm tra DNS record mới (Link #2)

---

## 📋 Checklist

- [ ] Đã sửa Service URL trong Tunnel: `http://frontend:80`
- [ ] Đã xóa DNS record sai (A record)
- [ ] Đã đợi 5-10 phút
- [ ] DNS record mới đã xuất hiện: CNAME → ...cfargotunnel.com
- [ ] Truy cập: https://sales.ammedtech.com
- [ ] Truy cập: https://sales.ammedtech.com/admin

---

## 🔍 Kiểm tra nhanh

Sau khi fix, kiểm tra:

```bash
# Tunnel logs
docker-compose logs cloudflared

# Services status
docker-compose ps
```

---

## ✅ Kết quả mong đợi

- ✅ Tunnel kết nối đúng: `http://frontend:80`
- ✅ DNS: CNAME → ...cfargotunnel.com
- ✅ Website: https://sales.ammedtech.com
- ✅ Admin: https://sales.ammedtech.com/admin
- ✅ Không còn Error 1000

