# 🔍 CHECKLIST KIỂM TRA HỆ THỐNG - AN MINH BUSINESS SYSTEM

## ✅ Trạng thái: SẴN SÀNG KIỂM TRA

---

## 📋 DANH SÁCH KIỂM TRA

### 🔐 **1. ĐĂNG NHẬP (PRIORITY: CAO)**
- **URL**: http://localhost:3100/admin/login
- **Credentials**: 
  - Username: `ADMIN001`
  - Password: `123456`
- **Kiểm tra**:
  - [ ] Trang login hiển thị đúng
  - [ ] KHÔNG còn text "Demo Users" 
  - [ ] Đăng nhập thành công
  - [ ] Redirect đến /admin/dashboard
  - [ ] Token được lưu vào localStorage

---

### 📊 **2. DASHBOARD (PRIORITY: CAO)**
- **URL**: http://localhost:3100/admin/dashboard
- **API**: `/api/dashboard/stats`
- **Kiểm tra**:
  - [ ] Stats cards hiển thị (Total Customers, Orders, Revenue, Active Reps)
  - [ ] Số liệu > 0 (không phải mock data)
  - [ ] Recent Orders section có data
  - [ ] System Activity có data
  - [ ] Không có lỗi console

**Expected Data**:
- Total Customers: ~200+ (từ seed)
- Total Orders: 30 (từ seed)
- Total Revenue: > 0
- Active Reps: 20 (TDV từ seed)

---

### 📦 **3. QUẢN LÝ ĐƠN HÀNG (PRIORITY: CAO)**
- **URL**: http://localhost:3100/admin/orders
- **API**: `/api/orders`
- **Kiểm tra**:
  - [ ] Danh sách 30 orders hiển thị
  - [ ] Order có orderNumber (ORD000001, ORD000002...)
  - [ ] Tên khách hàng hiển thị đúng
  - [ ] Trạng thái đơn hàng hiển thị
  - [ ] Click vào order để xem chi tiết
  - [ ] Có thể thay đổi status
  - [ ] Filter theo status hoạt động

**Test Case**:
1. Tìm order "ORD000001"
2. Click để xem chi tiết
3. Thử đổi status từ PENDING → CONFIRMED
4. Kiểm tra update thành công

---

### 👥 **4. QUẢN LÝ NGƯỜI DÙNG (PRIORITY: CAO)**
- **URL**: http://localhost:3100/admin/users
- **API**: `/api/users/admin/users`
- **Kiểm tra**:
  - [ ] Danh sách 26 users hiển thị
  - [ ] Có ADMIN001, TDV001-TDV020, QL001-QL003, KT001-KT002
  - [ ] Filter theo role hoạt động
  - [ ] Search hoạt động
  - [ ] Có thể thêm user mới
  - [ ] Có thể edit user
  - [ ] Có thể xóa user
  - [ ] Export Excel hoạt động
  - [ ] Import Excel hoạt động

**Test Case**:
1. Filter role = "TDV"
2. Kiểm tra có 20 TDV
3. Search "Nguyễn Văn An"
4. Click "Thêm người dùng"
5. Kiểm tra form hiển thị

---

### 🏥 **5. QUẢN LÝ KHÁCH HÀNG (PRIORITY: CAO)**
- **URL**: http://localhost:3100/admin/customers
- **API**: `/api/pharmacies`
- **Kiểm tra**:
  - [ ] Danh sách pharmacies hiển thị
  - [ ] Có mã NT0001, NT0002...
  - [ ] Tên nhà thuốc hiển thị
  - [ ] Địa chỉ hiển thị
  - [ ] Filter theo hub hoạt động
  - [ ] Search hoạt động
  - [ ] Có thể thêm customer mới
  - [ ] Có thể edit customer
  - [ ] Export Excel hoạt động

**Expected Data**:
- Tổng số: ~200+ pharmacies
- Có các hub: TP.HCM, Đồng Nai, Bình Dương

---

### 🗺️ **6. QUẢN LÝ LỘ TRÌNH (PRIORITY: CAO - MỚI)**
- **URL**: http://localhost:3100/admin/routes
- **API**: `/api/routes`
- **Kiểm tra**:
  - [ ] Trang load thành công (không lỗi)
  - [ ] Danh sách routes hiển thị
  - [ ] Mỗi route có: tên TDV, số khách hàng
  - [ ] Click "Tạo lộ trình" mở modal
  - [ ] Có thể chọn TDV
  - [ ] Có thể chọn khách hàng (checkbox)
  - [ ] Có thể lưu route mới
  - [ ] Có thể edit route
  - [ ] Có thể xóa route

