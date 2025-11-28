# 👤 HƯỚNG DẪN TẠO TÀI KHOẢN

## ✅ **TẠO 2 TÀI KHOẢN**

Script sẽ tạo 2 tài khoản:

1. **ADMIN** - Quản trị viên
2. **AM01** - Trình dược viên

---

## 🚀 **CÁCH CHẠY**

### **Cách 1: Dùng npm script (KHUYẾN NGHỊ)**
```bash
npm run create:users
```

### **Cách 2: Chạy trực tiếp**
```bash
node scripts/create-users.js
```

---

## 📝 **THÔNG TIN TÀI KHOẢN ĐƯỢC TẠO**

### **1. Tài khoản ADMIN:**
- **Employee Code:** `admin`
- **Password:** `admin`
- **Role:** `ADMIN`
- **Name:** Administrator
- **Email:** admin@anminh.com

### **2. Tài khoản TDV:**
- **Employee Code:** `AM01`
- **Password:** `Anminh@123`
- **Role:** `TDV` (Trình dược viên)
- **Name:** Nhân viên AM01
- **Email:** am01@anminh.com

---

## ✅ **KIỂM TRA TÀI KHOẢN ĐÃ TẠO**

Chạy script kiểm tra:

```bash
npm run check:users
```

**HOẶC:**
```bash
node scripts/verify-users.js
```

Script sẽ hiển thị:
- User ADMIN có tồn tại không
- Password có đúng không
- User AM01 có tồn tại không
- Password có đúng không

---

## 🔑 **ĐĂNG NHẬP**

Sau khi tạo xong, có thể đăng nhập:

### **Tài khoản ADMIN:**
1. Mở browser: `http://localhost:3099`
2. Employee Code: `admin`
3. Password: `admin`
4. Click "Đăng nhập"

### **Tài khoản TDV:**
1. Mở browser: `http://localhost:3099`
2. Employee Code: `AM01`
3. Password: `Anminh@123`
4. Click "Đăng nhập"

---

## ⚠️ **LƯU Ý**

1. **Database phải chạy:**
   - PostgreSQL service phải đang chạy
   - Nếu lỗi "Can't reach database server" → Start PostgreSQL

2. **Nếu user đã tồn tại:**
   - Script sẽ **cập nhật** thông tin và password
   - Không tạo user trùng

3. **Password được hash:**
   - Password được hash bằng bcrypt
   - Không thể xem password gốc từ database

---

## 🐛 **NẾU CÓ LỖI**

### **Lỗi: "Can't reach database server"**
**Nguyên nhân:** PostgreSQL không chạy

**Giải pháp:**
1. Mở Services: `services.msc`
2. Tìm service `postgresql` hoặc `PostgreSQL`
3. Start nếu đang stopped

**HOẶC PowerShell:**
```powershell
Get-Service | Where-Object {$_.Name -like '*postgres*'}
Start-Service postgresql-x64-XX
```

### **Lỗi: "Module not found"**
**Nguyên nhân:** Chưa cài dependencies

**Giải pháp:**
```bash
npm install
```

---

## 📋 **SCRIPTS ĐÃ TẠO**

1. ✅ `scripts/create-users.js` - Tạo 2 tài khoản
2. ✅ `scripts/verify-users.js` - Kiểm tra tài khoản
3. ✅ `scripts/check-all-connections.js` - Kiểm tra tất cả kết nối

---

## 🎯 **TÓM TẮT**

**Chạy lệnh:**
```bash
npm run create:users
```

**Kiểm tra:**
```bash
npm run check:users
```

**Đăng nhập:**
- Admin: `admin` / `admin`
- TDV: `AM01` / `Anminh@123`

---

**Tạo bởi:** System Helper  
**Ngày:** 2025-11-18

