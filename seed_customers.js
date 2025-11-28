import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    console.log('Starting seed...');

    // 1. Find User TDV001
    // Try to find by employeeCode, if not create one
    let user = await prisma.user.findUnique({
        where: { employeeCode: 'TDV001' }
    });

    if (!user) {
        console.log('User TDV001 not found. Creating...');
        user = await prisma.user.create({
            data: {
                employeeCode: 'TDV001',
                name: 'Nguyễn Văn An',
                password: 'password123', // In real app should be hashed
                role: 'TDV',
                phone: '0909000001',
                isActive: true
            }
        });
    }

    console.log(`User: ${user.name} (${user.id})`);

    // 2. Create 200 Pharmacies
    const districts = ['Quận 1', 'Quận 3', 'Quận 5', 'Quận 10', 'Tân Bình', 'Bình Thạnh', 'Gò Vấp', 'Phú Nhuận'];
    const streets = ['Nguyễn Văn Linh', 'Lê Văn Sỹ', 'Cách Mạng Tháng 8', 'Hoàng Văn Thụ', 'Phan Đăng Lưu', 'Nguyễn Kiệm', 'Phạm Văn Đồng'];

    // Clear existing assignments for this user to avoid duplicates if re-run
    await prisma.pharmacyRepPharmacy.deleteMany({ where: { userId: user.id } });
    await prisma.visitPlan.deleteMany({ where: { userId: user.id } });

    // Optional: Delete old pharmacies created by seed (if we can identify them)
    // For now, just create new ones.

    for (let i = 1; i <= 200; i++) {
        const district = districts[Math.floor(Math.random() * districts.length)];
        const street = streets[Math.floor(Math.random() * streets.length)];
        // Random lat/lng around HCMC (10.762622, 106.660172)
        const lat = 10.7 + (Math.random() - 0.5) * 0.1;
        const lng = 106.66 + (Math.random() - 0.5) * 0.1;

        const pharmacy = await prisma.pharmacy.create({
            data: {
                name: `Nhà thuốc An Minh ${i}`,
                code: `KH${Date.now()}${i}`, // Unique code
                phone: `090${Math.floor(Math.random() * 10000000).toString().padStart(7, '0')}`,
                address: `${Math.floor(Math.random() * 100) + 1} ${street}, ${district}, TP.HCM`,
                latitude: lat,
                longitude: lng,
                isActive: true,
                isVerified: true,
            }
        });

        // 3. Assign to TDV
        await prisma.pharmacyRepPharmacy.create({
            data: {
                userId: user.id,
                pharmacyId: pharmacy.id
            }
        });

        // 4. Create Visit Plan (Random day 2-7)
        // Schema: 1=CN, 2=T2, ..., 7=T7
        const dayOfWeek = Math.floor(Math.random() * 6) + 2; // 2 to 7

        // Calculate next date for this dayOfWeek
        const today = new Date();
        const currentDaySchema = today.getDay() + 1; // JS 0=Sun -> Schema 1=Sun

        let daysUntil = dayOfWeek - currentDaySchema;
        if (daysUntil < 0) daysUntil += 7;

        const visitDate = new Date(today);
        visitDate.setDate(today.getDate() + daysUntil);

        await prisma.visitPlan.create({
            data: {
                userId: user.id,
                pharmacyId: pharmacy.id,
                visitDate: visitDate,
                dayOfWeek: dayOfWeek,
                status: 'PLANNED',
                frequency: 'F1'
            }
        });

        if (i % 50 === 0) console.log(`Created ${i} customers...`);
    }

    console.log('Seeding completed!');
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => await prisma.$disconnect());