**Test Case**:
1. Click "Tạo lộ trình"
2. Chọn TDV: "Nguyễn Văn An - TDV001"
3. Chọn 3-5 khách hàng
4. Click "Lưu"
5. Kiểm tra route mới xuất hiện trong danh sách

---

### 💊 **7. QUẢN LÝ SẢN PHẨM (PRIORITY: TRUNG BÌNH)**
- **URL**: http://localhost:3100/admin/products
- **API**: `/api/products`
- **Kiểm tra**:
  - [ ] Danh sách products hiển thị
  - [ ] Có các sản phẩm từ seed (Paracetamol, Amoxicillin...)
  - [ ] Filter theo nhóm hoạt động
  - [ ] Search hoạt động

---

### 📈 **8. BÁO CÁO & THỐNG KÊ (PRIORITY: THẤP)**
- **URL**: http://localhost:3100/admin/reports
- **Kiểm tra**:
  - [ ] Trang load được (có thể còn dùng mock data)
  - [ ] Charts hiển thị
  - [ ] Filters hoạt động

---

### ⚙️ **9. CÀI ĐẶT (PRIORITY: THẤP)**
- **URL**: http://localhost:3100/admin/settings
- **Kiểm tra**:
  - [ ] Trang load được
  - [ ] Tabs chuyển đổi được
  - [ ] Territory Management tab hoạt động
  - [ ] Có thể lưu settings

---

## 🔧 KIỂM TRA KỸ THUẬT

### Backend API Endpoints
```bash
# Test các endpoint chính:
curl http://localhost:5000/api
curl http://localhost:5000/api/orders
curl http://localhost:5000/api/users/admin/users
curl http://localhost:5000/api/pharmacies
curl http://localhost:5000/api/routes
curl http://localhost:5000/api/dashboard/stats
```

### Database
- [ ] Prisma đang kết nối đúng database
- [ ] Seed data đã chạy (30 orders, 26 users, 200+ pharmacies)
- [ ] Không có lỗi connection

### Console Errors
- [ ] Không có lỗi 404 trong Network tab
- [ ] Không có lỗi CORS
- [ ] Không có lỗi authentication
- [ ] Không có lỗi JavaScript trong Console

---

## 🚨 CÁC LỖI THƯỜNG GẶP

### 1. Lỗi 404 - Route not found
**Nguyên nhân**: Server chưa restart sau khi update
**Giải pháp**: Restart server (Ctrl+C và chạy lại `npm start`)

### 2. Lỗi CORS
**Nguyên nhân**: Frontend port không trong whitelist
**Giải pháp**: Kiểm tra server.js có port 3100 trong allowedOrigins

### 3. Data không hiển thị
**Nguyên nhân**: Chưa seed database
**Giải pháp**: Chạy `npx prisma db seed`

### 4. Lỗi authentication
**Nguyên nhân**: Token hết hạn hoặc không đúng
**Giải pháp**: Logout và login lại

---

## 📝 GHI CHÚ

### Credentials
- **Admin**: ADMIN001 / 123456
- **TDV**: TDV001 / 123456
- **QL**: QL001 / 123456
- **KT**: KT001 / 123456

### Ports
- **Backend**: http://localhost:5000
- **Frontend**: http://localhost:3100

### Database
- **Type**: PostgreSQL
- **ORM**: Prisma
- **Seed**: 30 orders, 26 users, 200+ pharmacies, 20 TDV

---

## ✅ KẾT LUẬN

Sau khi kiểm tra hết các mục trên, hệ thống sẽ:
- ✅ 100% data từ database (không còn mock)
- ✅ Tất cả API endpoints hoạt động
- ✅ Phân quyền admin đúng
- ✅ CRUD operations hoạt động
- ✅ UI/UX mượt mà, không lỗi

---

**Người kiểm tra**: _________________
**Ngày kiểm tra**: _________________
**Kết quả**: [ ] PASS  [ ] FAIL
**Ghi chú**: _________________
