# 🧪 HƯỚNG DẪN TEST CHI TIẾT - AN MINH BUSINESS SYSTEM

## ✅ KẾT QUẢ KIỂM TRA API

### Backend API - ✅ HOẠT ĐỘNG TỐT
```bash
# Test Login TDV
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"employeeCode":"TDV001","password":"123456"}'

# Kết quả: ✅ SUCCESS
{
  "token": "eyJhbGci...",
  "user": {
    "id": "...",
    "name": "Nguyễn Văn An",
    "email": "tdv001@anminh.com",
    "phone": "0900000001",
    "role": "TDV"
  }
}
```

---

## 📋 HƯỚNG DẪN TEST THỦ CÔNG

### PHẦN 1: TEST PHÂN HỆ TDV

#### Bước 1: Mở Trang Login TDV
```
URL: http://localhost:3100/
```

**Kiểm tra:**
- [ ] Trang hiển thị form login
- [ ] Có logo An Minh
- [ ] Có 2 input: Mã nhân viên, Mật khẩu
- [ ] Có nút "Đăng nhập" màu cam

#### Bước 2: Nhập Thông Tin Login
```
Mã nhân viên: TDV001
Mật khẩu: 123456
```

**Kiểm tra:**
- [ ] Input mã nhân viên tự động chuyển chữ hoa
- [ ] Input password ẩn ký tự
- [ ] Không có lỗi validation

#### Bước 3: Click "Đăng nhập"
```
Action: Click nút "Đăng nhập"
```

**Kiểm tra:**
- [ ] Nút đổi thành "Đang đăng nhập..."
- [ ] Có loading spinner
- [ ] Sau 1-2 giây có phản hồi

#### Bước 4: Kiểm Tra Sau Login

**Nếu thành công:**
- [ ] Thấy message "✅ Đăng nhập thành công!"
- [ ] Redirect đến /home
- [ ] Thấy trang Home với navbar

**Nếu lỗi "Route không tìm thấy":**
- Đây là lỗi redirect
- Backend đã login OK
- Vấn đề: Frontend redirect đến route không tồn tại

**Giải pháp:**
1. Sau khi thấy lỗi, manually navigate đến: http://localhost:3100/home
2. Nếu vào được /home → Login đã thành công, chỉ là lỗi redirect
3. Có thể bỏ qua lỗi này và test tiếp

#### Bước 5: Test Tạo Đơn Hàng
```
URL: http://localhost:3100/create-order
```

**Kiểm tra:**
- [ ] Trang hiển thị "⏳ Đang tải dữ liệu..." (loading)
- [ ] Sau 1-2 giây hiển thị danh sách nhà thuốc
- [ ] Có search box
- [ ] Có danh sách nhà thuốc (từ database)

**Test Case:**
1. Search "NT" → Thấy kết quả lọc
2. Click chọn 1 nhà thuốc
3. ✅ Chuyển sang bước 2 "Chọn sản phẩm"

#### Bước 6: Chọn Sản Phẩm
```
Bước 2: Chọn sản phẩm
```

**Kiểm tra:**
- [ ] Hiển thị thông tin nhà thuốc đã chọn
- [ ] Có dropdown "Nhóm sản phẩm"
- [ ] Chọn nhóm → Hiển thị dropdown "Sản phẩm"
- [ ] Chọn sản phẩm → Hiển thị input số lượng
- [ ] Có nút + / - để tăng/giảm số lượng

**Test Case:**
1. Chọn nhóm "Kháng sinh" (hoặc nhóm khác)
2. Chọn sản phẩm "Amoxicillin" (hoặc sp khác)
3. Đặt số lượng = 10
4. Click "Thêm vào đơn hàng"
5. ✅ Chuyển sang bước 3 "Xem lại"

#### Bước 7: Xem Lại Đơn Hàng
```
Bước 3: Xem lại đơn hàng
```

**Kiểm tra:**
- [ ] Hiển thị danh sách sản phẩm đã chọn
- [ ] Hiển thị số lượng, đơn giá, thành tiền
- [ ] Hiển thị tổng tiền
- [ ] Có nút "Hoàn tất đơn hàng"

