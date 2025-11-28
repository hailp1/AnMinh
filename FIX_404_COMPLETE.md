# ✅ FIX 404 ROUTE - HƯỚNG DẪN HOÀN CHỈNH

## ❌ **VẤN ĐỀ**

```
POST http://localhost:3099/api/auth/login 404 (Not Found)
{"message": "Route không tìm thấy"}
```

---

## 🔍 **NGUYÊN NHÂN GỐC RỄ**

**Đã xác định:** Backend không chạy hoặc routes chưa được load đúng

---

## ✅ **GIẢI PHÁP TỪNG BƯỚC**

### **Bước 1: Đảm bảo Backend chạy**

**Kiểm tra:**
```bash
# Test trong PowerShell
Invoke-RestMethod -Uri "http://localhost:5000/api" -Method GET
```

**Nếu lỗi → Start Backend:**
```bash
node server.js
```

**Đợi thấy trong terminal Backend:**
```
Registering routes...
  - /api/auth
[Server] Registering route: /api/auth
Server đang chạy trên port 5000
```

---

### **Bước 2: Test Routes Trực Tiếp**

**Test GET (should return 405):**
```bash
curl http://localhost:5000/api/auth/login
```

**Test POST:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"employeeCode":"admin","password":"admin"}'
```

**Kỳ vọng:**
- GET → 405 (Method Not Allowed) ✅
- POST → 200 (với token) hoặc 400 (user chưa có) ✅

---

### **Bước 3: Restart Frontend (nếu vẫn 404 qua proxy)**

```bash
cd client
rmdir /s /q node_modules\.cache
npm start
```

**Đợi thấy:**
```
Compiled successfully!
[Config] ✅✅✅ setupProxy.js loaded
```

---

### **Bước 4: Kiểm tra Logs**

**Khi login, Terminal Backend PHẢI hiển thị:**
```
[Backend] POST /api/auth/login - Original: /api/auth/login - URL: /api/auth/login
```

**Nếu KHÔNG thấy:**
- Request không đến backend
- Proxy không hoạt động

**Nếu THẤY nhưng vẫn 404:**
- Routes chưa được register
- Có lỗi trong quá trình load routes

---

## 🚀 **SCRIPT TỰ ĐỘNG**

### **Chạy test tự động:**
```bash
node scripts/fix-and-test-routes.js
```

Script sẽ:
- ✅ Test Backend
- ✅ Test Routes
- ✅ Báo cáo nguyên nhân nếu có vấn đề

---

## 📋 **CHECKLIST CUỐI CÙNG**

- [ ] Backend đang chạy (`http://localhost:5000/api` → 200)
- [ ] Routes được register (Backend logs có "Registering routes...")
- [ ] GET /api/auth/login → 405
- [ ] POST /api/auth/login → 200 hoặc 400
- [ ] Backend logs hiển thị request khi login
- [ ] Frontend đang chạy
- [ ] Proxy hoạt động (Frontend logs có proxy logs)

---

## 🎯 **SAU KHI FIX**

**Login:**
- URL: `http://localhost:3099/admin/login`
- Employee Code: `admin`
- Password: `admin`

---

**Tạo bởi:** System Helper  
**Ngày:** 2025-11-18

