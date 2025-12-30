import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🔧 Bắt đầu tạo nhân viên AM01...\n');

  const employeeCode = 'AM01';
  const password = 'admin123';
  const name = 'Nhân viên AM01';

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Kiểm tra xem user đã tồn tại chưa
  let user = await prisma.user.findUnique({
    where: { employeeCode },
  });

  if (user) {
    // Cập nhật user nếu đã tồn tại
    user = await prisma.user.update({
      where: { id: user.id },
      data: {
        name,
        password: hashedPassword,
        role: 'TDV',
        isActive: true,
      },
    });
    console.log('✅ Đã cập nhật user:', user.name, `(${user.employeeCode})`);
  } else {
    // Tạo user mới - kiểm tra số điện thoại và email chưa tồn tại
    let phone = '0900000001';
    let email = 'am01@anminh.com';
    let emailCounter = 1;
    
    // Kiểm tra và tìm số điện thoại và email chưa sử dụng
    while (await prisma.user.findUnique({ where: { phone } })) {
      phone = `09000${String(10000 + emailCounter).slice(-5)}`;
      emailCounter++;
    }
    
    while (await prisma.user.findUnique({ where: { email } })) {
      email = `am01-${emailCounter}@anminh.com`;
      emailCounter++;
    }

    user = await prisma.user.create({
      data: {
        name,
        employeeCode,
        routeCode: 'AM01',
        email: email,
        phone: phone,
        password: hashedPassword,
        role: 'TDV',
        isActive: true,
      },
    });
    console.log('✅ Đã tạo user:', user.name, `(${user.employeeCode})`);
  }

  // Lấy tất cả nhà thuốc đang hoạt động
  const allPharmacies = await prisma.pharmacy.findMany({
    where: { isActive: true },
    take: 15, // Chỉ lấy 15 nhà thuốc đầu tiên
    orderBy: { createdAt: 'asc' },
  });

  if (allPharmacies.length < 15) {
    console.log(`⚠️  Chỉ tìm thấy ${allPharmacies.length} nhà thuốc trong database.`);
    console.log(`   Sẽ gán ${allPharmacies.length} nhà thuốc cho ${employeeCode}.`);
  }

  if (allPharmacies.length === 0) {
    console.log('❌ Không tìm thấy nhà thuốc nào trong database!');
    console.log('   Vui lòng chạy seed script trước: npm run db:seed');
    return;
  }

  console.log(`\n📋 Tìm thấy ${allPharmacies.length} nhà thuốc để gán.`);

  // Xóa các assignment cũ nếu có
  await prisma.customerAssignment.deleteMany({
    where: { userId: user.id },
  });

  await prisma.pharmacyRepPharmacy.deleteMany({
    where: { userId: user.id },
  });

  await prisma.visitPlan.deleteMany({
    where: { userId: user.id },
  });

  console.log('🗑️  Đã xóa các assignment và visit plan cũ (nếu có).\n');

  // Tạo CustomerAssignment và PharmacyRepPharmacy cho mỗi nhà thuốc
  const assignments = [];
  for (const pharmacy of allPharmacies) {
    // Tạo CustomerAssignment
    const assignment = await prisma.customerAssignment.create({
      data: {
        userId: user.id,
        pharmacyId: pharmacy.id,
        territoryId: pharmacy.territoryId,
        isActive: true,
        notes: `Phân bổ cho ${employeeCode}`,
      },
    });
    assignments.push({ assignment, pharmacy });

    // Tạo PharmacyRepPharmacy
    await prisma.pharmacyRepPharmacy.create({
      data: {
        userId: user.id,
        pharmacyId: pharmacy.id,
      },
    });
  }

  console.log(`✅ Đã gán ${assignments.length} nhà thuốc cho ${employeeCode}`);

  // Tạo VisitPlan cho mỗi nhà thuốc, phân bổ vào các ngày trong tuần
  // Thứ 2 (2), Thứ 3 (3), Thứ 4 (4), Thứ 5 (5), Thứ 6 (6), Thứ 7 (7)
  const dayOfWeekMapping = [2, 3, 4, 5, 6, 7]; // Bỏ Chủ nhật
  const visitTimes = ['08:00', '09:00', '10:00', '14:00', '15:00', '16:00'];

  // Tính số nhà thuốc mỗi ngày
  const pharmaciesPerDay = Math.ceil(allPharmacies.length / 6); // Chia đều cho 6 ngày

  console.log(`\n📅 Tạo lịch chăm sóc cho ${allPharmacies.length} nhà thuốc...`);

  const visitPlans = [];
  let pharmacyIndex = 0;

  // Lấy ngày đầu tuần (Thứ 2) của tuần hiện tại
  const today = new Date();
  const currentDay = today.getDay(); // 0=CN, 1=T2, ..., 6=T7
  const daysToMonday = currentDay === 0 ? 1 : (currentDay === 1 ? 0 : 1 - currentDay);
  const thisMonday = new Date(today);
  thisMonday.setDate(today.getDate() + daysToMonday);
  thisMonday.setHours(8, 0, 0, 0);

  for (let dayIndex = 0; dayIndex < 6; dayIndex++) {
    const dayOfWeek = dayOfWeekMapping[dayIndex];
    const visitDate = new Date(thisMonday);
    visitDate.setDate(thisMonday.getDate() + dayIndex);

    // Phân bổ nhà thuốc cho ngày này
    const pharmaciesForDay = allPharmacies.slice(
      pharmacyIndex,
      Math.min(pharmacyIndex + pharmaciesPerDay, allPharmacies.length)
    );

    for (let i = 0; i < pharmaciesForDay.length; i++) {
      const pharmacy = pharmaciesForDay[i];
      const visitTime = visitTimes[i % visitTimes.length];

      // Tính dayOfWeek chính xác
      const planDayOfWeek = visitDate.getDay();
      const mappedDayOfWeek = planDayOfWeek === 0 ? 7 : planDayOfWeek; // CN=7, T2=2, ..., T7=7

      // Tạo visit plan - database đã được sync với schema
      const visitPlan = await prisma.visitPlan.create({
        data: {
          userId: user.id,
          pharmacyId: pharmacy.id,
          territoryId: pharmacy.territoryId || null,
          visitDate: visitDate,
          visitTime: visitTime,
          dayOfWeek: mappedDayOfWeek,
          frequency: 'F1', // F1 = hàng tuần
          purpose: 'Chăm sóc khách hàng',
          notes: `Lịch chăm sóc hàng tuần - ${pharmacy.name}`,
          status: 'PLANNED',
        },
      });

      visitPlans.push(visitPlan);
      console.log(
        `   ✓ ${pharmacy.name} - ${getDayName(mappedDayOfWeek)} ${visitDate.toLocaleDateString('vi-VN')} ${visitTime}`
      );
    }

    pharmacyIndex += pharmaciesForDay.length;
    if (pharmacyIndex >= allPharmacies.length) break;
  }

  console.log(`\n✅ Đã tạo ${visitPlans.length} kế hoạch viếng thăm.\n`);

  // Tóm tắt
  console.log('📊 TÓM TẮT:');
  console.log('═══════════════════════════════════════');
  console.log(`👤 Nhân viên: ${user.name} (${user.employeeCode})`);
  console.log(`🔑 Mật khẩu: ${password}`);
  console.log(`📦 Số nhà thuốc được gán: ${assignments.length}`);
  console.log(`📅 Số kế hoạch viếng thăm: ${visitPlans.length}`);
  console.log('═══════════════════════════════════════\n');

  // Hiển thị lịch theo ngày
  console.log('📅 LỊCH CHĂM SÓC THEO NGÀY:');
  for (let dayIndex = 0; dayIndex < 6; dayIndex++) {
    const dayOfWeek = dayOfWeekMapping[dayIndex];
    const dayName = getDayName(dayOfWeek);
    const visitDate = new Date(thisMonday);
    visitDate.setDate(thisMonday.getDate() + dayIndex);
    const targetDayOfWeek = visitDate.getDay() === 0 ? 7 : visitDate.getDay();
    const plansForDay = visitPlans.filter(
      vp => {
        const planDate = new Date(vp.visitDate);
        const planDayOfWeek = planDate.getDay() === 0 ? 7 : planDate.getDay();
        return planDayOfWeek === targetDayOfWeek;
      }
    );

    if (plansForDay.length > 0) {
      console.log(`\n${dayName} (${visitDate.toLocaleDateString('vi-VN')}):`);
      plansForDay.forEach(plan => {
        const ph = allPharmacies.find(p => p.id === plan.pharmacyId);
        if (ph) {
          console.log(`  • ${ph.name} - ${plan.visitTime}`);
        }
      });
    }
  }

  console.log('\n✅ Hoàn tất!\n');
}

function getDayName(dayOfWeek) {
  const names = {
    1: 'Chủ nhật',
    2: 'Thứ Hai',
    3: 'Thứ Ba',
    4: 'Thứ Tư',
    5: 'Thứ Năm',
    6: 'Thứ Sáu',
    7: 'Thứ Bảy',
  };
  return names[dayOfWeek] || `Thứ ${dayOfWeek}`;
}

main()
  .catch((e) => {
    console.error('❌ Lỗi:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

