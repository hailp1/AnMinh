# 📊 TƯ VẤN HOÀN THIỆN HỆ THỐNG QUẢN LÝ SẢN PHẨM & TỒN KHO

**Ngày**: 05/12/2024
**Phân tích**: Dữ liệu Excel tồn kho thực tế (3,284,124 đơn vị)

---

## 🔍 PHÂN TÍCH DỮ LIỆU HIỆN TẠI

### Cấu trúc dữ liệu Excel:
```
- Tên kho: PPT01, PPT02
- Mã hàng: AMG000005, AMG000006...
- Tên hàng: Acemol 325mg (Chai 40 viên) - NADYPHAR
- Số lô: 25001A, FVH1282...
- Hạn sử dụng: 8/5/2028, 5/19/2027...
- ĐVT: Chai, Hộp, Viên, Gói...
- Cuối kỳ - Số lượng: 53.00, 10.00...
```

### ⚠️ VẤN ĐỀ PHÁT HIỆN:

1. **Thiếu thông tin sản phẩm cơ bản:**
   - Không có giá bán
   - Không có giá nhập
   - Không có nhà sản xuất (chỉ có trong tên)
   - Không có hoạt chất
   - Không có nhóm thuốc
   - Không có barcode/SKU

2. **Thiếu thông tin tồn kho:**
   - Không có tồn đầu kỳ
   - Không có nhập trong kỳ
   - Không có xuất trong kỳ
   - Không có giá trị tồn kho
   - Không có vị trí kho

3. **Thiếu thông tin quản lý:**
   - Không có mức tồn kho tối thiểu (min stock)
   - Không có mức tồn kho tối đa (max stock)
   - Không có trạng thái (active/inactive)
   - Không có cảnh báo hết hạn

---

## 🎯 ĐỀ XUẤT CẤU TRÚC DATABASE HOÀN CHỈNH

### 1. **Bảng Product (Sản phẩm)**

```prisma
model Product {
  id                String   @id @default(uuid())
  
  // Thông tin cơ bản
  code              String   @unique          // AMG000005
  name              String                    // Acemol 325mg
  genericName       String?                   // Paracetamol
  activeIngredient  String?                   // Paracetamol 325mg
  
  // Phân loại
  productGroupId    String?                   // Nhóm thuốc
  categoryId        String?                   // Danh mục (Kháng sinh, Giảm đau...)
  therapeuticClass  String?                   // Phân loại điều trị
  
  // Nhà sản xuất
  manufacturerId    String?                   // ID nhà sản xuất
  manufacturer      String?                   // NADYPHAR, SANOFI...
  countryOfOrigin   String?                   // Việt Nam, Pháp...
  
  // Đơn vị & Quy cách
  unit              String                    // Chai, Hộp, Viên
  packingSpec       String?                   // Chai 40 viên, Hộp 3 vỉ x 10 viên
  conversionUnit    String?                   // Đơn vị chuyển đổi
  conversionFactor  Float?                    // Hệ số chuyển đổi
  
  // Giá
  costPrice         Float?                    // Giá nhập
  sellingPrice      Float                     // Giá bán
  wholesalePrice    Float?                    // Giá bán sỉ
  retailPrice       Float?                    // Giá bán lẻ
  
  // Mã vạch & SKU
  barcode           String?   @unique         // Mã vạch
  sku               String?   @unique         // SKU
  registrationNo    String?                   // Số đăng ký (VD-xxxxx-xx)
  
  // Tồn kho
  minStock          Int?      @default(10)    // Tồn kho tối thiểu
  maxStock          Int?      @default(1000)  // Tồn kho tối đa
  reorderPoint      Int?      @default(20)    // Điểm đặt hàng lại
  
  // Thuộc tính
  isPrescription    Boolean   @default(false) // Thuốc kê đơn
  isControlled      Boolean   @default(false) // Thuốc kiểm soát đặc biệt
  isRefrigerated    Boolean   @default(false) // Bảo quản lạnh
  storageCondition  String?                   // Điều kiện bảo quản
  
  // Hình ảnh & Mô tả
  imageUrl          String?                   // Hình ảnh sản phẩm
  description       String?   @db.Text        // Mô tả chi tiết
  usage             String?   @db.Text        // Cách dùng
  sideEffects       String?   @db.Text        // Tác dụng phụ
  contraindications String?   @db.Text        // Chống chỉ định
  
  // Trạng thái
  isActive          Boolean   @default(true)
  discontinuedDate  DateTime?                 // Ngày ngừng kinh doanh
  
  // Metadata
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
  createdBy         String?
  updatedBy         String?
  
  // Relations
  productGroup      ProductGroup?    @relation(fields: [productGroupId], references: [id])
  category          Category?        @relation(fields: [categoryId], references: [id])
  inventoryItems    InventoryItem[]
  batches           ProductBatch[]
  prices            PharmacyPrice[]
  orderItems        OrderItem[]
}
```

