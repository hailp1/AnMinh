# 🔍 KIỂM TRA KẾT NỐI - BACKEND, FRONTEND, DATABASE

## 📋 **SCRIPT KIỂM TRA**

Chạy script để kiểm tra tất cả kết nối:

```bash
node scripts/check-all-connections.js
```

Script sẽ kiểm tra:
1. ✅ Database Connection (PostgreSQL)
2. ✅ Backend Server (Port 5000)
3. ✅ Backend Login API (`/api/auth/login`)
4. ✅ Frontend Server (Port 3099, 3100, 3101, 3000)
5. ✅ Proxy (Frontend → Backend)
6. ✅ Proxy Login (Login qua proxy)

---

## 🔧 **KIỂM TRA THỦ CÔNG**

### **1. KIỂM TRA DATABASE**

```bash
node scripts/check-user-am01.js
```

**Hoặc tạo admin user:**
```bash
node scripts/create-admin-simple.js
```

**Kỳ vọng:**
- ✅ Database kết nối được
- ✅ Tìm thấy users trong database
- ✅ User ADMIN hoặc AM01 tồn tại

**Nếu lỗi:**
- ❌ "Can't reach database server" → Start PostgreSQL service

---

### **2. KIỂM TRA BACKEND**

**Kiểm tra Backend đang chạy:**
```bash
# Mở browser hoặc dùng curl
curl http://localhost:5000/api
```

**Kỳ vọng:**
- ✅ Status: 200 OK
- ✅ Response: JSON với version và endpoints

**Nếu lỗi:**
- ❌ Connection refused → Backend chưa chạy
- ❌ Timeout → Backend không phản hồi

**Start Backend:**
```bash
node server.js
```

**Kiểm tra Backend Login:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"employeeCode\":\"ADMIN\",\"password\":\"admin\"}"
```

**Kỳ vọng:**
- ✅ Status: 200 OK
- ✅ Response: JSON với token và user info

---

### **3. KIỂM TRA FRONTEND**

**Kiểm tra Frontend đang chạy:**
```bash
# Mở browser
http://localhost:3099
```

**Kỳ vọng:**
- ✅ Trang mở được (không lỗi ERR_CONNECTION_REFUSED)
- ✅ Hiển thị trang login/onboarding

**Nếu lỗi:**
- ❌ Connection refused → Frontend chưa chạy
- ❌ Port khác → Kiểm tra terminal Frontend để xem port nào

**Start Frontend:**
```bash
cd client
npm start
```

---

### **4. KIỂM TRA PROXY**

**Kiểm tra Proxy hoạt động:**
```bash
# Mở browser
http://localhost:3099/api
```

**Kỳ vọng:**
- ✅ Response: JSON giống như `http://localhost:5000/api`
- ✅ Không phải 404

**Nếu lỗi:**
- ❌ 404 → Proxy không hoạt động
- ❌ Response headers có `x-powered-by: Express` → Request đến backend nhưng route sai

**Fix Proxy:**
```bash
cd client
# Xóa cache
rmdir /s /q node_modules\.cache
# Restart
npm start
```

---

### **5. KIỂM TRA LOGIN QUA PROXY**

**Test trong Browser Console:**
```javascript
fetch('http://localhost:3099/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    employeeCode: 'ADMIN',
    password: 'admin'
  })
})
.then(r => r.json())
.then(console.log)
.catch(console.error);
```

**Kỳ vọng:**
- ✅ Response: `{ token: "...", user: {...} }`
- ✅ Status: 200

---

## 📊 **CHECKLIST ĐẦY ĐỦ**

### **Database:**
- [ ] PostgreSQL service đang chạy
- [ ] DATABASE_URL đúng trong .env
- [ ] Kết nối database thành công
- [ ] Có users trong database
- [ ] User ADMIN hoặc AM01 tồn tại

### **Backend:**
- [ ] Backend đang chạy trên port 5000
- [ ] GET `/api` trả về 200 OK
- [ ] POST `/api/auth/login` hoạt động
- [ ] JWT_SECRET được set trong .env
- [ ] Routes được register đúng

### **Frontend:**
- [ ] Frontend đang chạy (port 3099 hoặc khác)
- [ ] Trang mở được trong browser
- [ ] setupProxy.js được load
- [ ] config-overrides.js đúng
- [ ] Không có lỗi compile

### **Proxy:**
- [ ] GET `/api` qua Frontend trả về backend response
- [ ] POST `/api/auth/login` qua Frontend hoạt động
- [ ] Request được forward đúng đến backend
- [ ] Không có lỗi CORS

### **Integration:**
- [ ] Login từ Frontend thành công
- [ ] Token được lưu trong localStorage
- [ ] User được redirect đúng sau login
- [ ] API calls từ Frontend hoạt động

---

## 🐛 **CÁC LỖI THƯỜNG GẶP**

### **1. Database không kết nối được**

**Lỗi:**
```
Can't reach database server at localhost:5432
```

**Giải pháp:**
1. Mở Services: `services.msc`
2. Tìm service `postgresql` hoặc `PostgreSQL`
3. Start nếu đang stopped

**HOẶC:**
```powershell
Get-Service | Where-Object {$_.Name -like '*postgres*'}
Start-Service postgresql-x64-XX
```

---

### **2. Backend không chạy**

**Lỗi:**
```
ERR_CONNECTION_REFUSED trên port 5000
```

**Giải pháp:**
```bash
node server.js
```

**Kiểm tra:**
- Tìm dòng: `Server đang chạy trên port 5000`
- Test: `curl http://localhost:5000/api`

---

### **3. Frontend không chạy**

**Lỗi:**
```
ERR_CONNECTION_REFUSED trên port 3099
```

**Giải pháp:**
```bash
cd client
npm start
```

**Đợi:**
- Dòng: `Compiled successfully!`
- Dòng: `[Config] ✅ setupProxy.js loaded successfully`

---

### **4. Proxy không hoạt động**

**Lỗi:**
```
404 khi gọi /api qua Frontend
```

**Giải pháp:**
```bash
cd client
# Xóa cache
rmdir /s /q node_modules\.cache
# Restart
npm start
```

**Kiểm tra:**
- Terminal Frontend có log: `[Proxy] GET /api -> http://localhost:5000/api`
- config-overrides.js đã load setupProxy.js

---

### **5. Login không được**

**Nguyên nhân:**
- User không tồn tại trong database
- Password không đúng
- Backend không kết nối được database

**Giải pháp:**
```bash
# Tạo user ADMIN
node scripts/create-admin-simple.js

# Hoặc dùng user từ seed
# ADMIN001 / 123456
# AM01 / admin123
```

---

## ✅ **KẾT QUẢ MONG ĐỢI**

Sau khi kiểm tra, tất cả phải **PASS**:

```
✅ Database Connection: OK
✅ Backend Server: OK  
✅ Backend Login API: OK
✅ Frontend Server: OK
✅ Proxy (Frontend → Backend): OK
✅ Proxy Login: OK
```

---

## 🚀 **SAU KHI TẤT CẢ OK**

1. **Mở browser:** `http://localhost:3099`
2. **Login với:**
   - Employee Code: `ADMIN`
   - Password: `admin`
3. **Hoặc:**
   - Employee Code: `AM01`
   - Password: `admin123`

---

**Tạo bởi:** System Check  
**Ngày:** 2025-11-18

