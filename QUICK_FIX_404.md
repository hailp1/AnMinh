# 🚨 QUICK FIX - LỖI 404 KHI LOGIN

## ❌ **LỖI**

```
POST http://localhost:3099/api/auth/login 404 (Not Found)
```

---

## ✅ **GIẢI PHÁP NHANH**

### **Bước 1: Kiểm Tra Backend Có Chạy Không**

**Test trong PowerShell:**
```powershell
Invoke-RestMethod -Uri "http://localhost:5000/api" -Method GET
```

**HOẶC mở browser:**
```
http://localhost:5000/api
```

**Kỳ vọng:**
- ✅ Thấy JSON với `version` và `endpoints`

**Nếu lỗi:**
- ❌ Connection refused → Backend không chạy

---

### **Bước 2: Start Backend**

**Mở terminal mới và chạy:**
```bash
node server.js
```

**Đợi thấy:**
```
Registering routes...
  - /api/auth
Server đang chạy trên port 5000
```

**Nếu không thấy:**
- ❌ Có lỗi trong code
- ❌ Database không kết nối được

---

### **Bước 3: Test Login Trực Tiếp Backend**

**Trong PowerShell:**
```powershell
$body = @{employeeCode='admin'; password='admin'} | ConvertTo-Json -Compress
Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" -Method POST -Body $body -ContentType "application/json"
```

**HOẶC mở Postman:**
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
- ❌ Backend routes chưa load → Restart backend

**Nếu 400:**
- ❌ User không tồn tại → Chạy: `npm run create:users`

---

### **Bước 4: Tạo User (Nếu Chưa Có)**

```bash
npm run create:users
```

**Hoặc:**
```bash
node scripts/create-users.js
```

---

### **Bước 5: Test Login Qua Frontend**

1. **Đảm bảo Frontend đang chạy:**
   ```
   http://localhost:3099
   ```

2. **Mở trang login:**
   ```
   http://localhost:3099/admin/login
   ```

3. **Nhập:**
   - Employee Code: `admin`
   - Password: `admin`

4. **Xem logs:**
   - **Terminal Backend:** `[Backend] POST /api/auth/login ...`
   - **Terminal Frontend:** `[Proxy] POST /api/auth/login -> ...`

---

## 📋 **CHECKLIST**

- [ ] Backend đang chạy: `http://localhost:5000/api` → 200 OK
- [ ] Login trực tiếp backend OK: `POST http://localhost:5000/api/auth/login` → 200 OK
- [ ] User tồn tại: `npm run create:users`
- [ ] Frontend đang chạy: `http://localhost:3099`
- [ ] Test login qua Frontend

---

## 🐛 **NẾU VẪN 404**

**Kiểm tra:**

1. **Backend logs có hiển thị request không?**
   - Nếu không → Proxy không hoạt động
   - Restart frontend với cache clear

2. **Backend logs có hiển thị route không?**
   - Nếu không → Routes chưa load
   - Restart backend

3. **Request path trong logs là gì?**
   - `/api/auth/login` → Đúng ✅
   - `/api/api/auth/login` → Proxy double `/api` ❌
   - `/auth/login` → Proxy remove `/api` ❌

---

## 🎯 **TÓM TẮT**

**Nếu backend không chạy:**
```bash
node server.js
```

**Nếu user không tồn tại:**
```bash
npm run create:users
```

**Nếu vẫn 404:**
- Restart backend
- Restart frontend với cache clear
- Xem logs để debug

---

**Tạo bởi:** System Helper  
**Ngày:** 2025-11-18