### 2. **Bảng ProductBatch (Lô hàng)**

```prisma
model ProductBatch {
  id              String    @id @default(uuid())
  
  // Thông tin lô
  productId       String
  batchNumber     String                      // 25001A, FVH1282
  expiryDate      DateTime                    // Hạn sử dụng
  manufacturingDate DateTime?                 // Ngày sản xuất
  
  // Số lượng
  initialQuantity Int                         // Số lượng ban đầu
  currentQuantity Int                         // Số lượng hiện tại
  
  // Giá nhập của lô này
  costPrice       Float?
  
  // Vị trí
  warehouseId     String?
  location        String?                     // Vị trí trong kho (Kệ A1, Ngăn B2)
  
  // Trạng thái
  status          String    @default("ACTIVE") // ACTIVE, EXPIRED, RECALLED
  
  // Metadata
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  
  // Relations
  product         Product   @relation(fields: [productId], references: [id])
  warehouse       Warehouse? @relation(fields: [warehouseId], references: [id])
  
  @@unique([productId, batchNumber])
}
```

### 3. **Bảng Warehouse (Kho)**

```prisma
model Warehouse {
  id              String    @id @default(uuid())
  
  code            String    @unique           // PPT01, PPT02
  name            String                      // KHO HÀNG 02
  type            String?                     // MAIN, BRANCH, VIRTUAL
  
  // Địa chỉ
  address         String?
  province        String?
  district        String?
  
  // Người quản lý
  managerId       String?
  managerName     String?
  phone           String?
  
  // Trạng thái
  isActive        Boolean   @default(true)
  
  // Metadata
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  
  // Relations
  manager         User?     @relation(fields: [managerId], references: [id])
  inventoryItems  InventoryItem[]
  batches         ProductBatch[]
}
```

### 4. **Bảng InventoryItem (Tồn kho)**

```prisma
model InventoryItem {
  id              String    @id @default(uuid())
  
  // Sản phẩm & Kho
  productId       String
  warehouseId     String
  
  // Số lượng
  beginningQty    Int       @default(0)       // Tồn đầu kỳ
  receivedQty     Int       @default(0)       // Nhập trong kỳ
  issuedQty       Int       @default(0)       // Xuất trong kỳ
  currentQty      Int       @default(0)       // Tồn cuối kỳ
  
  // Giá trị
  avgCostPrice    Float?                      // Giá vốn bình quân
  totalValue      Float?                      // Giá trị tồn kho
  
  // Vị trí
  location        String?                     // Vị trí trong kho
  
  // Cảnh báo
  isLowStock      Boolean   @default(false)   // Dưới mức tối thiểu
  isOverStock     Boolean   @default(false)   // Vượt mức tối đa
  hasExpiringSoon Boolean   @default(false)   // Sắp hết hạn (< 6 tháng)
  
  // Metadata
  lastCountDate   DateTime?                   // Ngày kiểm kê cuối
  lastUpdated     DateTime  @updatedAt
  
  // Relations
  product         Product   @relation(fields: [productId], references: [id])
  warehouse       Warehouse @relation(fields: [warehouseId], references: [id])
  
  @@unique([productId, warehouseId])
}
```

### 5. **Bảng InventoryTransaction (Giao dịch tồn kho)**

```prisma
model InventoryTransaction {
  id              String    @id @default(uuid())
  
  // Loại giao dịch
  type            String                      // IMPORT, EXPORT, TRANSFER, ADJUSTMENT
  transactionNo   String    @unique           // Số phiếu
  
  // Sản phẩm
  productId       String
  batchNumber     String?
  
  // Kho
  warehouseId     String
  fromWarehouseId String?                     // Kho xuất (nếu chuyển kho)
  toWarehouseId   String?                     // Kho nhập (nếu chuyển kho)
  
  // Số lượng & Giá
  quantity        Int
  unitPrice       Float?
  totalAmount     Float?
  
  // Lý do
  reason          String?                     // Nhập hàng, Xuất bán, Hỏng hóc...
  notes           String?   @db.Text
  
  // Liên kết
  orderId         String?                     // Liên kết đơn hàng
  supplierId      String?                     // Nhà cung cấp
  
  // Người thực hiện
  createdBy       String?
  approvedBy      String?
  approvedAt      DateTime?
  
  // Metadata
  transactionDate DateTime  @default(now())
  createdAt       DateTime  @default(now())
  
  // Relations
  product         Product   @relation(fields: [productId], references: [id])
  warehouse       Warehouse @relation(fields: [warehouseId], references: [id])
  order           Order?    @relation(fields: [orderId], references: [id])
}
```

