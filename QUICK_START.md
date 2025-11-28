# 🚀 QUICK START - An Minh Business System

## ⚡ Khởi động nhanh

### Cách 1: Tự động khởi động cả Backend và Frontend (Khuyến nghị)

**Windows:**
```bash
# Double-click file hoặc chạy trong PowerShell:
.\scripts\start-all.bat

# Hoặc PowerShell:
.\scripts\start-all.ps1
```

**Sau khi khởi động:**
1. Đợi Backend khởi động (vài giây)
2. Đợi Frontend compile xong (~30 giây)
3. Tìm dòng: `Compiled successfully!`
4. Mở browser: http://localhost:3099
5. Đăng nhập: AM01 / admin123

---

### Cách 2: Khởi động riêng lẻ

#### 1. Backend (Port 5000)

```bash
# Cách 1: Double-click
start-backend.bat

# Cách 2: PowerShell
.\start-backend.ps1

# Cách 3: Manual
node server.js
```

**Kiểm tra Backend:**
- Mở: http://localhost:5000/api
- Sẽ thấy danh sách API endpoints

#### 2. Frontend (Port 3099)

```bash
cd client
npm start
```

**Kiểm tra Frontend:**
- Mở: http://localhost:3099
- Đợi compile xong

---

## 🔍 Kiểm tra hệ thống

### Kiểm tra Backend health:
```bash
npm run check:backend
```

### Kiểm tra User AM01:
```bash
npm run check:user
```

### Kiểm tra toàn bộ hệ thống:
```bash
npm run check
```

---

## 🔑 Đăng nhập

**Thông tin đăng nhập:**
- Employee Code: `AM01`
- Password: `admin123`

---

## ❌ Troubleshooting

### Lỗi 504 Gateway Timeout
- **Nguyên nhân:** Backend không chạy
- **Giải pháp:** Khởi động backend bằng `start-backend.bat` hoặc `node server.js`

### Lỗi Proxy 404
- **Nguyên nhân:** setupProxy.js chưa được load
- **Giải pháp:** Restart frontend (Ctrl+C rồi `npm start` lại)

### Lỗi "Route không tìm thấy"
- **Nguyên nhân:** Backend chưa khởi động hoặc route chưa được đăng ký
- **Giải pháp:** Khởi động lại backend

---

## 📝 Scripts có sẵn

- `start-backend.bat` / `start-backend.ps1` - Khởi động backend
- `start-all.bat` / `start-all.ps1` - Khởi động cả backend và frontend
- `scripts/check-backend-health.js` - Kiểm tra backend health
- `scripts/check-user-am01.js` - Kiểm tra user AM01 trong database

---

✅ **Sau khi khởi động xong, bạn có thể login với AM01 / admin123!**

