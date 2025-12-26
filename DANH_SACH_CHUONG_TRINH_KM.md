# 🎁 Danh Sách Chương Trình Khuyến Mãi & Hỗ Trợ Thương Mại

## 📋 Tổng Quan

Hệ thống đã chuẩn bị sẵn **15 chương trình** bao gồm:
- **5 Chương Trình Khuyến Mãi (CTKM)**
- **10 Chương Trình Hỗ Trợ Thương Mại (CTHHTM)**

---

## 🚀 Cách Tạo Chương Trình

### Cách 1: Chạy Script (Khuyến Nghị)
```bash
cd d:\AM_DMS
scripts\SEED_PROMOTIONS.bat
```

### Cách 2: Chạy Trực Tiếp
```bash
cd d:\AM_DMS\DMS\backend
node prisma\seed-promotions.js
```

### Cách 3: Qua Docker
```bash
docker exec dms_backend node prisma/seed-promotions.js
```

---

## 🎉 CHƯƠNG TRÌNH KHUYẾN MÃI (CTKM)

### 1. CTKM_TET2025 - Khuyến Mãi Tết Nguyên Đán 2025
- **Loại:** Giảm giá theo %
- **Giảm:** 10%
- **Điều kiện:** Đơn hàng từ 5.000.000đ
- **Giảm tối đa:** 1.000.000đ
- **Thời gian:** 15/01/2025 - 15/02/2025
- **Áp dụng:** Tất cả khách hàng

### 2. CTKM_FLASH_Q1 - Flash Sale Quý 1/2025
- **Loại:** Giảm giá cố định
- **Giảm:** 500.000đ
- **Điều kiện:** Đơn hàng từ 10.000.000đ
- **Thời gian:** 01/01/2025 - 31/03/2025
- **Áp dụng:** Tất cả khách hàng
- **Đặc biệt:** Số lượng có hạn!

### 3. CTKM_NEWCUST - Ưu Đãi Khách Hàng Mới
- **Loại:** Giảm giá theo %
- **Giảm:** 15%
- **Điều kiện:** Đơn hàng đầu tiên từ 2.000.000đ
- **Giảm tối đa:** 500.000đ
- **Thời gian:** 01/01/2025 - 31/12/2025
- **Áp dụng:** Khách hàng mới

### 4. CTKM_VIP_Q1 - Ưu Đãi Khách Hàng VIP Q1
- **Loại:** Giảm giá theo %
- **Giảm:** 20%
- **Điều kiện:** Đơn hàng từ 3.000.000đ
- **Giảm tối đa:** 2.000.000đ
- **Thời gian:** 01/01/2025 - 31/03/2025
- **Áp dụng:** Chỉ khách hàng VIP

### 5. CTKM_COMBO_VITAMIN - Combo Vitamin Giá Sốc
- **Loại:** Mua X Tặng Y
- **Ưu đãi:** Mua 3 tặng 1
- **Điều kiện:** Đơn hàng từ 1.000.000đ
- **Thời gian:** 10/01/2025 - 28/02/2025
- **Áp dụng:** Sản phẩm Vitamin

---

## 🤝 CHƯƠNG TRÌNH HỖ TRỢ THƯƠNG MẠI (CTHHTM)

### 1. CTHHTM_LAUNCH_2025 - Hỗ Trợ Ra Mắt Sản Phẩm Mới
- **Loại:** Giảm giá theo %
- **Hỗ trợ:** 25%
- **Điều kiện:** Đơn hàng từ 5.000.000đ
- **Hỗ trợ tối đa:** 3.000.000đ
- **Thời gian:** 01/01/2025 - 30/06/2025
- **Áp dụng:** Khách hàng phân khúc A, B
- **Mục đích:** Hỗ trợ giới thiệu sản phẩm mới

### 2. CTHHTM_DISPLAY - Hỗ Trợ Trưng Bày Sản Phẩm
- **Loại:** Hỗ trợ cố định
- **Hỗ trợ:** 500.000đ
- **Điều kiện:** 
  - Đơn hàng từ 3.000.000đ
  - Cam kết trưng bày sản phẩm tại vị trí đẹp
- **Thời gian:** 01/01/2025 - 31/12/2025
- **Áp dụng:** Tất cả nhà thuốc

### 3. CTHHTM_TRAINING - Hỗ Trợ Đào Tạo Dược Sĩ
- **Loại:** Giảm giá theo %
- **Hỗ trợ:** 15%
- **Điều kiện:**
  - Đơn hàng từ 2.000.000đ
  - Tham gia chương trình đào tạo sản phẩm
- **Hỗ trợ tối đa:** 1.000.000đ
- **Thời gian:** 15/01/2025 - 31/12/2025
- **Áp dụng:** Tất cả nhà thuốc

### 4. CTHHTM_LOYALTY - Hỗ Trợ Khách Hàng Trung Thành
- **Loại:** Giảm giá theo %
- **Hỗ trợ:** 18%
- **Điều kiện:**
  - Đơn hàng từ 4.000.000đ
  - Mua hàng đều đặn 6 tháng liên tục
- **Hỗ trợ tối đa:** 2.000.000đ
- **Thời gian:** 01/01/2025 - 31/12/2025
- **Áp dụng:** Khách hàng phân khúc A, B

