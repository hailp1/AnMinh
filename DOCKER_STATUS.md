# 🐳 Docker Status - An Minh Business System

## ✅ Đã khởi chạy thành công!

### Services đang chạy:

1. **PostgreSQL Database** (ambs_postgres)
   - Port: `5433:5432` (mapped to 5433 để tránh conflict)
   - Status: ✅ Running

2. **Backend API** (ambs_backend)
   - Port: `5000:5000`
   - Status: ✅ Running
   - URL: http://localhost:5000

3. **Frontend** (ambs_frontend)
   - Port: `80:80`
   - Status: ✅ Running
   - URL: http://localhost

4. **Cloudflare Tunnel** (ambs_cloudflared)
   - Status: ⚠️ Cần CLOUDFLARE_TUNNEL_TOKEN trong .env

## 📋 Các lệnh hữu ích

### Xem status
```bash
docker-compose ps
```

### Xem logs
```bash
# Tất cả services
docker-compose logs -f

# Từng service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres
docker-compose logs -f cloudflared
```

### Restart services
```bash
# Tất cả
docker-compose restart

# Từng service
docker-compose restart backend
```

### Stop/Start
```bash
# Stop
docker-compose stop

# Start
docker-compose start

# Down (xóa containers)
docker-compose down

# Up (tạo và start)
docker-compose up -d
```

### Database operations
```bash
# Chạy migrations
docker-compose exec backend npx prisma migrate deploy

# Seed database
docker-compose exec backend npm run db:seed

# Prisma Studio (UI để xem database)
docker-compose exec backend npx prisma studio
```

## ⚠️ Lưu ý

1. **Cloudflare Tunnel**: Cần thêm `CLOUDFLARE_TUNNEL_TOKEN` vào file `.env` để tunnel hoạt động
2. **Database Port**: Đã đổi từ 5432 sang 5433 để tránh conflict với PostgreSQL local
3. **Frontend**: Truy cập tại http://localhost
4. **Backend API**: Truy cập tại http://localhost:5000/api

## 🔧 Troubleshooting

### Port đã được sử dụng
```bash
# Kiểm tra port
docker-compose ps

# Đổi port trong docker-compose.yml nếu cần
```

### Services không start
```bash
# Xem logs
docker-compose logs [service-name]

# Rebuild
docker-compose build --no-cache [service-name]
docker-compose up -d [service-name]
```

### Database connection error
```bash
# Kiểm tra database đang chạy
docker-compose exec postgres pg_isready -U postgres

# Restart database
docker-compose restart postgres
```

