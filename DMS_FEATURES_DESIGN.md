# Thiết kế Hệ thống DMS Chuyên nghiệp - An Minh Business System

## Tổng quan

Hệ thống DMS (Distribution Management System) đã được thiết kế và mở rộng với các phân hệ chuyên nghiệp để quản lý toàn diện hoạt động phân phối dược phẩm.

## Các phân hệ đã thiết kế

### 1. PROMOTIONS (Khuyến mãi)
**Mục đích**: Quản lý các chương trình khuyến mãi, giảm giá, combo sản phẩm

**Models**:
- `Promotion`: Chương trình khuyến mãi
- `PromotionItem`: Sản phẩm trong khuyến mãi
- `PromotionApplication`: Áp dụng khuyến mãi cho đơn hàng

**Tính năng**:
- Tạo chương trình khuyến mãi (giảm giá %, cố định, mua X tặng Y, combo)
- Áp dụng theo phân nhóm khách hàng, địa bàn, hoặc tất cả
- Tự động tính toán giảm giá khi tạo đơn hàng
- Theo dõi hiệu quả khuyến mãi

### 2. LOYALTY/POINTS (Tích lũy)
**Mục đích**: Hệ thống tích điểm và đổi thưởng cho khách hàng

**Models**:
- `LoyaltyPoint`: Điểm tích lũy của khách hàng
- `LoyaltyTransaction`: Giao dịch tích/trừ điểm
- `LoyaltyReward`: Phần thưởng đổi điểm
- `LoyaltyRedemption`: Đổi điểm lấy thưởng

**Tính năng**:
- Tích điểm tự động từ đơn hàng
- Quản lý điểm tích lũy, sử dụng, hết hạn
- Tạo phần thưởng đổi điểm (giảm giá, sản phẩm, voucher)
- Đổi điểm lấy thưởng với quy trình phê duyệt

### 3. CUSTOMER SEGMENTATION (Phân nhóm khách hàng)
**Mục đích**: Phân loại khách hàng theo tiêu chí để áp dụng chính sách phù hợp

**Models**:
- `CustomerSegment`: Phân nhóm khách hàng (VIP, A, B, C)

**Tính năng**:
- Phân nhóm theo doanh số, số đơn hàng, khu vực
- Gán quyền lợi riêng cho từng nhóm
- Tự động phân nhóm dựa trên tiêu chí
- Áp dụng giá, khuyến mãi theo nhóm

### 4. TRADE ACTIVITIES (Hoạt động thương mại)
**Mục đích**: Quản lý các hoạt động thương mại như triển lãm, hội thảo, sự kiện

**Models**:
- `TradeActivity`: Hoạt động thương mại

**Tính năng**:
- Lên kế hoạch hoạt động (triển lãm, hội thảo, đào tạo)
- Quản lý ngân sách và chi phí thực tế
- Theo dõi người tham gia
- Đánh giá kết quả hoạt động

### 5. KPI & INCENTIVE (KPI và Thưởng)
**Mục đích**: Đặt mục tiêu KPI và tính toán thưởng cho Trình dược viên

**Models**:
- `KPITarget`: Mục tiêu KPI (doanh số, đơn hàng, viếng thăm, khách hàng mới)
- `KPIResult`: Kết quả KPI thực tế
- `Incentive`: Thưởng/Incentive

**Tính năng**:
- Đặt mục tiêu KPI theo tháng/quý/năm
- Tự động tính toán kết quả KPI
- Tính toán thưởng dựa trên KPI
- Theo dõi tỷ lệ đạt mục tiêu

### 6. APPROVAL WORKFLOW (Quy trình phê duyệt)
**Mục đích**: Quy trình phê duyệt đơn hàng, chi phí, nghỉ phép

**Models**:
- `ApprovalRequest`: Yêu cầu phê duyệt
- `ApprovalAction`: Hành động phê duyệt

**Tính năng**:
- Tạo yêu cầu phê duyệt (đơn hàng, chi phí, nghỉ phép, giảm giá)
- Quy trình phê duyệt nhiều bước
- Theo dõi trạng thái phê duyệt
- Lịch sử phê duyệt

### 7. PRICE MANAGEMENT (Quản lý giá)
**Mục đích**: Quản lý giá sản phẩm theo thời gian và theo khách hàng

**Models**:
- `ProductPrice`: Giá sản phẩm theo thời gian
- `PharmacyPrice`: Giá theo khách hàng

**Tính năng**:
- Quản lý giá sản phẩm theo thời gian
- Đặt giá riêng cho từng khách hàng
- Lịch sử thay đổi giá
- Áp dụng giá tự động khi tạo đơn hàng

### 8. INVENTORY (Tồn kho)
**Mục đích**: Quản lý tồn kho tại nhà thuốc

**Models**:
- `InventoryItem`: Tồn kho tại nhà thuốc
- `InventoryTransaction`: Giao dịch tồn kho

**Tính năng**:
- Theo dõi tồn kho theo nhà thuốc
- Cảnh báo tồn kho thấp
- Lịch sử nhập/xuất tồn kho
- Đồng bộ tồn kho với đơn hàng

### 9. PAYMENT (Thanh toán)
**Mục đích**: Quản lý thanh toán và công nợ

**Models**:
- `Payment`: Thanh toán

**Tính năng**:
- Quản lý thanh toán (đặt cọc, một phần, đủ)
- Nhiều phương thức thanh toán (tiền mặt, chuyển khoản, thẻ)
- Theo dõi công nợ khách hàng
- Lịch sử thanh toán

## Cấu trúc Database

### Quan hệ chính:
- User (TDV) → KPITarget → KPIResult → Incentive
- User (TDV) → ApprovalRequest → ApprovalAction
- Pharmacy → CustomerSegment
- Pharmacy → LoyaltyPoint → LoyaltyTransaction
- Pharmacy → PromotionApplication
- Order → PromotionApplication
- Order → Payment
- Order → ApprovalRequest

## Trạng thái triển khai

### ✅ Đã hoàn thành

1. **Database Schema**: Đã thiết kế và cập nhật Prisma schema với 9 phân hệ
2. **Seed Data**: Đã tạo seed data đầy đủ cho tất cả model mới
3. **API Routes**: Đã tạo API routes cho tất cả phân hệ:
   - `/api/promotions` - Quản lý khuyến mãi
   - `/api/loyalty` - Quản lý tích lũy
   - `/api/customer-segments` - Phân nhóm khách hàng
   - `/api/trade-activities` - Hoạt động thương mại
   - `/api/kpi` - KPI và Incentive
   - `/api/approvals` - Quy trình phê duyệt

### ⏳ Cần triển khai

1. **Migration Database**: Chạy `npm run db:migrate` hoặc `npm run db:push` để tạo các bảng mới
2. **Frontend Components**: Tạo UI cho quản lý các phân hệ trong admin panel
3. **Integration**: Tích hợp các phân hệ vào luồng nghiệp vụ hiện có (tạo đơn hàng, thanh toán, v.v.)

## Lưu ý

- Tất cả dữ liệu phải lấy từ database, không dùng mock data
- Đảm bảo tính nhất quán dữ liệu giữa các phân hệ
- Xử lý transaction cho các thao tác phức tạp
- Validate dữ liệu đầu vào đầy đủ
- Logging và audit trail cho các thao tác quan trọng

