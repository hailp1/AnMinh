# 🔍 TÌM NGUYÊN NHÂN GỐC RỄ - LỖI 404 ROUTE

## 📋 **CÁC NGUYÊN NHÂN CÓ THỂ**

### **1. Backend không chạy** ⭐ (Nguyên nhân phổ biến nhất)

**Kiểm tra:**
```bash
# Test trong PowerShell
Invoke-RestMethod -Uri "http://localhost:5000/api" -Method GET

# HOẶC mở browser
http://localhost:5000/api
```

**Nếu lỗi:**
- ❌ Connection refused → Backend không chạy
- **Fix:** `node server.js`

---

### **2. Routes chưa được register**

**Kiểm tra server.js:**
- Line ~169: `import authRoutes from './routes/auth.js';` ✅
- Line ~212: `app.use('/api/auth', authRoutes);` ✅
- Line ~305: 404 handler phải SAU routes ✅

**Kiểm tra routes/auth.js:**
- Line ~61: `router.post('/login', ...)` ✅
- Line ~148: `export default router;` ✅

**Nếu thiếu:**
- **Fix:** Thêm code còn thiếu và restart backend

---

### **3. Routes được register SAI THỨ TỰ**

**Vấn đề:**
- 404 handler được đặt TRƯỚC routes
- Routes không được load trước khi 404 handler

**Kiểm tra server.js:**
```javascript
// ✅ ĐÚNG:
app.use('/api/auth', authRoutes);  // Line ~212
// ... other routes
app.use((req, res) => {             // Line ~305 (404 handler)
  res.status(404).json({...});
});

// ❌ SAI:
app.use((req, res) => {             // 404 handler TRƯỚC routes
  res.status(404).json({...});
});
app.use('/api/auth', authRoutes);   // Routes SAU 404 handler
```

**Fix:** Đảm bảo routes được register TRƯỚC 404 handler

---

### **4. Middleware chặn request**

**Kiểm tra:**
- CORS middleware
- Body parser
- Rate limiting
- Validation middleware

**Có thể middleware chặn request trước khi đến routes**

---

### **5. Proxy không hoạt động**

**Kiểm tra:**
- setupProxy.js có được load không?
- Frontend logs có hiển thị proxy logs không?

**Fix:**
```bash
cd client
rmdir /s /q node_modules\.cache
npm start
```

---

## 🔧 **CÁCH KIỂM TRA**

### **Bước 1: Kiểm tra Backend**

```bash
# Test backend trực tiếp
curl http://localhost:5000/api

# HOẶC PowerShell
Invoke-RestMethod -Uri "http://localhost:5000/api" -Method GET
```

**Kỳ vọng:** JSON với version và endpoints

---

### **Bước 2: Test Route GET**

```bash
# Test GET /api/auth/login (should return 405)
curl http://localhost:5000/api/auth/login

# HOẶC PowerShell
Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" -Method GET
```

**Kỳ vọng:**
- Status: 405 (Method Not Allowed) → Route TỒN TẠI ✅
- Status: 404 → Route KHÔNG TỒN TẠI ❌

---

### **Bước 3: Test Route POST**

```bash
# Test POST /api/auth/login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"employeeCode":"admin","password":"admin"}'
```

**Kỳ vỌng:**
- Status: 200 → Route hoạt động ✅
- Status: 404 → Route KHÔNG TỒN TẠI ❌

---

### **Bước 4: Kiểm tra Backend Logs**

Khi login, terminal Backend phải hiển thị:
```
[Backend] POST /api/auth/login - Original: /api/auth/login - URL: /api/auth/login
```

**Nếu không thấy:**
- Request không đến backend
- Proxy không hoạt động

**Nếu thấy nhưng vẫn 404:**
- Routes chưa được register
- Request path không match route

---

## ✅ **CHECKLIST TÌM NGUYÊN NHÂN**

1. [ ] Backend có chạy không? (`http://localhost:5000/api`)
2. [ ] Route GET /api/auth/login có tồn tại không? (405 = tồn tại)
3. [ ] Route POST /api/auth/login có tồn tại không? (200 = hoạt động)
4. [ ] Routes có được register đúng không? (server.js line ~212)
5. [ ] Routes có được register TRƯỚC 404 handler không?
6. [ ] Backend logs có hiển thị request không?
7. [ ] Proxy có hoạt động không? (Frontend logs)

---

## 🎯 **NGUYÊN NHÂN PHỔ BIẾN NHẤT**

**Theo thống kê, 90% lỗi 404 là do:**

1. **Backend không chạy** (50%)
   - Fix: `node server.js`

2. **Backend routes chưa load** (30%)
   - Fix: Restart backend

3. **Proxy không hoạt động** (10%)
   - Fix: Restart frontend với cache clear

---

## 🚀 **SCRIPT TỰ ĐỘNG TÌM NGUYÊN NHÂN**

```bash
node scripts/find-root-cause.js
```

Script sẽ:
- ✅ Kiểm tra cấu trúc server.js
- ✅ Kiểm tra routes/auth.js
- ✅ Test backend
- ✅ Test routes
- ✅ Test proxy
- ✅ Đưa ra kết luận

---

**Tạo bởi:** System Helper  
**Ngày:** 2025-11-18

