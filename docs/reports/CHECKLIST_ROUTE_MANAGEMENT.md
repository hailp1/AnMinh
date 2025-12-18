# ✅ CHECKLIST - Kiểm tra Phân hệ Quản lý Lộ trình

## 📋 Danh sách kiểm tra

### 1️⃣ **Chuẩn bị dữ liệu**
- [ ] Chạy `SETUP_ROUTE_DATA.bat` (đã xong)
- [ ] Chạy `FIX_ADMIN_FINAL.bat` (nếu cần)

### 2️⃣ **Đăng nhập**
- [ ] Truy cập: `http://localhost:3599/Anminh/admin`
- [ ] Nhập: `admin / 123456`
- [ ] Kiểm tra redirect đến Dashboard

### 3️⃣ **Truy cập Quản lý Lộ trình**
- [ ] Click menu "Quản lý lộ trình"
- [ ] Hoặc truy cập: `http://localhost:3599/Anminh/admin/routes`
- [ ] Trang load thành công (không có lỗi)

### 4️⃣ **Kiểm tra UI cơ bản**
- [ ] Header hiển thị: "Quản lý Tuyến (MCP)"
- [ ] Dropdown "-- Chọn Trình dược viên --" có sẵn
- [ ] Bản đồ OpenStreetMap hiển thị
- [ ] Tabs ngày (Thứ 2 → Thứ 7) hiển thị
- [ ] Stats hiển thị: Tổng KH, Đã xếp tuyến, Chưa xếp

### 5️⃣ **Chọn TDV**
- [ ] Click dropdown TDV
- [ ] Thấy "Nguyễn Văn A (TDV001)" trong danh sách
- [ ] Chọn TDV001
- [ ] Bản đồ hiển thị 5 markers (điểm)

### 6️⃣ **Kiểm tra Markers trên bản đồ**
- [ ] Thấy 5 điểm màu xám (chưa xếp tuyến)
- [ ] Click vào 1 marker
- [ ] Popup hiển thị tên nhà thuốc
- [ ] Popup có nút "Thêm vào Thứ X"

### 7️⃣ **Thêm khách hàng vào tuyến**
- [ ] Click "Thêm vào Thứ 2" trong popup
- [ ] Marker chuyển sang màu xanh dương
- [ ] Khách hàng xuất hiện trong danh sách bên phải
- [ ] Thêm thêm 2-3 khách hàng nữa

