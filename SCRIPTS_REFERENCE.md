# 📜 Danh Sách Scripts Quản Lý Hệ Thống

## 🚀 Production Deployment

### 1. PUBLISH_PRODUCTION.bat
**Mục đích:** Publish toàn bộ hệ thống lên production qua Cloudflare Tunnel

**Cách dùng:**
```bash
scripts\PUBLISH_PRODUCTION.bat
```

**Chức năng:**
- ✅ Kiểm tra Docker và Cloudflare credentials
- 🛑 Dừng containers cũ
- 🏗️ Build tất cả services (Backend, Frontend, Landing, WebApp)
- 🚀 Khởi động hệ thống
- 🌐 Kết nối Cloudflare Tunnel đến https://dms.ammedtech.com

**Thời gian:** 5-10 phút (lần đầu)

---

### 2. CHECK_PRODUCTION.bat
**Mục đích:** Kiểm tra trạng thái hệ thống production

**Cách dùng:**
```bash
scripts\CHECK_PRODUCTION.bat
```

**Kiểm tra:**
- ✅ Trạng thái containers
- ✅ Cloudflare Tunnel logs
- ✅ Backend API health
- ✅ Frontend health
- ✅ Database connection
- ✅ Public domain (https://dms.ammedtech.com)

---

### 3. STOP_PRODUCTION.bat
**Mục đích:** Dừng toàn bộ hệ thống production

**Cách dùng:**
```bash
scripts\STOP_PRODUCTION.bat
```

**Chức năng:**
- 🛑 Dừng tất cả containers
- 💾 Giữ nguyên data (volumes không bị xóa)

---

## 🧪 Pre-Production Testing

### 4. START_PREPROD.bat
**Mục đích:** Khởi động môi trường pre-production (test trước khi lên production)

**Cách dùng:**
```bash
scripts\START_PREPROD.bat
```

**URLs:**
- Landing Page: http://localhost:3500
- DMS Frontend: http://localhost:3599
- Web App: http://localhost:3501
- Backend API: http://localhost:5555
- Database: localhost:5455

---

### 5. STOP_PREPROD.bat
**Mục đích:** Dừng môi trường pre-production

**Cách dùng:**
```bash
scripts\STOP_PREPROD.bat
```

---

## 📊 Data Management

### 6. SEED_COMPLETE_DATA.bat
**Mục đích:** Seed dữ liệu mẫu đầy đủ vào database

**Cách dùng:**
```bash
scripts\SEED_COMPLETE_DATA.bat
```

**Dữ liệu được tạo:**
- 👥 Users (Admin, TDV, Delivery staff)
- 🏪 500+ Pharmacies (khách hàng)
- 📦 Products (sản phẩm)
- 🏭 Warehouses (kho)
- 📋 Sample orders
- 🗺️ Routes và visit plans

---

### 7. CHECK_DATA.bat
**Mục đích:** Kiểm tra nhanh số lượng records trong database

**Cách dùng:**
```bash
scripts\CHECK_DATA.bat
```

**Hiển thị:**
- Số lượng Users
- Số lượng Pharmacies
- Số lượng Products
- Số lượng Orders
- Số lượng Warehouses

---

### 8. CHECK_DATA_DETAIL.bat
**Mục đích:** Kiểm tra chi tiết dữ liệu trong database

**Cách dùng:**
```bash
scripts\CHECK_DATA_DETAIL.bat
```

**Hiển thị:**
- Danh sách Users với roles
- Danh sách Pharmacies với địa chỉ
- Danh sách Products
- Chi tiết Orders

---

### 9. SETUP_ROUTE_DATA.bat
**Mục đích:** Tạo dữ liệu routes và visit plans cho TDV

**Cách dùng:**
```bash
scripts\SETUP_ROUTE_DATA.bat
```

---

## 🔧 Maintenance & Fixes

### 10. FIX_ADMIN_USER.bat
**Mục đích:** Sửa lỗi admin user (reset password, permissions)

**Cách dùng:**
```bash
scripts\FIX_ADMIN_USER.bat
```

---

### 11. FIX_ADMIN_FINAL.bat
**Mục đích:** Sửa lỗi admin module (final fix)

**Cách dùng:**
```bash
scripts\FIX_ADMIN_FINAL.bat
```

---

### 12. FIX_ALL.bat
**Mục đích:** Chạy tất cả các fix scripts

**Cách dùng:**
```bash
scripts\FIX_ALL.bat
```

---

## 🧪 Testing

### 13. TEST_ALL_APIs.bat
**Mục đích:** Test tất cả API endpoints

**Cách dùng:**
```bash
scripts\TEST_ALL_APIs.bat
```

**Test:**
- ✅ Auth endpoints
- ✅ User endpoints
- ✅ Pharmacy endpoints
- ✅ Product endpoints
- ✅ Order endpoints
- ✅ Warehouse endpoints

---

## 🗄️ Database Admin Tools

### 14. admin_tools\backup_database.bat
**Mục đích:** Backup database

**Cách dùng:**
```bash
scripts\admin_tools\backup_database.bat
```

**Output:** File backup trong thư mục `backups/`

---

### 15. admin_tools\cleanup_project.bat
**Mục đích:** Dọn dẹp project (xóa node_modules, build files, logs)

**Cách dùng:**
```bash
scripts\admin_tools\cleanup_project.bat
```

⚠️ **Cẩn thận:** Script này sẽ xóa nhiều files!

---

## 📋 Workflow Thường Dùng

### Workflow 1: Lần Đầu Setup Production
```bash
# 1. Seed data
scripts\SEED_COMPLETE_DATA.bat

# 2. Check data
scripts\CHECK_DATA.bat

# 3. Publish to production
scripts\PUBLISH_PRODUCTION.bat

# 4. Check production status
scripts\CHECK_PRODUCTION.bat
```

---

### Workflow 2: Sau Khi Sửa Code
```bash
# Option A: Rebuild toàn bộ
scripts\STOP_PRODUCTION.bat
scripts\PUBLISH_PRODUCTION.bat

# Option B: Rebuild chỉ service cần thiết
docker-compose -f docker-compose.yml up -d --build backend
# hoặc
docker-compose -f docker-compose.yml up -d --build frontend
```

---

### Workflow 3: Test Trước Khi Lên Production
```bash
# 1. Start pre-prod environment
scripts\START_PREPROD.bat

# 2. Test APIs
scripts\TEST_ALL_APIs.bat

# 3. Manual testing on http://localhost:3599

# 4. If OK, publish to production
scripts\STOP_PREPROD.bat
scripts\PUBLISH_PRODUCTION.bat
```

---

### Workflow 4: Troubleshooting
```bash
# 1. Check production status
scripts\CHECK_PRODUCTION.bat

# 2. View logs
docker-compose -f docker-compose.yml logs -f

# 3. Check data
scripts\CHECK_DATA_DETAIL.bat

# 4. If needed, restart
scripts\STOP_PRODUCTION.bat
scripts\PUBLISH_PRODUCTION.bat
```

---

### Workflow 5: Daily Maintenance
```bash
# Morning: Check status
scripts\CHECK_PRODUCTION.bat

# View logs for errors
docker logs dms_backend --tail 100
docker logs dms_frontend --tail 100
docker logs dms_tunnel --tail 100

# Backup database
scripts\admin_tools\backup_database.bat
```

---

## 🆘 Emergency Commands

### Restart Everything
```bash
scripts\STOP_PRODUCTION.bat
scripts\PUBLISH_PRODUCTION.bat
```

### Reset Database (⚠️ MẤT DATA!)
```bash
docker-compose -f docker-compose.yml down -v
scripts\SEED_COMPLETE_DATA.bat
scripts\PUBLISH_PRODUCTION.bat
```

### View Realtime Logs
```bash
# All services
docker-compose -f docker-compose.yml logs -f

# Specific service
docker logs dms_backend -f
docker logs dms_frontend -f
docker logs dms_tunnel -f
docker logs dms_postgres -f
```

---

## 📞 Support

Nếu gặp vấn đề:
1. Chạy `scripts\CHECK_PRODUCTION.bat`
2. Xem logs: `docker-compose -f docker-compose.yml logs`
3. Check Docker Desktop có đang chạy không
4. Kiểm tra file `tunnel-creds.json` có tồn tại không
