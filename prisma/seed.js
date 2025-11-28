import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Bắt đầu seed database...');

  // Xóa dữ liệu cũ (nếu có)
  console.log('🗑️  Xóa dữ liệu cũ...');
  // Xóa theo thứ tự để tránh lỗi foreign key
  try {
    await prisma.loyaltyRedemption.deleteMany();
    await prisma.loyaltyTransaction.deleteMany();
    await prisma.loyaltyPoint.deleteMany();
    await prisma.loyaltyReward.deleteMany();
    await prisma.promotionApplication.deleteMany();
    await prisma.promotionItem.deleteMany();
    await prisma.promotion.deleteMany();
    await prisma.inventoryTransaction.deleteMany();
    await prisma.inventoryItem.deleteMany();
    await prisma.payment.deleteMany();
    await prisma.pharmacyPrice.deleteMany();
    await prisma.productPrice.deleteMany();
    await prisma.approvalAction.deleteMany();
    await prisma.approvalRequest.deleteMany();
    await prisma.incentive.deleteMany();
    await prisma.kpiResult.deleteMany();
    await prisma.kpiTarget.deleteMany();
    await prisma.tradeActivity.deleteMany();
    await prisma.customerSegment.deleteMany();
    await prisma.orderItem.deleteMany();
    await prisma.order.deleteMany();
    await prisma.message.deleteMany();
    await prisma.revenueStat.deleteMany();
    await prisma.pharmacyRepPharmacy.deleteMany();
    await prisma.visitPlan.deleteMany();
    await prisma.customerAssignment.deleteMany();
    await prisma.product.deleteMany();
    await prisma.productGroup.deleteMany();
    await prisma.pharmacy.deleteMany();
    await prisma.territory.deleteMany();
    await prisma.businessUnit.deleteMany();
    await prisma.region.deleteMany();
    await prisma.user.deleteMany();
  } catch (error) {
    console.log('⚠️  Một số bảng chưa tồn tại, bỏ qua...', error.message);
  }

  // Đảm bảo xóa hết dữ liệu bằng cách thử lại
  try {
    await prisma.user.deleteMany();
  } catch (e) {
    // Ignore
  }

  // Hash password mặc định
  const hashedPassword = await bcrypt.hash('123456', 10);

  // 1. Tạo Users
  console.log('👥 Tạo users...');
  const users = [];

  // Admin
  const adminCode = 'ADMIN001';
  let admin = await prisma.user.findUnique({ where: { employeeCode: adminCode } });
  if (!admin) {
    admin = await prisma.user.create({
      data: {
        name: 'Administrator',
        employeeCode: adminCode,
        routeCode: null,
        email: 'admin@anminh.com',
        phone: '0900000000',
        password: hashedPassword,
        role: 'ADMIN',
        isActive: true,
      },
    });
  }
  users.push(admin);

  // Trình dược viên (TDV)
  const tdvNames = ['Nguyễn Văn An', 'Trần Thị Bình', 'Lê Văn Cường', 'Phạm Thị Dung', 'Hoàng Văn Em',
    'Võ Thị Phương', 'Đặng Văn Giang', 'Bùi Thị Hoa', 'Đỗ Văn Hùng', 'Ngô Thị Lan',
    'Lý Văn Minh', 'Vũ Thị Nga', 'Đinh Văn Phúc', 'Trương Thị Quỳnh', 'Nguyễn Văn Sơn',
    'Lê Thị Tuyết', 'Phạm Văn Uy', 'Hoàng Thị Vân', 'Võ Văn Xuân', 'Đặng Thị Yến'];
  const routeCodes = ['T001', 'T002', 'T003', 'T004', 'T005', 'T006', 'T007', 'T008', 'T009', 'T010'];

  for (let i = 0; i < 20; i++) {
    const code = `TDV${String(i + 1).padStart(3, '0')}`;
    let tdv = await prisma.user.findUnique({ where: { employeeCode: code } });
    if (!tdv) {
      tdv = await prisma.user.create({
        data: {
          name: tdvNames[i],
          employeeCode: code,
          routeCode: routeCodes[i % routeCodes.length],
          email: `tdv${i + 1}@anminh.com`,
          phone: `09${String(i + 1).padStart(8, '0')}`,
          password: hashedPassword,
          role: 'TDV',
          isActive: true,
        },
      });
    }
    users.push(tdv);
  }

  // Quản lý (QL)
  const qlNames = ['Nguyễn Văn Quản', 'Trần Thị Lý', 'Lê Văn Đức'];
  for (let i = 0; i < 3; i++) {
    const code = `QL${String(i + 1).padStart(3, '0')}`;
    let ql = await prisma.user.findUnique({ where: { employeeCode: code } });
    if (!ql) {
      ql = await prisma.user.create({
        data: {
          name: qlNames[i] || `Quản lý ${i + 1}`,
          employeeCode: code,
          routeCode: null,
          email: `ql${i + 1}@anminh.com`,
          phone: `08${String(i + 1).padStart(8, '0')}`,
          password: hashedPassword,
          role: 'QL',
          isActive: true,
        },
      });
    }
    users.push(ql);
  }

  // Kế toán (KT)
  for (let i = 0; i < 2; i++) {
    const code = `KT${String(i + 1).padStart(3, '0')}`;
    let kt = await prisma.user.findUnique({ where: { employeeCode: code } });
    if (!kt) {
      kt = await prisma.user.create({
        data: {
          name: `Kế toán ${i + 1}`,
          employeeCode: code,
          routeCode: null,
          email: `kt${i + 1}@anminh.com`,
          phone: `07${String(i + 1).padStart(8, '0')}`,
          password: hashedPassword,
          role: 'KT',
          isActive: true,
        },
      });
    }
    users.push(kt);
  }

  const regions = [];
  const regionData = [
    { code: 'HCM', name: 'Thành phố Hồ Chí Minh', description: 'TP.HCM và các quận huyện' },
    { code: 'DN', name: 'Đồng Nai', description: 'Tỉnh Đồng Nai' },
    { code: 'BD', name: 'Bình Dương', description: 'Tỉnh Bình Dương' },
  ];

  for (const reg of regionData) {
    // Check if region code exists
    const existing = await prisma.region.findUnique({ where: { code: reg.code } });
    if (existing) {
      console.log(`Skipping duplicate region code: ${reg.code}`);
      regions.push(existing);
      continue;
    }
    const region = await prisma.region.create({
      data: reg,
    });
    regions.push(region);
  }

  // 3. Tạo Business Units (Khối kinh doanh)
  console.log('🏢 Tạo business units...');
  const businessUnits = [];
  const buData = [
    { code: 'BU_HCM_1', name: 'Khối HCM 1', regionId: regions[0].id, description: 'Khối kinh doanh HCM 1' },
    { code: 'BU_HCM_2', name: 'Khối HCM 2', regionId: regions[0].id, description: 'Khối kinh doanh HCM 2' },
    { code: 'BU_DN_1', name: 'Khối Đồng Nai 1', regionId: regions[1].id, description: 'Khối kinh doanh Đồng Nai' },
    { code: 'BU_BD_1', name: 'Khối Bình Dương 1', regionId: regions[2].id, description: 'Khối kinh doanh Bình Dương' },
  ];

  for (const bu of buData) {
    // Check if BU code exists
    const existing = await prisma.businessUnit.findUnique({ where: { code: bu.code } });
    if (existing) {
      console.log(`Skipping duplicate BU code: ${bu.code}`);
      businessUnits.push(existing);
      continue;
    }
    const businessUnit = await prisma.businessUnit.create({
      data: bu,
    });
    businessUnits.push(businessUnit);
  }

  // 4. Tạo Territories (Địa bàn - các quận/huyện)
  console.log('📍 Tạo territories...');
  const territories = [];

  // HCM Quận
  const hcmDistricts = [
    { code: 'Q1', name: 'Quận 1', buIndex: 0 },
    { code: 'Q2', name: 'Quận 2', buIndex: 0 },
    { code: 'Q3', name: 'Quận 3', buIndex: 0 },
    { code: 'Q4', name: 'Quận 4', buIndex: 0 },
    { code: 'Q5', name: 'Quận 5', buIndex: 0 },
    { code: 'Q6', name: 'Quận 6', buIndex: 0 },
    { code: 'Q7', name: 'Quận 7', buIndex: 0 },
    { code: 'Q8', name: 'Quận 8', buIndex: 0 },
    { code: 'Q9', name: 'Quận 9', buIndex: 0 },
    { code: 'Q10', name: 'Quận 10', buIndex: 0 },
    { code: 'Q11', name: 'Quận 11', buIndex: 0 },
    { code: 'Q12', name: 'Quận 12', buIndex: 0 },
    { code: 'BT', name: 'Bình Thạnh', buIndex: 1 },
    { code: 'TB', name: 'Tân Bình', buIndex: 1 },
    { code: 'TD', name: 'Tân Phú', buIndex: 1 },
    { code: 'PN', name: 'Phú Nhuận', buIndex: 1 },
    { code: 'GV', name: 'Gò Vấp', buIndex: 1 },
    { code: 'BTH', name: 'Bình Tân', buIndex: 1 },
    { code: 'CC', name: 'Củ Chi', buIndex: 1 },
    { code: 'HOC', name: 'Hóc Môn', buIndex: 1 },
    { code: 'NB', name: 'Nhà Bè', buIndex: 1 },
    { code: 'CB', name: 'Cần Giờ', buIndex: 1 },
  ];

  // Đồng Nai
  const dnDistricts = [
    { code: 'BH', name: 'Biên Hòa', buIndex: 2 },
    { code: 'LC', name: 'Long Khánh', buIndex: 2 },
    { code: 'XT', name: 'Xuân Lộc', buIndex: 2 },
    { code: 'TN', name: 'Thống Nhất', buIndex: 2 },
    { code: 'CM', name: 'Cẩm Mỹ', buIndex: 2 },
    { code: 'DL', name: 'Định Quán', buIndex: 2 },
    { code: 'TP', name: 'Tân Phú', buIndex: 2 },
    { code: 'VT', name: 'Vĩnh Cửu', buIndex: 2 },
    { code: 'TC', name: 'Trảng Bom', buIndex: 2 },
    { code: 'NH', name: 'Nhơn Trạch', buIndex: 2 },
  ];

  // Bình Dương
  const bdDistricts = [
    { code: 'TDM', name: 'Thủ Dầu Một', buIndex: 3 },
    { code: 'DM', name: 'Dầu Tiếng', buIndex: 3 },
    { code: 'BCT', name: 'Bến Cát', buIndex: 3 },
    { code: 'TUY', name: 'Tân Uyên', buIndex: 3 },
    { code: 'DU', name: 'Dĩ An', buIndex: 3 },
    { code: 'TA', name: 'Tân An', buIndex: 3 },
    { code: 'PH', name: 'Phú Giáo', buIndex: 3 },
    { code: 'BC', name: 'Bàu Bàng', buIndex: 3 },
    { code: 'BTU', name: 'Bắc Tân Uyên', buIndex: 3 },
  ];

  // Tạo territories cho HCM
  for (const dist of hcmDistricts) {
    // Check if territory code exists
    const existing = await prisma.territory.findUnique({ where: { code: dist.code } });
    if (existing) {
      console.log(`Skipping duplicate territory code: ${dist.code}`);
      territories.push(existing);
      continue;
    }
    const territory = await prisma.territory.create({
      data: {
        code: dist.code,
        name: dist.name,
        regionId: regions[0].id,
        businessUnitId: businessUnits[dist.buIndex].id,
        description: `Địa bàn ${dist.name}, TP.HCM`,
      },
    });
    territories.push(territory);
  }

  // Tạo territories cho Đồng Nai
  for (const dist of dnDistricts) {
    // Check if territory code exists
    const existing = await prisma.territory.findUnique({ where: { code: dist.code } });
    if (existing) {
      console.log(`Skipping duplicate territory code: ${dist.code}`);
      territories.push(existing);
      continue;
    }
    const territory = await prisma.territory.create({
      data: {
        code: dist.code,
        name: dist.name,
        regionId: regions[1].id,
        businessUnitId: businessUnits[dist.buIndex].id,
        description: `Địa bàn ${dist.name}, Đồng Nai`,
      },
    });
    territories.push(territory);
  }

  // Tạo territories cho Bình Dương
  for (const dist of bdDistricts) {
    // Check if territory code exists
    const existing = await prisma.territory.findUnique({ where: { code: dist.code } });
    if (existing) {
      console.log(`Skipping duplicate territory code: ${dist.code}`);
      territories.push(existing);
      continue;
    }

    const territory = await prisma.territory.create({
      data: {
        code: dist.code,
        name: dist.name,
        regionId: regions[2].id,
        businessUnitId: businessUnits[dist.buIndex].id,
        description: `Địa bàn ${dist.name}, Bình Dương`,
      },
    });
    territories.push(territory);
  }

  // 5. Tạo Product Groups
  console.log('📦 Tạo product groups...');
  const productGroups = [];

  const groups = [
    { name: 'Thuốc kê đơn', description: 'Các loại thuốc cần kê đơn', order: 1 },
    { name: 'Thuốc không kê đơn', description: 'Thuốc OTC', order: 2 },
    { name: 'Thực phẩm chức năng', description: 'TPCN, vitamin', order: 3 },
    { name: 'Dụng cụ y tế', description: 'Dụng cụ, thiết bị y tế', order: 4 },
    { name: 'Chăm sóc sức khỏe', description: 'Sản phẩm chăm sóc', order: 5 },
  ];

  for (const group of groups) {
    const pg = await prisma.productGroup.create({
      data: group,
    });
    productGroups.push(pg);
  }

  // 7. Tạo Products
  console.log('💊 Tạo products...');
  const products = [];

  const productData = [
    // Thuốc kê đơn
    { code: 'PAR500', name: 'Paracetamol 500mg', unit: 'Vĩ', price: 5000, groupId: productGroups[0].id },
    { code: 'AMO500', name: 'Amoxicillin 500mg', unit: 'Vĩ', price: 8000, groupId: productGroups[0].id },
    { code: 'CIP500', name: 'Ciprofloxacin 500mg', unit: 'Vĩ', price: 12000, groupId: productGroups[0].id },
    { code: 'AZI500', name: 'Azithromycin 500mg', unit: 'Vĩ', price: 15000, groupId: productGroups[0].id },
    { code: 'MET500', name: 'Metformin 500mg', unit: 'Vĩ', price: 3000, groupId: productGroups[0].id },
    { code: 'ATV20', name: 'Atorvastatin 20mg', unit: 'Vĩ', price: 25000, groupId: productGroups[0].id },
    { code: 'AML5', name: 'Amlodipine 5mg', unit: 'Vĩ', price: 10000, groupId: productGroups[0].id },
    { code: 'LOS50', name: 'Losartan 50mg', unit: 'Vĩ', price: 12000, groupId: productGroups[0].id },

    // Thuốc không kê đơn
    { code: 'PANEXT', name: 'Panadol Extra', unit: 'Hộp', price: 45000, groupId: productGroups[1].id },
    { code: 'TUSSIN', name: 'Tussin Cough', unit: 'Chai', price: 35000, groupId: productGroups[1].id },
    { code: 'DECOL', name: 'Decolgen', unit: 'Vỉ', price: 25000, groupId: productGroups[1].id },
    { code: 'BETADIN', name: 'Betadine', unit: 'Chai', price: 55000, groupId: productGroups[1].id },
    { code: 'BAND', name: 'Băng dán y tế', unit: 'Cuộn', price: 15000, groupId: productGroups[1].id },

    // Thực phẩm chức năng
    { code: 'VITC', name: 'Vitamin C 1000mg', unit: 'Hộp', price: 120000, groupId: productGroups[2].id },
    { code: 'VITD', name: 'Vitamin D3 2000IU', unit: 'Hộp', price: 150000, groupId: productGroups[2].id },
    { code: 'OMEGA3', name: 'Omega 3', unit: 'Hộp', price: 200000, groupId: productGroups[2].id },
    { code: 'GLUCOS', name: 'Glucosamine', unit: 'Hộp', price: 180000, groupId: productGroups[2].id },

    // Dụng cụ y tế
    { code: 'THERM', name: 'Nhiệt kế điện tử', unit: 'Cái', price: 150000, groupId: productGroups[3].id },
    { code: 'MASK', name: 'Khẩu trang y tế', unit: 'Hộp', price: 50000, groupId: productGroups[3].id },
    { code: 'SYRING', name: 'Ống tiêm', unit: 'Hộp', price: 30000, groupId: productGroups[3].id },

    // Chăm sóc sức khỏe
    { code: 'SOAP', name: 'Xà phòng diệt khuẩn', unit: 'Chai', price: 45000, groupId: productGroups[4].id },
    { code: 'HAND', name: 'Nước rửa tay', unit: 'Chai', price: 35000, groupId: productGroups[4].id },
  ];

  for (const prod of productData) {
    // Check if product code exists
    const existing = await prisma.product.findUnique({ where: { code: prod.code } });
    if (existing) {
      console.log(`Skipping duplicate product code: ${prod.code}`);
      products.push(existing);
      continue;
    }
    const product = await prisma.product.create({
      data: prod,
    });
    products.push(product);
  }

  // 6. Tạo Pharmacies (Nhà thuốc)
  console.log('🏥 Tạo pharmacies...');
  const pharmacies = [];

  // Tạo pharmacies cho từng territory
  const pharmacyNames = [
    'Long Hưng', 'Minh Đức', 'An Khang', 'Phước Thành', 'Thành Đạt', 'Hương Lan', 'Đức Hòa', 'Mai Linh',
    'Sơn Hà', 'Linh Chi', 'Bảo An', 'Hồng Phát', 'Kim Long', 'Thiên Phú', 'Đông Dương', 'Tây Nam',
    'Bắc Sơn', 'Nam Hải', 'Trung Tâm', 'Ngoại Ô', 'Thành Công', 'Phát Đạt', 'Hưng Thịnh', 'Vạn Phúc',
    'Bình An', 'Hòa Bình', 'Thái Bình', 'An Bình', 'Mỹ Đức', 'Tân Hưng', 'Phú Hưng', 'Quang Hưng',
    'Minh Hưng', 'Đức Hưng', 'Thịnh Hưng', 'Phát Hưng', 'Hưng Lợi', 'Hưng Phát', 'Hưng Thọ', 'Hưng Vượng'
  ];

  const ownerNames = [
    'Nguyễn Văn', 'Trần Thị', 'Lê Văn', 'Phạm Thị', 'Hoàng Văn', 'Võ Thị', 'Đặng Văn', 'Bùi Thị',
    'Đỗ Văn', 'Ngô Thị', 'Lý Văn', 'Vũ Thị', 'Đinh Văn', 'Trương Thị', 'Lương Văn', 'Phan Thị',
    'Vương Văn', 'Dương Thị', 'Hồ Văn', 'Lưu Thị', 'Chu Văn', 'Tôn Thị', 'Trịnh Văn', 'Đinh Thị',
    'Bạch Văn', 'Cao Thị', 'Đào Văn', 'Đỗ Thị', 'Dương Văn', 'Hà Thị', 'Hồng Văn', 'Huỳnh Thị',
    'Khổng Văn', 'Lâm Thị', 'Lê Văn', 'Lý Thị', 'Mạc Văn', 'Mai Thị', 'Nguyễn Văn', 'Phạm Thị'
  ];

  const lastNames = [
    'An', 'Bình', 'Cường', 'Dung', 'Em', 'Phương', 'Giang', 'Hoa', 'Hùng', 'Lan', 'Minh', 'Nga',
    'Phúc', 'Quỳnh', 'Sơn', 'Tuyết', 'Uy', 'Vân', 'Xuân', 'Yến', 'Long', 'Hưng', 'Đức', 'Thành',
    'Hưng', 'Phát', 'Thịnh', 'Lợi', 'Phước', 'Thọ', 'Vượng', 'Bảo', 'Kim', 'Thiên', 'Đông', 'Tây',
    'Bắc', 'Nam', 'Trung', 'Ngoại'
  ];

  // Tọa độ mẫu cho các quận HCM
  const hcmCoordinates = {
    'Q1': { lat: 10.7769, lng: 106.7009, base: 100 },
    'Q2': { lat: 10.7872, lng: 106.7493, base: 200 },
    'Q3': { lat: 10.7820, lng: 106.6900, base: 300 },
    'Q4': { lat: 10.7570, lng: 106.7010, base: 400 },
    'Q5': { lat: 10.7594, lng: 106.6672, base: 500 },
    'Q6': { lat: 10.7465, lng: 106.6350, base: 600 },
    'Q7': { lat: 10.7314, lng: 106.7214, base: 700 },
    'Q8': { lat: 10.7203, lng: 106.6286, base: 800 },
    'Q9': { lat: 10.8428, lng: 106.8097, base: 900 },
    'Q10': { lat: 10.7679, lng: 106.6669, base: 1000 },
    'Q11': { lat: 10.7679, lng: 106.6500, base: 1100 },
    'Q12': { lat: 10.8633, lng: 106.6547, base: 1200 },
    'BT': { lat: 10.8100, lng: 106.7100, base: 1300 },
    'TB': { lat: 10.8014, lng: 106.6583, base: 1400 },
    'TD': { lat: 10.7900, lng: 106.6300, base: 1500 },
    'PN': { lat: 10.7944, lng: 106.6800, base: 1600 },
    'GV': { lat: 10.8383, lng: 106.6883, base: 1700 },
    'BTH': { lat: 10.7656, lng: 106.6033, base: 1800 },
    'CC': { lat: 10.9700, lng: 106.4900, base: 1900 },
    'HOC': { lat: 10.8833, lng: 106.5833, base: 2000 },
    'NB': { lat: 10.6833, lng: 106.7333, base: 2100 },
    'CB': { lat: 10.4167, lng: 106.9667, base: 2200 },
  };

  // Tọa độ mẫu cho Đồng Nai
  const dnCoordinates = {
    'BH': { lat: 10.9500, lng: 106.8200, base: 3000 },
    'LC': { lat: 10.9333, lng: 107.2333, base: 3100 },
    'XT': { lat: 10.9167, lng: 107.4167, base: 3200 },
    'TN': { lat: 10.9833, lng: 107.1500, base: 3300 },
    'CM': { lat: 10.8000, lng: 107.2500, base: 3400 },
    'DL': { lat: 11.1833, lng: 107.3667, base: 3500 },
    'TP': { lat: 11.2833, lng: 107.4167, base: 3600 },
    'VT': { lat: 10.9667, lng: 107.0167, base: 3700 },
    'TC': { lat: 10.9500, lng: 107.0000, base: 3800 },
    'NH': { lat: 10.7167, lng: 106.9000, base: 3900 },
  };

  // Tọa độ mẫu cho Bình Dương
  const bdCoordinates = {
    'TDM': { lat: 10.9667, lng: 106.6500, base: 4000 },
    'DM': { lat: 11.2667, lng: 106.3667, base: 4100 },
    'BCT': { lat: 11.3667, lng: 106.5833, base: 4200 },
    'TUY': { lat: 11.0833, lng: 106.8000, base: 4300 },
    'DU': { lat: 10.9167, lng: 106.7667, base: 4400 },
    'TA': { lat: 11.1500, lng: 106.7000, base: 4500 },
    'PH': { lat: 11.3333, lng: 106.7500, base: 4600 },
    'BC': { lat: 11.4167, lng: 106.6667, base: 4700 },
    'BTU': { lat: 11.2000, lng: 106.8500, base: 4800 },
  };

  // Tạo pharmacies cho từng territory
  let pharmacyCounter = 1;
  for (const territory of territories) {
    const coords = hcmCoordinates[territory.code] || dnCoordinates[territory.code] || bdCoordinates[territory.code];
    if (!coords) continue;

    // Mỗi territory có 5-10 nhà thuốc
    const pharmacyCount = 5 + Math.floor(Math.random() * 6);

    for (let i = 0; i < pharmacyCount; i++) {
      const ownerIndex = Math.floor(Math.random() * ownerNames.length);
      const lastNameIndex = Math.floor(Math.random() * lastNames.length);
      const nameIndex = Math.floor(Math.random() * pharmacyNames.length);

      const ownerName = `${ownerNames[ownerIndex]} ${lastNames[lastNameIndex]}`;
      const pharmacyName = `Nhà thuốc ${pharmacyNames[nameIndex]} ${territory.name}`;

      // Tọa độ ngẫu nhiên trong khu vực
      const lat = coords.lat + (Math.random() - 0.5) * 0.05;
      const lng = coords.lng + (Math.random() - 0.5) * 0.05;

      const phone = `0${28 + Math.floor(Math.random() * 3)}${String(coords.base + i).padStart(7, '0')}`;

      // Check if pharmacy code exists
      const existingPharmacy = await prisma.pharmacy.findUnique({
        where: { code: `NT${String(pharmacyCounter).padStart(4, '0')}` }
      });

      if (existingPharmacy) {
        console.log(`Skipping duplicate pharmacy code: NT${String(pharmacyCounter).padStart(4, '0')}`);
        pharmacies.push(existingPharmacy);
        pharmacyCounter++;
        continue;
      }

      const pharmacy = await prisma.pharmacy.create({
        data: {
          code: `NT${String(pharmacyCounter).padStart(4, '0')}`,
          name: pharmacyName,
          ownerName: ownerName,
          phone: phone,
          email: `nt${pharmacyCounter}@example.com`,
          address: `${Math.floor(Math.random() * 999) + 1} Đường ${lastNames[lastNameIndex]}, ${territory.name}`,
          province: territory.regionId === regions[0].id ? 'TP.HCM' : (territory.regionId === regions[1].id ? 'Đồng Nai' : 'Bình Dương'),
          district: territory.name,
          ward: `Phường ${Math.floor(Math.random() * 20) + 1}`,
          latitude: lat,
          longitude: lng,
          territoryId: territory.id,
          isVerified: Math.random() > 0.3,
          isActive: true,
          images: [],
        },
      });
      pharmacies.push(pharmacy);
      pharmacyCounter++;
    }
  }

  // 8. Tạo Customer Segments (Phân nhóm khách hàng)
  console.log('🏷️  Tạo customer segments...');
  const segments = [];
  const segmentData = [
    { code: 'VIP', name: 'VIP', description: 'Khách hàng VIP', minOrderAmount: 50000000, minOrderCount: 50, benefits: ['Giảm giá 10%', 'Miễn phí vận chuyển', 'Ưu tiên giao hàng'] },
    { code: 'A', name: 'Nhóm A', description: 'Khách hàng nhóm A', minOrderAmount: 20000000, minOrderCount: 20, benefits: ['Giảm giá 5%', 'Miễn phí vận chuyển'] },
    { code: 'B', name: 'Nhóm B', description: 'Khách hàng nhóm B', minOrderAmount: 10000000, minOrderCount: 10, benefits: ['Giảm giá 3%'] },
    { code: 'C', name: 'Nhóm C', description: 'Khách hàng nhóm C', minOrderAmount: 0, minOrderCount: 0, benefits: [] },
  ];

  for (const seg of segmentData) {
    // Check if segment code exists
    const existing = await prisma.customerSegment.findUnique({ where: { code: seg.code } });
    if (existing) {
      console.log(`Skipping duplicate segment code: ${seg.code}`);
      segments.push(existing);
      continue;
    }
    const segment = await prisma.customerSegment.create({
      data: seg,
    });
    segments.push(segment);
  }

  // Gán phân nhóm cho pharmacies
  for (let i = 0; i < pharmacies.length; i++) {
    let segmentId = null;
    if (i < 2) segmentId = segments[0].id; // VIP
    else if (i < 5) segmentId = segments[1].id; // A
    else if (i < 8) segmentId = segments[2].id; // B
    else segmentId = segments[3].id; // C

    await prisma.pharmacy.update({
      where: { id: pharmacies[i].id },
      data: { customerSegmentId: segmentId },
    });
  }

  // 7. Tạo Customer Assignments (Gán khách hàng cho TDV theo địa bàn)
  console.log('🔗 Gán khách hàng cho trình dược viên...');
  const reps = users.filter(u => u.role === 'TDV');

  // Phân bổ territories cho các TDV (mỗi TDV phụ trách 1-2 territories)
  const territoryAssignments = [];
  for (let i = 0; i < reps.length; i++) {
    const territoriesPerRep = Math.ceil(territories.length / reps.length);
    const startIndex = i * territoriesPerRep;
    const endIndex = Math.min(startIndex + territoriesPerRep, territories.length);

    for (let j = startIndex; j < endIndex; j++) {
      if (territories[j]) {
        territoryAssignments.push({
          tdv: reps[i],
          territory: territories[j]
        });
      }
    }
  }

  // Gán pharmacies cho TDV dựa trên territory
  for (const pharmacy of pharmacies) {
    if (!pharmacy.territoryId) continue;

    // Tìm TDV được gán cho territory này
    const assignment = territoryAssignments.find(ta => ta.territory.id === pharmacy.territoryId);
    if (assignment) {
      // Check if assignment exists
      const existingAssignment = await prisma.customerAssignment.findFirst({
        where: {
          userId: assignment.tdv.id,
          pharmacyId: pharmacy.id
        }
      });

      if (!existingAssignment) {
        await prisma.customerAssignment.create({
          data: {
            userId: assignment.tdv.id,
            pharmacyId: pharmacy.id,
            territoryId: pharmacy.territoryId,
            assignedBy: admin.id,
            notes: `Tự động gán theo địa bàn ${assignment.territory.name}`,
          },
        });
      }

      // Check if PharmacyRepPharmacy exists
      const existingRepPharmacy = await prisma.pharmacyRepPharmacy.findFirst({
        where: {
          userId: assignment.tdv.id,
          pharmacyId: pharmacy.id
        }
      });

      if (!existingRepPharmacy) {
        // Tạo PharmacyRepPharmacy để tương thích
        await prisma.pharmacyRepPharmacy.create({
          data: {
            userId: assignment.tdv.id,
            pharmacyId: pharmacy.id,
          },
        });
      }
    }
  }

  // 8. Tạo Visit Plans (Kế hoạch viếng thăm) với frequency
  console.log('📅 Tạo visit plans...');
  const frequencies = ['F1', 'F2', 'F4', 'F8']; // F1: hàng tuần, F2: 2 tuần/lần, F4: hàng tháng, F8: 2 tháng/lần
  const daysOfWeek = [2, 3, 4, 5, 6, 7]; // Thứ 2 đến thứ 7
  const visitTimes = ['08:00', '09:00', '10:00', '14:00', '15:00', '16:00'];
  const purposes = [
    'Giới thiệu sản phẩm mới',
    'Thu thập đơn hàng',
    'Theo dõi tồn kho',
    'Hỗ trợ khách hàng',
    'Tư vấn sản phẩm',
    'Kiểm tra chất lượng dịch vụ'
  ];

  // Tạo visit plans cho 4 tuần tới
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (const assignment of territoryAssignments) {
    const tdv = assignment.tdv;
    const territory = assignment.territory;

    // Lấy tất cả pharmacies trong territory này
    const territoryPharmacies = pharmacies.filter(p => p.territoryId === territory.id);

    for (const pharmacy of territoryPharmacies) {
      // Chọn frequency ngẫu nhiên
      const frequency = frequencies[Math.floor(Math.random() * frequencies.length)];
      const dayOfWeek = daysOfWeek[Math.floor(Math.random() * daysOfWeek.length)];
      const visitTime = visitTimes[Math.floor(Math.random() * visitTimes.length)];
      const purpose = purposes[Math.floor(Math.random() * purposes.length)];

      // Tính số lần viếng thăm dựa trên frequency
      let visitCount = 0;
      if (frequency === 'F1') visitCount = 4; // Hàng tuần = 4 lần/tháng
      else if (frequency === 'F2') visitCount = 2; // 2 tuần/lần = 2 lần/tháng
      else if (frequency === 'F4') visitCount = 1; // Hàng tháng = 1 lần/tháng
      else if (frequency === 'F8') visitCount = 0.5; // 2 tháng/lần = 0.5 lần/tháng

      // Tạo visit plans cho 4 tuần tới
      for (let week = 0; week < 4; week++) {
        if (frequency === 'F8' && week % 2 !== 0) continue; // F8 chỉ mỗi 2 tuần

        // Tính ngày viếng thăm
        const visitDate = new Date(today);
        visitDate.setDate(today.getDate() + (week * 7) + (dayOfWeek - today.getDay()));
        if (visitDate < today) {
          visitDate.setDate(visitDate.getDate() + 7);
        }

        // Bỏ qua nếu không phải F1 và không đúng tuần
        if (frequency === 'F2' && week % 2 !== 0) continue;
        if (frequency === 'F4' && week !== 0) continue;

        // Check if visit plan exists
        const existingPlan = await prisma.visitPlan.findFirst({
          where: {
            userId: tdv.id,
            pharmacyId: pharmacy.id,
            visitDate: visitDate
          }
        });

        if (existingPlan) continue;

        await prisma.visitPlan.create({
          data: {
            userId: tdv.id,
            pharmacyId: pharmacy.id,
            territoryId: territory.id,
            visitDate: visitDate,
            visitTime: visitTime,
            dayOfWeek: dayOfWeek,
            frequency: frequency,
            purpose: purpose,
            notes: `Kế hoạch viếng thăm ${frequency} - ${purpose}`,
            status: 'PLANNED',
          },
        });
      }
    }
  }

  // 7. Tạo Promotions (Khuyến mãi)
  console.log('🎁 Tạo promotions...');
  const promotions = [];
  const now = new Date();
  const nextMonth = new Date(now);
  nextMonth.setMonth(nextMonth.getMonth() + 1);

  const promotionData = [
    {
      code: 'KM001',
      name: 'Giảm giá 10% cho đơn hàng trên 1 triệu',
      description: 'Áp dụng cho tất cả khách hàng',
      type: 'DISCOUNT',
      discountType: 'PERCENTAGE',
      discountValue: 10,
      minOrderAmount: 1000000,
      startDate: now,
      endDate: nextMonth,
      applicableTo: 'ALL',
    },
    {
      code: 'KM002',
      name: 'Mua 2 tặng 1 - Vitamin C',
      description: 'Mua 2 hộp Vitamin C tặng 1 hộp',
      type: 'BUY_X_GET_Y',
      discountType: null,
      discountValue: null,
      minOrderAmount: null,
      startDate: now,
      endDate: nextMonth,
      applicableTo: 'SEGMENT',
      customerSegmentIds: [segments[0].id, segments[1].id], // VIP và A
    },
    {
      code: 'KM003',
      name: 'Miễn phí vận chuyển',
      description: 'Miễn phí vận chuyển cho đơn hàng trên 500k',
      type: 'FREE_SHIPPING',
      discountType: null,
      discountValue: null,
      minOrderAmount: 500000,
      startDate: now,
      endDate: nextMonth,
      applicableTo: 'ALL',
    },
  ];

  for (const promo of promotionData) {
    // Check if promotion code exists
    const existing = await prisma.promotion.findUnique({ where: { code: promo.code } });
    if (existing) {
      console.log(`Skipping duplicate promotion code: ${promo.code}`);
      promotions.push(existing);
      continue;
    }
    const promotion = await prisma.promotion.create({
      data: {
        ...promo,
        customerSegmentIds: promo.customerSegmentIds || [],
        territoryIds: [],
      },
    });
    promotions.push(promotion);
  }

  // Thêm sản phẩm vào promotion KM002
  const vitaminCForPromo = products.find(p => p.code === 'VITC');
  if (vitaminCForPromo && promotions[1]) {
    await prisma.promotionItem.create({
      data: {
        promotionId: promotions[1].id,
        productId: vitaminCForPromo.id,
        quantity: 2,
      },
    });
  }

  // 8. Tạo Loyalty Rewards (Phần thưởng tích lũy)
  console.log('🎁 Tạo loyalty rewards...');
  const rewards = [];
  const vitaminC = products.find(p => p.code === 'VITC');
  const rewardData = [
    { name: 'Voucher 100k', description: 'Voucher giảm giá 100.000đ', pointsRequired: 1000, rewardType: 'VOUCHER', rewardValue: 'VOUCHER100K', stock: 100 },
    { name: 'Voucher 200k', description: 'Voucher giảm giá 200.000đ', pointsRequired: 2000, rewardType: 'VOUCHER', rewardValue: 'VOUCHER200K', stock: 50 },
    { name: 'Giảm giá 5%', description: 'Giảm giá 5% cho đơn hàng tiếp theo', pointsRequired: 500, rewardType: 'DISCOUNT', rewardValue: '5%', stock: null },
    { name: 'Vitamin C miễn phí', description: 'Tặng 1 hộp Vitamin C', pointsRequired: 1500, rewardType: 'PRODUCT', rewardValue: vitaminC?.id || '', stock: 20 },
  ];

  for (const rew of rewardData) {
    const reward = await prisma.loyaltyReward.create({
      data: rew,
    });
    rewards.push(reward);
  }

  // Tạo Loyalty Points cho pharmacies
  console.log('💎 Tạo loyalty points...');
  for (const pharmacy of pharmacies) {
    const points = Math.floor(Math.random() * 5000) + 1000; // 1000-6000 điểm
    await prisma.loyaltyPoint.create({
      data: {
        pharmacyId: pharmacy.id,
        points: points,
        earnedPoints: points + Math.floor(Math.random() * 2000),
        usedPoints: Math.floor(Math.random() * 1000),
        expiredPoints: 0,
      },
    });
  }

  // 9. Tạo Trade Activities (Hoạt động thương mại)
  console.log('🎪 Tạo trade activities...');
  const activities = [];
  const activityData = [
    {
      code: 'TA001',
      name: 'Triển lãm Dược phẩm TP.HCM 2024',
      type: 'EXHIBITION',
      description: 'Triển lãm dược phẩm và thiết bị y tế',
      location: 'Trung tâm Hội chợ & Triển lãm Sài Gòn',
      startDate: new Date(2024, 2, 1),
      endDate: new Date(2024, 2, 5),
      budget: 50000000,
      status: 'PLANNED',
      organizerId: users.find(u => u.role === 'QL')?.id,
      participants: [],
    },
    {
      code: 'TA002',
      name: 'Hội thảo về thuốc tim mạch',
      type: 'SEMINAR',
      description: 'Hội thảo chuyên đề về điều trị tim mạch',
      location: 'Khách sạn Rex, TP.HCM',
      startDate: new Date(2024, 3, 15),
      endDate: new Date(2024, 3, 15),
      budget: 20000000,
      status: 'PLANNED',
      organizerId: users.find(u => u.role === 'QL')?.id,
      participants: [],
    },
  ];

  for (const act of activityData) {
    // Check if activity code exists
    const existing = await prisma.tradeActivity.findUnique({ where: { code: act.code } });
    if (existing) {
      console.log(`Skipping duplicate activity code: ${act.code}`);
      activities.push(existing);
      continue;
    }
    const activity = await prisma.tradeActivity.create({
      data: act,
    });
    activities.push(activity);
  }

  // 10. Tạo KPI Targets và Results
  console.log('📊 Tạo KPI targets...');
  const kpiCurrentYear = new Date().getFullYear();
  const kpiCurrentMonth = new Date().getMonth() + 1;
  const period = `${kpiCurrentYear}-${String(kpiCurrentMonth).padStart(2, '0')}`;

  for (const rep of reps) {
    if (!rep || !rep.id) {
      console.log('Invalid rep:', rep);
      continue;
    }
    // Check if target exists
    let existingTarget;
    try {
      existingTarget = await prisma.kpiTarget.findFirst({
        where: {
          userId: rep.id,
          period: period,
        }
      });
    } catch (e) {
      console.error('Error finding KPI target:', e);
      continue;
    }

    let target;
    if (existingTarget) {
      console.log(`Skipping duplicate KPI target for user: ${rep.employeeCode}`);
      target = existingTarget;
    } else {
      target = await prisma.kpiTarget.create({
        data: {
          userId: rep.id,
          period: period,
          periodType: 'MONTH',
          targetSales: 50000000 + Math.floor(Math.random() * 50000000),
          targetOrders: 20 + Math.floor(Math.random() * 30),
          targetVisits: 15 + Math.floor(Math.random() * 20),
          targetNewCustomers: 2 + Math.floor(Math.random() * 5),
        },
      });
    }

    // Tạo KPI Result
    const actualSales = target.targetSales * (0.7 + Math.random() * 0.4); // 70-110% mục tiêu
    const actualOrders = Math.floor(target.targetOrders * (0.7 + Math.random() * 0.4));
    const actualVisits = Math.floor(target.targetVisits * (0.8 + Math.random() * 0.3));
    const actualNewCustomers = Math.floor(target.targetNewCustomers * (0.5 + Math.random() * 0.8));
    const achievementRate = (actualSales / target.targetSales) * 100;

    // Check if KPI result exists
    const existingResult = await prisma.kpiResult.findUnique({
      where: { targetId: target.id }
    });

    if (existingResult) {
      console.log(`Skipping duplicate KPI result for target: ${target.id}`);
      continue;
    }

    const result = await prisma.kpiResult.create({
      data: {
        targetId: target.id,
        userId: rep.id,
        period: period,
        actualSales: actualSales,
        actualOrders: actualOrders,
        actualVisits: actualVisits,
        actualNewCustomers: actualNewCustomers,
        achievementRate: achievementRate,
      },
    });

    // Tạo Incentive nếu đạt mục tiêu
    if (achievementRate >= 100) {
      const incentiveAmount = actualSales * 0.02; // 2% doanh số
      await prisma.incentive.create({
        data: {
          userId: rep.id,
          period: period,
          kpiResultId: result.id,
          type: 'SALES',
          amount: incentiveAmount,
          description: `Thưởng doanh số tháng ${currentMonth}/${currentYear}`,
          status: 'PENDING',
        },
      });
    }
  }

  // 11. Tạo Product Prices
  console.log('💰 Tạo product prices...');
  for (const product of products) {
    await prisma.productPrice.create({
      data: {
        productId: product.id,
        price: product.price,
        effectiveDate: now,
        isActive: true,
      },
    });
  }

  // 12. Tạo Inventory Items
  console.log('📦 Tạo inventory items...');
  for (const pharmacy of pharmacies) {
    // Shuffle products to pick unique ones
    const shuffledProducts = [...products].sort(() => 0.5 - Math.random());
    const selectedProducts = shuffledProducts.slice(0, 5);

    for (const product of selectedProducts) {
      const quantity = Math.floor(Math.random() * 100) + 10;

      // Check if inventory item exists
      const existingItem = await prisma.inventoryItem.findFirst({
        where: {
          pharmacyId: pharmacy.id,
          productId: product.id
        }
      });

      if (existingItem) continue;

      await prisma.inventoryItem.create({
        data: {
          pharmacyId: pharmacy.id,
          productId: product.id,
          quantity: quantity,
          minStock: 10,
          maxStock: 200,
        },
      });
    }
  }

  // 13. Tạo Orders và OrderItems
  console.log('📋 Tạo orders...');
  const orders = [];
  const orderStatuses = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPING', 'DELIVERED'];

  for (let i = 0; i < 30; i++) {
    const rep = reps[Math.floor(Math.random() * reps.length)];
    const pharmacy = pharmacies[Math.floor(Math.random() * pharmacies.length)];
    const status = orderStatuses[Math.floor(Math.random() * orderStatuses.length)];

    const orderNumber = `ORD${String(i + 1).padStart(6, '0')}`;
    const orderItems = [];
    const numItems = Math.floor(Math.random() * 5) + 1;
    let totalAmount = 0;

    for (let j = 0; j < numItems; j++) {
      const product = products[Math.floor(Math.random() * products.length)];
      const quantity = Math.floor(Math.random() * 10) + 1;
      const price = product.price;
      const subtotal = quantity * price;
      totalAmount += subtotal;

      orderItems.push({
        productId: product.id,
        quantity,
        price,
        subtotal,
      });
    }

    // Check if order exists
    const existingOrder = await prisma.order.findUnique({ where: { orderNumber } });
    if (existingOrder) {
      console.log(`Skipping duplicate order: ${orderNumber}`);
      orders.push(existingOrder);
      continue;
    }

    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId: rep.id,
        pharmacyId: pharmacy.id,
        status,
        totalAmount,
        notes: `Đơn hàng ${i + 1}`,
        items: {
          create: orderItems,
        },
      },
      include: {
        items: true,
      },
    });
    orders.push(order);
  }

  // 14. Tạo Payments (Thanh toán)
  console.log('💳 Tạo payments...');
  for (let i = 0; i < orders.length; i++) {
    if (i % 3 === 0) { // Một số đơn hàng đã thanh toán
      await prisma.payment.create({
        data: {
          orderId: orders[i].id,
          pharmacyId: orders[i].pharmacyId,
          amount: orders[i].totalAmount,
          paymentType: 'FULL',
          paymentMethod: 'BANK_TRANSFER',
          status: 'COMPLETED',
          paidAt: new Date(orders[i].createdAt.getTime() + 24 * 60 * 60 * 1000), // 1 ngày sau
        },
      });
    }
  }

  // 15. Tạo Revenue Stats
  console.log('💰 Tạo revenue stats...');
  const revenueCurrentDate = new Date();
  const revenueCurrentMonth = revenueCurrentDate.getMonth() + 1;
  const revenueCurrentYear = revenueCurrentDate.getFullYear();

  for (let month = revenueCurrentMonth - 2; month <= revenueCurrentMonth; month++) {
    if (month < 1) continue;

    for (const rep of reps) {
      const repOrders = orders.filter(o => o.userId === rep.id);
      const monthOrders = repOrders.filter(o => {
        const orderDate = new Date(o.createdAt);
        return orderDate.getMonth() + 1 === month && orderDate.getFullYear() === revenueCurrentYear;
      });

      const totalAmount = monthOrders.reduce((sum, o) => sum + o.totalAmount, 0);

      if (monthOrders.length > 0) {
        // Check if revenue stat exists
        const existingStat = await prisma.revenueStat.findFirst({
          where: {
            userId: rep.id,
            month: month,
            year: revenueCurrentYear
          }
        });

        if (existingStat) continue;

        await prisma.revenueStat.create({
          data: {
            userId: rep.id,
            month,
            year: revenueCurrentYear,
            totalAmount,
            orderCount: monthOrders.length,
          },
        });
      }
    }
  }

  // 16. Tạo Messages (Chat)
  console.log('💬 Tạo messages...');
  for (let i = 0; i < 20; i++) {
    const sender = reps[Math.floor(Math.random() * reps.length)];
    let receiver = reps[Math.floor(Math.random() * reps.length)];
    while (receiver.id === sender.id) {
      receiver = reps[Math.floor(Math.random() * reps.length)];
    }

    await prisma.message.create({
      data: {
        senderId: sender.id,
        receiverId: receiver.id,
        content: `Tin nhắn mẫu ${i + 1} từ ${sender.name} đến ${receiver.name}`,
        isRead: Math.random() > 0.5,
      },
    });
  }

  console.log('✅ Seed database hoàn tất!');
  console.log(`   - ${users.length} users`);
  console.log(`   - ${productGroups.length} product groups`);
  console.log(`   - ${products.length} products`);
  console.log(`   - ${pharmacies.length} pharmacies`);
  console.log(`   - ${segments.length} customer segments`);
  console.log(`   - ${promotions.length} promotions`);
  console.log(`   - ${rewards.length} loyalty rewards`);
  console.log(`   - ${activities.length} trade activities`);
  console.log(`   - ${orders.length} orders`);
}

main()
  .catch((e) => {
    console.error('❌ Lỗi khi seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