### 8️⃣ **Kiểm tra thông tin khách hàng**
- [ ] Mỗi card hiển thị: Mã KH, Tên, Địa chỉ
- [ ] **Tier Badge** hiển thị (A/B/C) với màu sắc:
  - A: Vàng (#fef3c7)
  - B: Xanh dương (#dbeafe)
  - C: Xám (#f3f4f6)
- [ ] Số thứ tự (#1, #2, #3...)
- [ ] Dropdown Frequency (F4, F2-ODD, F2-EVEN, F1)

### 9️⃣ **Kiểm tra hiển thị khoảng cách**
- [ ] Phía trên danh sách hiển thị: "X khách hàng"
- [ ] **Hiển thị khoảng cách**: "📍 Y km"
- [ ] Khoảng cách > 0 khi có >= 2 khách hàng

### 🔟 **Test nút Tối ưu hóa**
- [ ] Nút "🎯 Tối ưu" hiển thị
- [ ] Nút bị disabled khi < 2 khách hàng
- [ ] Nút enabled khi >= 2 khách hàng
- [ ] Click "🎯 Tối ưu"
- [ ] Thấy thông báo: "Đã tối ưu! Khoảng cách giảm xuống X km"
- [ ] Thứ tự khách hàng thay đổi (sắp xếp theo khoảng cách)
- [ ] Khách hàng Tier A lên đầu, sau đó B, rồi C

### 1️⃣1️⃣ **Test các nút điều khiển**
- [ ] Nút ⬆️ (Lên): Di chuyển khách hàng lên trên
- [ ] Nút ⬇️ (Xuống): Di chuyển khách hàng xuống dưới
- [ ] Nút 🗑️ (Xóa): Loại bỏ khỏi tuyến
- [ ] Marker quay lại màu xám sau khi xóa

### 1️⃣2️⃣ **Test chuyển ngày**
- [ ] Click tab "Thứ 3"
- [ ] Danh sách khách hàng trống
- [ ] Thêm khách hàng vào Thứ 3
- [ ] Marker chuyển sang màu xanh dương
- [ ] Quay lại "Thứ 2"
- [ ] Khách hàng Thứ 2 vẫn còn
- [ ] Marker Thứ 3 hiển thị màu xanh lá (đã xếp vào ngày khác)

### 1️⃣3️⃣ **Test Legend (Chú thích)**
- [ ] Legend hiển thị 3 loại:
  - 🔵 Đang chọn (Thứ X)
  - 🟢 Đã xếp tuyến khác
  - ⚪ Chưa xếp tuyến

### 1️⃣4️⃣ **Test Import/Export**
- [ ] Nút "📥 Template" hiển thị
- [ ] Click "📥 Template" → Download file Excel
- [ ] Nút "📤 Import" hiển thị
- [ ] (Optional) Test import file Excel

### 1️⃣5️⃣ **Test Lưu tuyến**
- [ ] Nút "LƯU TUYẾN & SINH LỊCH" hiển thị
- [ ] Nút disabled khi chưa chọn TDV
- [ ] Nút enabled khi đã chọn TDV
- [ ] Click "LƯU TUYẾN & SINH LỊCH"
- [ ] Thấy thông báo: "Đã lưu Tuyến mẫu và sinh lịch thành công!"

### 1️⃣6️⃣ **Kiểm tra Console (F12)**
- [ ] Không có lỗi màu đỏ
- [ ] Không có warning về routeOptimization
- [ ] API calls thành công (200 OK)

### 1️⃣7️⃣ **Kiểm tra responsive**
- [ ] Zoom in/out → UI vẫn ổn
- [ ] Resize window → Bản đồ tự điều chỉnh

---

## 🐛 Các lỗi thường gặp

### Lỗi 1: Dropdown TDV trống
**Nguyên nhân**: Chưa có dữ liệu
**Fix**: Chạy `SETUP_ROUTE_DATA.bat`

### Lỗi 2: Không thấy markers
**Nguyên nhân**: Khách hàng chưa có GPS
**Fix**: Chạy lại `SETUP_ROUTE_DATA.bat`

### Lỗi 3: Nút Tối ưu không hoạt động
**Nguyên nhân**: File routeOptimization.js chưa được build
**Fix**: 
```cmd
cd d:\AM_DMS
docker-compose -f docker-compose.preprod.yml up -d --build frontend
```

### Lỗi 4: Khoảng cách = 0 km
**Nguyên nhân**: Chưa đủ 2 khách hàng hoặc thiếu GPS
**Fix**: Thêm ít nhất 2 khách hàng có GPS

### Lỗi 5: Tier badge không hiển thị
**Nguyên nhân**: Database chưa có migration mới
**Fix**:
```cmd
cd d:\AM_DMS\DMS\backend
npx prisma migrate deploy
```

---

## ✅ Kết quả mong đợi

Nếu tất cả các bước trên đều ✅, phân hệ Quản lý Lộ trình đã hoạt động **100% đúng** theo chuẩn DMS chuyên nghiệp!

---

## 📸 Screenshot để kiểm tra

Nếu gặp vấn đề, hãy chụp màn hình:
1. Toàn bộ trang Quản lý Lộ trình
2. Console (F12) → Tab Console
3. Console (F12) → Tab Network → Filter: "api"

---

**Cập nhật**: 04/12/2024 23:23
**Trạng thái**: ✅ READY FOR TESTING
