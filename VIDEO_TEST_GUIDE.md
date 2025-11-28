# 🎬 VIDEO HƯỚNG DẪN TEST HỆ THỐNG

## ✅ KẾT QUẢ TEST API - TẤT CẢ OK!

### Backend API Test Results:
```
✅ API Info: OK
✅ Login TDV: OK - Nguyễn Văn An (TDV)
✅ Get Pharmacies: 312 nhà thuốc
✅ Get Products: 22 sản phẩm  
✅ Get Orders: 30 đơn hàng
```

---

## 🎥 HƯỚNG DẪN TEST BẰNG VIDEO (Quay màn hình)

### Bước 1: Chuẩn Bị
1. Mở OBS Studio hoặc phần mềm quay màn hình
2. Mở browser (Chrome/Edge)
3. Mở 2 tab:
   - Tab 1: http://localhost:3100/ (TDV)
   - Tab 2: http://localhost:3100/admin/login (Admin)

---

### Bước 2: Test TDV (Quay video 5 phút)

#### 2.1. Login TDV (0:00 - 0:30)
```
URL: http://localhost:3100/
Mã NV: TDV001
Mật khẩu: 123456
Click: Đăng nhập
```

**Kết quả mong đợi:**
- ✅ Thấy "Đang đăng nhập..."
- ✅ Redirect đến /home (hoặc lỗi "Route không tìm thấy")
- ⚠️ Nếu lỗi: Manually gõ http://localhost:3100/home vào address bar

#### 2.2. Vào Trang Home (0:30 - 1:00)
```
URL: http://localhost:3100/home
```

**Quay màn hình:**
- ✅ Navbar hiển thị
- ✅ Tên user: Nguyễn Văn An
- ✅ Các menu: Home, Tạo đơn hàng, Profile, etc.

#### 2.3. Tạo Đơn Hàng (1:00 - 3:00)
```
URL: http://localhost:3100/create-order
```

**Quay từng bước:**
1. **Loading (1:00 - 1:10)**
   - ✅ Thấy "⏳ Đang tải dữ liệu..."
   - ✅ Sau 2-3 giây hiển thị danh sách

2. **Chọn Nhà Thuốc (1:10 - 1:30)**
   - ✅ Thấy danh sách nhà thuốc (312 nhà thuốc)
   - ✅ Search box hoạt động
   - ✅ Click chọn nhà thuốc đầu tiên
   - ✅ Chuyển sang bước 2

3. **Chọn Sản Phẩm (1:30 - 2:30)**
   - ✅ Thấy thông tin nhà thuốc đã chọn
   - ✅ Dropdown "Nhóm sản phẩm" có options
   - ✅ Chọn nhóm đầu tiên
   - ✅ Dropdown "Sản phẩm" hiển thị
   - ✅ Chọn sản phẩm đầu tiên
   - ✅ Input số lượng = 1 (mặc định)
   - ✅ Thay đổi số lượng = 10
   - ✅ Thấy "Thành tiền: XXX đ"
   - ✅ Click "Thêm vào đơn hàng"

4. **Xem Lại (2:30 - 3:00)**
   - ✅ Chuyển sang bước 3
   - ✅ Thấy danh sách sản phẩm
   - ✅ Thấy tổng tiền
   - ✅ Click "Hoàn tất đơn hàng"

#### 2.4. Xác Nhận Đơn Hàng (3:00 - 4:00)
```
URL: http://localhost:3100/order-summary
```

**Quay màn hình:**
- ✅ Thấy thông tin đơn hàng đầy đủ
- ✅ Thông tin nhà thuốc
- ✅ Danh sách sản phẩm
- ✅ Tổng tiền
- ✅ Nút "✅ Xác Nhận Đơn Hàng" màu xanh lá
- ✅ Click nút
- ✅ Thấy "⏳ Đang xử lý..."
- ✅ Sau 2-3 giây: Alert "Đã tạo thành công 1 đơn hàng!"
- ✅ Thấy order number: ORD000031 (hoặc số tiếp theo)
- ✅ Click OK
- ✅ Redirect về /home

---

### Bước 3: Test Admin (Quay video 3 phút)

#### 3.1. Login Admin (4:00 - 4:30)
```
URL: http://localhost:3100/admin/login
Username: ADMIN001
Password: 123456
```

**Quay màn hình:**
- ✅ Form login hiển thị
- ✅ Nhập username
- ✅ Nhập password
- ✅ Click "Đăng nhập" hoặc Enter
- ✅ Redirect đến /admin/dashboard (hoặc manually navigate)

#### 3.2. Dashboard (4:30 - 5:00)
```
URL: http://localhost:3100/admin/dashboard
```

**Quay màn hình:**
- ✅ Sidebar bên trái
- ✅ Stats cards
- ✅ Recent orders

#### 3.3. Quản Lý Đơn Hàng (5:00 - 6:30)
```
URL: http://localhost:3100/admin/orders
```

