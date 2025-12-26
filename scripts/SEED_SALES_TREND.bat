@echo off
chcp 65001 >nul
echo ========================================================
echo   📊 TẠO DATA DOANH SỐ THEO THÁNG CHO BIZ REVIEW
echo ========================================================
echo.

echo 📋 Tạo dữ liệu doanh số 12 tháng với xu hướng tăng trưởng...
echo.

cd "%~dp0..\DMS\backend"

node prisma\seed-sales-trend.js

echo.
echo ========================================================
echo   ✅ HOÀN THÀNH!
echo ========================================================
echo.
echo 📊 Đã tạo dữ liệu doanh số:
echo.
echo   📅 Thời gian: 12 tháng (Jan - Dec 2024)
echo   📈 Xu hướng: Tăng trưởng đều đặn
echo   💰 Tổng đơn hàng: ~1,300 đơn
echo   📦 Sản phẩm: Đa dạng
echo.
echo 📈 Xu hướng tăng trưởng theo tháng:
echo   ├─ Jan 2024: Baseline (100%%)
echo   ├─ Feb 2024: +5%%
echo   ├─ Mar 2024: +12%%
echo   ├─ Apr 2024: +8%%
echo   ├─ May 2024: +15%%
echo   ├─ Jun 2024: +20%%
echo   ├─ Jul 2024: +18%%
echo   ├─ Aug 2024: +25%%
echo   ├─ Sep 2024: +30%%
echo   ├─ Oct 2024: +35%%
echo   ├─ Nov 2024: +42%%
echo   └─ Dec 2024: +50%%
echo.
echo 🎯 Kết quả:
echo   - Biểu đồ trend sẽ hiển thị xu hướng tăng rõ ràng
echo   - Dữ liệu thực tế, có biến động tự nhiên
echo   - Phù hợp cho demo và presentation
echo.
echo 💡 Xem kết quả tại:
echo   Admin Portal ^> Biz Review Center 360°
echo.
pause
