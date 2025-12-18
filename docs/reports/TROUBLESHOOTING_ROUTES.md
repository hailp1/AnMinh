# 🔧 Troubleshooting Guide - Quản lý Lộ trình

## ❌ Vấn đề thường gặp

### 1. **Lỗi: "Cannot find module './routeOptimization'"**

**Nguyên nhân**: File `routeOptimization.js` chưa được build vào Docker container

**Giải pháp**:
```bash
cd d:\AM_DMS
docker-compose -f docker-compose.preprod.yml up -d --build frontend
```

Chờ 2-3 phút để build hoàn tất, sau đó tải lại trang.

---

### 2. **Lỗi: "Không có token, vui lòng đăng nhập"**

**Nguyên nhân**: Chưa đăng nhập hoặc token đã hết hạn

**Giải pháp**:
1. Xóa localStorage: `localStorage.clear()`
2. Đăng nhập lại tại `http://localhost:3599/Anminh/admin`
3. Username: `admin`, Password: `123456`

---

### 3. **Không hiển thị danh sách TDV**

**Nguyên nhân**: Database chưa có users với role TDV

**Giải pháp**:
```bash
cd d:\AM_DMS\DMS\backend
node prisma/seed.js
```

Hoặc tạo user TDV thủ công qua Prisma Studio:
```bash
npx prisma studio
```

---

### 4. **Không hiển thị khách hàng trên bản đồ**

**Nguyên nhân**: 
- Khách hàng chưa có tọa độ GPS (latitude/longitude)
- Khách hàng chưa được gán cho TDV

**Giải pháp**:
1. Vào **Quản lý Khách hàng**
2. Cập nhật Latitude/Longitude cho từng khách hàng
3. Hoặc import Excel với đầy đủ thông tin GPS

---

### 5. **Nút "🎯 Tối ưu" bị disabled**

**Nguyên nhân**: Chưa đủ 2 khách hàng trong ngày

**Giải pháp**: Thêm ít nhất 2 khách hàng vào ngày hiện tại

---

### 6. **Lỗi: "Failed to fetch" khi gọi API**

**Nguyên nhân**: Backend không chạy hoặc CORS issue

**Kiểm tra**:
```bash
docker ps --filter "name=backend"
docker logs preprod_backend --tail 50
```

**Giải pháp**:
```bash
docker restart preprod_backend
```

---

### 7. **Tier badge không hiển thị**

**Nguyên nhân**: Database chưa có migration mới

**Giải pháp**:
```bash
cd d:\AM_DMS\DMS\backend
npx prisma migrate deploy
```

---

## ✅ Checklist kiểm tra nhanh

Trước khi báo lỗi, hãy kiểm tra:

- [ ] Backend đang chạy: `docker ps | grep backend`
- [ ] Frontend đang chạy: `docker ps | grep frontend`
- [ ] Database đang chạy: `docker ps | grep postgres`
- [ ] Đã đăng nhập: Kiểm tra `localStorage.getItem('token')`
- [ ] File `routeOptimization.js` tồn tại trong `src/utils/`
- [ ] Migration đã chạy: `npx prisma migrate status`
- [ ] Có dữ liệu test: Kiểm tra qua Prisma Studio

---

## 🔍 Debug Mode

### Bật Console Log
Mở DevTools (F12) → Console → Xem lỗi chi tiết

### Kiểm tra Network
DevTools → Network → Xem API calls:
- `/api/users` - Lấy danh sách TDV
- `/api/customer-assignments` - Lấy khách hàng
- `/api/routes` - Lấy/Lưu tuyến

### Kiểm tra State
Trong Console, gõ:
```javascript
// Xem token
localStorage.getItem('token')

// Xem user info
JSON.parse(localStorage.getItem('adminUser'))

// Clear tất cả
localStorage.clear()
```

---

## 📞 Liên hệ hỗ trợ

Nếu vẫn gặp lỗi, cung cấp thông tin:
1. Screenshot lỗi từ Console (F12)
2. Kết quả của: `docker ps`
3. Log backend: `docker logs preprod_backend --tail 100`
4. Log frontend: `docker logs preprod_frontend --tail 100`
