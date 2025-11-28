# 🔧 FIX LỖI 404 KHI LOGIN

## 📋 **VẤN ĐỀ**

Khi login, nhận được lỗi:
```
Status Code: 404 Not Found
Response: {"message": "Route không tìm thấy"}
```

**Nhưng response headers có:**
- `access-control-allow-origin: http://localhost:3099`
- → Proxy **ĐANG hoạt động**, request đã đến backend!

---

## 🔍 **NGUYÊN NHÂN CÓ THỂ**

1. **Request path sai** (double `/api`)
   - Frontend gọi: `/api/auth/login`
   - Proxy forward: `http://localhost:5000/api/auth/login`
   - Nhưng backend nhận: `/api/api/auth/login` ❌

2. **Backend routes chưa load**
   - Routes chưa được import/register đúng
   - Backend cần restart

3. **Middleware chặn request**
   - CORS middleware
   - Rate limiting
   - Validation middleware

---

## ✅ **GIẢI PHÁP**

### **Bước 1: Test Backend Trực Tiếp**

Chạy script test:
```bash
node scripts/test-login-direct.js
```

**Kỳ vọng:**
- ✅ Status: 200 OK
- ✅ Response: JSON với token và user

**Nếu lỗi:**
- ❌ ECONNREFUSED → Backend không chạy
- ❌ 404 → Routes chưa load (restart backend)
- ❌ 400 → User không tồn tại (tạo user: `npm run create:users`)

---

### **Bước 2: Kiểm Tra Backend Logs**

Sau khi thêm logging, khi login sẽ thấy logs trong terminal Backend:

```
[Backend] POST /api/auth/login - Original: /api/auth/login - URL: /api/auth/login
```

**Nếu thấy:**
- `/api/api/auth/login` → Proxy đang double `/api` ❌
- `/auth/login` → Proxy đang remove `/api` ❌
- `/api/auth/login` → Path đúng ✅

---

### **Bước 3: Restart Backend**

Nếu backend đã chạy lâu hoặc có thay đổi code:

```bash
# Trong terminal Backend
# Nhấn Ctrl+C để stop
# Chạy lại:
node server.js
```

**Đảm bảo thấy:**
- `Server đang chạy trên port 5000`
- Không có lỗi import routes

---

### **Bước 4: Xóa Cache Frontend**

Nếu proxy không hoạt động:

```bash
cd client
# Xóa cache
rmdir /s /q node_modules\.cache
# Restart frontend
npm start
```

**Đảm bảo thấy trong terminal Frontend:**
```
[Config] ✅✅✅ setupProxy.js loaded and registered successfully!
[Proxy] POST /api/auth/login -> http://localhost:5000/api/auth/login
```

---

### **Bước 5: Kiểm Tra Routes**

Đảm bảo routes được register trong `server.js`:

```javascript
app.use('/api/auth', authRoutes);
```

Và trong `routes/auth.js`:

```javascript
router.post('/login', validateLogin, async (req, res) => {
  // ...
});
```

---

## 🔍 **DEBUG LOGS**

### **Backend Logs:**

Khi login, sẽ thấy trong terminal Backend:

```
[Backend] POST /api/auth/login - Original: /api/auth/login - URL: /api/auth/login
```

### **Frontend Proxy Logs:**

Trong terminal Frontend:

```
[Proxy] POST /api/auth/login -> http://localhost:5000/api/auth/login
[Proxy] Request path: /api/auth/login
```

---

## 📝 **CHECKLIST**

- [ ] Backend đang chạy (`node server.js`)
- [ ] Frontend đang chạy (`cd client && npm start`)
- [ ] Test backend trực tiếp: `node scripts/test-login-direct.js` → 200 OK
- [ ] Backend logs hiển thị request path đúng: `/api/auth/login`
- [ ] Proxy logs hiển thị forward đúng
- [ ] Routes được register trong server.js
- [ ] User tồn tại trong database (`npm run create:users`)

---

## 🚀 **SAU KHI FIX**

Login với:
- **Employee Code:** `admin`
- **Password:** `admin`

HOẶC:
- **Employee Code:** `AM01`
- **Password:** `Anminh@123`

---

**Tạo bởi:** System Helper  
**Ngày:** 2025-11-18

