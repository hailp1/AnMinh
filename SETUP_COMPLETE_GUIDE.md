# 🚀 Hướng dẫn Setup Hoàn Chỉnh - An Minh Business System

## Bước 1: Tạo Cloudflare Tunnel

### 1.1. Đăng nhập Cloudflare

1. Truy cập: **https://dash.cloudflare.com**
2. Đăng nhập vào tài khoản của bạn
3. Chọn domain: **`ammedtech.com`**

### 1.2. Kích hoạt Zero Trust (Nếu chưa có)

1. Vào **Zero Trust** (có thể ở menu bên trái hoặc tìm kiếm)
2. Nếu chưa kích hoạt, Cloudflare sẽ hướng dẫn bạn (miễn phí)
3. Chọn plan **Free** và tiếp tục

### 1.3. Tạo Tunnel

1. Vào **Zero Trust** > **Networks** > **Tunnels**
2. Click nút **Create a tunnel** (màu xanh)
3. Chọn **Cloudflared**
4. Đặt tên tunnel: **`sales-tunnel`**
5. Click **Save tunnel**

### 1.4. Lấy Tunnel Token

Sau khi tạo tunnel, bạn sẽ thấy màn hình với **Token**. 

**⚠️ QUAN TRỌNG:** Copy token này ngay (bạn sẽ không thấy lại nữa nếu đóng trang)

Token sẽ có dạng:
```
eyJhIjoi... (rất dài)
```

**Lưu token này vào file `.env`:**

```bash
# Thêm dòng này vào file .env
CLOUDFLARE_TUNNEL_TOKEN=eyJhIjoi... (paste token của bạn vào đây)
```

### 1.5. Cấu hình Public Hostname

1. Vào tunnel vừa tạo: Click vào **`sales-tunnel`**
2. Click tab **Public Hostnames**
3. Click **Add a public hostname**
4. Điền thông tin:

   ```
   Subdomain: sales
   Domain: ammedtech.com
   Service: http://frontend:80
   ```

5. Click **Save hostname**

**✅ DNS sẽ được tạo tự động!** Bạn không cần tạo DNS record thủ công nữa.

## Bước 2: Cấu hình Environment Variables

Tạo hoặc cập nhật file `.env` ở thư mục root:

```env
# Database
POSTGRES_USER=postgres
POSTGRES_PASSWORD=change_this_secure_password
POSTGRES_DB=anminh_db

# Backend
NODE_ENV=production
PORT=5000
JWT_SECRET=change_this_jwt_secret_key_min_32_chars

# Cloudflare Tunnel Token (lấy từ Bước 1.4)
CLOUDFLARE_TUNNEL_TOKEN=your_tunnel_token_here
```

**⚠️ LƯU Ý:**
- Đổi `POSTGRES_PASSWORD` thành mật khẩu mạnh
- Đổi `JWT_SECRET` thành chuỗi ngẫu nhiên dài (ít nhất 32 ký tự)
- Paste `CLOUDFLARE_TUNNEL_TOKEN` từ Bước 1.4

## Bước 3: Build và Start Docker Services

```bash
# 1. Build và start tất cả services
docker-compose up -d --build

# 2. Xem logs để kiểm tra
docker-compose logs -f

# 3. Xem logs của từng service
docker-compose logs -f cloudflared
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres
```

## Bước 4: Chạy Database Migrations

```bash
# Chờ database sẵn sàng (khoảng 10-15 giây)
sleep 15

# Chạy migrations
docker-compose exec backend npx prisma migrate deploy

# Seed database (tùy chọn - tạo dữ liệu mẫu)
docker-compose exec backend npm run db:seed
```

## Bước 5: Kiểm tra Tunnel Status

1. Vào Cloudflare Dashboard: **Zero Trust** > **Networks** > **Tunnels**
2. Click vào **`sales-tunnel`**
3. Kiểm tra status phải là **🟢 HEALTHY** (màu xanh)

Nếu status là **🔴 UNHEALTHY**:
- Kiểm tra logs: `docker-compose logs cloudflared`
- Kiểm tra token trong `.env` đúng chưa
- Đảm bảo frontend và backend đang chạy: `docker-compose ps`

## Bước 6: Kiểm tra DNS

DNS record đã được tạo tự động khi bạn thêm Public Hostname. Bạn có thể kiểm tra:

1. Vào **DNS** > **Records** trong Cloudflare Dashboard
2. Tìm record:
   - **Type**: `CNAME`
   - **Name**: `sales`
   - **Target**: `...cfargotunnel.com` (tự động tạo)
   - **Proxy status**: 🟠 **Proxied**

Hoặc kiểm tra bằng command:
```bash
# Windows
nslookup sales.ammedtech.com

# Linux/Mac
dig sales.ammedtech.com
```

## Bước 7: Truy cập Website

Sau khi tunnel status là **HEALTHY** và DNS đã propagate (5-10 phút):

1. Truy cập: **https://sales.ammedtech.com**
2. Kiểm tra SSL: https://www.ssllabs.com/ssltest/analyze.html?d=sales.ammedtech.com

## Bước 8: Cấu hình SSL/TLS (Tự động)

Với Cloudflare Tunnel, SSL được xử lý tự động. Bạn chỉ cần:

1. Vào **SSL/TLS** > **Overview**
2. Chọn **Full (strict)** mode
3. Xong!

## Checklist Hoàn Thành

- [ ] Đã tạo Cloudflare Tunnel
- [ ] Đã copy và lưu Tunnel Token vào `.env`
- [ ] Đã cấu hình Public Hostname: `sales.ammedtech.com` → `http://frontend:80`
- [ ] Đã tạo file `.env` với đầy đủ thông tin
- [ ] Đã build và start Docker services
- [ ] Đã chạy database migrations
- [ ] Tunnel status là **HEALTHY**
- [ ] DNS record đã được tạo tự động
- [ ] Có thể truy cập `https://sales.ammedtech.com`

## Troubleshooting

### Tunnel không kết nối

```bash
# Kiểm tra logs
docker-compose logs cloudflared

# Kiểm tra token
cat .env | grep TUNNEL_TOKEN

# Restart tunnel
docker-compose restart cloudflared
```

### DNS không resolve

- Đợi 5-10 phút để DNS propagate
- Kiểm tra Public Hostname đã được tạo trong Cloudflare Dashboard
- Kiểm tra tunnel status phải là HEALTHY

### 502 Bad Gateway

```bash
# Kiểm tra services đang chạy
docker-compose ps

# Kiểm tra frontend
docker-compose logs frontend

# Kiểm tra backend
docker-compose logs backend
```

### Database connection error

```bash
# Kiểm tra database
docker-compose exec postgres pg_isready -U postgres

# Kiểm tra connection
docker-compose exec backend npx prisma db pull
```

## Thông tin DNS Record (Tự động tạo)

Khi bạn tạo Public Hostname trong Cloudflare Tunnel, DNS record sẽ được tạo tự động:

```
Type: CNAME
Name: sales
Target: <tunnel-id>.cfargotunnel.com
Proxy: Proxied (🟠)
TTL: Auto
```

**Bạn KHÔNG cần tạo DNS record thủ công!** Cloudflare Tunnel sẽ tự động tạo và quản lý.

## Liên hệ Hỗ trợ

Nếu gặp vấn đề, kiểm tra:
1. Logs: `docker-compose logs -f`
2. Tunnel status trong Cloudflare Dashboard
3. File `CLOUDFLARE_TUNNEL_SETUP.md` để biết thêm chi tiết