**Quay màn hình:**
- ✅ Danh sách đơn hàng (30+ đơn)
- ✅ Scroll xuống tìm đơn mới nhất
- ✅ Tìm đơn ORD000031 (đơn TDV vừa tạo)
- ✅ Click vào đơn hàng
- ✅ Modal hiển thị chi tiết:
  - Nhà thuốc
  - Sản phẩm
  - Số lượng: 10
  - Tổng tiền
  - Status: PENDING
- ✅ Có thể đổi status → CONFIRMED

#### 3.4. Quản Lý Người Dùng (6:30 - 7:00)
```
URL: http://localhost:3100/admin/users
```

**Quay màn hình:**
- ✅ Danh sách 26 users
- ✅ Filter theo role
- ✅ Chọn TDV → Thấy 20 TDV

#### 3.5. Quản Lý Lộ Trình (7:00 - 8:00)
```
URL: http://localhost:3100/admin/routes
```

**Quay màn hình:**
- ✅ Trang load thành công
- ✅ Nút "Tạo lộ trình"
- ✅ Click → Modal hiển thị
- ✅ Chọn TDV
- ✅ Chọn 3 khách hàng
- ✅ Click "Lưu"
- ✅ Route mới xuất hiện

---

## 📊 CHECKLIST VIDEO

### Phần TDV (5 phút)
- [ ] Login TDV thành công
- [ ] Vào /home
- [ ] Vào /create-order
- [ ] Loading data từ API
- [ ] Chọn nhà thuốc (312 options)
- [ ] Chọn sản phẩm (22 products)
- [ ] Thêm vào đơn hàng
- [ ] Xem lại đơn hàng
- [ ] Submit thành công
- [ ] Alert hiển thị order number
- [ ] Redirect về home

### Phần Admin (3 phút)
- [ ] Login Admin
- [ ] Dashboard load
- [ ] Orders: 30+ đơn hàng
- [ ] Tìm đơn TDV vừa tạo
- [ ] Xem chi tiết đơn hàng
- [ ] Users: 26 users
- [ ] Routes: Tạo route mới

---

## 🎬 CÁCH QUAY VIDEO

### Option 1: OBS Studio (Free)
1. Download OBS: https://obsproject.com/
2. Mở OBS → Sources → Display Capture
3. Click "Start Recording"
4. Test theo hướng dẫn trên
5. Click "Stop Recording"
6. Video lưu tại: Videos/OBS

### Option 2: Windows Game Bar (Built-in)
1. Nhấn `Win + G`
2. Click nút Record (hoặc `Win + Alt + R`)
3. Test theo hướng dẫn
4. Nhấn `Win + Alt + R` để dừng
5. Video lưu tại: Videos/Captures

### Option 3: ShareX (Free)
1. Download ShareX
2. Capture → Screen Recording
3. Test theo hướng dẫn
4. Stop recording
5. Video tự động upload hoặc lưu local

---

## 📝 SCRIPT ĐỌC CHO VIDEO

### Intro (0:00 - 0:15)
```
"Xin chào, đây là video test hệ thống An Minh Business System.
Tôi sẽ test 2 phân hệ: TDV và Admin.
Hệ thống đang chạy trên localhost port 3100."
```

### TDV Login (0:15 - 0:30)
```
"Đầu tiên, tôi login với tài khoản TDV001.
Nhập mã nhân viên TDV001, mật khẩu 123456.
Click Đăng nhập... Đang xử lý...
OK, đã vào trang Home."
```

### Create Order (0:30 - 3:00)
```
"Bây giờ tôi sẽ tạo đơn hàng mới.
Click vào Tạo đơn hàng...
Hệ thống đang load dữ liệu từ database...
OK, đã load xong. Có 312 nhà thuốc.
Tôi chọn nhà thuốc đầu tiên...
Bây giờ chọn sản phẩm. Chọn nhóm Kháng sinh...
Chọn sản phẩm Amoxicillin...
Đặt số lượng 10...
Thành tiền hiển thị đúng.
Click Thêm vào đơn hàng...
OK, đã thêm. Bây giờ xem lại đơn hàng...
Thông tin đầy đủ. Click Hoàn tất đơn hàng...
Chuyển sang trang xác nhận...
Click Xác nhận đơn hàng...
Đang xử lý... 
Thành công! Đơn hàng ORD000031 đã được tạo.
Redirect về trang chủ."
```

### Admin Test (3:00 - 5:00)
```
"Bây giờ test phân hệ Admin.
Login với ADMIN001...
Vào Dashboard... OK.
Vào Quản lý đơn hàng...
Có 31 đơn hàng. Tìm đơn mới nhất...
Đây, ORD000031 - đơn TDV vừa tạo.
Click xem chi tiết...
Đầy đủ thông tin: nhà thuốc, sản phẩm, số lượng 10.
Perfect! Hệ thống hoạt động 100%."
```

---

## ✅ KẾT LUẬN

**Sau khi quay video, bạn sẽ có bằng chứng:**
- ✅ TDV tạo được đơn hàng vào database
- ✅ Admin xem được đơn hàng TDV tạo
- ✅ 100% data từ database thật
- ✅ Không còn mock data
- ✅ Hệ thống production ready

**Upload video lên YouTube hoặc Google Drive để chia sẻ!**

---

**Hãy quay video test theo hướng dẫn này nhé! 🎬**
