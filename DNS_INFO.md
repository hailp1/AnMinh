# 📋 Thông tin DNS Record cho sales.ammedtech.com

## ⚠️ QUAN TRỌNG: Với Cloudflare Tunnel

**Bạn KHÔNG cần tạo DNS record thủ công!**

Khi bạn tạo **Public Hostname** trong Cloudflare Tunnel, DNS record sẽ được tạo **TỰ ĐỘNG**.

## Thông tin DNS Record (Tự động tạo)

Sau khi bạn cấu hình Public Hostname trong Cloudflare Tunnel, DNS record sẽ có dạng:

```
Type: CNAME
Name: sales
Target: <tunnel-id>.cfargotunnel.com
Proxy status: Proxied (🟠)
TTL: Auto
```

**Ví dụ:**
```
Type: CNAME
Name: sales
Target: abc123def456.cfargotunnel.com
Proxy status: Proxied
TTL: Auto
```

## Cách kiểm tra DNS đã được tạo

### 1. Trong Cloudflare Dashboard

1. Vào **DNS** > **Records**
2. Tìm record có:
   - **Type**: `CNAME`
   - **Name**: `sales`
   - **Target**: `...cfargotunnel.com`

### 2. Bằng Command Line

**Windows:**
```powershell
nslookup sales.ammedtech.com
```

**Linux/Mac:**
```bash
dig sales.ammedtech.com
# hoặc
nslookup sales.ammedtech.com
```

**Kết quả mong đợi:**
```
sales.ammedtech.com canonical name = <tunnel-id>.cfargotunnel.com
```

## Nếu muốn tạo DNS thủ công (KHÔNG KHUYẾN NGHỊ)

Nếu vì lý do nào đó bạn muốn tạo DNS record thủ công thay vì dùng Tunnel:

### Option 1: DNS A Record (Cần IP công khai)

1. Vào **DNS** > **Records**
2. Click **Add record**
3. Điền:
   ```
   Type: A
   Name: sales
   IPv4 address: <IP-công-khai-của-server>
   Proxy status: Proxied (🟠)
   TTL: Auto
   ```
4. Click **Save**

**Lưu ý:** Với cách này, bạn cần:
- IP công khai của server
- Mở port 80, 443 trên server
- Cấu hình SSL certificate

### Option 2: DNS CNAME (Nếu có domain khác)

1. Vào **DNS** > **Records**
2. Click **Add record**
3. Điền:
   ```
   Type: CNAME
   Name: sales
   Target: <domain-khác-của-bạn>
   Proxy status: Proxied (🟠)
   TTL: Auto
   ```
4. Click **Save**

## So sánh: Tunnel vs DNS A Record

| Tính năng | Cloudflare Tunnel | DNS A Record |
|-----------|-------------------|-------------|
| Cần IP công khai | ❌ Không | ✅ Có |
| Cần mở port | ❌ Không | ✅ Có |
| DNS tự động | ✅ Có | ❌ Tự tạo |
| Bảo mật | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| Setup | Dễ | Phức tạp hơn |

## Kết luận

**Sử dụng Cloudflare Tunnel** - DNS sẽ được tạo tự động khi bạn cấu hình Public Hostname. Không cần làm gì thêm!

Xem file `SETUP_COMPLETE_GUIDE.md` để biết cách setup hoàn chỉnh.