**Test Case:**
1. Kiểm tra thông tin sản phẩm đúng
2. Kiểm tra tổng tiền = giá × số lượng
3. Click "Hoàn tất đơn hàng"
4. ✅ Chuyển sang /order-summary

#### Bước 8: Xác Nhận Đơn Hàng
```
URL: http://localhost:3100/order-summary
```

**Kiểm tra:**
- [ ] Hiển thị thông tin đơn hàng đầy đủ
- [ ] Có thông tin nhà thuốc
- [ ] Có danh sách sản phẩm
- [ ] Có tổng tiền
- [ ] Có nút "✅ Xác Nhận Đơn Hàng" màu xanh lá

**Test Case:**
1. Xem lại thông tin lần cuối
2. Click "✅ Xác Nhận Đơn Hàng"
3. ✅ Nút đổi thành "⏳ Đang xử lý..."
4. ✅ Sau 2-3 giây thấy alert "Đã tạo thành công X đơn hàng!"
5. ✅ Thấy order number (VD: ORD000031)
6. ✅ Auto redirect về /home

---

### PHẦN 2: TEST PHÂN HỆ ADMIN

#### Bước 1: Logout TDV (nếu đang login)
```
Action: Click nút Logout hoặc clear localStorage
```

#### Bước 2: Login Admin
```
URL: http://localhost:3100/admin/login
Username: ADMIN001
Password: 123456
```

**Kiểm tra:**
- [ ] Form login hiển thị
- [ ] Nhập username/password
- [ ] Click "Đăng nhập" hoặc Enter
- [ ] Redirect đến /admin/dashboard

**Nếu không redirect:**
- Manually navigate: http://localhost:3100/admin/dashboard

#### Bước 3: Kiểm Tra Dashboard
```
URL: http://localhost:3100/admin/dashboard
```

**Kiểm tra:**
- [ ] Trang load thành công
- [ ] Có sidebar bên trái
- [ ] Có stats cards (Total Customers, Orders, etc.)
- [ ] Có recent orders section

#### Bước 4: Kiểm Tra Quản Lý Đơn Hàng
```
URL: http://localhost:3100/admin/orders
```

**Kiểm tra:**
- [ ] Hiển thị danh sách đơn hàng
- [ ] Có ít nhất 30 đơn hàng (từ seed)
- [ ] Tìm đơn hàng mới nhất (ORD000031+)
- [ ] Click vào đơn hàng → Modal hiển thị chi tiết
- [ ] Thấy thông tin: Nhà thuốc, Sản phẩm, Số lượng, Tổng tiền

**Test Case:**
1. Tìm đơn hàng vừa tạo từ TDV
2. Click để xem chi tiết
3. ✅ Thấy đầy đủ thông tin
4. ✅ Có thể đổi status (PENDING → CONFIRMED)

#### Bước 5: Kiểm Tra Quản Lý Người Dùng
```
URL: http://localhost:3100/admin/users
```

**Kiểm tra:**
- [ ] Hiển thị 26 users
- [ ] Có ADMIN001, TDV001-TDV020, QL001-QL003, KT001-KT002
- [ ] Filter theo role hoạt động
- [ ] Search hoạt động

#### Bước 6: Kiểm Tra Quản Lý Khách Hàng
```
URL: http://localhost:3100/admin/customers
```

**Kiểm tra:**
- [ ] Hiển thị danh sách pharmacies
- [ ] Có mã NT0001, NT0002...
- [ ] Search hoạt động
- [ ] Filter hoạt động

#### Bước 7: Kiểm Tra Quản Lý Lộ Trình
```
URL: http://localhost:3100/admin/routes
```

**Kiểm tra:**
- [ ] Trang load thành công
- [ ] Có nút "Tạo lộ trình"
- [ ] Click "Tạo lộ trình" → Modal hiển thị
- [ ] Có dropdown chọn TDV
- [ ] Có checkbox chọn khách hàng
- [ ] Có thể tạo route mới

