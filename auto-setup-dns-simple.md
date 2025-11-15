# 🚀 Tự động Setup DNS - Hướng dẫn nhanh

## ⚡ Cách 1: Sử dụng Script PowerShell (Tự động)

### Bước 1: Lấy Cloudflare API Key

1. Truy cập: **https://dash.cloudflare.com/profile/api-tokens**
2. Click **"Create Token"**
3. Chọn template: **"Edit zone DNS"** hoặc **"Custom token"**
4. Cấu hình permissions:
   - **Account** → **Cloudflare Tunnel** → **Edit**
   - **Zone** → **DNS** → **Edit**
5. Click **"Continue to summary"** → **"Create Token"**
6. **Copy token ngay!** (chỉ hiện 1 lần)

### Bước 2: Chạy Script

```powershell
# Chạy script với thông tin của bạn
.\auto-setup-dns.ps1 `
    -CloudflareEmail "your-email@example.com" `
    -CloudflareAPIKey "your-api-key-here"
```

**Hoặc với các tham số tùy chỉnh:**

```powershell
.\auto-setup-dns.ps1 `
    -CloudflareEmail "your-email@example.com" `
    -CloudflareAPIKey "your-api-key-here" `
    -Subdomain "sales" `
    -Domain "ammedtech.com" `
    -Service "http://frontend:80"
```

### Bước 3: Đợi và kiểm tra

Script sẽ tự động:
- ✅ Lấy Account ID
- ✅ Lấy Zone ID
- ✅ Tạo Public Hostname
- ✅ Tạo DNS record tự động
- ✅ Verify DNS record

---

## 🎯 Cách 2: Sử dụng Cloudflare Dashboard (Thủ công - Nhanh)

### Link trực tiếp:
👉 **https://one.dash.cloudflare.com/cloudflare-tunnels**

### Các bước:

1. **Click vào tunnel `sales-tunnel`**

2. **Click tab "Public Hostnames"**

3. **Click "Add a public hostname"**

4. **Điền:**
   ```
   Subdomain: sales
   Domain: ammedtech.com
   Service: http://frontend:80
   ```

5. **Click "Save hostname"**

**✅ DNS sẽ được tạo tự động trong vài giây!**

---

## 📋 So sánh 2 cách

| Tính năng | Script (Tự động) | Dashboard (Thủ công) |
|-----------|------------------|----------------------|
| **Tốc độ** | ⚡ Rất nhanh | ⏱️ Nhanh |
| **Cần API Key** | ✅ Cần | ❌ Không cần |
| **Tự động hóa** | ✅ Hoàn toàn | ❌ Thủ công |
| **Dễ sử dụng** | ⚠️ Cần setup | ✅ Rất dễ |
| **Khuyến nghị** | Cho automation | Cho người dùng thông thường |

---

## 🔧 Troubleshooting

### Script báo lỗi "Failed to get Account ID"

**Nguyên nhân:**
- Email hoặc API Key không đúng
- API Key không có quyền đủ

**Giải pháp:**
1. Kiểm tra lại email và API Key
2. Tạo API Key mới với đầy đủ quyền

### Script báo lỗi "Failed to create Public Hostname"

**Nguyên nhân:**
- Tunnel ID không đúng
- Service URL không đúng

**Giải pháp:**
1. Kiểm tra Tunnel ID trong Cloudflare Dashboard
2. Thử dùng Dashboard để tạo thủ công

### DNS không xuất hiện sau khi chạy script

**Nguyên nhân:**
- DNS cần thời gian để sync
- Có thể cần đợi 5-10 phút

**Giải pháp:**
1. Đợi 5-10 phút
2. Kiểm tra lại trong Dashboard
3. Nếu vẫn không có, tạo thủ công qua Dashboard

---

## ✅ Checklist

### Nếu dùng Script:
- [ ] Đã có Cloudflare API Key
- [ ] Đã chạy script với đúng thông tin
- [ ] Script chạy thành công
- [ ] DNS record đã được tạo

### Nếu dùng Dashboard:
- [ ] Đã truy cập Cloudflare Tunnels
- [ ] Đã click vào tunnel `sales-tunnel`
- [ ] Đã thêm Public Hostname
- [ ] DNS record đã được tạo tự động

---

## 🎯 Kết quả

Sau khi hoàn tất (bằng cách nào), bạn sẽ có:

✅ **DNS Record**: `sales.ammedtech.com` → `...cfargotunnel.com`  
✅ **Website**: https://sales.ammedtech.com  
✅ **Admin**: https://sales.ammedtech.com/admin  
✅ **SSL tự động** (Cloudflare)  
✅ **DDoS protection tự động**  

---

## 📚 Links hữu ích

- **Cloudflare Tunnels**: https://one.dash.cloudflare.com/cloudflare-tunnels
- **API Tokens**: https://dash.cloudflare.com/profile/api-tokens
- **DNS Records**: https://dash.cloudflare.com/[account-id]/ammedtech.com/dns

