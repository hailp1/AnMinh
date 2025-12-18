# 🔧 HƯỚNG DẪN FIX - Dropdown TDV trống

## ❌ Vấn đề

Dropdown "-- Chọn Trình dược viên --" trống, không có dữ liệu.

## 🔍 Nguyên nhân

Frontend chưa có token hoặc token không hợp lệ → API từ chối request.

## ✅ Giải pháp (Làm theo thứ tự)

### **Bước 1: Đăng xuất và đăng nhập lại**

1. Mở Console (F12)
2. Gõ lệnh:
```javascript
localStorage.clear()
```
3. Nhấn Enter
4. Tải lại trang (Ctrl + R)
5. Đăng nhập lại:
   - Username: `admin`
   - Password: `123456`

### **Bước 2: Kiểm tra token**

Sau khi đăng nhập, mở Console (F12) và gõ:
```javascript
localStorage.getItem('token')
```

**Kết quả mong đợi**: Một chuỗi dài bắt đầu bằng `eyJ...`

**Nếu null**: Đăng nhập không thành công → Quay lại Bước 1

### **Bước 3: Kiểm tra API**

Trong Console (F12), gõ:
```javascript
fetch('/api/users?role=TDV', {
  headers: {
    'Authorization': 'Bearer ' + localStorage.getItem('token')
  }
})
.then(r => r.json())
.then(d => console.log(d))
```

**Kết quả mong đợi**: Array có 2 users (TDV001, TDV002)

**Nếu lỗi**: Backend không chạy hoặc dữ liệu chưa có

### **Bước 4: Kiểm tra dữ liệu**

Chạy script:
```cmd
cd d:\AM_DMS
.\CHECK_DATA_DETAIL.bat
```

**Kết quả mong đợi**: Thấy TDV001 và TDV002

**Nếu không có**: Chạy lại `SETUP_ROUTE_DATA.bat`

### **Bước 5: Rebuild Frontend (nếu cần)**

Nếu vẫn không được:
```cmd
cd d:\AM_DMS
docker-compose -f docker-compose.preprod.yml restart frontend
```

Chờ 30 giây, sau đó tải lại trang.

---

## 🎯 Quy trình đầy đủ

```cmd
# 1. Đảm bảo có dữ liệu
cd d:\AM_DMS
.\SETUP_ROUTE_DATA.bat
.\FIX_ADMIN_FINAL.bat

# 2. Restart services
docker-compose -f docker-compose.preprod.yml restart backend frontend

# 3. Đợi 30 giây

# 4. Mở trình duyệt
http://localhost:3599/Anminh/admin

# 5. Clear cache
Ctrl + Shift + R

# 6. Đăng nhập
admin / 123456

# 7. Vào Quản lý Lộ trình
```

---

## 🐛 Debug nâng cao

### Kiểm tra Network (F12 → Network)

1. Tải lại trang Quản lý Lộ trình
2. Filter: `users`
3. Click vào request `/api/users`
4. Xem tab "Headers":
   - **Request Headers** → Có `Authorization: Bearer ...` không?
   - **Response** → Status code là gì?

**Nếu 401 Unauthorized**: Token không hợp lệ → Đăng nhập lại

**Nếu 200 OK nhưng response = []**: Database không có TDV → Chạy `SETUP_ROUTE_DATA.bat`

### Kiểm tra Backend Log

```cmd
docker logs preprod_backend --tail 50
```

Tìm dòng có `LOGIN` hoặc `ERROR`.

---

## ✅ Checklist

- [ ] Đã chạy `SETUP_ROUTE_DATA.bat`
- [ ] Đã chạy `FIX_ADMIN_FINAL.bat`
- [ ] Đã clear localStorage
- [ ] Đã đăng nhập thành công
- [ ] Token tồn tại trong localStorage
- [ ] Backend đang chạy
- [ ] Frontend đang chạy
- [ ] Đã clear cache (Ctrl + Shift + R)

---

## 📞 Nếu vẫn không được

Cung cấp:
1. Screenshot Console (F12 → Console)
2. Screenshot Network (F12 → Network → Filter: users)
3. Kết quả của: `.\CHECK_DATA_DETAIL.bat`

---

**Cập nhật**: 04/12/2024 23:32
**Trạng thái**: 🔧 TROUBLESHOOTING
