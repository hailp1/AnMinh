# Danh sách Báo cáo DMS Tiêu chuẩn (Standard DMS Reports)

Dưới đây là danh sách các báo cáo cần thiết cho một hệ thống DMS hoàn chỉnh, được phân loại theo mục đích quản lý.

## 1. Báo cáo Doanh số (Sales Reports)
Dành cho: Giám đốc kinh doanh (CSO), Quản lý vùng (RSM), Giám sát (SS).

| Tên Báo cáo | Mô tả | Dữ liệu cần thiết | Khả thi (Hiện tại) |
| :--- | :--- | :--- | :--- |
| **Doanh số theo TDV** | Tổng doanh số, số đơn hàng của từng nhân viên trong kỳ. So sánh với cùng kỳ tháng trước. | Order, User | ✅ |
| **Doanh số theo Khách hàng** | Top khách hàng mua nhiều nhất. Phân loại khách hàng (Vàng, Bạc, Đồng) dựa trên doanh số. | Order, Pharmacy | ✅ |
| **Doanh số theo Sản phẩm (SKU)** | Sản phẩm bán chạy (Best Seller), sản phẩm bán chậm (Slow Moving). | OrderItem, Product | ✅ |
| **Doanh số theo Khu vực** | So sánh hiệu quả giữa các Vùng/Miền/Tỉnh. | Order, Region/Territory | ✅ |

## 2. Báo cáo Hiệu quả Viếng thăm (Visit Performance)
Dành cho: Giám sát (SS), Admin.

| Tên Báo cáo | Mô tả | Dữ liệu cần thiết | Khả thi (Hiện tại) |
| :--- | :--- | :--- | :--- |
| **Tuân thủ Tuyến (MCP Compliance)** | Tỷ lệ thực hiện đúng kế hoạch viếng thăm (Số KH đã viếng thăm / Số KH trong tuyến). | VisitPlan | ✅ |
| **Tần suất Viếng thăm (Visit Frequency)** | Trung bình số lần ghé thăm 1 khách hàng trong tháng. | VisitPlan | ✅ |
| **Năng suất Viếng thăm (Strike Rate)** | Tỷ lệ viếng thăm có đơn hàng (Số đơn hàng / Số lượt viếng thăm). | VisitPlan, Order | ✅ |
| **Thời gian Viếng thăm (Time in Call)** | Thời gian trung bình nhân viên ở tại điểm bán (Check-out - Check-in). | VisitPlan (Time logs) | ✅ |

## 3. Báo cáo Đơn hàng & Công nợ (Order & Debt)
Dành cho: Kế toán, Admin.

| Tên Báo cáo | Mô tả | Dữ liệu cần thiết | Khả thi (Hiện tại) |
| :--- | :--- | :--- | :--- |
| **Trạng thái Đơn hàng** | Theo dõi tiến độ xử lý đơn (Mới -> Duyệt -> Giao -> Hoàn tất). | Order | ✅ |
| **Lý do Từ chối/Hủy** | Phân tích nguyên nhân đơn hàng bị hủy (Hết hàng, Khách đổi ý, Nợ quá hạn...). | Order (Notes/Reason) | 🟡 (Cần chuẩn hóa lý do) |
| **Công nợ Khách hàng** | Tổng nợ hiện tại, nợ quá hạn của từng khách hàng. | Debt/Invoice Table | 🔴 (Chưa có bảng Công nợ) |

## 4. Báo cáo KPI & Lương thưởng (Performance & Incentive)
Dành cho: HR, Quản lý.

| Tên Báo cáo | Mô tả | Dữ liệu cần thiết | Khả thi (Hiện tại) |
| :--- | :--- | :--- | :--- |
| **KPI Scorecard** | Bảng điểm tổng hợp: % Đạt doanh số, % Bao phủ, % Mở mới. | KpiTarget, KpiResult | ✅ |
| **Ước tính Thưởng (Incentive)** | Tính toán sơ bộ tiền thưởng dựa trên KPI đạt được. | Incentive Rules | 🟡 (Cần cấu hình luật thưởng) |

## 5. Báo cáo Độ phủ & Thị phần (Coverage & Market Share)
Dành cho: Marketing, Quản lý chiến lược.

| Tên Báo cáo | Mô tả | Dữ liệu cần thiết | Khả thi (Hiện tại) |
| :--- | :--- | :--- | :--- |
| **Độ phủ Sản phẩm (Distribution)** | Bao nhiêu % nhà thuốc có bán sản phẩm X (Numeric Distribution). | OrderItem, Pharmacy | ✅ |
| **Hình ảnh Trưng bày** | Tổng hợp hình ảnh chụp trưng bày từ thị trường. | VisitPlan (Images) | ✅ |

---

## Đề xuất triển khai ngay (Phase 1)
Để hệ thống Admin hoàn thiện, tôi đề xuất xây dựng trang **"Báo cáo Tổng hợp"** bao gồm 3 tab chính:
1.  **Doanh số**: Biểu đồ cột (Theo ngày), Biểu đồ tròn (Theo danh mục), Bảng chi tiết theo TDV.
2.  **Viếng thăm**: Biểu đồ đường (Tuân thủ tuyến theo ngày), Bảng chi tiết năng suất (Strike Rate).
3.  **Sản phẩm**: Top 10 sản phẩm bán chạy nhất.
