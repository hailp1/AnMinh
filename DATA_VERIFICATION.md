# Xác minh Nguồn Dữ liệu Hệ thống DMS

## 1. Admin Dashboard
- **File:** `DMS/frontend/src/pages/admin/AdminDashboard.js`
- **Nguồn dữ liệu:**
  - `pharmaciesAPI.getAll()`: Lấy danh sách khách hàng từ DB.
  - `ordersAPI.getAll()`: Lấy danh sách đơn hàng từ DB.
  - `usersAPI.getAll()`: Lấy danh sách nhân viên từ DB.
- **Trạng thái:** ✅ Đang sử dụng dữ liệu thật.

## 2. Quản lý Khách hàng (Customers)
- **File:** `DMS/frontend/src/pages/admin/AdminCustomers.js`
- **Nguồn dữ liệu:**
  - `fetch('${API_BASE}/pharmacies/admin/all')`: Lấy toàn bộ khách hàng.
  - `fetch('${API_BASE}/pharmacies', { method: 'POST' })`: Tạo khách hàng mới vào DB.
- **Trạng thái:** ✅ Đang sử dụng dữ liệu thật.

## 3. Quản lý Lộ trình (Routes)
- **File:** `DMS/frontend/src/pages/admin/AdminRoutes.js`
- **Nguồn dữ liệu:**
  - `usersAPI.getAll()`: Lấy danh sách TDV.
  - `customerAssignmentsAPI.getAll({ userId })`: Lấy danh sách khách hàng được phân công cho TDV.
  - `visitPlansAPI.generate(payload)`: Sinh lịch viếng thăm và lưu vào DB.
- **Trạng thái:** ✅ Đang sử dụng dữ liệu thật.

## Kết luận
Toàn bộ hệ thống Admin Panel đã được kết nối hoàn chỉnh với Backend API và Database PostgreSQL. Không có dữ liệu giả (mock data) được sử dụng trong các chức năng chính.
