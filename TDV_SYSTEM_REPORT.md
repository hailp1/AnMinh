# 📱 BÁO CÁO PHÂN HỆ TDV (TRÌNH DƯỢC VIÊN)

## ⚠️ TRẠNG THÁI: CHƯA TEST - CẦN CẬP NHẬT

**Ngày kiểm tra**: 28/11/2025 - 09:20
**Kết quả**: ❌ **CHƯA SẴN SÀNG - Đang dùng Mock Data**

---

## 🔍 PHÁT HIỆN VẤN ĐỀ

### ❌ Các trang TDV đang dùng Mock Data:

1. **CreateOrder.js** ❌ (QUAN TRỌNG NHẤT)
   - Đang import: `customersData from '../data/customers.json'`
   - Đang import: `productsData from '../data/products.json'`
   - **Cần**: Fetch từ `/api/pharmacies` và `/api/products`

2. **OrderSummary.js** ❓ (Cần kiểm tra)
   - Có thể đang dùng data từ CreateOrder
   - **Cần**: Submit order qua `/api/orders`

3. **Map.js** ❌
   - Đang import: `customersData from '../data/customers.json'`
   - **Cần**: Fetch từ `/api/pharmacies`

4. **CreatePharmacy.js** ❌
   - Đang import: `customersData from '../data/customers.json'`
   - **Cần**: Submit qua `/api/pharmacies`

---

## 📋 LUỒNG TDV CẦN KIỂM TRA

### 1. 🔐 Login TDV
**URL**: http://localhost:3100/
**Credentials**: TDV001 / 123456

**Kiểm tra**:
- [ ] Login thành công
- [ ] Redirect đến /home
- [ ] Hiển thị tên TDV
- [ ] Hiển thị Hub của TDV

---

### 2. 🏠 Home/Dashboard TDV
**URL**: http://localhost:3100/home

**Kiểm tra**:
- [ ] Hiển thị thống kê cá nhân
- [ ] Danh sách khách hàng được phân công
- [ ] Lộ trình hôm nay
- [ ] Đơn hàng gần đây

---

### 3. 📦 Tạo Đơn Hàng (QUAN TRỌNG NHẤT)
**URL**: http://localhost:3100/create-order

#### Bước 1: Chọn Nhà Thuốc
- [ ] Danh sách nhà thuốc hiển thị
- [ ] Chỉ hiển thị nhà thuốc trong Hub của TDV
- [ ] Search hoạt động
- [ ] Hiển thị khoảng cách (nếu có GPS)
- [ ] Click chọn nhà thuốc

#### Bước 2: Chọn Sản Phẩm
- [ ] Danh sách nhóm sản phẩm hiển thị
- [ ] Chọn nhóm → hiển thị sản phẩm
- [ ] Hiển thị giá, đơn vị
- [ ] Nhập số lượng (+ / -)
- [ ] Thêm vào đơn hàng

#### Bước 3: Xem Lại Đơn Hàng
- [ ] Danh sách sản phẩm đã chọn
- [ ] Tổng tiền tính đúng
- [ ] Có thể sửa số lượng
- [ ] Có thể xóa sản phẩm
- [ ] Click "Hoàn tất đơn hàng"

---

### 4. 📄 Tổng Kết Đơn Hàng
**URL**: http://localhost:3100/order-summary

**Kiểm tra**:
- [ ] Hiển thị thông tin đơn hàng
- [ ] Thông tin khách hàng
- [ ] Danh sách sản phẩm
- [ ] Tổng tiền
- [ ] Nút "Xác nhận đơn hàng"
- [ ] **Submit đơn hàng qua API** ❌ (Chưa có)

---

### 5. 🗺️ Bản Đồ Khách Hàng
**URL**: http://localhost:3100/map

**Kiểm tra**:
- [ ] Hiển thị bản đồ
- [ ] Markers của khách hàng
- [ ] Vị trí hiện tại của TDV
- [ ] Click marker → thông tin khách hàng

---

### 6. 👤 Profile TDV
**URL**: http://localhost:3100/profile

