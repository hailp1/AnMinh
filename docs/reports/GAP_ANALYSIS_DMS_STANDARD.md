# Phân Tích & Rà Soát Dự Án DMS (Gap Analysis)
*So sánh với tiêu chuẩn DMS Quốc tế (Salesforce, SAP, Veeva)*

## 1. Tổng quan
Hệ thống hiện tại (An Minh DMS) đã đáp ứng được các nhu cầu cơ bản của một hệ thống DMS: Quản lý khách hàng, Tuyến bán hàng, Viếng thăm, Đơn hàng, Tồn kho.
Tuy nhiên, so với các giải pháp DMS hàng đầu thế giới (World-Class), hệ thống còn thiếu một số tính năng nâng cao và tối ưu hóa trải nghiệm người dùng (UX) cũng như khả năng vận hành Offline thực thụ.

## 2. Các điểm thiếu sót (Gaps) & Đề xuất cải tiến

### A. Phân hệ TDV (Mobile App)

| Tính năng | Hiện tại | Tiêu chuẩn Quốc tế (World-Class) | Đánh giá |
| :--- | :--- | :--- | :--- |
| **Offline Mode** | Giả lập (Simulated). Phụ thuộc vào mạng 4G. | **Offline-First**. Dữ liệu lưu local (SQLite/Realm). Đồng bộ khi có mạng. | 🔴 **Critical** |
| **Gợi ý đơn hàng** | Không có. Nhập tay hoàn toàn. | **AI Suggested Order**. Dựa trên lịch sử mua, tồn kho, và chương trình KM. | 🟡 Advanced |
| **Check-in/GPS** | Lưu tọa độ điểm check-in. | **Real-time Tracking**. Vẽ lộ trình di chuyển (Breadcrumbs), cảnh báo sai tuyến. | 🟡 Medium |
| **Trưng bày (Visual)** | Chụp ảnh & Upload. | **AI Image Recognition**. Tự động chấm điểm trưng bày, đếm sản phẩm (Planogram). | 🟡 Advanced |
| **Công nợ** | Không hiển thị hạn mức/nợ quá hạn. | **Credit Check**. Cảnh báo/Chặn đơn hàng nếu vượt hạn mức tín dụng. | 🔴 **Critical** |
| **Khảo sát (Survey)** | Ghi chú text đơn giản. | **Dynamic Forms**. Biểu mẫu khảo sát động (giá đối thủ, thị phần). | 🟡 Medium |

### B. Phân hệ Admin (Web Portal)

| Tính năng | Hiện tại | Tiêu chuẩn Quốc tế (World-Class) | Đánh giá |
| :--- | :--- | :--- | :--- |
| **Phân tuyến (Route)** | Gán thủ công từng khách vào tuyến. | **Route Optimization**. Tự động tối ưu tuyến đường di chuyển (MCP) để tiết kiệm xăng/thời gian. | 🟡 Advanced |
| **Khuyến mãi (Promo)** | Cấu trúc dữ liệu có, chưa có Engine tự động tính. | **Promotion Engine**. Tự động tính KM phức tạp (Mua X tặng Y, Chiết khấu bậc thang). | 🔴 **Critical** |
| **Báo cáo (BI)** | Báo cáo bảng biểu cơ bản. | **Dashboard BI**. Tích hợp PowerBI/Tableau, biểu đồ tương tác, dự báo doanh số. | 🟡 Medium |
| **Gamification** | Chưa có. | **Leaderboard**. Bảng xếp hạng thi đua, huy hiệu, điểm thưởng cho TDV. | ⚪ Nice to have |

## 3. Lộ trình nâng cấp đề xuất (Roadmap)

### Giai đoạn 1: Củng cố nền tảng (Immediate)
1.  **Quản lý Công nợ**:
    *   Thêm trường `creditLimit`, `currentDebt` vào Database.
    *   Hiển thị cảnh báo nợ trên App TDV khi lên đơn.
2.  **Promotion Engine**:
    *   Xây dựng logic tính khuyến mãi tự động khi lên đơn hàng (Backend & Frontend).
3.  **Offline Capability (Phase 1)**:
    *   Cache dữ liệu Master (Sản phẩm, Khách hàng) vào IndexedDB để giảm tải Server và tăng tốc độ App.

### Giai đoạn 2: Nâng cao trải nghiệm (Next 3 Months)
1.  **Gợi ý đơn hàng (Suggested Order)**:
    *   Thuật toán đơn giản: `(Trung bình 3 tháng - Tồn kho hiện tại)`.
2.  **Tối ưu tuyến (Route Optimization)**:
    *   Tích hợp Google Maps API để sắp xếp thứ tự viếng thăm tối ưu.
3.  **Báo cáo động**:
    *   Cải thiện Dashboard Admin với nhiều biểu đồ trực quan hơn.

### Giai đoạn 3: Công nghệ tiên tiến (Future)
1.  **AI Image Recognition**: Tích hợp AI để chấm điểm trưng bày.
2.  **Real-time GPS Tracking**: Theo dõi vị trí nhân viên theo thời gian thực.

## 4. Kết luận
Dự án đang ở mức độ **"Functional DMS"** (DMS chức năng). Để đạt chuẩn **"Smart DMS"** hoặc **"World-Class"**, cần tập trung mạnh vào **Offline-First**, **Automation** (Gợi ý đơn, Tính KM), và **Data Intelligence** (Báo cáo, Dự báo).