### 6. **Bảng Category (Danh mục thuốc)**

```prisma
model Category {
  id              String    @id @default(uuid())
  
  code            String    @unique
  name            String                      // Kháng sinh, Giảm đau, Vitamin...
  description     String?
  parentId        String?                     // Danh mục cha
  
  // Metadata
  order           Int       @default(0)
  isActive        Boolean   @default(true)
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  
  // Relations
  parent          Category? @relation("CategoryHierarchy", fields: [parentId], references: [id])
  children        Category[] @relation("CategoryHierarchy")
  products        Product[]
}
```

---

## 📋 SCRIPT IMPORT DỮ LIỆU TỪ EXCEL

Tôi sẽ tạo script để import dữ liệu Excel vào database:

```javascript
// import_inventory_excel.js
import { PrismaClient } from '@prisma/client';
import xlsx from 'xlsx';

const prisma = new PrismaClient();

async function importFromExcel(filePath) {
  console.log('📊 Đọc file Excel...');
  
  const workbook = xlsx.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const data = xlsx.utils.sheet_to_json(worksheet);
  
  console.log(`✅ Đọc được ${data.length} dòng dữ liệu`);
  
  let stats = {
    warehouses: 0,
    products: 0,
    batches: 0,
    inventory: 0,
    errors: []
  };
  
  for (const row of data) {
    try {
      // 1. Tạo/Cập nhật Warehouse
      const warehouse = await prisma.warehouse.upsert({
        where: { code: row['Mã kho'] || 'UNKNOWN' },
        update: {},
        create: {
          code: row['Mã kho'] || 'UNKNOWN',
          name: row['Tên kho'] || 'Unknown Warehouse',
          isActive: true
        }
      });
      stats.warehouses++;
      
      // 2. Parse tên sản phẩm để tách manufacturer
      const fullName = row['Tên hàng'] || '';
      const parts = fullName.split(' - ');
      const productName = parts[0] || fullName;
      const manufacturer = parts[1] || null;
      
      // 3. Tạo/Cập nhật Product
      const product = await prisma.product.upsert({
        where: { code: row['Mã hàng'] },
        update: {
          name: productName,
          manufacturer: manufacturer,
          unit: row['ĐVT'] || 'Viên'
        },
        create: {
          code: row['Mã hàng'],
          name: productName,
          manufacturer: manufacturer,
          unit: row['ĐVT'] || 'Viên',
          price: 0, // Cần cập nhật sau
          isActive: true
        }
      });
      stats.products++;
      
      // 4. Tạo ProductBatch (nếu có số lô)
      if (row['Số lô']) {
        const expiryDate = parseExcelDate(row['Hạn sử dụng']);
        
        await prisma.productBatch.upsert({
          where: {
            productId_batchNumber: {
              productId: product.id,
              batchNumber: row['Số lô']
            }
          },
          update: {
            currentQuantity: parseFloat(row['Số lượng']) || 0
          },
          create: {
            productId: product.id,
            batchNumber: row['Số lô'],
            expiryDate: expiryDate,
            initialQuantity: parseFloat(row['Số lượng']) || 0,
            currentQuantity: parseFloat(row['Số lượng']) || 0,
            warehouseId: warehouse.id
          }
        });
        stats.batches++;
      }
      
      // 5. Cập nhật InventoryItem
      const quantity = parseFloat(row['Số lượng']) || 0;
      
      await prisma.inventoryItem.upsert({
        where: {
          productId_warehouseId: {
            productId: product.id,
            warehouseId: warehouse.id
          }
        },
        update: {
          currentQty: quantity,
          lastUpdated: new Date()
        },
        create: {
          productId: product.id,
          warehouseId: warehouse.id,
          currentQty: quantity,
          beginningQty: quantity
        }
      });
      stats.inventory++;
      
    } catch (error) {
      stats.errors.push({
        row: row['Mã hàng'],
        error: error.message
      });
    }
  }
  
  console.log('\\n✅ Import hoàn tất!');
  console.log(`   - Warehouses: ${stats.warehouses}`);
  console.log(`   - Products: ${stats.products}`);
  console.log(`   - Batches: ${stats.batches}`);
  console.log(`   - Inventory: ${stats.inventory}`);
  console.log(`   - Errors: ${stats.errors.length}`);
  
  if (stats.errors.length > 0) {
    console.log('\\n❌ Lỗi:');
    stats.errors.forEach(e => console.log(`   - ${e.row}: ${e.error}`));
  }
}

function parseExcelDate(dateStr) {
  if (!dateStr) return new Date();
  
  // Parse "8/5/2028" format
  const parts = dateStr.split('/');
  if (parts.length === 3) {
    return new Date(parts[2], parts[0] - 1, parts[1]);
  }
  
  return new Date(dateStr);
}

// Run
importFromExcel('path/to/your/excel/file.xlsx');
```

