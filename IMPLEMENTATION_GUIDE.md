# Hướng dẫn Triển khai DMS - An Minh Business System

## Tổng quan

Hệ thống DMS đã được mở rộng với 9 phân hệ chuyên nghiệp, sử dụng database PostgreSQL thật (không dùng mock data).

## Các phân hệ đã triển khai

### ✅ Backend (Database & API)

1. **Promotions (Khuyến mãi)** - `/api/promotions`
2. **Loyalty/Points (Tích lũy)** - `/api/loyalty`
3. **Customer Segmentation (Phân nhóm)** - `/api/customer-segments`
4. **Trade Activities (Hoạt động thương mại)** - `/api/trade-activities`
5. **KPI & Incentive** - `/api/kpi`
6. **Approval Workflow (Phê duyệt)** - `/api/approvals`
7. **Price Management** - (Tích hợp trong products/pharmacies)
8. **Inventory (Tồn kho)** - (Sẵn sàng trong schema)
9. **Payment (Thanh toán)** - (Sẵn sàng trong schema)

## Bước triển khai

### 1. Migration Database

```bash
# Generate Prisma Client
npm run db:generate

# Tạo migration
npm run db:migrate

# Hoặc push trực tiếp (development)
npm run db:push
```

### 2. Seed Data

```bash
npm run db:seed
```

Seed data sẽ tạo:
- Users (Admin, TDV, QL, KT)
- Product Groups & Products
- Pharmacies với phân nhóm
- Promotions (3 chương trình)
- Loyalty Rewards & Points
- Trade Activities
- KPI Targets & Results
- Incentives
- Orders với payments
- Inventory items

### 3. Kiểm tra API

Các endpoint đã sẵn sàng:

**Promotions:**
- `GET /api/promotions` - Danh sách khuyến mãi
- `GET /api/promotions/:id` - Chi tiết
- `POST /api/promotions` - Tạo mới
- `PUT /api/promotions/:id` - Cập nhật
- `DELETE /api/promotions/:id` - Xóa
- `GET /api/promotions/available/:pharmacyId` - Khuyến mãi có thể áp dụng

**Loyalty:**
- `GET /api/loyalty/points/:pharmacyId` - Điểm tích lũy
- `POST /api/loyalty/points/:pharmacyId/earn` - Tích điểm
- `GET /api/loyalty/rewards` - Danh sách phần thưởng
- `POST /api/loyalty/redeem` - Đổi thưởng
- `POST /api/loyalty/rewards` - Tạo phần thưởng

**Customer Segments:**
- `GET /api/customer-segments` - Danh sách
- `POST /api/customer-segments` - Tạo mới
- `PUT /api/customer-segments/:id` - Cập nhật
- `POST /api/customer-segments/auto-assign` - Tự động phân nhóm

**Trade Activities:**
- `GET /api/trade-activities` - Danh sách
- `POST /api/trade-activities` - Tạo mới
- `PUT /api/trade-activities/:id` - Cập nhật

**KPI:**
- `GET /api/kpi/targets` - Mục tiêu KPI
- `POST /api/kpi/targets` - Tạo mục tiêu
- `GET /api/kpi/results` - Kết quả KPI
- `POST /api/kpi/calculate/:targetId` - Tính toán KPI
- `GET /api/kpi/incentives` - Danh sách thưởng
- `POST /api/kpi/incentives` - Tạo thưởng
- `PUT /api/kpi/incentives/:id/approve` - Phê duyệt thưởng
- `PUT /api/kpi/incentives/:id/pay` - Thanh toán thưởng

**Approvals:**
- `GET /api/approvals` - Danh sách yêu cầu
- `GET /api/approvals/pending` - Yêu cầu chờ phê duyệt
- `POST /api/approvals` - Tạo yêu cầu
- `POST /api/approvals/:id/approve` - Phê duyệt
- `POST /api/approvals/:id/reject` - Từ chối

## Cấu trúc Database

### Models mới:
- Promotion, PromotionItem, PromotionApplication
- LoyaltyPoint, LoyaltyTransaction, LoyaltyReward, LoyaltyRedemption
- CustomerSegment
- TradeActivity
- KPITarget, KPIResult, Incentive
- ApprovalRequest, ApprovalAction
- ProductPrice, PharmacyPrice
- InventoryItem, InventoryTransaction
- Payment

### Quan hệ chính:
- User → KPITarget → KPIResult → Incentive
- User → ApprovalRequest → ApprovalAction
- Pharmacy → CustomerSegment
- Pharmacy → LoyaltyPoint → LoyaltyTransaction
- Order → PromotionApplication
- Order → Payment
- Order → ApprovalRequest

## Frontend (Cần triển khai)

Các component cần tạo trong `client/src/pages/admin/`:

1. `AdminPromotions.js` - Quản lý khuyến mãi
2. `AdminLoyalty.js` - Quản lý tích lũy
3. `AdminCustomerSegments.js` - Quản lý phân nhóm
4. `AdminTradeActivities.js` - Quản lý hoạt động thương mại
5. `AdminKPI.js` - Quản lý KPI và Incentive
6. `AdminApprovals.js` - Quản lý phê duyệt

## Lưu ý quan trọng

1. **Tất cả dữ liệu từ database**: Không còn sử dụng mock data, tất cả lấy từ PostgreSQL
2. **Migration**: Chạy migration trước khi seed data
3. **Environment**: Đảm bảo `.env` có `DATABASE_URL` đúng
4. **Prisma Client**: Chạy `npm run db:generate` sau khi thay đổi schema

## Testing

Sau khi migration và seed:

1. Kiểm tra database bằng Prisma Studio: `npm run db:studio`
2. Test API endpoints bằng Postman hoặc curl
3. Kiểm tra seed data đã được tạo đầy đủ

## Next Steps

1. ✅ Database schema - Hoàn thành
2. ✅ Seed data - Hoàn thành
3. ✅ API routes - Hoàn thành
4. ⏳ Frontend components - Cần triển khai
5. ⏳ Integration với luồng nghiệp vụ hiện có
6. ⏳ Testing và validation

