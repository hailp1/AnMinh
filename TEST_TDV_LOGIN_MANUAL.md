# 🧪 HƯỚNG DẪN TEST LOGIN TDV - CHI TIẾT

## 📋 CHUẨN BỊ

### Bước 1: Đảm Bảo Servers Đang Chạy
```
✅ Backend: http://localhost:5000
✅ Frontend: http://localhost:3100
```

### Bước 2: Mở DevTools
```
1. Mở Chrome/Edge
2. Nhấn F12 (DevTools)
3. Chọn tab "Console"
4. Chọn tab "Network"
```

---

## 🎯 TEST LUỒNG LOGIN TDV

### TEST 1: Trang Login

#### Bước 1: Mở Trang
```
URL: http://localhost:3100/
```

#### Bước 2: Kiểm Tra Giao Diện
```
✅ Có logo An Minh
✅ Có tiêu đề "An Minh Business System"
✅ Có 2 input fields:
   - Mã nhân viên
   - Mật khẩu
✅ Có nút "Đăng nhập" màu cam
```

#### Bước 3: Kiểm Tra Console
```
Console tab → Không có lỗi đỏ
```

---

### TEST 2: Nhập Thông Tin

#### Bước 1: Nhập Mã Nhân Viên
```
Click vào input "Mã nhân viên"
Gõ: TDV001
✅ Text tự động chuyển chữ hoa
```

#### Bước 2: Nhập Mật Khẩu
```
Click vào input "Mật khẩu"
Gõ: 123456
✅ Ký tự bị ẩn (••••••)
```

---

### TEST 3: Click Login

#### Bước 1: Click Nút "Đăng nhập"
```
Click nút màu cam "Đăng nhập"
```

#### Bước 2: Quan Sát
```
✅ Nút đổi thành "Đang đăng nhập..."
✅ Có loading spinner
```

#### Bước 3: Kiểm Tra Network Tab
```
Network tab → Tìm request:
  Name: login
  Method: POST
  URL: /api/auth/login
  Status: ???
```

**Nếu Status = 200:**
```
✅ Login thành công
→ Click vào request
→ Tab "Response"
→ Thấy:
{
  "token": "eyJhbGci...",
  "user": {
    "name": "Nguyễn Văn An",
    "role": "TDV"
  }
}
```

**Nếu Status = 401:**
```
❌ Sai username/password
→ Kiểm tra lại credentials
```

**Nếu Status = 404:**
```
❌ Backend route không tồn tại
→ Kiểm tra server.js
```

**Nếu không thấy request:**
```
❌ Form không submit
→ Kiểm tra Console có lỗi
→ Kiểm tra Onboarding.js
```

---

### TEST 4: Sau Khi Login

#### Kịch Bản A: Thành Công
```
✅ Thấy message "✅ Đăng nhập thành công!"
✅ URL chuyển sang: http://localhost:3100/home
✅ Navbar hiển thị
✅ Thấy tên user: "Nguyễn Văn An"
✅ Có menu: Home, Tạo đơn hàng, Profile
```

#### Kịch Bản B: Lỗi "Route không tìm thấy"
```
❌ Thấy message: "⚠️ Route không tìm thấy"
❌ URL vẫn ở: http://localhost:3100/

→ Nguyên nhân: AuthContext redirect sai
→ Giải pháp: 
   1. Manually gõ: http://localhost:3100/home
   2. Nếu vào được → Login đã thành công
   3. Cần fix AuthContext.js
```

#### Kịch Bản C: Lỗi Backend
```
❌ Thấy message: "Backend không phản hồi"

→ Nguyên nhân: Backend không chạy
→ Giải pháp:
   1. Check backend terminal
   2. Restart: node server.js
```

---

## 📊 CHECKLIST TEST

### Trước Khi Test:
- [ ] Backend đang chạy port 5000
- [ ] Frontend đang chạy port 3100
- [ ] DevTools đã mở (F12)
- [ ] Console tab đã chọn
- [ ] Network tab đã chọn

### Trong Quá Trình Test:
- [ ] Trang login hiển thị đúng
- [ ] Input mã NV tự động chữ hoa
- [ ] Input password ẩn ký tự
- [ ] Click login → Thấy loading
- [ ] Network tab có request /api/auth/login
- [ ] Request status = 200
- [ ] Response có token + user

### Sau Khi Login:
- [ ] Thấy success message
- [ ] URL = /home
- [ ] Navbar hiển thị
- [ ] Tên user hiển thị
- [ ] Menu hiển thị

---

## 🔍 DEBUG

### Nếu Không Login Được:

#### Check 1: Console Errors
```
F12 → Console tab
Có lỗi đỏ không?

Nếu có:
- Copy lỗi
- Gửi cho tôi
```

#### Check 2: Network Request
```
F12 → Network tab
Có request /api/auth/login không?

Nếu không:
- Form không submit
- Check Onboarding.js

Nếu có:
- Status code là gì?
- Response là gì?
```

#### Check 3: Backend Logs
```
Terminal backend có log gì?

Nếu thấy:
POST /api/auth/login 200
→ Backend OK

Nếu thấy:
POST /api/auth/login 401
→ Sai credentials

Nếu không thấy gì:
→ Request không đến backend
→ Check proxy
```

---

## 📸 SCREENSHOTS CẦN CHỤP

### Screenshot 1: Trang Login
```
- Toàn bộ trang login
- Có logo, form, nút
```

### Screenshot 2: Sau Khi Click Login
```
- Nút đang loading
- Hoặc error message
- Hoặc success message
```

### Screenshot 3: Console Tab
```
- Có lỗi gì không?
- Có log gì?
```

### Screenshot 4: Network Tab
```
- Request /api/auth/login
- Status code
- Response body
```

### Screenshot 5: Kết Quả
```
- Nếu thành công: Trang /home
- Nếu lỗi: Error message
```

---

## 🎯 KẾT QUẢ MONG ĐỢI

### Luồng Thành Công:
```
1. Vào http://localhost:3100/
2. Nhập TDV001 / 123456
3. Click "Đăng nhập"
4. Thấy "Đang đăng nhập..."
5. Network: POST /api/auth/login → 200 OK
6. Thấy "✅ Đăng nhập thành công!"
7. URL → http://localhost:3100/home
8. Navbar hiển thị
9. Tên user: "Nguyễn Văn An"
10. ✅ THÀNH CÔNG!
```

---

## 📝 BÁO CÁO KẾT QUẢ

### Sau khi test, hãy cho tôi biết:

1. **Trang login có hiển thị không?**
   - [ ] Có
   - [ ] Không

2. **Nhập TDV001 / 123456 được không?**
   - [ ] Có
   - [ ] Không

3. **Click "Đăng nhập" có phản hồi không?**
   - [ ] Có loading
   - [ ] Không phản hồi

4. **Network tab có request /api/auth/login không?**
   - [ ] Có - Status: ___
   - [ ] Không

5. **Sau khi login, URL là gì?**
   - [ ] /home
   - [ ] Vẫn /
   - [ ] Khác: ___

6. **Console có lỗi không?**
   - [ ] Không
   - [ ] Có: ___

7. **Screenshots:**
   - [ ] Đã chụp 5 screenshots
   - [ ] Gửi cho tôi xem

---

**Hãy test theo checklist và báo kết quả! 🚀**
