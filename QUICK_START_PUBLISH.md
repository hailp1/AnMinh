# 🚀 Quick Start - Publish to Production

## Cách Nhanh Nhất để Publish

### 1. Mở PowerShell/CMD tại thư mục dự án
```bash
cd d:\AM_DMS
```

### 2. Chạy lệnh publish
```bash
scripts\PUBLISH_PRODUCTION.bat
```

### 3. Đợi 5-10 phút để hệ thống build và khởi động

### 4. Truy cập
- **Production:** https://dms.ammedtech.com
- **Local Test:** http://localhost:3099

---

## ⚡ Các Lệnh Thường Dùng

### Kiểm tra trạng thái
```bash
scripts\CHECK_PRODUCTION.bat
```

### Dừng hệ thống
```bash
scripts\STOP_PRODUCTION.bat
```

### Xem logs realtime
```bash
docker-compose -f docker-compose.yml logs -f
```

### Restart một service
```bash
docker-compose -f docker-compose.yml restart backend
docker-compose -f docker-compose.yml restart frontend
docker-compose -f docker-compose.yml restart cloudflared
```

---

## 🔧 Sau Khi Sửa Code

### Nếu sửa Backend
```bash
docker-compose -f docker-compose.yml up -d --build backend
```

### Nếu sửa Frontend
```bash
docker-compose -f docker-compose.yml up -d --build frontend
```

### Nếu sửa cả hai
```bash
scripts\PUBLISH_PRODUCTION.bat
```

---

## ✅ Checklist Nhanh

- [ ] Docker Desktop đang chạy
- [ ] Có file `tunnel-creds.json`
- [ ] Chạy `scripts\PUBLISH_PRODUCTION.bat`
- [ ] Đợi 5-10 phút
- [ ] Truy cập https://dms.ammedtech.com
- [ ] Done! 🎉

---

## 🆘 Gặp Lỗi?

1. Xem logs: `docker-compose -f docker-compose.yml logs`
2. Restart: `scripts\STOP_PRODUCTION.bat` rồi `scripts\PUBLISH_PRODUCTION.bat`
3. Kiểm tra Docker Desktop có đang chạy không
