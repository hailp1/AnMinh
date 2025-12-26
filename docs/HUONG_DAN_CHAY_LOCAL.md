# 🖥️ Hướng Dẫn Chạy Hệ Thống Trên Local

## 📋 Tổng Quan

Có **3 cách** để chạy hệ thống trên máy local:

1. **Docker (Khuyến nghị)** - Đơn giản nhất, không cần cài đặt gì thêm
2. **Local Development** - Chạy từng service riêng lẻ, tốt cho dev
3. **Pre-Production** - Giống production nhưng chạy local

---

## 🚀 CÁCH 1: Chạy Bằng Docker (KHUYẾN NGHỊ)

### Bước 1: Chuẩn Bị
```bash
# Đảm bảo Docker Desktop đang chạy
# Kiểm tra: mở Docker Desktop hoặc chạy lệnh
docker --version
```

### Bước 2: Khởi Động Hệ Thống
```bash
cd d:\AM_DMS

# Khởi động tất cả services
docker-compose up -d
```

### Bước 3: Đợi Services Khởi Động
```bash
# Xem logs để theo dõi
docker-compose logs -f

# Hoặc kiểm tra trạng thái
docker-compose ps
```

### Bước 4: Truy Cập Hệ Thống

**URLs Local:**
- 🌐 **Landing Page:** http://localhost:3000
- 💼 **DMS Frontend:** http://localhost:3099
- 🔧 **Backend API:** http://localhost:5001
- 📊 **Web App:** http://localhost:3001
- 🗄️ **Database:** localhost:5433

**Tài khoản đăng nhập:**
- Username: `admin`
- Password: `123456`

### Bước 5: Dừng Hệ Thống
```bash
# Dừng nhưng giữ data
docker-compose down

# Dừng và xóa data (cẩn thận!)
docker-compose down -v
```

---

## 💻 CÁCH 2: Local Development (Cho Developers)

### Bước 1: Cài Đặt Dependencies

#### Backend
```bash
cd d:\AM_DMS\DMS\backend
npm install
```

#### Frontend
```bash
cd d:\AM_DMS\DMS\frontend
npm install
```

#### Landing Page
```bash
cd d:\AM_DMS\home\landing
npm install
```

### Bước 2: Chuẩn Bị Database

**Option A: Dùng Docker cho Database**
```bash
cd d:\AM_DMS
docker-compose up -d postgres
```

**Option B: Cài PostgreSQL Local**
- Tải PostgreSQL 15 từ https://www.postgresql.org/download/
- Cài đặt và tạo database `anminh_db`

### Bước 3: Cấu Hình Environment Variables

#### Backend (.env)
```bash
cd d:\AM_DMS\DMS\backend
copy .env.example .env
```

Sửa file `.env`:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/anminh_db?schema=public"
JWT_SECRET="your-secret-key-minimum-32-characters-long"
PORT=5000
NODE_ENV=development
```

#### Frontend (.env)
```bash
cd d:\AM_DMS\DMS\frontend
copy .env.example .env
```

Sửa file `.env`:
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_CUSTOMER_ID=Anminh
```

### Bước 4: Setup Database Schema
```bash
cd d:\AM_DMS\DMS\backend

# Tạo schema
npx prisma db push

# Seed data mẫu
npx prisma db seed
```

### Bước 5: Chạy Từng Service

**Terminal 1 - Backend:**
```bash
cd d:\AM_DMS\DMS\backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd d:\AM_DMS\DMS\frontend
npm start
```

**Terminal 3 - Landing Page:**
```bash
cd d:\AM_DMS\home\landing
npm run dev
```

### Bước 6: Truy Cập
- Backend API: http://localhost:5000/api
- Frontend: http://localhost:3000
- Landing: http://localhost:3000

---

## 🧪 CÁCH 3: Pre-Production Environment

Môi trường này giống production nhưng chạy trên local với ports khác để tránh conflict.

### Khởi Động
```bash
cd d:\AM_DMS
scripts\START_PREPROD.bat
```

### URLs Pre-Production
- 🌐 **Landing Page:** http://localhost:3500
- 💼 **DMS Frontend:** http://localhost:3599
- 🔧 **Backend API:** http://localhost:5555
- 📊 **Web App:** http://localhost:3501
- 🗄️ **Database:** localhost:5455

### Dừng
```bash
scripts\STOP_PREPROD.bat
```

---

## 🔧 Quản Lý Hệ Thống Local

### Xem Logs
```bash
# Docker mode
docker-compose logs -f

# Xem log một service cụ thể
docker logs dms_backend -f
docker logs dms_frontend -f
```

### Restart Services
```bash
# Restart tất cả
docker-compose restart

# Restart một service
docker-compose restart backend
docker-compose restart frontend
```

