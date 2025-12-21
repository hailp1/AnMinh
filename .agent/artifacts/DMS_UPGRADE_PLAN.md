# 🚀 KẾ HOẠCH NÂNG CẤP HỆ THỐNG DMS CHUẨN ERP/SFA/CRM QUỐC TẾ

## 📌 Tổng quan
Tài liệu này mô tả kế hoạch nâng cấp hệ thống An Minh DMS từ MVP hiện tại lên chuẩn ERP/SFA/CRM quốc tế, bao gồm:
- Chuẩn hóa Database Schema
- Template Excel Import/Export chuyên nghiệp
- Báo cáo phân mục đầy đủ
- Quản lý lộ trình & Org Chart

---

## 1️⃣ NÂNG CẤP BẢNG CUSTOMER (Pharmacy/Khách hàng)

### Hiện tại:
```prisma
model Pharmacy {
  id, name, code, address, phone, email, territoryId
}
```

### Đề xuất chuẩn CRM:
```prisma
model Customer {
  // === IDENTIFICATION ===
  id              String   @id @default(uuid())
  code            String   @unique  // VD: KH-HCM-001
  name            String            // Tên chính thức
  tradeName       String?           // Tên thương mại
  taxCode         String?  @unique  // Mã số thuế
  
  // === CLASSIFICATION ===
  type            CustomerType      // PHARMACY, CLINIC, HOSPITAL, DISTRIBUTOR
  channel         Channel           // ETC, OTC, HOSPITAL_TENDER
  segment         Segment           // A, B, C, D (theo doanh số/tiềm năng)
  tier            String?           // VIP, GOLD, SILVER, BRONZE
  
  // === CONTACT INFO ===
  phone           String?
  phone2          String?           // Số phụ
  email           String?
  website         String?
  
  // === ADDRESS (Full structure) ===
  addressLine1    String?           // Số nhà, đường
  addressLine2    String?           // Tòa nhà, tầng
  ward            String?           // Phường/Xã
  district        String?           // Quận/Huyện
  province        String?           // Tỉnh/Thành phố
  postalCode      String?
  country         String   @default("VN")
  latitude        Float?
  longitude       Float?
  
  // === BUSINESS INFO ===
  licenseNumber   String?           // Số giấy phép kinh doanh
  licenseExpiry   DateTime?         // Ngày hết hạn GP
  pharmacistName  String?           // Dược sĩ phụ trách
  pharmacistLicense String?         // Chứng chỉ hành nghề
  
  // === FINANCIAL ===
  creditLimit     Float    @default(0)
  paymentTerms    Int      @default(30) // Số ngày công nợ
  taxExempt       Boolean  @default(false)
  bankAccount     String?
  bankName        String?
  
  // === SALES ASSIGNMENT ===
  territoryId     String?
  primaryRepId    String?           // TDV phụ trách chính
  secondaryRepId  String?           // TDV phụ trách phụ
  
  // === LIFECYCLE ===
  status          CustomerStatus    // ACTIVE, INACTIVE, SUSPENDED, PROSPECT
  source          String?           // Nguồn khách hàng (REFERRAL, COLD_CALL, EVENT)
  acquiredDate    DateTime?         // Ngày trở thành khách hàng
  lastOrderDate   DateTime?
  lastVisitDate   DateTime?
  
  // === PREFERENCES ===
  visitFrequency  Int?              // Số lần ghé/tuần
  preferredDay    String?           // Thứ ưu tiên
  preferredTime   String?           // Khung giờ
  notes           String?  @db.Text
  tags            String[]          // Tags: "vip", "khó tính", "trả chậm"
  
  // === AUDIT ===
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  createdBy       String?
  updatedBy       String?
}

enum CustomerType { PHARMACY, CLINIC, HOSPITAL, DISTRIBUTOR, OTHER }
enum Channel { ETC, OTC, HOSPITAL_TENDER, ONLINE, EXPORT }
enum Segment { A, B, C, D, UNCLASSIFIED }
enum CustomerStatus { PROSPECT, ACTIVE, INACTIVE, SUSPENDED, CHURNED }
```

