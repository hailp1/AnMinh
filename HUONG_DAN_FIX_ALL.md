# 🛠️ HƯỚNG DẪN FIX TẤT CẢ VẤN ĐỀ

## ✅ ĐÃ TEST TOÀN DIỆN VÀ TÌM THẤY 2 VẤN ĐỀ

### **KẾT QUẢ TEST:**
- ✅ Backend: RUNNING (port 5000)
- ✅ Frontend: RUNNING (port 3099)
- ❌ **Proxy**: KHÔNG HOẠT ĐỘNG (404) → **CẦN FIX**
- ❌ **Database**: KHÔNG KẾT NỐI → **CẦN START POSTGRESQL**

---

## 🔧 GIẢI PHÁP - FIX CẢ HAI

### **CÁCH 1: Dùng BAT Scripts (KHUYẾN NGHỊ - Dễ nhất)**

BAT scripts chạy được mọi lúc, không cần PowerShell execution policy!

#### **1. Fix Tất Cả Vấn Đề:**

```batch
.\scripts\fix-all.bat
```

**HOẶC double-click:** `scripts\fix-all.bat`

Script này sẽ:
- ✅ Dừng frontend cũ
- ✅ Xóa cache
- ✅ Khởi động lại frontend
- ✅ Kiểm tra backend
- ✅ Kiểm tra PostgreSQL

---

#### **2. Start Cả Hai Servers:**

```batch
.\scripts\start-all.bat
```

**HOẶC double-click:** `scripts\start-all.bat`

Script này sẽ:
- ✅ Dừng servers cũ
- ✅ Start backend
- ✅ Start frontend
- ✅ Mở 2 terminal riêng

---

#### **3. Test Toàn Diện:**

```bash
node scripts/test-full-fix-all.js
```

Script này sẽ:
- ✅ Test backend
- ✅ Test frontend
- ✅ Test proxy
- ✅ Test database
- ✅ Test login endpoint
- ✅ Báo cáo tất cả vấn đề

---

### **CÁCH 2: Dùng PowerShell Scripts (Nếu BAT không chạy)**

Nếu PowerShell scripts không chạy, có thể do execution policy. Có 2 cách:

#### **Cách A: Fix Execution Policy**

1. Mở PowerShell as Administrator (Right-click -> Run as Administrator)
2. Chạy lệnh:
   ```powershell
   Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
   ```
3. Trả lời Y (Yes) khi được hỏi
4. Sau đó chạy scripts bình thường:
   ```powershell
   .\scripts\fix-proxy-restart-frontend.ps1
   .\scripts\check-start-postgresql.ps1
   ```

#### **Cách B: Bypass Policy (Tạm thời)**

```powershell
PowerShell -ExecutionPolicy Bypass -File .\scripts\fix-proxy-restart-frontend.ps1
PowerShell -ExecutionPolicy Bypass -File .\scripts\check-start-postgresql.ps1
```

---

### **CÁCH 3: Fix Thủ Công (Nếu scripts không chạy)**

#### **1. Fix Proxy:**

```powershell
# Dừng frontend (Ctrl+C trong terminal frontend)
cd client

# Xóa cache
Remove-Item -Recurse -Force node_modules\.cache -ErrorAction SilentlyContinue

# Restart
npm start
```

**Kiểm tra terminal frontend có log:**
```
[Config] ✅ setupProxy.js loaded successfully
[Config] 📡 Proxy configured: /api -> http://localhost:5000
```

---

#### **2. Start PostgreSQL:**

**Cách A: Qua Services (Dễ nhất)**
1. Mở Services: `services.msc`
2. Tìm service `postgresql` hoặc `PostgreSQL`
3. Nếu Status = Stopped, click Start

**Cách B: Qua PowerShell**
```powershell
# Tìm service
Get-Service | Where-Object {$_.Name -like '*postgres*'}

# Start service (cần tên service cụ thể)
Start-Service postgresql-x64-XX
```

**Cách C: Qua Command Prompt**
```batch
# Tìm service
sc query | findstr /i "postgres"

# Start service (cần tên service cụ thể)
net start postgresql-x64-XX
```

---

#### **3. Start Backend (Nếu chưa chạy):**

```bash
# Từ root
node server.js
```

**Kiểm tra terminal backend có log:**
```
Server đang chạy trên port 5000
```

---

## 📋 CHECKLIST SAU KHI FIX

- [ ] Backend đang chạy: `http://localhost:5000/api`
- [ ] Frontend đang chạy: `http://localhost:3099`
- [ ] Proxy được load (check terminal frontend có log `[Config] ✅ setupProxy.js loaded successfully`)
- [ ] PostgreSQL đang chạy (check Services hoặc test connection)
- [ ] Database kết nối được: `node scripts/check-user-am01.js`

---

## 🧪 TEST LOGIN

### **1. Test Toàn Diện:**
```bash
node scripts/test-full-fix-all.js
```

### **2. Test Login Trong Browser:**
1. Mở browser: `http://localhost:3099`
2. Nhập:
   - Employee Code: `AM01`
   - Password: `admin123`
3. Click "Đăng nhập"

### **3. Kiểm Tra Logs:**

**Terminal Frontend (Proxy logs):**
- Tìm: `[Proxy] POST /api/auth/login -> http://localhost:5000/api/auth/login`
- Nếu có → Proxy đang forward request

**Terminal Backend (Request logs):**
- Tìm: `Login request received: ...`
- Nếu có → Backend đã nhận request

---

## 🐛 NẾU VẪN KHÔNG LOGIN ĐƯỢC

### **1. Proxy vẫn 404:**
- Kiểm tra terminal frontend có log proxy không
- Restart frontend lại một lần nữa
- Xóa cache: `Remove-Item -Recurse -Force client\node_modules\.cache`

### **2. Database vẫn không kết nối:**
- Kiểm tra PostgreSQL service có đang chạy không
- Kiểm tra DATABASE_URL trong `.env` có đúng không
- Test connection: `node scripts/check-user-am01.js`

### **3. Backend không chạy:**
- Start backend: `node server.js`
- Kiểm tra log: `Server đang chạy trên port 5000`

---

## ✅ TÓM TẮT

**ĐÃ TẠO SCRIPTS:**

1. ✅ `scripts/fix-all.bat` - Fix tất cả vấn đề (BAT - dễ nhất)
2. ✅ `scripts/start-all.bat` - Start cả hai servers (BAT)
3. ✅ `scripts/test-full-fix-all.js` - Test toàn diện (Node.js)
4. ✅ `scripts/fix-proxy-restart-frontend.ps1` - Fix proxy (PowerShell)
5. ✅ `scripts/check-start-postgresql.ps1` - Check database (PowerShell)

**CÁCH NHANH NHẤT:**
```batch
.\scripts\fix-all.bat
```

Sau đó test login trong browser!

---

**Tạo bởi:** Auto Fix System  
**Ngày:** $(Get-Date)  
**Version:** 1.0 - Fix Tất Cả

