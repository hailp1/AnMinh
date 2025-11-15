# 📋 Copy-Paste Guide - Điền Form Public Hostname

## 🎯 Bạn đang ở form "Configure your route"

### Bước 1: Điền Hostname

**Tìm ô "Hostname" hoặc "Subdomain":**

**Cách 1: Nếu có 2 ô riêng (Subdomain + Domain)**
- **Subdomain**: Gõ: `sales`
- **Domain**: Chọn từ dropdown: `ammedtech.com`

**Cách 2: Nếu có 1 ô "Hostname"**
- Xóa `www.example.local`
- Gõ: `sales.ammedtech.com`

---

### Bước 2: Điền Service URL

**Tìm ô "Service" hoặc "Service URL":**

Gõ chính xác:
```
http://frontend:80
```

**⚠️ LƯU Ý:**
- ✅ Phải là: `http://frontend:80`
- ❌ KHÔNG phải: `https://sales.ammedtech.com`
- ❌ KHÔNG phải: `http://localhost:80`
- ❌ KHÔNG phải: `http://127.0.0.1:80`

---

### Bước 3: Description (Tùy chọn)

**Tìm ô "Description":**

Có thể gõ:
```
Sales website
```

Hoặc để trống.

---

### Bước 4: Click Save

**Tìm nút:**
- "Save hostname"
- "Add hostname"
- "Save"
- "Create"

**Click vào nút đó!**

---

## ✅ Sau khi Save

1. Bạn sẽ thấy thông báo thành công
2. DNS record sẽ được tạo tự động
3. Đợi 5-10 phút
4. Truy cập: https://sales.ammedtech.com

---

## 📋 Tóm tắt - Copy nhanh

```
Hostname: sales.ammedtech.com
Service: http://frontend:80
Description: Sales website (tùy chọn)
```

---

## 🔍 Kiểm tra sau khi save

### Link kiểm tra DNS:
👉 **https://dash.cloudflare.com/adb01423498179528120c1e99f492561/ammedtech.com/dns**

Sau 5-10 phút, bạn sẽ thấy record mới:
```
Type: CNAME
Name: sales
Content: [tunnel-id].cfargotunnel.com
Proxy: 🟠 Proxied
```

---

## 🚨 Nếu gặp lỗi

### Lỗi "Invalid service URL"
- Kiểm tra lại: Phải là `http://frontend:80` (không có `s` sau `http`)

### Lỗi "Hostname already exists"
- Vào tab "Public Hostnames"
- Tìm `sales.ammedtech.com`
- Click "Edit"
- Sửa Service URL thành: `http://frontend:80`
- Click "Save"

---

## ✅ Checklist

- [ ] Đã điền Hostname: `sales.ammedtech.com`
- [ ] Đã điền Service: `http://frontend:80`
- [ ] Đã click "Save hostname"
- [ ] Đã thấy thông báo thành công
- [ ] Đã đợi 5-10 phút
- [ ] Đã kiểm tra DNS record mới
- [ ] Đã truy cập: https://sales.ammedtech.com

