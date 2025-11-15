# 🌐 Hướng dẫn DNS cho sales.ammedtech.com

## ⚡ Cách 1: Tự động (Khuyến nghị - Dùng Cloudflare Tunnel)

### ✅ DNS được tạo TỰ ĐỘNG

Khi bạn cấu hình **Public Hostname** trong Cloudflare Tunnel, DNS record sẽ được tạo **TỰ ĐỘNG**. Bạn **KHÔNG CẦN** tạo thủ công!

### Các bước:

1. **Truy cập Cloudflare Tunnels:**
   👉 https://one.dash.cloudflare.com/cloudflare-tunnels

2. **Click vào tunnel `sales-tunnel`**

3. **Click tab "Public Hostnames"**

4. **Click "Add a public hostname"**

5. **Điền thông tin:**
   ```
   Subdomain: sales
   Domain: ammedtech.com
   Service: http://frontend:80
   ```

6. **Click "Save hostname"**

7. **✅ DNS record sẽ được tạo tự động!**

### Kiểm tra DNS đã được tạo:

👉 https://dash.cloudflare.com/[account-id]/ammedtech.com/dns

Bạn sẽ thấy record:
```
Type: CNAME
Name: sales
Target: [tunnel-id].cfargotunnel.com
Proxy: 🟠 Proxied
TTL: Auto
```

---

## 🔧 Cách 2: Tạo thủ công (Nếu không dùng Tunnel)

### ⚠️ Lưu ý: Chỉ dùng nếu KHÔNG dùng Cloudflare Tunnel

Nếu bạn muốn tạo DNS record thủ công (không dùng tunnel), bạn cần:

1. **Có IP công khai của server**
2. **Mở port 80 và 443 trên firewall**
3. **Cấu hình SSL certificate**

### Các bước tạo DNS thủ công:

1. **Truy cập DNS Dashboard:**
   👉 https://dash.cloudflare.com/[account-id]/ammedtech.com/dns

2. **Click "Add record"**

3. **Chọn loại record:**

   **Option A: Dùng A record (nếu có IP tĩnh)**
   ```
   Type: A
   Name: sales
   IPv4 address: [IP-công-khai-của-server]
   Proxy: 🟠 Proxied (bật Cloudflare Proxy)
   TTL: Auto
   ```

   **Option B: Dùng CNAME (nếu có domain khác)**
   ```
   Type: CNAME
   Name: sales
   Target: [domain-hoặc-subdomain-khác]
   Proxy: 🟠 Proxied
   TTL: Auto
   ```

4. **Click "Save"**

---

## 📋 So sánh 2 cách

| Tính năng | Cloudflare Tunnel (Tự động) | DNS thủ công |
|-----------|----------------------------|--------------|
| **DNS record** | ✅ Tự động tạo | ❌ Phải tạo thủ công |
| **SSL/TLS** | ✅ Tự động | ⚠️ Cần cấu hình |
| **DDoS Protection** | ✅ Tự động | ✅ Có (nếu bật Proxy) |
| **Cần IP công khai** | ❌ Không cần | ✅ Cần |
| **Cần mở port** | ❌ Không cần | ✅ Cần (80, 443) |
| **Bảo mật** | ✅ Rất cao | ⚠️ Trung bình |
| **Khuyến nghị** | ✅ **Nên dùng** | ❌ Không khuyến nghị |

---

## 🎯 Hướng dẫn cho dự án hiện tại

### Vì bạn đã setup Cloudflare Tunnel:

1. **✅ Tunnel đã kết nối thành công**
2. **⏳ Cần cấu hình Public Hostname** (nếu chưa làm)

### Kiểm tra xem đã có Public Hostname chưa:

👉 https://one.dash.cloudflare.com/cloudflare-tunnels

1. Click vào tunnel `sales-tunnel`
2. Xem tab **"Public Hostnames"**
3. Nếu **CHƯA CÓ**, làm theo **Cách 1** ở trên
4. Nếu **ĐÃ CÓ**, DNS đã được tạo tự động!

### Kiểm tra DNS record:

👉 https://dash.cloudflare.com/[account-id]/ammedtech.com/dns

Tìm record:
- **Type**: `CNAME`
- **Name**: `sales`
- **Target**: `...cfargotunnel.com`
- **Proxy**: 🟠 Proxied

---

## 🔍 Troubleshooting

### DNS record không xuất hiện

**Nguyên nhân:**
- Chưa cấu hình Public Hostname trong tunnel
- Đợi vài phút để DNS sync

**Giải pháp:**
1. Kiểm tra Public Hostname trong tunnel
2. Đợi 5-10 phút
3. Refresh DNS page

### DNS record có nhưng website không load

**Nguyên nhân:**
- Tunnel chưa healthy
- Frontend/Backend chưa chạy
- DNS chưa propagate

**Giải pháp:**
1. Kiểm tra tunnel status: https://one.dash.cloudflare.com/cloudflare-tunnels
2. Kiểm tra services: `docker-compose ps`
3. Đợi 5-10 phút để DNS propagate
4. Xóa DNS cache: `ipconfig /flushdns` (Windows)

### Muốn xóa DNS record

**Nếu dùng Tunnel:**
- Xóa Public Hostname trong tunnel → DNS tự động xóa

**Nếu tạo thủ công:**
- Vào DNS Dashboard → Click vào record → Click "Delete"

---

## 📚 Links hữu ích

| Mục đích | Link |
|----------|------|
| **Cloudflare Tunnels** | https://one.dash.cloudflare.com/cloudflare-tunnels |
| **DNS Records** | https://dash.cloudflare.com/[account-id]/ammedtech.com/dns |
| **Cloudflare Dashboard** | https://dash.cloudflare.com |

---

## ✅ Checklist

- [ ] Đã cấu hình Public Hostname trong tunnel
- [ ] DNS record đã được tạo tự động (CNAME: sales → ...cfargotunnel.com)
- [ ] DNS record có Proxy status: 🟠 Proxied
- [ ] Tunnel status: 🟢 HEALTHY
- [ ] Đợi 5-10 phút để DNS propagate
- [ ] Truy cập https://sales.ammedtech.com (sau khi DNS propagate)

---

## 🎯 Kết luận

**Với Cloudflare Tunnel, bạn KHÔNG CẦN tạo DNS record thủ công!**

Chỉ cần:
1. ✅ Cấu hình Public Hostname trong tunnel
2. ✅ DNS sẽ được tạo tự động
3. ✅ Đợi 5-10 phút để DNS propagate
4. ✅ Truy cập website!

