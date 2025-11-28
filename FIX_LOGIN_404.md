# 🔧 FIX LỖI 404 KHI LOGIN - HƯỚNG DẪN CHI TIẾT

## 📋 **VẤN ĐỀ**

Login nhận được lỗi:
```
POST http://localhost:3099/api/auth/login 404 (Not Found)
Response: {"message": "Route không tìm thấy"}
```

---

## 🔍 **NGUYÊN NHÂN**

Có nhiều nguyên nhân có thể:

1. **Backend không chạy**
2. **Backend routes chưa được load**
3. **Proxy không forward request đúng**
4. **User không tồn tại trong database**

---

## ✅ **GIẢI PHÁP TỪNG BƯỚC**

### **Bước 1: Chạy Script Chẩn Đoán**

```bash
node scripts/full-diagnosis.js
```

Script này sẽ kiểm tra:
- ✅ Database connection
- ✅ Backend API (GET /api)
- ✅ Backend Login (POST /api/auth/login)
- ✅ Frontend server
- ✅ Proxy functionality

**Xem kết quả và làm theo khuyến nghị!**

---

### **Bước 2: Đảm Bảo Backend Đang Chạy**

**Test backend:**
```bash
# Mở browser hoặc dùng curl
curl http://localhost:5000/api
```

**Kỳ vọng:**
- ✅ Status: 200 OK
- ✅ Response: JSON với version và endpoints

**Nếu lỗi:**
- ❌ Connection refused → Backend không chạy
- **Giải pháp:** Chạy `node server.js` trong terminal riêng

---

### **Bước 3: Test Login Trực Tiếp (Không Qua Proxy)**

**Test trong browser hoặc Postman:**
```
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "employeeCode": "admin",
  "password": "admin"
}
```

**Kỳ vọng:**
- ✅ Status: 200 OK
- ✅ Response: JSON với token và user

**Nếu 404:**
- ❌ Backend routes chưa load
- **Giải pháp:** Restart backend

**Nếu 400:**
- ❌ User không tồn tại
- **Giải pháp:** Tạo user: `npm run create:users`

---

### **Bước 4: Restart Backend**

```bash
# Trong terminal Backend
# Nhấn Ctrl+C để stop
# Chạy lại:
node server.js
```

**Kiểm tra logs:**
- ✅ Tìm: `Registering routes...`
- ✅ Tìm: `- /api/auth`
- ✅ Tìm: `Server đang chạy trên port 5000`

**Nếu không thấy:**
- ❌ Routes không được register
- **Kiểm tra:** File `server.js` line 209: `app.use('/api/auth', authRoutes);`

---

### **Bước 5: Tạo User Nếu Chưa Có**

```bash
npm run create:users
```

**Hoặc:**
```bash
node scripts/create-users.js
```

**Kỳ vọng:**
- ✅ User ADMIN được tạo/cập nhật
- ✅ User AM01 được tạo/cập nhật

---

### **Bước 6: Restart Frontend**

```bash
cd client
rmdir /s /q node_modules\.cache
npm start
```

**Kiểm tra logs:**
- ✅ Tìm: `Compiled successfully!`
- ✅ Tìm: `[Config] ✅✅✅ setupProxy.js loaded`

---

### **Bước 7: Test Login Qua Proxy**

**Mở browser:**
```
http://localhost:3099/admin/login
```

**Nhập:**
- Employee Code: `admin`
- Password: `admin`

**Xem logs:**

**Terminal Backend:**
```
[Backend] POST /api/auth/login - Original: /api/auth/login - URL: /api/auth/login
```

**Terminal Frontend:**
```
[Proxy] POST /api/auth/login -> http://localhost:5000/api/auth/login
```

---

## 📊 **CHECKLIST**

- [ ] Backend đang chạy (`http://localhost:5000/api` → 200 OK)
- [ ] Login trực tiếp backend OK (`POST http://localhost:5000/api/auth/login` → 200 OK)
- [ ] User tồn tại trong database (`npm run create:users`)
- [ ] Backend đã restart (nếu có thay đổi code)
- [ ] Frontend đã restart với cache clear
- [ ] Proxy logs hiển thị trong terminal Frontend
- [ ] Backend logs hiển thị request trong terminal Backend

---

## 🐛 **DEBUG NÂNG CAO**

### **Kiểm Tra Route Registration**

Trong `server.js`, đảm bảo:

1. Routes được import (line ~169):
```javascript
import authRoutes from './routes/auth.js';
```

2. Routes được register (line ~209):
```javascript
app.use('/api/auth', authRoutes);
```

3. Routes được register TRƯỚC 404 handler (line ~301)

4. Routes được register SAU middleware (CORS, body parser)

---

### **Kiểm Tra Logs Backend**

Khi login, backend logs sẽ hiển thị:

```
[Backend] POST /api/auth/login - Original: /api/auth/login - URL: /api/auth/login
```

**Nếu không thấy:**
- ❌ Request không đến backend
- ❌ Proxy không hoạt động

**Nếu thấy nhưng vẫn 404:**
- ❌ Routes không được register
- ❌ Route path không match

---

### **Kiểm Tra Proxy Logs**

Khi login, frontend logs sẽ hiển thị:

```
[Proxy] POST /api/auth/login -> http://localhost:5000/api/auth/login
[Proxy] Request path: /api/auth/login
```

**Nếu không thấy:**
- ❌ setupProxy.js không được load
- ❌ Restart frontend với cache clear

---

## 🎯 **SAU KHI FIX**

**Login với:**
- Employee Code: `admin`
- Password: `admin`

**HOẶC:**
- Employee Code: `AM01`
- Password: `Anminh@123`

---

**Tạo bởi:** System Helper  
**Ngày:** 2025-11-18