---

## 2️⃣ NÂNG CẤP BẢNG PRODUCT

### Đề xuất chuẩn ERP Pharma:
```prisma
model Product {
  // === IDENTIFICATION ===
  id              String   @id @default(uuid())
  sku             String   @unique    // Mã nội bộ: SP-KS-001
  upc             String?  @unique    // Barcode
  registrationNo  String?             // Số đăng ký: VD-12345-20
  
  // === NAMING ===
  name            String              // Tên thương mại
  genericName     String?             // Hoạt chất
  brandName       String?             // Nhãn hiệu
  shortName       String?             // Tên viết tắt
  
  // === CLASSIFICATION ===
  categoryId      String?
  groupId         String?
  subGroupId      String?
  class           ProductClass        // RX (kê đơn), OTC, SUPPLEMENT, DEVICE
  form            DosageForm          // TABLET, CAPSULE, SYRUP, INJECTION...
  
  // === MANUFACTURER ===
  manufacturerId  String?
  supplierId      String?
  originCountry   String?
  
  // === PACKAGING ===
  primaryUnit     String              // Viên, Chai, Ống
  primaryQty      Int      @default(1)
  secondaryUnit   String?             // Vỉ, Hộp
  secondaryQty    Int?                // 10 viên/vỉ
  tertiaryUnit    String?             // Thùng
  tertiaryQty     Int?                // 30 hộp/thùng
  
  // === PRICING (Multi-tier) ===
  costPrice       Float?              // Giá nhập
  listPrice       Float?              // Giá niêm yết
  wholesalePrice  Float?              // Giá sỉ
  retailPrice     Float?              // Giá lẻ
  hospitalPrice   Float?              // Giá bệnh viện
  vat             Float    @default(8)
  
  // === INVENTORY ===
  reorderPoint    Int      @default(100)
  reorderQty      Int      @default(500)
  safetyStock     Int      @default(50)
  leadTimeDays    Int      @default(7)
  
  // === PHARMA SPECIFICS ===
  concentration   String?             // 500mg, 10mg/ml
  indication      String?  @db.Text   // Chỉ định
  contraindication String? @db.Text   // Chống chỉ định
  dosage          String?  @db.Text   // Liều dùng
  sideEffects     String?  @db.Text   
  storageCondition String?            // Bảo quản dưới 25°C
  shelfLifeMonths Int?
  
  // === REGULATORY ===
  isPrescription  Boolean  @default(false)
  isControlled    Boolean  @default(false)
  isRefrigerated  Boolean  @default(false)
  isHazardous     Boolean  @default(false)
  
  // === STATUS ===
  status          ProductStatus       // ACTIVE, DISCONTINUED, OUT_OF_STOCK
  launchDate      DateTime?
  discontinueDate DateTime?
}

enum ProductClass { RX, OTC, SUPPLEMENT, MEDICAL_DEVICE, COSMETIC }
enum DosageForm { TABLET, CAPSULE, SYRUP, INJECTION, CREAM, GEL, DROPS, POWDER, PATCH }
enum ProductStatus { DRAFT, ACTIVE, DISCONTINUED, OUT_OF_STOCK, RECALLED }
```

---

## 3️⃣ NÂNG CẤP TERRITORY & ORG CHART

