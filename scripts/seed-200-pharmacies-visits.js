import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const DISTRICTS = [
    'Quận 1', 'Quận 3', 'Quận 4', 'Quận 5', 'Quận 6', 'Quận 7', 'Quận 8', 'Quận 10', 'Quận 11', 'Quận 12',
    'Quận Bình Thạnh', 'Quận Gò Vấp', 'Quận Phú Nhuận', 'Quận Tân Bình', 'Quận Tân Phú', 'Quận Bình Tân',
    'TP. Thủ Đức', 'Huyện Bình Chánh', 'Huyện Hóc Môn', 'Huyện Củ Chi', 'Huyện Nhà Bè', 'Huyện Cần Giờ'
];

const STREETS = [
    'Nguyễn Trãi', 'Lê Lợi', 'Nguyễn Huệ', 'Pasteur', 'Hai Bà Trưng', 'Lê Duẩn', 'Nam Kỳ Khởi Nghĩa',
    'Điện Biên Phủ', 'Võ Thị Sáu', 'Cách Mạng Tháng 8', 'Nguyễn Thị Minh Khai', 'Trần Hưng Đạo',
    'Lý Thường Kiệt', 'Hùng Vương', 'An Dương Vương', 'Nguyễn Văn Cừ', 'Phạm Văn Đồng', 'Hoàng Văn Thụ'
];

const PHARMACY_PREFIXES = [
    'Nhà thuốc', 'Quầy thuốc', 'Hiệu thuốc', 'Dược phẩm'
];

const PHARMACY_NAMES = [
    'An Khang', 'Long Châu', 'Pharmacity', 'Minh Châu', 'Thanh Bình', 'Hồng Ngọc', 'Kim Anh',
    'Đức Tâm', 'Phúc An', 'Vạn Phát', 'Bảo Châu', 'Thảo Dược', 'Tâm Đức', 'Việt Mỹ', 'Hoàng Gia'
];

