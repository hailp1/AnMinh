# 🚀 HƯỚNG DẪN NHANH - Quản lý Lộ trình

## ⚡ Bắt đầu ngay (3 bước đơn giản)

### **Bước 1: Tạo dữ liệu test**
```cmd
cd d:\AM_DMS
.\SETUP_ROUTE_DATA.bat
```
Chờ 30 giây để script tạo tất cả dữ liệu.

### **Bước 2: Tạo/Fix user admin**
```cmd
.\FIX_ADMIN_USER.bat
```
Tạo lại user admin nếu không đăng nhập được.

### **Bước 3: Đăng nhập và test**
1. Mở: `http://localhost:3599/Anminh/admin`
2. Đăng nhập:
   - Username: `admin`
   - Password: `123456`
3. Vào menu "Quản lý lộ trình"
4. Chọn TDV001
5. Test các tính năng!

---

## 📋 Danh sách Scripts

| Script | Mục đích |
|--------|----------|
| `SETUP_ROUTE_DATA.bat` | Tạo dữ liệu test (TDV, khách hàng, GPS) |
| `FIX_ADMIN_USER.bat` | Tạo lại user admin |
| `CHECK_DATA.bat` | Kiểm tra dữ liệu |

---

## 🔑 Thông tin đăng nhập

**Admin:**
- Username: `admin`
- Password: `123456`

**TDV (test):**
- Username: `TDV001` hoặc `TDV002`
- Password: `123456`

---

## ✨ Tính năng đã hoàn thành

- ✅ Hiển thị khoảng cách (📍 X km)
- ✅ Nút Tối ưu hóa (🎯 Tối ưu)
- ✅ Tier Badge (A/B/C)
- ✅ Route Optimization Algorithm
- ✅ Database Schema mới

---

## ❌ Nếu gặp lỗi

### Lỗi: "Tên đăng nhập hoặc mật khẩu không đúng"
**Giải pháp:**
```cmd
.\FIX_ADMIN_USER.bat
```

### Lỗi: "Dropdown TDV trống"
**Giải pháp:**
```cmd
.\SETUP_ROUTE_DATA.bat
```

### Lỗi: "Không thấy khách hàng"
**Kiểm tra:**
```cmd
.\CHECK_DATA.bat
```

---

**Chúc bạn thành công!** 🎉
