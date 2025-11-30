# 🚀 AM MEDTECH - Hướng dẫn nhanh

## Khởi động hệ thống

### 1. Khởi động tất cả services
```
START_ALL_SIMPLE.bat
```

Chờ 30-60 giây để services khởi động hoàn tất.

### 2. Truy cập

- **Landing Page (Public)**: http://localhost:3000 hoặc https://ammedtech.com
- **DMS Client (Internal)**: http://localhost:3099
- **Backend API**: http://localhost:5000

### 3. Đăng nhập DMS

- Employee Code: `AM01`
- Password: `admin123`

## Dừng hệ thống

```
STOP_ALL_SIMPLE.bat
```

## Cấu trúc Services

1. **Backend API** (Port 5000) - Express.js server
2. **DMS Client** (Port 3099) - React app cho nhân viên
3. **Landing Page** (Port 3000) - Next.js website công khai
4. **Cloudflare Tunnel** - Kết nối local → ammedtech.com

## Xử lý sự cố

### Lỗi: Port đã được sử dụng
Chạy `STOP_ALL_SIMPLE.bat` trước, sau đó chạy lại `START_ALL_SIMPLE.bat`

### Lỗi: ammedtech.com không truy cập được (502)
- Kiểm tra xem `START_ALL_SIMPLE.bat` đã chạy chưa
- Đợi 1-2 phút để Cloudflare Tunnel kết nối
- Kiểm tra port 3000 có đang chạy: http://localhost:3000

### Lỗi: Build không tồn tại
```bash
cd am-medtech-web
npm run build
```

## Files quan trọng

- `START_ALL_SIMPLE.bat` - Khởi động tất cả
- `STOP_ALL_SIMPLE.bat` - Dừng tất cả
- `PUSH_TO_GIT.bat` - Push code lên GitHub
- `README.md` - Documentation đầy đủ
- `TUNNEL_SETUP.md` - Hướng dẫn cấu hình Cloudflare Tunnel

---

**Developed by AM MEDTECH Team**