function getRandomItem(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomCoordinate(center, radiusInKm) {
    const r = radiusInKm / 111.32; // Convert km to degrees
    const u = Math.random();
    const v = Math.random();
    const w = r * Math.sqrt(u);
    const t = 2 * Math.PI * v;
    const x = w * Math.cos(t);
    const y = w * Math.sin(t);

    // Adjust for longitude shrinking at higher latitudes
    const newLat = center.lat + x;
    const newLon = center.lon + y / Math.cos(center.lat * (Math.PI / 180));

    return { lat: newLat, lon: newLon };
}

async function main() {
    console.log('🚀 Bắt đầu tạo 200 nhà thuốc và lịch viếng thăm thực tế...\n');

    // 1. Setup User AM01
    const employeeCode = 'AM01';
    const password = 'admin123';
    const hashedPassword = await bcrypt.hash(password, 10);

    let user = await prisma.user.findUnique({ where: { employeeCode } });

    if (!user) {
        // Check if phone exists
        const existingPhone = await prisma.user.findUnique({ where: { phone: '0900000001' } });
        const phone = existingPhone ? `09000${Math.floor(Math.random() * 90000 + 10000)}` : '0900000001';

        // Check if email exists
        const existingEmail = await prisma.user.findUnique({ where: { email: 'am01@anminh.com' } });
        const email = existingEmail ? `am01_${Math.floor(Math.random() * 1000)}@anminh.com` : 'am01@anminh.com';

        user = await prisma.user.create({
            data: {
                name: 'Nhân viên AM01',
                employeeCode,
                routeCode: 'AM01',
                email,
                phone,
                password: hashedPassword,
                role: 'TDV',
                isActive: true,
            },
        });
        console.log('✅ Đã tạo user:', user.name);
    } else {
        console.log('✅ Đã tìm thấy user:', user.name);
    }

    // 2. Create 200 Pharmacies
    console.log('\n🏥 Đang tạo 200 nhà thuốc...');

    const pharmacies = [];
    const HCMC_CENTER = { lat: 10.762622, lon: 106.660172 };

    for (let i = 1; i <= 200; i++) {
        const code = `PHARM_REAL_${String(i).padStart(3, '0')}`;
        const name = `${getRandomItem(PHARMACY_PREFIXES)} ${getRandomItem(PHARMACY_NAMES)} ${i}`;
        const district = getRandomItem(DISTRICTS);
        const street = getRandomItem(STREETS);
        const address = `Số ${Math.floor(Math.random() * 200) + 1} ${street}, ${district}, TP.HCM`;
        const coords = getRandomCoordinate(HCMC_CENTER, 10); // 10km radius

        // Upsert pharmacy
        const pharmacy = await prisma.pharmacy.upsert({
            where: { code },
            update: {
                name,
                address,
                district,
                province: 'TP.HCM',
                latitude: coords.lat,
                longitude: coords.lon,
                isActive: true
            },
            create: {
                code,
                name,
                phone: `09${Math.floor(Math.random() * 100000000).toString().padStart(8, '0')}`,
                address,
                district,
                province: 'TP.HCM',
                latitude: coords.lat,
                longitude: coords.lon,
                isActive: true
            }
        });
        pharmacies.push(pharmacy);
        if (i % 50 === 0) console.log(`   ...đã tạo ${i} nhà thuốc`);
    }
    console.log(`✅ Đã tạo/cập nhật ${pharmacies.length} nhà thuốc.`);

    // 3. Assign Pharmacies to User
    console.log('\n🔗 Đang phân bổ nhà thuốc cho nhân viên...');

    // Clear old assignments for this user
    await prisma.customerAssignment.deleteMany({ where: { userId: user.id } });
    await prisma.pharmacyRepPharmacy.deleteMany({ where: { userId: user.id } });
    await prisma.visitPlan.deleteMany({ where: { userId: user.id } });

    for (const pharmacy of pharmacies) {
        await prisma.customerAssignment.create({
            data: {
                userId: user.id,
                pharmacyId: pharmacy.id,
                isActive: true,
                notes: 'Phân bổ tự động'
            }
        });
        await prisma.pharmacyRepPharmacy.create({
            data: {
                userId: user.id,
                pharmacyId: pharmacy.id
            }
        });
    }
    console.log(`✅ Đã phân bổ ${pharmacies.length} nhà thuốc.`);

    // 4. Create Visit Plans
    console.log('\n📅 Đang tạo lịch viếng thăm...');

    const visitTimes = ['08:00', '09:00', '10:00', '11:00', '13:30', '14:30', '15:30', '16:30'];
    const today = new Date();
    const currentDay = today.getDay(); // 0=Sun
    const daysToMonday = currentDay === 0 ? 1 : (currentDay === 1 ? 0 : 1 - currentDay);
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() + daysToMonday);
    startOfWeek.setHours(8, 0, 0, 0);

    // Distribute 200 pharmacies over 4 weeks (approx 24 days, Mon-Sat)
    // 200 / 24 ~= 8-9 visits per day

    let pharmacyIndex = 0;
    let totalVisits = 0;

    for (let week = 0; week < 4; week++) {
        for (let day = 0; day < 6; day++) { // Mon-Sat
            const visitDate = new Date(startOfWeek);
            visitDate.setDate(startOfWeek.getDate() + (week * 7) + day);

            const dayOfWeek = visitDate.getDay() === 0 ? 7 : visitDate.getDay(); // 2-7

            // Assign ~8 pharmacies per day
            const dailyCount = 8 + Math.floor(Math.random() * 3); // 8-10 visits

            for (let i = 0; i < dailyCount; i++) {
                if (pharmacyIndex >= pharmacies.length) break;

                const pharmacy = pharmacies[pharmacyIndex];
                const visitTime = visitTimes[i % visitTimes.length];

                await prisma.visitPlan.create({
                    data: {
                        userId: user.id,
                        pharmacyId: pharmacy.id,
                        visitDate: visitDate,
                        visitTime: visitTime,
                        dayOfWeek: dayOfWeek,
                        frequency: 'F4', // Monthly
                        purpose: 'Chăm sóc định kỳ',
                        status: 'PLANNED'
                    }
                });

                pharmacyIndex++;
                totalVisits++;
            }
            if (pharmacyIndex >= pharmacies.length) break;
        }
        if (pharmacyIndex >= pharmacies.length) break;
    }

    console.log(`✅ Đã tạo ${totalVisits} lịch viếng thăm trải dài 4 tuần.`);
    console.log('\n🎉 Hoàn tất quá trình khởi tạo dữ liệu thực tế!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