### Cấu trúc phân cấp chuẩn:
```prisma
// === ORGANIZATION HIERARCHY ===
model Organization {
  id          String   @id @default(uuid())
  name        String              // An Minh Pharma
  code        String   @unique
  type        OrgType             // COMPANY, DIVISION, BRANCH
  parentId    String?
  parent      Organization? @relation("OrgHierarchy", fields: [parentId], references: [id])
  children    Organization[] @relation("OrgHierarchy")
  level       Int      @default(0)
}

// === GEOGRAPHY HIERARCHY ===
model Region {
  id          String   @id @default(uuid())
  name        String              // Miền Nam
  code        String   @unique
  managerId   String?             // Regional Manager
  areas       Area[]
}

model Area {
  id          String   @id @default(uuid())
  name        String              // Khu vực HCM
  code        String   @unique
  regionId    String
  managerId   String?             // Area Manager
  territories Territory[]
}

model Territory {
  id          String   @id @default(uuid())
  name        String              // Quận 1
  code        String   @unique
  areaId      String
  assignedRepId String?           // TDV phụ trách
  
  // Geography
  districts   String[]            // Danh sách quận/huyện
  wards       String[]
  
  // Metrics
  potentialValue Float?           // Tiềm năng thị trường
  currentSales   Float?
  customerCount  Int?
  
  // Visit Planning
  visitDays      String[]         // ["MON", "WED", "FRI"]
}

// === SALES FORCE ===
model SalesRep {
  id              String   @id @default(uuid())
  employeeCode    String   @unique
  name            String
  
  // Hierarchy
  role            SalesRole         // REP, SUPERVISOR, MANAGER, DIRECTOR
  reportingToId   String?           // Manager
  
  // Assignment
  territoryIds    String[]
  
  // Targets
  monthlyTarget   Float?
  quarterlyTarget Float?
  yearlyTarget    Float?
  
  // Performance
  currentMTD      Float?            // Month-to-date sales
  currentQTD      Float?
  currentYTD      Float?
}

enum SalesRole { TDV, SUPERVISOR, ASM, RSM, NSM, DIRECTOR }
```

---

## 4️⃣ QUẢN LÝ LỘ TRÌNH (Route Management)

```prisma
model RouteTemplate {
  id              String   @id @default(uuid())
  code            String   @unique    // RT-HCM-Q1-MON
  name            String              // Lộ trình Q1 Thứ 2
  
  territoryId     String
  assignedRepId   String
  dayOfWeek       DayOfWeek          // MONDAY, TUESDAY...
  
  // Sequence of stops
  stops           RouteStop[]
  
  // Metrics
  estimatedDuration Int?             // Phút
  estimatedDistance Float?           // Km
  estimatedCalls    Int?             // Số khách
  
  isActive        Boolean  @default(true)
}

model RouteStop {
  id              String   @id @default(uuid())
  routeTemplateId String
  customerId      String
  
  sequence        Int               // Thứ tự ghé
  plannedArrival  String?           // "09:00"
  plannedDuration Int?              // Phút tại điểm
  
  // Navigation
  distanceFromPrev Float?
  durationFromPrev Int?
  
  notes           String?
}

model DailyRoute {
  id              String   @id @default(uuid())
  date            DateTime
  repId           String
  templateId      String?
  
  status          RouteStatus       // PLANNED, IN_PROGRESS, COMPLETED
  startTime       DateTime?
  endTime         DateTime?
  
  // Actual performance
  plannedStops    Int
  completedStops  Int
  skippedStops    Int
  
  visits          Visit[]
}

model Visit {
  id              String   @id @default(uuid())
  dailyRouteId    String
  customerId      String
  
  // Timing
  plannedArrival  DateTime?
  actualArrival   DateTime?
  departureTime   DateTime?
  
  // Location verification
  checkInLat      Float?
  checkInLng      Float?
  checkInPhoto    String?
  
  // Outcome
  status          VisitStatus       // COMPLETED, SKIPPED, NO_ANSWER, RESCHEDULED
  outcome         VisitOutcome?     // ORDER_PLACED, DISPLAY_UPDATED, INFO_COLLECTED
  
  // Data collected
  orderPlaced     Boolean  @default(false)
  orderId         String?
  notes           String?  @db.Text
  photos          String[]
  
  // Products displayed/checked
  shelfChecks     ShelfCheck[]
}
```

---

## 5️⃣ TEMPLATE EXCEL CHUẨN

### A. Customer Import Template
| Mã KH* | Tên* | Loại | Kênh | Segment | Điện thoại | Email | Địa chỉ | Phường | Quận | Tỉnh | MST | GP số | GP hạn | TDV |
|--------|------|------|------|---------|------------|-------|---------|--------|------|------|-----|-------|--------|-----|

