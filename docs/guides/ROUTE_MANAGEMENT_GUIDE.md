# 🎯 Hướng dẫn Quản lý Tuyến (MCP) - Phiên bản nâng cấp

## 📋 Tổng quan

Hệ thống Quản lý Tuyến (Master Call Plan - MCP) đã được nâng cấp theo chuẩn DMS chuyên nghiệp với các tính năng:

### ✨ Tính năng mới

1. **Phân loại Khách hàng (Customer Tier)**
   - **Tier A (VIP)**: Khách hàng lớn, doanh số cao
   - **Tier B (Medium)**: Khách hàng trung bình
   - **Tier C (Small)**: Khách hàng nhỏ
   
2. **Tối ưu hóa Lộ trình tự động**
   - Sử dụng thuật toán Nearest Neighbor (TSP)
   - Ưu tiên khách hàng Tier A → B → C
   - Giảm khoảng cách di chuyển tối đa

3. **Hiển thị Khoảng cách**
   - Tổng km di chuyển cho mỗi ngày
   - Cập nhật real-time khi thay đổi lộ trình

4. **Call Objective & Notes**
   - Ghi chú mục tiêu cho mỗi lần viếng thăm
   - Lưu trữ thông tin từ lần viếng thăm trước

---

## 🚀 Quy trình sử dụng

### Bước 1: Chọn Trình dược viên (TDV)
1. Vào menu **Quản lý Tuyến (MCP)**
2. Chọn TDV từ dropdown
3. Hệ thống tự động load danh sách khách hàng được gán

### Bước 2: Xây dựng Lộ trình

#### Cách 1: Thêm thủ công
1. Chọn tab ngày (Thứ 2 → Thứ 7)
2. Click vào điểm trên bản đồ để thêm khách hàng
3. Hoặc click vào Popup và chọn "Thêm vào Thứ X"

#### Cách 2: Import Excel
1. Click **📥 Template** để tải mẫu
2. Điền thông tin:
   - **Mã NV**: Mã nhân viên (VD: TDV001)
   - **Mã KH**: Mã khách hàng (VD: KH001)
   - **Thứ**: Ngày trong tuần (T2, T3, ..., T7)
3. Click **📤 Import** để upload file

### Bước 3: Tối ưu hóa Lộ trình

1. Sau khi thêm đủ khách hàng (≥ 2)
2. Click nút **🎯 Tối ưu**
3. Hệ thống sẽ:
   - Sắp xếp theo Tier (A → B → C)
   - Tối ưu khoảng cách di chuyển
   - Hiển thị tổng km sau khi tối ưu

### Bước 4: Điều chỉnh thủ công (nếu cần)

- **⬆️ Lên**: Di chuyển khách hàng lên trên
- **⬇️ Xuống**: Di chuyển khách hàng xuống dưới
- **🗑️ Xóa**: Loại bỏ khỏi tuyến
- **Frequency**: Chọn tần suất viếng thăm
  - F4: Hàng tuần
  - F2-ODD: Tuần 1, 3
  - F2-EVEN: Tuần 2, 4
  - F1: 1 lần/tháng

### Bước 5: Lưu Tuyến & Sinh Lịch

1. Click **LƯU TUYẾN & SINH LỊCH**
2. Hệ thống sẽ:
   - Lưu cấu hình tuyến vào database
   - Tự động sinh lịch viếng thăm cho 4 tuần tới
   - TDV có thể xem lịch trên App Mobile

---

## 📊 Hiểu về các chỉ số

### Thống kê trên Header
- **Tổng KH**: Tổng số khách hàng được gán cho TDV
- **Đã xếp tuyến**: Số khách hàng đã được thêm vào lịch trình
- **Chưa xếp**: Số khách hàng chưa được xếp vào ngày nào

### Thông tin mỗi ngày
- **X khách hàng**: Số lượng khách hàng trong ngày
- **📍 Y km**: Tổng khoảng cách di chuyển (tính theo đường chim bay)

### Màu sắc trên Bản đồ
- 🔵 **Xanh dương**: Khách hàng đang chọn (ngày hiện tại)
- 🟢 **Xanh lá**: Đã xếp vào ngày khác
- ⚪ **Xám**: Chưa xếp tuyến

---

## 💡 Tips & Best Practices

### 1. Phân loại Tier chính xác
- Tier A: Doanh số > 50 triệu/tháng
- Tier B: Doanh số 20-50 triệu/tháng
- Tier C: Doanh số < 20 triệu/tháng

### 2. Tối ưu hóa hiệu quả
- Luôn sử dụng nút **🎯 Tối ưu** sau khi thêm khách hàng
- Kiểm tra lại thứ tự nếu có khách hàng ưu tiên đặc biệt
- Mục tiêu: Giảm khoảng cách xuống dưới 30km/ngày

### 3. Cân bằng khối lượng công việc
- Mỗi ngày nên có 8-12 khách hàng
- Không nên quá 15 khách hàng/ngày
- Ưu tiên phân bổ đều các ngày trong tuần

### 4. Xử lý khách hàng đặc biệt
- Khách hàng yêu cầu giờ cố định: Đặt ở đầu hoặc cuối ngày
- Khách hàng xa: Nhóm với các khách hàng cùng khu vực
- Khách hàng VIP (Tier A): Luôn ưu tiên viếng thăm đầu tiên

---

## 🔧 Xử lý sự cố

### Lỗi: "Khách hàng đã được xếp vào Thứ X"
**Nguyên nhân**: Khách hàng đã tồn tại trong ngày khác
**Giải pháp**: 
1. Xóa khách hàng khỏi ngày cũ
2. Thêm vào ngày mới

### Lỗi: "Cần ít nhất 2 khách hàng để tối ưu"
**Nguyên nhân**: Chưa đủ khách hàng để tối ưu
**Giải pháp**: Thêm ít nhất 2 khách hàng vào ngày

### Không hiển thị khách hàng trên bản đồ
**Nguyên nhân**: Khách hàng chưa có tọa độ GPS
**Giải pháp**: 
1. Vào **Quản lý Khách hàng**
2. Cập nhật Latitude/Longitude cho khách hàng

---

## 📱 Tích hợp với Mobile App

Sau khi lưu tuyến, TDV có thể:
1. Xem lịch trình trên App Mobile
2. Check-in/Check-out tại mỗi điểm
3. Ghi nhận đơn hàng
4. Chụp ảnh trưng bày
5. Cập nhật tồn kho

---

## 📞 Hỗ trợ

Nếu gặp vấn đề, liên hệ:
- **Email**: support@ammedtech.com
- **Hotline**: 1900-xxxx
- **Zalo**: AM Medtech Support
