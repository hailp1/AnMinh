# Quick Start Guide - Docker Deployment

## 🚀 Deploy nhanh với Docker

### 1. Tạo Cloudflare Tunnel (Bắt buộc)

Xem file **`SETUP_COMPLETE_GUIDE.md`** để biết cách tạo Cloudflare Tunnel và lấy token.

### 2. Tạo file .env

```bash
# Copy file mẫu
cp .env.example .env

# Hoặc tạo thủ công
cat > .env << EOF
POSTGRES_USER=postgres
POSTGRES_PASSWORD=change_this_secure_password
POSTGRES_DB=anminh_db
JWT_SECRET=change_this_jwt_secret_min_32_chars
NODE_ENV=production
CLOUDFLARE_TUNNEL_TOKEN=your_tunnel_token_from_cloudflare
EOF
```

**⚠️ QUAN TRỌNG:** 
- Đổi mật khẩu và JWT secret
- Thêm `CLOUDFLARE_TUNNEL_TOKEN` từ Cloudflare Dashboard

### 2. Build và Start

```bash
# Build và start tất cả services
docker-compose up -d --build

# Xem logs
docker-compose logs -f
```

### 3. Chạy Database Migrations

```bash
# Chờ database sẵn sàng (khoảng 10 giây)
sleep 10

# Chạy migrations
docker-compose exec backend npx prisma migrate deploy

# Seed database (tùy chọn)
docker-compose exec backend npm run db:seed
```

### 4. Kiểm tra

- Frontend: http://localhost
- Backend API: http://localhost:5000/api
- Database: localhost:5432

## 📋 Cấu hình Cloudflare

Xem file `CLOUDFLARE_SETUP.md` để cấu hình domain `sales.ammedtech.com`

## 🔧 Troubleshooting

```bash
# Xem logs
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres

# Restart services
docker-compose restart

# Rebuild
docker-compose up -d --build --force-recreate
```

## 📚 Tài liệu chi tiết

- `DOCKER_DEPLOYMENT.md` - Hướng dẫn deploy chi tiết
- `CLOUDFLARE_SETUP.md` - Cấu hình Cloudflare DNS

