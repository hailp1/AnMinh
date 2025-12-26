@echo off
chcp 65001 >nul
echo ========================================================
echo   🎁 SEED CHƯƠNG TRÌNH KHUYẾN MÃI & HỖ TRỢ THƯƠNG MẠI
echo ========================================================
echo.

echo 📋 Đang tạo các chương trình...
echo.

cd "%~dp0..\DMS\backend"

node prisma\seed-promotions.js

echo.
echo ========================================================
echo   ✅ HOÀN THÀNH!
echo ========================================================
echo.
echo 📊 Đã tạo các chương trình:
echo.
echo   === CHƯƠNG TRÌNH KHUYẾN MÃI (CTKM) ===
echo   ✅ CTKM_TET2025         - Khuyến Mãi Tết 2025
echo   ✅ CTKM_FLASH_Q1        - Flash Sale Q1
echo   ✅ CTKM_NEWCUST         - Ưu Đãi KH Mới
echo   ✅ CTKM_VIP_Q1          - Ưu Đãi VIP Q1
echo   ✅ CTKM_COMBO_VITAMIN   - Combo Vitamin
echo.
echo   === CHƯƠNG TRÌNH HỖ TRỢ THƯƠNG MẠI (CTHHTM) ===
echo   ✅ CTHHTM_LAUNCH_2025   - Hỗ Trợ Ra Mắt SP Mới
echo   ✅ CTHHTM_DISPLAY       - Hỗ Trợ Trưng Bày
echo   ✅ CTHHTM_TRAINING      - Hỗ Trợ Đào Tạo
echo   ✅ CTHHTM_LOYALTY       - Hỗ Trợ KH Trung Thành
echo   ✅ CTHHTM_VOLUME        - Hỗ Trợ Khối Lượng Lớn
echo   ✅ CTHHTM_REGION_HCM    - Hỗ Trợ Khu Vực HCM
echo   ✅ CTHHTM_PAYMENT       - Hỗ Trợ Thanh Toán Sớm
echo   ✅ CTHHTM_BUNDLE        - Hỗ Trợ Mua Combo
echo   ✅ CTHHTM_REFERRAL      - Hỗ Trợ Giới Thiệu KH
echo   ✅ CTHHTM_SEASONAL      - Hỗ Trợ Theo Mùa
echo.
echo 💡 Lưu ý:
echo   - Tất cả chương trình đã được kích hoạt
echo   - Có thể quản lý trong Admin Portal
echo   - Áp dụng tự động khi đặt hàng đủ điều kiện
echo.
pause