**Kiểm tra**:
- [ ] Thông tin cá nhân
- [ ] Thống kê đơn hàng
- [ ] Lịch sử hoạt động

---

## 🔧 CẦN CẬP NHẬT

### 1. CreateOrder.js - PRIORITY CAO ⚠️

**Thay đổi cần thiết**:

```javascript
// ❌ HIỆN TẠI (Mock Data)
import customersData from '../data/customers.json';
import productsData from '../data/products.json';

const customers = useMemo(() => customersData?.customers || [], []);
const productGroups = useMemo(() => productsData?.productGroups || [], []);

// ✅ CẦN ĐỔI THÀNH (API)
const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

useEffect(() => {
  // Fetch customers (pharmacies)
  fetch(`${API_BASE}/pharmacies`, {
    headers: { 'x-auth-token': token }
  })
  .then(res => res.json())
  .then(data => setCustomers(data));

  // Fetch products
  fetch(`${API_BASE}/products`, {
    headers: { 'x-auth-token': token }
  })
  .then(res => res.json())
  .then(data => setProducts(data));
}, []);
```

---

### 2. OrderSummary.js - PRIORITY CAO ⚠️

**Thêm chức năng submit order**:

```javascript
const handleSubmitOrder = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-auth-token': token
      },
      body: JSON.stringify({
        pharmacyId: selectedCustomer.id,
        items: orderItems.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.price
        })),
        totalAmount: totalAmount,
        status: 'PENDING'
      })
    });

    if (response.ok) {
      const order = await response.json();
      alert(`Đơn hàng ${order.orderNumber} đã được tạo thành công!`);
      navigate('/home');
    } else {
      alert('Lỗi khi tạo đơn hàng');
    }
  } catch (error) {
    console.error('Error:', error);
    alert('Lỗi kết nối');
  }
};
```

---

### 3. Map.js - PRIORITY TRUNG BÌNH

**Cập nhật để dùng API**:
- Fetch pharmacies từ `/api/pharmacies`
- Filter theo Hub của TDV

---

### 4. CreatePharmacy.js - PRIORITY THẤP

**Cập nhật để submit qua API**:
- POST `/api/pharmacies` để tạo nhà thuốc mới

---

## 📊 TỔNG KẾT

### ❌ Chưa Sẵn Sàng:
- CreateOrder (trang quan trọng nhất)
- OrderSummary (submit order)
- Map
- CreatePharmacy

### ✅ Đã Sẵn Sàng:
- Backend API có đầy đủ endpoints
- Database có data (pharmacies, products)
- Authentication hoạt động

---

## 🎯 KẾ HOẠCH HÀNH ĐỘNG

### Bước 1: Cập nhật CreateOrder.js (1-2 giờ)
1. Thay mock data bằng API calls
2. Fetch pharmacies từ `/api/pharmacies`
3. Fetch products từ `/api/products`
4. Filter pharmacies theo Hub của TDV
5. Test trên mobile/tablet

### Bước 2: Cập nhật OrderSummary.js (30 phút)
1. Thêm function submit order
2. POST `/api/orders`
3. Handle success/error
4. Redirect sau khi tạo thành công

### Bước 3: Cập nhật Map.js (30 phút)
1. Fetch pharmacies từ API
2. Filter theo Hub
3. Test hiển thị markers

### Bước 4: Test toàn bộ luồng TDV (1 giờ)
1. Login TDV
2. Tạo đơn hàng hoàn chỉnh
3. Submit đơn hàng
4. Kiểm tra đơn hàng trong admin panel

---

## 🚨 QUAN TRỌNG

**Phân hệ TDV chưa thể sử dụng được vì:**
- ❌ Trang tạo đơn hàng đang dùng mock data
- ❌ Không thể submit đơn hàng vào database
- ❌ TDV không thể làm việc thực tế

**Cần ưu tiên cập nhật ngay:**
1. CreateOrder.js (quan trọng nhất)
2. OrderSummary.js (để submit order)

**Thời gian ước tính**: 2-3 giờ để hoàn thiện

---

**Trạng thái**: ⚠️ **ĐANG ĐÁNH GIÁ - CHƯA SẴN SÀNG CHO PRODUCTION**
