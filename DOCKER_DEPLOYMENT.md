# Hướng dẫn Deploy với Docker

## Yêu cầu

- Docker Engine 20.10+
- Docker Compose 2.0+
- Ít nhất 2GB RAM
- Ít nhất 10GB dung lượng ổ cứng

## Bước 1: Chuẩn bị Environment Variables

Tạo file `.env` ở thư mục root:

```env
# Database
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_secure_password_here
POSTGRES_DB=anminh_db

# Backend
NODE_ENV=production
PORT=5000
JWT_SECRET=your_jwt_secret_key_here

# Database URL (sẽ tự động tạo từ các biến trên)
DATABASE_URL=postgresql://postgres:your_secure_password_here@postgres:5432/anminh_db?schema=public
```

## Bước 2: Build và Start Services

```bash
# Build và start tất cả services
docker-compose up -d --build

# Xem logs
docker-compose logs -f

# Xem logs của từng service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres
```

## Bước 3: Chạy Database Migrations và Seed

```bash
# Chạy migrations
docker-compose exec backend npx prisma migrate deploy

# Seed database (tùy chọn)
docker-compose exec backend npm run db:seed
```

## Bước 4: Kiểm tra Services

```bash
# Kiểm tra containers đang chạy
docker-compose ps

# Kiểm tra backend
curl http://localhost:5000/api/health

# Kiểm tra frontend
curl http://localhost:80
```

## Các lệnh hữu ích

```bash
# Stop tất cả services
docker-compose down

# Stop và xóa volumes (xóa database)
docker-compose down -v

# Restart một service
docker-compose restart backend

# Xem logs real-time
docker-compose logs -f backend

# Vào container
docker-compose exec backend sh
docker-compose exec postgres psql -U postgres -d anminh_db

# Rebuild một service
docker-compose build --no-cache backend
docker-compose up -d backend
```

## Production Deployment

### 1. Cập nhật docker-compose.yml

Thêm các cấu hình production:

```yaml
services:
  backend:
    environment:
      NODE_ENV: production
    restart: always
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
```

### 2. Sử dụng Reverse Proxy (Nginx)

Tạo `nginx-proxy.conf`:

```nginx
server {
    listen 80;
    server_name sales.ammedtech.com;

    location / {
        proxy_pass http://localhost:80;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /api {
        proxy_pass http://localhost:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 3. SSL với Let's Encrypt

```bash
# Cài đặt certbot
sudo apt-get update
sudo apt-get install certbot python3-certbot-nginx

# Tạo certificate
sudo certbot --nginx -d sales.ammedtech.com
```

## Backup Database

```bash
# Backup
docker-compose exec postgres pg_dump -U postgres anminh_db > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore
docker-compose exec -T postgres psql -U postgres anminh_db < backup_20240101_120000.sql
```

## Monitoring

### Health Checks

```bash
# Backend health
curl http://localhost:5000/api/health

# Database health
docker-compose exec postgres pg_isready -U postgres
```

### Resource Usage

```bash
# Xem resource usage
docker stats

# Xem disk usage
docker system df
```

## Troubleshooting

### Container không start

```bash
# Xem logs
docker-compose logs backend

# Kiểm tra container status
docker-compose ps

# Restart
docker-compose restart backend
```

### Database connection error

```bash
# Kiểm tra database đang chạy
docker-compose ps postgres

# Kiểm tra connection
docker-compose exec backend npx prisma db pull
```

### Port đã được sử dụng

```bash
# Kiểm tra port
netstat -tulpn | grep :5000

# Thay đổi port trong docker-compose.yml
ports:
  - "5001:5000"  # Thay đổi port host
```

## Security Best Practices

1. **Đổi mật khẩu mặc định**: Cập nhật `POSTGRES_PASSWORD` và `JWT_SECRET`
2. **Firewall**: Chỉ mở port cần thiết (80, 443, 5000)
3. **SSL/TLS**: Sử dụng HTTPS trong production
4. **Regular updates**: Cập nhật Docker images thường xuyên
5. **Backup**: Tự động backup database hàng ngày