### B. Product Import Template  
| SKU* | Tên* | Hoạt chất | Nhóm | Loại | Đơn vị | Quy cách | Giá nhập | Giá bán | VAT | Tồn min | NSX | Nước SX |
|------|------|-----------|------|------|--------|----------|----------|---------|-----|---------|-----|---------|

### C. Route Import Template
| Mã Route | Tên | Territory | TDV | Thứ | Sequence | Mã KH | Giờ ghé | Thời gian (phút) |
|----------|-----|-----------|-----|-----|----------|-------|---------|------------------|

### D. Order Export Template
| Mã ĐH | Ngày | Khách hàng | Địa chỉ | TDV | Trạng thái | SP | SL | Đơn giá | Thành tiền | Tổng | Ghi chú |
|-------|------|------------|---------|-----|------------|----|----|---------|------------|------|---------|

---

## 6️⃣ BÁO CÁO PHÂN MỤC ĐẦY ĐỦ

### A. BÁO CÁO BÁN HÀNG (Sales Reports)
1. **Daily Sales Report** - Doanh số theo ngày
2. **Sales by Rep** - Doanh số theo TDV
3. **Sales by Territory** - Doanh số theo vùng
4. **Sales by Customer** - Doanh số theo khách
5. **Sales by Product** - Doanh số theo sản phẩm
6. **Sales by Channel** - Doanh số theo kênh (ETC/OTC)
7. **Sales Trend Analysis** - Xu hướng bán hàng
8. **Top N Analysis** - Top sản phẩm/khách hàng

### B. BÁO CÁO VIẾNG THĂM (Visit Reports)
1. **Daily Visit Summary** - Tổng hợp viếng thăm ngày
2. **Visit Compliance** - Tuân thủ lộ trình
3. **Productive Calls** - Cuộc ghé có đơn
4. **Visit Duration Analysis** - Phân tích thời gian ghé
5. **Coverage Report** - Độ phủ khách hàng
6. **Strike Rate** - Tỷ lệ chốt đơn

### C. BÁO CÁO KHO (Inventory Reports)
1. **Stock Status** - Tồn kho hiện tại
2. **Stock Movement** - Biến động tồn kho
3. **Low Stock Alert** - Cảnh báo hết hàng
4. **Expiry Report** - Hàng sắp hết hạn
5. **Dead Stock** - Hàng chậm luân chuyển

### D. BÁO CÁO KHÁCH HÀNG (Customer Reports)
1. **Customer Master List** - Danh sách khách hàng
2. **New Customer Acquisition** - Khách hàng mới
3. **Customer Segmentation** - Phân khúc khách hàng
4. **Customer Churn** - Khách hàng rời bỏ
5. **Aging Report** - Công nợ theo tuổi

### E. BÁO CÁO HIỆU SUẤT (Performance Reports)
1. **KPI Dashboard** - Bảng theo dõi KPI
2. **Target vs Actual** - Mục tiêu vs Thực hiện
3. **Rep Scorecard** - Bảng điểm TDV
4. **Territory Performance** - Hiệu suất vùng

---

## 7️⃣ LỘ TRÌNH THỰC HIỆN

### Phase 1: Foundation (2 tuần)
- [ ] Migrate Customer schema
- [ ] Migrate Product schema
- [ ] Create Excel templates
- [ ] Seed sample data

### Phase 2: Territory & Org (1 tuần)
- [ ] Implement Org hierarchy
- [ ] Implement Territory structure
- [ ] Sales Rep assignment

### Phase 3: Route Management (2 tuần)
- [ ] Route template CRUD
- [ ] Daily route generation
- [ ] Visit tracking with GPS

### Phase 4: Reports (2 tuần)
- [ ] Build report framework
- [ ] Implement all report types
- [ ] Excel/PDF export

### Phase 5: Integration (1 tuần)
- [ ] API documentation
- [ ] Mobile app sync
- [ ] Testing & QA

---

## 📞 Cần hỗ trợ?
Liên hệ đội ngũ phát triển để bắt đầu triển khai từng phase.
