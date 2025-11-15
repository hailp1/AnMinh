# ⚡ Fix DNS Error 1000 - NGAY BÂY GIỜ

## 🚀 Cách nhanh nhất (2 phút)

### Bước 1: Xóa DNS record sai

👉 **https://dash.cloudflare.com/[account-id]/ammedtech.com/dns**

1. Tìm record có **Name**: `sales`
2. Nếu **Type: A** (trỏ đến IP) → **Click Delete ngay!**
3. Nếu **Type: CNAME** nhưng không trỏ đến `...cfargotunnel.com` → **Click Delete ngay!**

### Bước 2: Cấu hình Tunnel Public Hostname

👉 **https://one.dash.cloudflare.com/cloudflare-tunnels**

1. Click vào tunnel **`sales-tunnel`**
2. Click tab **"Public Hostnames"**
3. Kiểm tra xem đã có `sales.ammedtech.com` chưa:
   - **Nếu CHƯA CÓ**: Click **"Add a public hostname"**
   - **Nếu ĐÃ CÓ**: Kiểm tra Service phải là `http://frontend:80`
4. Điền:
   ```
   Subdomain: sales
   Domain: ammedtech.com
   Service: http://frontend:80
   ```
5. Click **"Save hostname"**

### Bước 3: Đợi 5-10 phút

DNS sẽ tự động sync!

---

## ✅ Kết quả

Sau khi fix:
- ✅ DNS: CNAME → ...cfargotunnel.com
- ✅ Website: https://sales.ammedtech.com
- ✅ Admin: https://sales.ammedtech.com/admin

---

## 🔧 Hoặc chạy script tự động

Nếu bạn có Cloudflare Email, chạy:

```powershell
$env:CLOUDFLARE_EMAIL = "your-email@example.com"
.\fix-dns-simple.ps1
```

Script sẽ tự động:
- Xóa DNS record sai
- Cấu hình Public Hostname
- Tạo DNS record đúng

