# Hướng dẫn Sử dụng Hệ thống Quản lý Kho & Sản phẩm

## 1. Cài đặt & Cấu hình
- **Backend**: Đã cập nhật Schema và API. Cần khởi động lại server (`npm run start:backend` hoặc `node server.js`).
- **Frontend**: Đã thêm trang Quản lý kho. Cần refresh trình duyệt.

## 2. Import Dữ liệu
Sử dụng script `import_inventory_excel.js` để nhập dữ liệu từ file Excel.
Cú pháp:
```bash
node import_inventory_excel.js <đường_dẫn_file_excel>
```
File Excel cần có các cột: `Mã kho`, `Tên kho`, `Mã hàng`, `Tên hàng`, `Số lô`, `Hạn sử dụng`, `Số lượng`.

## 3. Chức năng trên Giao diện
Truy cập menu **Quản lý kho** trên Admin Panel:
1. **📦 Tồn kho**: Xem tổng quan số lượng tồn của từng sản phẩm tại từng kho.
   - Màu xanh: Còn hàng.
   - Màu đỏ: Sắp hết (dưới định mức tối thiểu).
2. **📅 Lô & Hạn dùng**: Quản lý chi tiết từng lô hàng.
   - Cảnh báo "Cận date" nếu hạn sử dụng còn dưới 6 tháng.
3. **🏭 Danh sách kho**: Xem thông tin các kho hàng (địa chỉ, người quản lý).
4. **📝 Lịch sử**: Xem nhật ký nhập/xuất kho.

## 4. Lưu ý
- Dữ liệu tồn kho được tổng hợp tự động từ các lô hàng.
- Khi nhập hàng mới, nên sử dụng chức năng Import hoặc tạo giao dịch nhập kho (tính năng sắp ra mắt).