---

## 🎨 UI/UX CHO QUẢN LÝ SẢN PHẨM & TỒN KHO

### Trang Quản lý Sản phẩm:
- ✅ Danh sách sản phẩm với filter (Nhóm, Nhà SX, Trạng thái)
- ✅ Search theo mã, tên, barcode
- ✅ Hiển thị: Ảnh, Mã, Tên, Nhà SX, Giá, Tồn kho, Trạng thái
- ✅ Cảnh báo: Sắp hết hạn, Tồn kho thấp, Hết hàng
- ✅ CRUD: Thêm, Sửa, Xóa, Import Excel, Export Excel
- ✅ Barcode scanner integration

### Trang Quản lý Tồn kho:
- ✅ Dashboard: Tổng giá trị tồn, Sản phẩm sắp hết, Sắp hết hạn
- ✅ Báo cáo tồn kho theo kho, theo nhóm
- ✅ Lịch sử nhập/xuất
- ✅ Kiểm kê tồn kho
- ✅ Cảnh báo tự động (Email/SMS)

---

## 📊 BÁO CÁO CẦN THIẾT

1. **Báo cáo Tồn kho:**
   - Tồn kho theo sản phẩm
   - Tồn kho theo kho
   - Tồn kho theo nhóm thuốc
   - Giá trị tồn kho

2. **Báo cáo Hết hạn:**
   - Sản phẩm đã hết hạn
   - Sản phẩm sắp hết hạn (< 6 tháng)
   - Sản phẩm sắp hết hạn (< 3 tháng)

3. **Báo cáo Nhập/Xuất:**
   - Nhập kho theo thời gian
   - Xuất kho theo thời gian
   - Top sản phẩm bán chạy
   - Sản phẩm ế ẩm

4. **Báo cáo Cảnh báo:**
   - Sản phẩm dưới mức tồn kho tối thiểu
   - Sản phẩm vượt mức tồn kho tối đa
   - Sản phẩm không hoạt động

---

## 🚀 KẾ HOẠCH TRIỂN KHAI

### Phase 1: Cập nhật Database Schema (1-2 ngày)
1. Cập nhật `schema.prisma` với các models mới
2. Chạy migration
3. Test schema

### Phase 2: Import Dữ liệu (1 ngày)
1. Cài đặt `xlsx` package
2. Tạo script import
3. Import dữ liệu từ Excel
4. Verify dữ liệu

### Phase 3: Phát triển UI (3-5 ngày)
1. Trang Quản lý Sản phẩm
2. Trang Quản lý Tồn kho
3. Trang Quản lý Lô hàng
4. Dashboard Tồn kho

### Phase 4: Báo cáo (2-3 ngày)
1. Báo cáo Tồn kho
2. Báo cáo Hết hạn
3. Báo cáo Nhập/Xuất
4. Export Excel/PDF

### Phase 5: Tối ưu & Test (1-2 ngày)
1. Performance optimization
2. Testing
3. Bug fixes
4. Documentation

**Tổng thời gian: 8-13 ngày**

---

## 💡 KHUYẾN NGHỊ

1. **Bắt đầu với Phase 1 & 2** - Hoàn thiện database và import dữ liệu
2. **Sử dụng Barcode** - Tăng tốc độ nhập/xuất kho
3. **Cảnh báo tự động** - Email/SMS khi tồn kho thấp hoặc sắp hết hạn
4. **Mobile App** - Cho nhân viên kho quét barcode và kiểm kê
5. **Integration** - Kết nối với hệ thống kế toán (nếu có)

---

**Bạn muốn tôi bắt đầu implement từ đâu?**
1. Cập nhật Database Schema?
2. Tạo script Import Excel?
3. Phát triển UI Quản lý Sản phẩm?
4. Tất cả cùng lúc?
