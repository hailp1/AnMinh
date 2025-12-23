# 🚀 Hướng Dẫn Publish AM Medtech DMS lên Production

## 📋 Yêu Cầu Trước Khi Publish

### 1. Cài Đặt Docker Desktop
- Tải và cài đặt Docker Desktop cho Windows
- Đảm bảo Docker đang chạy (icon Docker ở system tray)

### 2. Cloudflare Tunnel Credentials
Đảm bảo file `tunnel-creds.json` đã tồn tại trong thư mục gốc dự án với nội dung credentials từ Cloudflare.

### 3. Cấu Hình Domain
- Domain: `dms.ammedtech.com`
- Tunnel ID: `ebe58fd0-0808-4d20-849d-2656840fdf9b`
- Đã được cấu hình trong `cloudflare-tunnel.yml`

---

## 🎯 Các Bước Publish

### Bước 1: Publish Hệ Thống
```bash
cd d:\AM_DMS
scripts\PUBLISH_PRODUCTION.bat
```

Script này sẽ:
1. ✅ Kiểm tra Docker và Cloudflare credentials
2. 🛑 Dừng các container cũ (nếu có)
3. 🏗️ Build tất cả services (Backend, Frontend, Landing, WebApp)
4. 🚀 Khởi động toàn bộ hệ thống
5. 🌐 Kết nối Cloudflare Tunnel

**Thời gian ước tính:** 5-10 phút (lần đầu build)

### Bước 2: Kiểm Tra Trạng Thái
```bash
scripts\CHECK_PRODUCTION.bat
```

Script này sẽ kiểm tra:
- ✅ Trạng thái các containers
- ✅ Kết nối Cloudflare Tunnel
- ✅ Backend API
- ✅ Frontend
- ✅ Database
- ✅ Domain public (https://dms.ammedtech.com)

### Bước 3: Truy Cập Hệ Thống

#### 🌐 URL Public (qua Cloudflare Tunnel)
- **DMS System:** https://dms.ammedtech.com
- **Backend API:** https://dms.ammedtech.com/api
- **Landing Page:** https://ammedtech.com (Vercel)

#### 🔍 URL Local (để test)
- **Landing Page:** http://localhost:3000
- **DMS Frontend:** http://localhost:3099
- **Web App:** http://localhost:3001
- **Backend API:** http://localhost:5001
- **Database:** localhost:5433

---

## 🔧 Quản Lý Hệ Thống

### Xem Logs Realtime
```bash
# Tất cả services
docker-compose -f docker-compose.yml logs -f

# Chỉ Cloudflare Tunnel
docker logs dms_tunnel -f

# Chỉ Backend
docker logs dms_backend -f

# Chỉ Frontend
docker logs dms_frontend -f
```

### Restart Service
```bash
# Restart tất cả
docker-compose -f docker-compose.yml restart

# Restart một service cụ thể
docker-compose -f docker-compose.yml restart backend
docker-compose -f docker-compose.yml restart frontend
docker-compose -f docker-compose.yml restart cloudflared
```

### Rebuild Service (sau khi sửa code)
```bash
# Rebuild và restart một service
docker-compose -f docker-compose.yml up -d --build backend
docker-compose -f docker-compose.yml up -d --build frontend
```

### Dừng Hệ Thống
```bash
scripts\STOP_PRODUCTION.bat
```

---

## 🔍 Troubleshooting

### 1. Cloudflare Tunnel không kết nối
```bash
# Xem logs tunnel
docker logs dms_tunnel

# Restart tunnel
docker-compose -f docker-compose.yml restart cloudflared
```

**Nguyên nhân thường gặp:**
- File `tunnel-creds.json` không đúng
- Tunnel ID trong `cloudflare-tunnel.yml` không khớp
- Cloudflare DNS chưa được cấu hình

### 2. Frontend không load được
```bash
# Kiểm tra logs
docker logs dms_frontend

# Rebuild frontend
docker-compose -f docker-compose.yml up -d --build frontend
```

### 3. Backend API lỗi
```bash
# Kiểm tra logs
docker logs dms_backend

# Kiểm tra database connection
docker exec dms_postgres pg_isready -U postgres

# Restart backend
docker-compose -f docker-compose.yml restart backend
```

### 4. Database không khởi động
```bash
# Xem logs database
docker logs dms_postgres

# Kiểm tra volume
docker volume ls | findstr postgres

# Nếu cần reset database (CẨN THẬN - MẤT DATA)
docker-compose -f docker-compose.yml down -v
scripts\PUBLISH_PRODUCTION.bat
```

---

## 📊 Kiến Trúc Hệ Thống

```
┌─────────────────────────────────────────────────────────┐
│                    Internet Users                        │
└───────────────────┬─────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────┐
│              Cloudflare (DNS + CDN)                      │
└───────────────────┬─────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────┐
│         Cloudflare Tunnel (dms_tunnel)                   │
│         Tunnel ID: ebe58fd0-0808-4d20-849d-2656840fdf9b │
└───────────────────┬─────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────┐
│              DMS Frontend (dms_frontend)                 │
│              Port: 80 (internal), 3099 (external)        │
│              Nginx serving React build                   │
└───────────────────┬─────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────┐
│              DMS Backend (dms_backend)                   │
│              Port: 5000 (internal), 5001 (external)      │
│              Node.js Express API                         │
└───────────────────┬─────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────┐
│              PostgreSQL (dms_postgres)                   │
│              Port: 5432 (internal), 5433 (external)      │
│              Database: anminh_db                         │
└─────────────────────────────────────────────────────────┘
```

---

## 🔐 Bảo Mật

### Environment Variables
Các biến môi trường quan trọng trong `.env`:
```env
POSTGRES_USER=postgres
POSTGRES_PASSWORD=<strong-password>
POSTGRES_DB=anminh_db
JWT_SECRET=<minimum-32-characters>
```

### Cloudflare Tunnel
- ✅ Tất cả traffic được mã hóa qua Cloudflare
- ✅ Không cần mở port trên firewall
- ✅ DDoS protection tự động
- ✅ SSL/TLS được quản lý bởi Cloudflare

---

## 📝 Checklist Trước Khi Publish

- [ ] Docker Desktop đang chạy
- [ ] File `tunnel-creds.json` tồn tại
- [ ] File `.env` đã được cấu hình đúng
- [ ] Code đã được commit và push lên Git
- [ ] Database backup đã được tạo (nếu có data quan trọng)
- [ ] Đã test trên local environment
- [ ] Cloudflare DNS đã được cấu hình cho `dms.ammedtech.com`

---

## 🎉 Sau Khi Publish Thành Công

1. ✅ Truy cập https://dms.ammedtech.com
2. ✅ Test đăng nhập với tài khoản admin
3. ✅ Kiểm tra các chức năng chính
4. ✅ Monitor logs trong 24h đầu
5. ✅ Setup backup tự động cho database

---

## 📞 Hỗ Trợ

Nếu gặp vấn đề, kiểm tra:
1. Logs của các containers
2. Cloudflare Tunnel status
3. Network connectivity
4. Database connection

**Lệnh hữu ích:**
```bash
# Xem tất cả containers
docker ps -a

# Xem logs tất cả services
docker-compose -f docker-compose.yml logs

# Restart toàn bộ hệ thống
scripts\STOP_PRODUCTION.bat
scripts\PUBLISH_PRODUCTION.bat
```
