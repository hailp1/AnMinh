# ✅ HOÀN TẤT - Hướng dẫn sử dụng

## 🎉 Chúc mừng! Tất cả đã sẵn sàng!

Tôi đã tạo **script tự động** để setup dữ liệu test cho bạn.

---

## 🚀 Cách sử dụng (CỰC KỲ ĐƠN GIẢN)

### **Bước 1: Chạy script setup (CHỈ 1 LẦN DUY NHẤT)**

Mở PowerShell/CMD tại thư mục `d:\AM_DMS` và chạy:

```cmd
.\SETUP_ROUTE_DATA.bat
```

Script sẽ tự động tạo:
- ✅ 1 Region (Hồ Chí Minh)
- ✅ 1 Territory (Quận 1)
- ✅ 2 TDV users (TDV001, TDV002) - Password: `123456`
- ✅ 5 Pharmacies với GPS coordinates
- ✅ 5 Customer Assignments

**Thời gian**: ~30 giây

---

### **Bước 2: Kiểm tra dữ liệu (TÙY CHỌN)**

Nếu muốn kiểm tra xem dữ liệu đã được tạo chưa:

```cmd
.\CHECK_DATA.bat
```

---

### **Bước 3: Test chức năng Quản lý Lộ trình**

1. **Đăng nhập Admin:**
   - Truy cập: `http://localhost:3599/Anminh/admin`
   - Username: `admin`
   - Password: `123456`

2. **Vào Quản lý Lộ trình:**
   - Click menu "Quản lý lộ trình" HOẶC
   - Truy cập trực tiếp: `http://localhost:3599/Anminh/admin/routes`

3. **Chọn TDV:**
   - Dropdown "-- Chọn Trình dược viên --"
   - Chọn "Nguyễn Văn A (TDV001)"

4. **Xem bản đồ:**
   - Sẽ thấy 5 marker (điểm) trên bản đồ
   - Màu sắc:
     - 🔵 Xanh dương: Đang chọn (ngày hiện tại)
     - 🟢 Xanh lá: Đã xếp vào ngày khác
     - ⚪ Xám: Chưa xếp tuyến

5. **Thêm khách hàng vào tuyến:**
   - Click vào marker trên bản đồ
   - Hoặc click "Thêm vào Thứ X" trong popup

6. **Test tính năng mới:**
   - ✅ **Xem khoảng cách**: "📍 X km" (hiển thị tổng km)
   - ✅ **Xem Tier badge**: A (vàng), B (xanh dương), C (xám)
   - ✅ **Click nút "🎯 Tối ưu"**: Tự động sắp xếp theo khoảng cách gần nhất
   - ✅ **Xem thông báo**: "Đã tối ưu! Khoảng cách giảm xuống X km"

7. **Lưu tuyến:**
   - Click "LƯU TUYẾN & SINH LỊCH"
   - Hệ thống sẽ lưu và tự động sinh lịch 4 tuần

---

## 📋 Thông tin đăng nhập

### **Admin Panel:**
- URL: `http://localhost:3599/Anminh/admin`
- Username: `admin`
- Password: `123456`

### **TDV (để test):**
- Username: `TDV001` hoặc `TDV002`
- Password: `123456`

---

## 🔧 Nếu gặp vấn đề

### **Vấn đề 1: Dropdown TDV vẫn trống**
**Giải pháp:**
1. Chạy lại: `.\SETUP_ROUTE_DATA.bat`
2. Tải lại trang (Ctrl + Shift + R)
3. Kiểm tra Console (F12) xem có lỗi không

### **Vấn đề 2: Không thấy khách hàng trên bản đồ**
**Giải pháp:**
1. Đảm bảo đã chọn TDV từ dropdown
2. Chạy: `.\CHECK_DATA.bat` để kiểm tra dữ liệu
3. Kiểm tra Console (F12)

### **Vấn đề 3: Nút "🎯 Tối ưu" bị disabled**
**Nguyên nhân:** Chưa đủ 2 khách hàng
**Giải pháp:** Thêm ít nhất 2 khách hàng vào ngày hiện tại

---

## 📞 Hỗ trợ

Nếu vẫn gặp lỗi, cung cấp:
1. Screenshot lỗi từ Console (F12)
2. Kết quả của: `.\CHECK_DATA.bat`

---

## 🎯 Tóm tắt

**Để bắt đầu ngay:**
```cmd
# Bước 1: Tạo dữ liệu
.\SETUP_ROUTE_DATA.bat

# Bước 2: Truy cập
http://localhost:3599/Anminh/admin/routes

# Bước 3: Đăng nhập
admin / 123456

# Bước 4: Chọn TDV001 và test!
```

**Chúc bạn thành công!** 🚀