### 5. CTHHTM_VOLUME - Hỗ Trợ Khối Lượng Lớn
- **Loại:** Hỗ trợ cố định
- **Hỗ trợ:** 1.000.000đ
- **Điều kiện:** Đơn hàng từ 20.000.000đ
- **Thời gian:** 01/01/2025 - 31/12/2025
- **Áp dụng:** Tất cả khách hàng

### 6. CTHHTM_REGION_HCM - Hỗ Trợ Khu Vực TP.HCM
- **Loại:** Giảm giá theo %
- **Hỗ trợ:** 12%
- **Điều kiện:** Đơn hàng từ 3.000.000đ
- **Hỗ trợ tối đa:** 1.500.000đ
- **Thời gian:** 01/01/2025 - 30/06/2025
- **Áp dụng:** Chỉ nhà thuốc tại TP.HCM

### 7. CTHHTM_PAYMENT - Hỗ Trợ Thanh Toán Sớm
- **Loại:** Giảm giá theo %
- **Hỗ trợ:** 3%
- **Điều kiện:**
  - Đơn hàng từ 5.000.000đ
  - Thanh toán trong vòng 7 ngày
- **Hỗ trợ tối đa:** 500.000đ
- **Thời gian:** 01/01/2025 - 31/12/2025
- **Áp dụng:** Tất cả khách hàng

### 8. CTHHTM_BUNDLE - Hỗ Trợ Mua Combo Sản Phẩm
- **Loại:** Hỗ trợ cố định
- **Hỗ trợ:** 800.000đ
- **Điều kiện:**
  - Đơn hàng từ 8.000.000đ
  - Mua combo 5 sản phẩm trở lên
- **Thời gian:** 01/01/2025 - 31/12/2025
- **Áp dụng:** Tất cả khách hàng

### 9. CTHHTM_REFERRAL - Hỗ Trợ Giới Thiệu Khách Hàng
- **Loại:** Hỗ trợ cố định
- **Hỗ trợ:** 300.000đ
- **Điều kiện:**
  - Đơn hàng từ 2.000.000đ
  - Giới thiệu khách hàng mới thành công
- **Thời gian:** 01/01/2025 - 31/12/2025
- **Áp dụng:** Tất cả khách hàng

### 10. CTHHTM_SEASONAL - Hỗ Trợ Theo Mùa - Mùa Cảm Cúm
- **Loại:** Giảm giá theo %
- **Hỗ trợ:** 20%
- **Điều kiện:** Đơn hàng từ 3.000.000đ
- **Hỗ trợ tối đa:** 1.500.000đ
- **Thời gian:** 01/01/2025 - 31/03/2025
- **Áp dụng:** Sản phẩm điều trị cảm cúm

---

## 📊 Thống Kê Chương Trình

| Loại | Số lượng | Tổng hỗ trợ tối đa |
|------|----------|-------------------|
| CTKM | 5 | ~4.000.000đ |
| CTHHTM | 10 | ~12.300.000đ |
| **Tổng** | **15** | **~16.300.000đ** |

---

## 🔧 Quản Lý Chương Trình

### Xem Danh Sách
- Truy cập Admin Portal
- Menu: **Marketing > Promotions**
- Xem tất cả chương trình đang hoạt động

### Chỉnh Sửa
- Click vào chương trình cần sửa
- Cập nhật thông tin
- Lưu thay đổi

### Tạm Dừng/Kích Hoạt
- Toggle switch **isActive**
- Chương trình sẽ ngừng/tiếp tục áp dụng ngay lập tức

### Xóa
- Click nút **Delete**
- Xác nhận xóa

---

## 💡 Cách Áp Dụng Tự Động

Khi khách hàng đặt hàng, hệ thống sẽ:

1. **Kiểm tra điều kiện:**
   - Giá trị đơn hàng
   - Phân khúc khách hàng
   - Khu vực
   - Sản phẩm trong đơn

2. **Tìm chương trình phù hợp:**
   - Đang trong thời gian hiệu lực
   - Đáp ứng điều kiện tối thiểu
   - Áp dụng cho khách hàng này

3. **Tính toán giảm giá:**
   - Áp dụng % hoặc số tiền cố định
   - Giới hạn theo giảm tối đa
   - Cộng dồn nếu có nhiều chương trình

4. **Hiển thị kết quả:**
   - Tổng giảm giá
   - Số tiền phải thanh toán
   - Danh sách chương trình đã áp dụng

---

## 🎯 Best Practices

### Cho CTKM (Khuyến Mãi)
- ✅ Thời gian ngắn (1-3 tháng)
- ✅ Giảm giá hấp dẫn (10-20%)
- ✅ Điều kiện đơn giản
- ✅ Áp dụng rộng rãi

### Cho CTHHTM (Hỗ Trợ Thương Mại)
- ✅ Thời gian dài (6-12 tháng)
- ✅ Hỗ trợ có điều kiện cụ thể
- ✅ Yêu cầu cam kết từ nhà thuốc
- ✅ Theo dõi hiệu quả

---

## 📞 Hỗ Trợ

Nếu cần thêm chương trình hoặc chỉnh sửa:
1. Liên hệ Marketing Team
2. Hoặc tự tạo trong Admin Portal
3. Hoặc chỉnh sửa file `seed-promotions.js`

---

**Cập nhật:** 23/12/2025  
**Phiên bản:** 1.0
