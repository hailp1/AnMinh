# ⚡ Quick Fix DNS Error 1000

## 🚀 Cách nhanh nhất (2 phút)

### Bước 1: Lấy Cloudflare API Key (1 phút)

👉 **https://dash.cloudflare.com/profile/api-tokens**

1. Click **"Create Token"**
2. Chọn template: **"Edit zone DNS"**
3. Click **"Continue to summary"** → **"Create Token"**
4. **Copy token ngay!**

### Bước 2: Chạy script (1 phút)

```powershell
.\fix-dns-auto.ps1
```

Script sẽ hỏi:
- Cloudflare Email: `your-email@example.com`
- Cloudflare API Key: `paste-your-token-here`

### Bước 3: Đợi 5-10 phút

DNS sẽ tự động sync và website sẽ hoạt động!

---

## 🎯 Hoặc sửa thủ công (3 phút)

### 1. Xóa DNS record sai

👉 **https://dash.cloudflare.com/[account-id]/ammedtech.com/dns**

- Tìm record `sales` (Type: A)
- Click **Delete**

### 2. Cấu hình Tunnel

👉 **https://one.dash.cloudflare.com/cloudflare-tunnels**

- Click tunnel `sales-tunnel`
- Tab **"Public Hostnames"**
- **"Add a public hostname"**:
  - Subdomain: `sales`
  - Domain: `ammedtech.com`
  - Service: `http://frontend:80`
- Click **"Save"**

### 3. Đợi 5-10 phút

---

## ✅ Kết quả

Sau khi fix:
- ✅ DNS: CNAME → ...cfargotunnel.com
- ✅ Website: https://sales.ammedtech.com
- ✅ Admin: https://sales.ammedtech.com/admin

