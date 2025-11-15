# 🚀 Hướng dẫn Setup Hoàn Chỉnh - sales.ammedtech.com

## ✅ Đã hoàn tất cấu hình Docker

Dự án đã được build và cấu hình để chạy với Docker. Bây giờ bạn cần:

## 🎯 Quick Links - Click để bắt đầu

👉 **Cloudflare Dashboard**: https://dash.cloudflare.com  
👉 **Zero Trust / Tunnels**: https://one.dash.cloudflare.com/cloudflare-tunnels  
👉 **DNS Records**: https://dash.cloudflare.com/[account-id]/ammedtech.com/dns  

**📖 Xem hướng dẫn chi tiết**: `CLOUDFLARE_QUICK_SETUP.md`

## Bước 1: Tạo Cloudflare Tunnel

### 1.1. Đăng nhập Cloudflare

1. Truy cập: **https://dash.cloudflare.com**
2. Đăng nhập vào tài khoản
3. Chọn domain: **`ammedtech.com`**

### 1.2. Kích hoạt Zero Trust

1. Truy cập: **https://one.dash.cloudflare.com/**
2. Nếu chưa có, chọn plan **Free** và tiếp tục

### 1.3. Tạo Tunnel

1. Truy cập: **https://one.dash.cloudflare.com/cloudflare-tunnels**
2. Click **Create a tunnel**
3. Chọn **Cloudflared**
4. Đặt tên: **`sales-tunnel`**
5. Click **Save tunnel**

### 1.4. Copy Tunnel Token

Sau khi tạo, bạn sẽ thấy **Token**. Copy token này ngay!

Token có dạng: `eyJhIjoi...` (rất dài)

### 1.5. Cấu hình Public Hostname (Tạo DNS tự động)

1. Vào tunnel **`sales-tunnel`** (từ link trên)
2. Click tab **Public Hostnames**
3. Click **Add a public hostname**
4. Điền:
   ```
   Subdomain: sales
   Domain: ammedtech.com
   Service: http://frontend:80
   ```
5. Click **Save hostname**

**✅ DNS record sẽ được tạo TỰ ĐỘNG!**

**📖 Xem chi tiết về DNS:** `DNS_SETUP_GUIDE.md`

## Bước 2: Thêm Token vào .env

Mở file `.env` và thêm:

```env
CLOUDFLARE_TUNNEL_TOKEN=your_token_from_step_1.4_here
```

## Bước 3: Uncomment Cloudflared trong docker-compose.yml

File `docker-compose.yml` đã được cấu hình sẵn. Chỉ cần đảm bảo có token trong `.env`.

## Bước 4: Restart Services

```bash
docker-compose restart cloudflared
```

Hoặc restart tất cả:

```bash
docker-compose restart
```

## Bước 5: Kiểm tra

### 5.1. Kiểm tra Tunnel Status

1. Vào Cloudflare Dashboard: **Zero Trust** > **Networks** > **Tunnels**
2. Click vào **`sales-tunnel`**
3. Status phải là **🟢 HEALTHY**

### 5.2. Kiểm tra DNS

1. Vào **DNS** > **Records**
2. Tìm record:
   - **Type**: `CNAME`
   - **Name**: `sales`
   - **Target**: `...cfargotunnel.com`

### 5.3. Truy cập Website

Sau 5-10 phút (DNS propagation):
- **Main site**: https://sales.ammedtech.com
- **Admin panel**: https://sales.ammedtech.com/admin

## Cấu trúc URL

| URL | Mô tả |
|-----|-------|
| `https://sales.ammedtech.com` | Trang chủ / Onboarding |
| `https://sales.ammedtech.com/admin` | Admin Login |
| `https://sales.ammedtech.com/admin/dashboard` | Admin Dashboard |
| `https://sales.ammedtech.com/admin/users` | Quản lý người dùng |
| `https://sales.ammedtech.com/admin/customers` | Quản lý khách hàng |
| `https://sales.ammedtech.com/admin/products` | Quản lý sản phẩm |
| `https://sales.ammedtech.com/admin/orders` | Quản lý đơn hàng |
| `https://sales.ammedtech.com/admin/settings` | Cài đặt hệ thống |
| `https://sales.ammedtech.com/admin/promotions` | Quản lý khuyến mãi |
| `https://sales.ammedtech.com/admin/loyalty` | Quản lý tích lũy |
| `https://sales.ammedtech.com/admin/customer-segments` | Phân nhóm khách hàng |
| `https://sales.ammedtech.com/admin/trade-activities` | Hoạt động thương mại |
| `https://sales.ammedtech.com/admin/kpi` | KPI & Incentive |
| `https://sales.ammedtech.com/admin/approvals` | Phê duyệt |

## Troubleshooting

### Tunnel không kết nối

```bash
# Kiểm tra logs
docker-compose logs cloudflared

# Kiểm tra token
cat .env | grep TUNNEL_TOKEN

# Restart
docker-compose restart cloudflared
```

### Backend không chạy

```bash
# Xem logs
docker-compose logs backend

# Kiểm tra database
docker-compose exec postgres pg_isready -U postgres

# Restart
docker-compose restart backend
```

### Frontend không load

```bash
# Xem logs
docker-compose logs frontend

# Kiểm tra nginx
docker-compose exec frontend nginx -t

# Restart
docker-compose restart frontend
```

### DNS không resolve

- Đợi 5-10 phút để DNS propagate
- Kiểm tra tunnel status phải là HEALTHY
- Xóa DNS cache: `ipconfig /flushdns` (Windows)

## Lệnh hữu ích

```bash
# Xem status tất cả services
docker-compose ps

# Xem logs real-time
docker-compose logs -f

# Restart tất cả
docker-compose restart

# Stop tất cả
docker-compose stop

# Start lại
docker-compose start

# Rebuild và start
docker-compose up -d --build
```

## Checklist Hoàn Thành

- [ ] Đã tạo Cloudflare Tunnel
- [ ] Đã copy Tunnel Token
- [ ] Đã cấu hình Public Hostname: `sales.ammedtech.com` → `http://frontend:80`
- [ ] Đã thêm `CLOUDFLARE_TUNNEL_TOKEN` vào `.env`
- [ ] Đã restart cloudflared service
- [ ] Tunnel status là **HEALTHY**
- [ ] DNS record đã được tạo tự động
- [ ] Có thể truy cập `https://sales.ammedtech.com`
- [ ] Có thể truy cập `https://sales.ammedtech.com/admin`

## Thông tin DNS (Tự động tạo)

Khi bạn tạo Public Hostname, DNS record sẽ được tạo tự động:

```
Type: CNAME
Name: sales
Target: <tunnel-id>.cfargotunnel.com
Proxy: Proxied (🟠)
TTL: Auto
```

**Bạn KHÔNG cần tạo DNS record thủ công!**

## Kết quả

Sau khi hoàn tất, bạn sẽ có:

✅ Website chạy tại: **https://sales.ammedtech.com**  
✅ Admin panel tại: **https://sales.ammedtech.com/admin**  
✅ API tại: **https://sales.ammedtech.com/api**  
✅ SSL tự động (Cloudflare)  
✅ DDoS protection tự động  
✅ Không cần mở port trên server  
✅ Không cần IP công khai  