**Test Case:**
1. Click "Tạo lộ trình"
2. Chọn TDV: "Nguyễn Văn An - TDV001"
3. Chọn 3-5 khách hàng
4. Click "Lưu"
5. ✅ Route mới xuất hiện trong danh sách

---

## 🐛 CÁC LỖI ĐÃ BIẾT VÀ CÁCH XỬ LÝ

### 1. Lỗi "Route không tìm thấy" sau khi login TDV

**Nguyên nhân:**
- Backend login thành công ✅
- Frontend redirect đến route không tồn tại ❌

**Giải pháp:**
1. **Tạm thời:** Sau khi thấy lỗi, manually navigate đến http://localhost:3100/home
2. **Lâu dài:** Cần kiểm tra AuthContext.js redirect logic

**Code cần check:**
```javascript
// File: client/src/context/AuthContext.js
// Tìm dòng redirect sau khi login
// Đảm bảo redirect đến '/home' chứ không phải route khác
```

### 2. Dashboard Stats hiển thị 0

**Nguyên nhân:**
- API `/api/dashboard/stats` có thể trả về 0

**Giải pháp:**
- Không ảnh hưởng chức năng chính
- Có thể bỏ qua hoặc fix sau

### 3. Loading lâu khi mở CreateOrder

**Nguyên nhân:**
- Đang fetch data từ API (pharmacies + products)
- Nếu database lớn sẽ mất thời gian

**Giải pháp:**
- Đợi 2-3 giây
- Nếu quá 10 giây → Check backend console

---

## ✅ CHECKLIST TEST HOÀN CHỈNH

### TDV Flow
- [ ] Login TDV thành công
- [ ] Vào được /home (manually nếu cần)
- [ ] Vào /create-order thấy danh sách nhà thuốc
- [ ] Chọn nhà thuốc thành công
- [ ] Chọn sản phẩm thành công
- [ ] Thêm vào đơn hàng thành công
- [ ] Xem lại đơn hàng đầy đủ
- [ ] Submit đơn hàng thành công
- [ ] Thấy alert success với order number
- [ ] Redirect về home

### Admin Flow
- [ ] Login Admin thành công
- [ ] Vào Dashboard
- [ ] Vào Orders → Thấy 30+ đơn hàng
- [ ] Tìm thấy đơn hàng TDV vừa tạo
- [ ] Xem chi tiết đơn hàng OK
- [ ] Vào Users → Thấy 26 users
- [ ] Vào Customers → Thấy pharmacies
- [ ] Vào Routes → Trang load OK
- [ ] Tạo route mới thành công

---

## 📊 KẾT QUẢ MONG ĐỢI

### Sau khi test xong:
- ✅ TDV có thể tạo đơn hàng vào database
- ✅ Admin có thể xem đơn hàng TDV tạo
- ✅ Tất cả data từ database thật
- ✅ Không còn mock data
- ✅ CRUD operations hoạt động

---

## 🎯 LƯU Ý QUAN TRỌNG

### 1. Lỗi "Route không tìm thấy" KHÔNG ẢNH HƯỞNG chức năng
- Backend đã login thành công
- Chỉ cần manually navigate đến /home
- Đơn hàng vẫn tạo được bình thường

### 2. Nếu CreateOrder không load data
- Check backend console có lỗi không
- Check network tab xem API call
- Đảm bảo server đang chạy port 5000

### 3. Nếu Submit order không thành công
- Check console có lỗi không
- Check network tab response
- Có thể backend chưa chạy hoặc database issue

---

## 📞 SUPPORT

**Nếu gặp vấn đề:**
1. Check backend đang chạy: http://localhost:5000/api
2. Check frontend đang chạy: http://localhost:3100
3. Check console browser (F12)
4. Check network tab (F12 → Network)
5. Check backend terminal có lỗi không

**Test thành công khi:**
- TDV tạo được đơn hàng
- Admin xem được đơn hàng
- Data từ database thật

---

**Hãy test theo hướng dẫn trên và báo kết quả! 🚀**
