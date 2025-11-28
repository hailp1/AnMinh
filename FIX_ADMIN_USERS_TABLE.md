# 🐛 VẤN ĐỀ: CỘT SỐ ĐIỆN THOẠI HIỂN THỊ MÃ NV

## 📍 VỊ TRÍ LỖI

**File**: `client/src/pages/admin/AdminUsers.js`
**Vị trí**: Desktop Table View (dòng 660-750)

---

## 🔍 PHÂN TÍCH VẤN ĐỀ

### Vấn Đề 1: Grid Columns Không Khớp

**Header (dòng 663)**: 8 cột
```javascript
gridTemplateColumns: '60px 1fr 150px 180px 120px 120px 150px 120px'
```

**Data Rows (dòng 686)**: 9 cột
```javascript
gridTemplateColumns: '60px 1fr 120px 120px 150px 120px 120px 120px 120px'
```

### Vấn Đề 2: Thứ Tự Cột Sai

**Header hiện tại**:
1. STT
2. Tên
3. Số điện thoại ❌ (nhưng data là Mã NV)
4. Email
5. Vai trò
6. Trạng thái
7. Thao tác

**Data rows hiện tại**:
1. STT
2. Tên
3. `user.employeeCode` (Mã NV) ❌
4. `user.routeCode` (Mã LT) ❌
5. `user.phone` (SĐT) ❌
6. `user.email`
7. Vai trò
8. Trạng thái
9. Thao tác

---

## ✅ GIẢI PHÁP

### Cần Sửa Header Thành 9 Cột:

```javascript
// ✅ ĐÚNG
<div style={{
  display: 'grid',
  gridTemplateColumns: '60px 1fr 120px 120px 150px 180px 120px 120px 150px',
  gap: '16px',
  padding: '16px 20px',
  background: '#f9fafb',
  borderBottom: '2px solid #e5e7eb',
  fontWeight: '600',
  fontSize: '14px',
  color: '#1a1a2e'
}}>
  <div>STT</div>
  <div>Tên</div>
  <div>Mã NV</div>
  <div>Mã LT</div>
  <div>SĐT</div>
  <div>Email</div>
  <div>Vai trò</div>
  <div>Trạng thái</div>
  <div>Thao tác</div>
</div>
```

---

## 📝 HƯỚNG DẪN FIX THỦ CÔNG

### Bước 1: Mở File
```
File: client/src/pages/admin/AdminUsers.js
Dòng: 660-679
```

### Bước 2: Tìm Đoạn Code
Tìm đoạn:
```javascript
gridTemplateColumns: '60px 1fr 150px 180px 120px 120px 150px 120px',
```

### Bước 3: Thay Thế
```javascript
// ❌ CŨ (8 cột)
gridTemplateColumns: '60px 1fr 150px 180px 120px 120px 150px 120px',

// ✅ MỚI (9 cột)
gridTemplateColumns: '60px 1fr 120px 120px 150px 180px 120px 120px 150px',
```

### Bước 4: Sửa Header Labels
```javascript
// ❌ CŨ
<div>STT</div>
<div>Tên</div>
<div>Số điện thoại</div>
<div>Email</div>
<div>Vai trò</div>
<div>Trạng thái</div>
<div>Thao tác</div>

// ✅ MỚI
<div>STT</div>
<div>Tên</div>
<div>Mã NV</div>
<div>Mã LT</div>
<div>SĐT</div>
<div>Email</div>
<div>Vai trò</div>
<div>Trạng thái</div>
<div>Thao tác</div>
```

---

## 📊 MAPPING ĐÚNG

| Cột | Header | Data | Field |
|-----|--------|------|-------|
| 1 | STT | {index + 1} | - |
| 2 | Tên | {user.name} | name |
| 3 | Mã NV | {user.employeeCode} | employeeCode |
| 4 | Mã LT | {user.routeCode} | routeCode |
| 5 | SĐT | {user.phone} | phone |
| 6 | Email | {user.email} | email |
| 7 | Vai trò | {getRoleLabel(user.role)} | role |
| 8 | Trạng thái | Online/Offline | isOnline |
| 9 | Thao tác | Sửa/Xóa | - |

---

## ⚠️ LƯU Ý

File AdminUsers.js có thể đã bị corrupt do lỗi edit trước đó.

**Nếu file bị lỗi:**
1. Restore từ git: `git checkout client/src/pages/admin/AdminUsers.js`
2. Sau đó áp dụng fix ở trên

---

## 🎯 KẾT QUẢ SAU KHI FIX

**Trước**:
```
| STT | Tên | Số điện thoại | Email | Vai trò |
| 1   | An  | TDV001       | ...   | TDV     |
         ❌ Hiển thị Mã NV thay vì SĐT
```

**Sau**:
```
| STT | Tên | Mã NV  | Mã LT | SĐT        | Email | Vai trò |
| 1   | An  | TDV001 | LT01  | 0900000001 | ...   | TDV     |
                                ✅ Đúng SĐT
```

---

**Hãy sửa theo hướng dẫn trên!**
