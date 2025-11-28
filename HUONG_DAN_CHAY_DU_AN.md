# 🚀 HƯỚNG DẪN KHỞI CHẠY DỰ ÁN

## ⚠️ **TẠI SAO DỰ ÁN CHƯA CHẠY?**

Có thể do:
1. ❌ **Terminal mới chưa mở** - Script mở terminal mới nhưng có thể bị chặn
2. ❌ **Process đã crash** - Server start nhưng gặp lỗi và tắt ngay
3. ❌ **Port đã bị chiếm** - Port 5000 hoặc 3099 đã được sử dụng
4. ❌ **Thiếu dependencies** - Chưa chạy `npm install`

---

## ✅ **CÁCH KHỞI CHẠY THỦ CÔNG (CHẮC CHẮN)**

### **BƯỚC 1: Kiểm tra Dependencies**

```bash
# Kiểm tra dependencies backend
npm list

# Nếu thiếu, cài đặt:
npm install

# Kiểm tra dependencies frontend
cd client
npm list

# Nếu thiếu, cài đặt:
npm install
cd ..
```

---

### **BƯỚC 2: Dừng các Process cũ**

```powershell
# PowerShell
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force

# Hoặc CMD
taskkill /F /IM node.exe
```

---

### **BƯỚC 3: Khởi động Backend**

**Mở Terminal 1 (PowerShell hoặc CMD):**

```bash
# Đảm bảo đang ở thư mục root của dự án
cd D:\newNCSKITORG\newNCSkit\AM_BS

# Start backend
node server.js
```

**Kỳ vọng output:**
```
Logger initialized in development mode
Server đang chạy trên port 5000
```

**Nếu có lỗi:**
- ❌ `Can't reach database server` → Start PostgreSQL service
- ❌ `Cannot find module` → Chạy `npm install`
- ❌ `Port 5000 already in use` → Dừng process đang dùng port 5000

---

### **BƯỚC 4: Khởi động Frontend**

**Mở Terminal 2 (PowerShell hoặc CMD):**

```bash
# Di chuyển vào thư mục client
cd D:\newNCSKITORG\newNCSkit\AM_BS\client

# Start frontend
npm start
```

**Kỳ vọng output:**
```
Compiled successfully!

You can now view an-minh-business-system-client in the browser.

  Local:            http://localhost:3099
  On Your Network:  http://192.168.x.x:3099

Note that the development build is not optimized.
To create a production build, use npm run build.
```

**Đợi compile (30-60 giây):**
- Tìm dòng: `Compiled successfully!`
- Tìm dòng: `[Config] ✅ setupProxy.js loaded successfully`

---

### **BƯỚC 5: Kiểm tra**

1. **Kiểm tra Backend:**
   - Mở browser: `http://localhost:5000/api`
   - Phải thấy JSON response với endpoints

2. **Kiểm tra Frontend:**
   - Mở browser: `http://localhost:3099`
   - Phải thấy trang login/onboarding

3. **Test Login:**
   - Employee Code: `AM01`
   - Password: `admin123`

---

## 🔧 **GIẢI PHÁP CHO CÁC LỖI THƯỜNG GẶP**

### **1. Lỗi: "Cannot find module"**

**Nguyên nhân:** Chưa cài dependencies

**Giải pháp:**
```bash
# Root directory
npm install

# Client directory
cd client
npm install
```

---

### **2. Lỗi: "Port 5000 already in use"**

**Nguyên nhân:** Port đã bị chiếm

**Giải pháp:**
```powershell
# Tìm process đang dùng port 5000
netstat -ano | findstr :5000

# Dừng process (thay PID bằng số thực tế)
taskkill /PID <PID> /F

# HOẶC dừng tất cả Node processes
taskkill /F /IM node.exe
```

---

### **3. Lỗi: "Can't reach database server"**

**Nguyên nhân:** PostgreSQL không chạy

**Giải pháp:**
1. Mở Services: `services.msc`
2. Tìm service `postgresql` hoặc `PostgreSQL`
3. Click **Start** nếu đang stopped

**HOẶC PowerShell:**
```powershell
# Tìm service
Get-Service | Where-Object {$_.Name -like '*postgres*'}

# Start service (thay tên service đúng)
Start-Service postgresql-x64-XX
```

---

### **4. Lỗi: "setupProxy.js không load"**

**Nguyên nhân:** Cache frontend cũ

**Giải pháp:**
```bash
# Xóa cache
cd client
rmdir /s /q node_modules\.cache

# Restart frontend
npm start
```

---

### **5. Frontend compile chậm hoặc lỗi**

**Giải pháp:**
```bash
# Xóa node_modules và cài lại
cd client
rmdir /s /q node_modules
npm install
npm start
```

---

## 📋 **CHECKLIST KHỞI CHẠY**

- [ ] Dependencies đã cài (`npm install` ở cả root và client)
- [ ] PostgreSQL service đang chạy
- [ ] .env file có DATABASE_URL và JWT_SECRET
- [ ] Terminal 1: Backend đang chạy (port 5000)
- [ ] Terminal 2: Frontend đang chạy (port 3099)
- [ ] Browser: `http://localhost:5000/api` hoạt động
- [ ] Browser: `http://localhost:3099` mở được
- [ ] Login với AM01/admin123 thành công

---

## 🚀 **SCRIPT TỰ ĐỘNG (Nếu muốn thử lại)**

### **Windows BAT:**
```batch
.\START_LOCAL.bat
```

### **Node.js Script:**
```bash
node scripts/start-servers.js
```

### **Kiểm tra trạng thái:**
```bash
node scripts/check-status.js
```

---

## 💡 **LƯU Ý**

1. **Luôn chạy Backend TRƯỚC Frontend**
   - Backend phải chạy trước để Frontend có thể proxy requests

2. **Giữ 2 terminal mở**
   - Terminal 1: Backend (node server.js)
   - Terminal 2: Frontend (npm start)

3. **Kiểm tra logs**
   - Xem logs trong terminal để biết lỗi gì
   - Backend: Tìm lỗi database, missing modules
   - Frontend: Tìm lỗi compile, proxy

4. **Nếu vẫn không chạy được:**
   - Xem file: `DANH_GIA_VA_ROADMAP_PRODUCTION.md`
   - Chạy: `node scripts/debug-full-detail.js`
   - Check logs trong `logs/` folder

---

## 📞 **TRỢ GIÚP**

Nếu vẫn gặp vấn đề, cung cấp:
1. Output từ terminal Backend
2. Output từ terminal Frontend
3. Lỗi cụ thể (screenshot hoặc copy text)
4. Kết quả của: `node scripts/check-status.js`

---

**Tạo bởi:** System Helper  
**Ngày:** 2025-11-18

