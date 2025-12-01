# Báo cáo Test Hệ Thống DMS

## 1. Admin Login Flow
- **URL Đăng nhập:** `https://dms.ammedtech.com/Anminh/admin`
- **Tài khoản:** `ADMIN001` / `123456`
- **Kết quả:**
  - ✅ Đăng nhập thành công.
  - ✅ Chuyển hướng đúng đến `https://dms.ammedtech.com/Anminh/admin/dashboard`.
  - ✅ Menu Sidebar: Tất cả các link đã được cập nhật thành `/Anminh/admin/...`.
  - ✅ Quick Actions (Dashboard): Tất cả các link đã được cập nhật.
  - ✅ Logout: Chuyển hướng về trang đăng nhập Admin.

## 2. TDV Login Flow
- **URL Đăng nhập:** `https://dms.ammedtech.com/`
- **Tài khoản:** `TDV001` / `123456`
- **Kết quả:**
  - ✅ Đăng nhập thành công.
  - ✅ Chuyển hướng đúng đến `https://dms.ammedtech.com/home`.
  - ✅ Dashboard TDV hiển thị đầy đủ thông tin.
  - ✅ Logout: Chuyển hướng về trang đăng nhập (`/login`).

## 3. Cơ chế Tự động Chuyển hướng (Auto-Redirect)
- Hệ thống đã được cấu hình để tự động chuyển hướng các truy cập từ đường dẫn cũ `/admin/...` sang đường dẫn mới `/Anminh/admin/...`.
- **Ví dụ:** Truy cập `https://dms.ammedtech.com/admin/customers` sẽ tự động chuyển sang `https://dms.ammedtech.com/Anminh/admin/customers`.

## 4. Lưu ý quan trọng
- Nếu bạn vẫn thấy các đường dẫn cũ hoặc giao diện bị lỗi, vui lòng **Xóa Cache Trình duyệt** hoặc thử truy cập bằng **Tab Ẩn danh (Incognito Mode)**.
- Do trình duyệt thường lưu cache các file JS/CSS cũ, việc xóa cache là cần thiết sau khi cập nhật hệ thống.
