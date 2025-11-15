# 🚀 Tóm tắt Deployment - An Minh Business System

## ✅ Đã khởi chạy thành công!

### Services đang chạy:

| Service | Container | Status | Port | URL |
|---------|-----------|--------|------|-----|
| **PostgreSQL** | ambs_postgres | ✅ Running | 5433:5432 | localhost:5433 |
| **Backend API** | ambs_backend | ✅ Running | 5001:5000 | http://localhost:5001 |
| **Frontend** | ambs_frontend | ✅ Running | 80:80 | http://localhost |
| **Cloudflare Tunnel** | ambs_cloudflared | ⚠️ Commented | - | Cần TUNNEL_TOKEN |

## 📋 Thông tin truy cập

### Local Development:
- **Frontend**: http://localhost
- **Backend API**: http://localhost:5001/api
- **Database**: localhost:5433

### Production (sau khi setup Cloudflare Tunnel):
- **Website**: https://sales.ammedtech.com
- **API**: https://sales.ammedtech.com/api

## 🔧 Các lệnh quản lý

### Xem status
```bash
docker-compose ps
```

### Xem logs
```bash
# Tất cả
docker-compose logs -f

# Từng service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres
```

### Restart
```bash
docker-compose restart
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

### Database
```bash
# Chạy migrations
docker-compose exec backend npx prisma migrate deploy

# Seed database
docker-compose exec backend npm run db:seed

# Prisma Studio (UI)
docker-compose exec backend npx prisma studio
```

## ⚠️ Lưu ý quan trọng

1. **Ports đã thay đổi**:
   - Database: `5433` (thay vì 5432) - để tránh conflict
   - Backend: `5001` (thay vì 5000) - để tránh conflict

2. **Cloudflare Tunnel**: 
   - Hiện đã được comment trong `docker-compose.yml`
   - Uncomment khi bạn có `CLOUDFLARE_TUNNEL_TOKEN` trong `.env`
   - Xem `SETUP_COMPLETE_GUIDE.md` để biết cách setup

3. **Environment Variables**:
   - File `.env` cần có đầy đủ thông tin
   - Xem `.env.example` để biết các biến cần thiết

## 📚 Tài liệu

- **SETUP_COMPLETE_GUIDE.md** - Hướng dẫn setup hoàn chỉnh
- **CLOUDFLARE_TUNNEL_SETUP.md** - Setup Cloudflare Tunnel
- **DNS_INFO.md** - Thông tin về DNS
- **DOCKER_DEPLOYMENT.md** - Hướng dẫn deploy chi tiết

## 🎯 Bước tiếp theo

1. ✅ Docker services đã chạy
2. ⏳ Setup Cloudflare Tunnel (xem `SETUP_COMPLETE_GUIDE.md`)
3. ⏳ Seed database (tùy chọn): `docker-compose exec backend npm run db:seed`
4. ⏳ Truy cập và kiểm tra: http://localhost

## 🔍 Kiểm tra nhanh

```bash
# Kiểm tra services
docker-compose ps

# Kiểm tra frontend
curl http://localhost

# Kiểm tra backend
curl http://localhost:5001/api

# Kiểm tra database
docker-compose exec postgres pg_isready -U postgres
```