### Rebuild Sau Khi Sửa Code
```bash
# Rebuild backend
docker-compose up -d --build backend

# Rebuild frontend
docker-compose up -d --build frontend

# Rebuild tất cả
docker-compose up -d --build
```

### Kiểm Tra Trạng Thái
```bash
# Xem containers đang chạy
docker-compose ps

# Xem chi tiết
docker ps -a
```

---

## 🗄️ Quản Lý Database Local

### Backup Database
```bash
# Nếu dùng Docker
docker exec dms_postgres pg_dump -U postgres anminh_db > backup.sql

# Nếu dùng PostgreSQL local
pg_dump -U postgres anminh_db > backup.sql
```

### Restore Database
```bash
# Nếu dùng Docker
docker exec -i dms_postgres psql -U postgres anminh_db < backup.sql

# Nếu dùng PostgreSQL local
psql -U postgres anminh_db < backup.sql
```

### Reset Database (Mất Data!)
```bash
cd d:\AM_DMS\DMS\backend

# Xóa và tạo lại schema
npx prisma db push --force-reset

# Seed lại data
npx prisma db seed
```

### Seed Data Mẫu
```bash
# Seed data đầy đủ (500+ pharmacies)
cd d:\AM_DMS
scripts\SEED_COMPLETE_DATA.bat

# Kiểm tra data
scripts\CHECK_DATA.bat
```

---

## 🔍 Troubleshooting

### 1. Port đã được sử dụng
**Lỗi:** `Port 3000 is already in use`

**Giải pháp:**
```bash
# Tìm process đang dùng port
netstat -ano | findstr :3000

# Kill process (thay PID bằng số từ lệnh trên)
taskkill /PID <PID> /F

# Hoặc dùng pre-prod (ports khác)
scripts\START_PREPROD.bat
```

### 2. Database Connection Failed
**Lỗi:** `Can't reach database server`

**Giải pháp:**
```bash
# Kiểm tra PostgreSQL đang chạy
docker ps | findstr postgres

# Hoặc
docker-compose ps postgres

# Restart database
docker-compose restart postgres
```

### 3. Frontend Không Load
**Lỗi:** Trang trắng hoặc lỗi 404

**Giải pháp:**
```bash
# Clear cache và rebuild
cd d:\AM_DMS\DMS\frontend
rm -rf node_modules build
npm install
npm start

# Hoặc với Docker
docker-compose up -d --build frontend
```

### 4. Backend API Lỗi
**Lỗi:** 500 Internal Server Error

**Giải pháp:**
```bash
# Xem logs
docker logs dms_backend --tail 100

# Kiểm tra database connection
docker exec dms_postgres pg_isready -U postgres

# Restart backend
docker-compose restart backend
```

---

## 📊 So Sánh 3 Cách

| Tiêu chí | Docker | Local Dev | Pre-Prod |
|----------|--------|-----------|----------|
| **Độ khó** | ⭐ Dễ | ⭐⭐⭐ Khó | ⭐⭐ Trung bình |
| **Tốc độ setup** | Nhanh (5 phút) | Chậm (30 phút) | Nhanh (5 phút) |
| **Hot reload** | ❌ Không | ✅ Có | ❌ Không |
| **Giống production** | ✅ 100% | ❌ 70% | ✅ 100% |
| **Dùng cho** | Test, Demo | Development | UAT Testing |

---

## 💡 Khuyến Nghị

### Cho Người Mới / Test / Demo
👉 **Dùng Docker** (Cách 1)
```bash
docker-compose up -d
```

### Cho Developers
👉 **Dùng Local Dev** (Cách 2) để có hot reload

### Cho Testing Trước Production
👉 **Dùng Pre-Prod** (Cách 3)
```bash
scripts\START_PREPROD.bat
```

---

## 🎯 Quick Commands Cheat Sheet

```bash
# START
docker-compose up -d                    # Khởi động
scripts\START_PREPROD.bat              # Khởi động pre-prod

# STOP
docker-compose down                     # Dừng
scripts\STOP_PREPROD.bat               # Dừng pre-prod

# LOGS
docker-compose logs -f                  # Xem logs
docker logs dms_backend -f             # Xem log backend

# STATUS
docker-compose ps                       # Trạng thái
scripts\CHECK_DATA.bat                 # Kiểm tra data

# REBUILD
docker-compose up -d --build           # Rebuild tất cả
docker-compose up -d --build backend   # Rebuild backend

# DATABASE
scripts\SEED_COMPLETE_DATA.bat         # Seed data
scripts\CHECK_DATA_DETAIL.bat          # Xem data chi tiết
```

---

## 📞 Cần Hỗ Trợ?

1. Xem logs: `docker-compose logs -f`
2. Kiểm tra containers: `docker-compose ps`
3. Restart: `docker-compose restart`
4. Rebuild: `docker-compose up -d --build`
