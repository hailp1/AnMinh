# 🔍 DEBUG LOGIN ISSUE - HƯỚNG DẪN KIỂM TRA

## ✅ API Backend: OK
```
✅ Login Success!
User: Nguyễn Văn An
Role: TDV
Token: eyJhbGci...
```

Backend hoạt động hoàn hảo!

---

## 🔍 KIỂM TRA FRONTEND

### Bước 1: Mở DevTools
```
1. Vào http://localhost:3100/
2. Nhấn F12 (mở DevTools)
3. Chọn tab "Console"
4. Chọn tab "Network"
```

### Bước 2: Clear Cache
```
1. DevTools → Application tab
2. Clear Storage
3. Click "Clear site data"
4. Refresh page (F5)
```

### Bước 3: Test Login
```
1. Nhập: TDV001
2. Nhập: 123456
3. Click "Đăng nhập"
4. Quan sát Console và Network
```

---

## 🔍 KIỂM TRA TRONG CONSOLE

### Nếu thấy:
```
✅ "POST /api/auth/login 200 OK"
   → API call thành công
   → Kiểm tra có redirect không

❌ "POST /api/auth/login 404"
   → Backend route sai
   → Kiểm tra server.js

❌ "POST /api/auth/login 401"
   → Sai username/password
   → Kiểm tra credentials

❌ "Failed to fetch"
   → Backend không chạy
   → Kiểm tra port 5000

❌ Không thấy request nào
   → Form không submit
   → Kiểm tra Onboarding.js
```

---

## 🔍 KIỂM TRA TRONG NETWORK TAB

### Tìm request: `auth/login`

**Click vào request → Headers:**
```
Request URL: http://localhost:3100/api/auth/login
Request Method: POST
Status Code: 200 OK (hoặc lỗi gì?)
```

**Click vào request → Payload:**
```
{
  "employeeCode": "TDV001",
  "password": "123456"
}
```

**Click vào request → Response:**
```
{
  "token": "eyJhbGci...",
  "user": {
    "name": "Nguyễn Văn An",
    "role": "TDV"
  }
}
```

---

## 🔍 CÁC VẤN ĐỀ CÓ THỂ

### Vấn Đề 1: Frontend chưa reload
**Triệu chứng**: Vẫn dùng AuthContext cũ

**Giải pháp**:
```bash
# Stop frontend (Ctrl+C)
cd d:\newNCSKITORG\newNCSkit\AM_BS\client
npm start
```

### Vấn Đề 2: Browser cache
**Triệu chứng**: Code cũ vẫn chạy

**Giải pháp**:
```
1. DevTools → Application → Clear Storage
2. Hard refresh: Ctrl+Shift+R
3. Hoặc: Ctrl+F5
```

### Vấn Đề 3: Onboarding.js không dùng AuthContext mới
**Triệu chứng**: Login không gọi API

**Kiểm tra**:
```javascript
// File: client/src/pages/Onboarding.js
// Dòng ~68-73

const result = await login(formData.employeeCode.trim(), formData.password);

if (result.success) {
  // Có redirect không?
  navigateWithTransition(result.redirect || '/home');
}
```

### Vấn Đề 4: Proxy không hoạt động
**Triệu chứng**: Request không đến backend

**Kiểm tra**:
```
Console có log:
[Proxy] POST /api/auth/login -> http://localhost:5000/api/auth/login
```

---

## 🔧 QUICK FIX

### Fix 1: Restart Frontend
```bash
# Terminal 1 (Frontend)
Ctrl+C
npm start
```

### Fix 2: Clear Browser
```
1. F12 → Application → Clear Storage
2. Ctrl+Shift+R (Hard refresh)
```

### Fix 3: Check Backend
```bash
# Terminal 2 (Backend)
# Xem có log gì không khi login?
```

---

## 📊 CHECKLIST DEBUG

### Backend:
- [x] Server chạy port 5000
- [x] API /api/auth/login hoạt động
- [x] Response đúng format

### Frontend:
- [ ] Đã restart frontend?
- [ ] Đã clear cache?
- [ ] DevTools Console có lỗi?
- [ ] Network tab có request /api/auth/login?
- [ ] Request có response 200?

### AuthContext:
- [x] File đã update
- [ ] Frontend đã reload file mới?
- [ ] Console.log có chạy?

---

## 🎯 HÀNH ĐỘNG TIẾP THEO

### Bạn làm theo thứ tự:

1. **Restart Frontend** (Quan trọng!)
   ```bash
   Ctrl+C trong terminal frontend
   npm start
   ```

2. **Clear Browser Cache**
   ```
   F12 → Application → Clear Storage
   Ctrl+Shift+R
   ```

3. **Test Login**
   ```
   TDV001 / 123456
   ```

4. **Chụp Screenshot**
   - Console tab (có lỗi gì?)
   - Network tab (request /api/auth/login)
   - Gửi cho tôi xem

---

## 💡 TIP

**Nếu vẫn không được, làm theo:**

1. Stop tất cả terminals
2. Restart backend:
   ```bash
   cd d:\newNCSKITORG\newNCSkit\AM_BS
   node server.js
   ```
3. Restart frontend:
   ```bash
   cd d:\newNCSKITORG\newNCSkit\AM_BS\client
   npm start
   ```
4. Clear browser cache
5. Test lại

---

**Hãy làm theo checklist và báo kết quả! 🔍**
