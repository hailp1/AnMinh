import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('Start seeding KA001 data...');

    // 1. Create/Find User KA001
    const employeeCode = 'KA001';
    const password = await bcrypt.hash('123456', 10);

    const user = await prisma.user.upsert({
        where: { employeeCode },
        update: {
            password,
            role: 'TDV',
            isActive: true
        },
        create: {
            name: 'Trình Dược Viên KA001',
            employeeCode,
            password,
            role: 'TDV',
            email: 'ka001@example.com',
            phone: '0900000001',
            isActive: true
        }
    });

    console.log(`User ${user.employeeCode} ready.`);

    // 2. Create 100 Pharmacies
    const pharmacies = [];
    const districts = ['Quận 1', 'Quận 3', 'Quận 5', 'Quận 10', 'Bình Thạnh', 'Gò Vấp', 'Tân Bình', 'Phú Nhuận'];

    console.log('Creating 100 pharmacies...');

    for (let i = 1; i <= 100; i++) {
        const code = `KH_KA_${i.toString().padStart(3, '0')}`;
        const district = districts[Math.floor(Math.random() * districts.length)];

        // Random coordinates around HCMC (10.762622, 106.660172)
        const lat = 10.7 + (Math.random() - 0.5) * 0.1;
        const lng = 106.6 + (Math.random() - 0.5) * 0.1;

        const pharmacy = await prisma.pharmacy.upsert({
            where: { code },
            update: {},
            create: {
                code,
                name: `Nhà thuốc KA ${i}`,
                ownerName: `Chủ nhà thuốc ${i}`,
                phone: `09${Math.floor(Math.random() * 100000000)}`,
                address: `${i} Đường Số ${Math.floor(Math.random() * 100)}, ${district}, TP.HCM`,
                district,
                province: 'TP.HCM',
                latitude: lat,
                longitude: lng,
                isActive: true
            }
        });
        pharmacies.push(pharmacy);
    }

    // 3. Assign customers to KA001
    console.log('Assigning customers...');
    for (const pharmacy of pharmacies) {
        await prisma.customerAssignment.upsert({
            where: {
                userId_pharmacyId: {
                    userId: user.id,
                    pharmacyId: pharmacy.id
                }
            },
            update: {},
            create: {
                userId: user.id,
                pharmacyId: pharmacy.id,
                assignedBy: 'SYSTEM'
            }
        });
    }

    // 4. Generate Visit Plans
    console.log('Generating visit plans...');

    // Clear existing plans for this user to avoid duplicates if run multiple times
    await prisma.visitPlan.deleteMany({
        where: { userId: user.id }
    });

    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    // Get all days in current month
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

    // Group pharmacies: 50 for F4, 50 for F2
    const groupF4 = pharmacies.slice(0, 50);
    const groupF2 = pharmacies.slice(50, 100);

    // Helper to distribute into weekdays (2-7)
    // 0=Sun, 1=Mon, ..., 6=Sat
    // We want Mon(1) to Sat(6)
    const weekdays = [1, 2, 3, 4, 5, 6];

    // --- Process F4 (Weekly - 4 times/month) ---
    // Distribute 50 customers across 6 days -> ~8-9 customers per day of week
    let dayIndex = 0;

    for (const pharmacy of groupF4) {
        const targetDayOfWeek = weekdays[dayIndex % weekdays.length]; // 1-6
        dayIndex++;

        // Create plan for every occurrence of this day in the month
        for (let d = 1; d <= daysInMonth; d++) {
            const date = new Date(currentYear, currentMonth, d);
            if (date.getDay() === targetDayOfWeek) {
                await prisma.visitPlan.create({
                    data: {
                        userId: user.id,
                        pharmacyId: pharmacy.id,
                        visitDate: date,
                        dayOfWeek: targetDayOfWeek + 1, // Store as 2-7 (CN=1, T2=2...) -> JS getDay 1=Mon -> T2=2
                        frequency: 'F4',
                        status: 'PLANNED'
                    }
                });
            }
        }
    }

    // --- Process F2 (Bi-weekly - 2 times/month) ---
    // Distribute 50 customers across 6 days
    dayIndex = 0;

    for (const pharmacy of groupF2) {
        const targetDayOfWeek = weekdays[dayIndex % weekdays.length]; // 1-6
        dayIndex++;

        // Create plan for 1st and 3rd occurrence (or 2nd and 4th)
        let occurrence = 0;
        for (let d = 1; d <= daysInMonth; d++) {
            const date = new Date(currentYear, currentMonth, d);
            if (date.getDay() === targetDayOfWeek) {
                occurrence++;
                // F2: Visit on 1st and 3rd occurrence
                if (occurrence === 1 || occurrence === 3) {
                    await prisma.visitPlan.create({
                        data: {
                            userId: user.id,
                            pharmacyId: pharmacy.id,
                            visitDate: date,
                            dayOfWeek: targetDayOfWeek + 1,
                            frequency: 'F2',
                            status: 'PLANNED'
                        }
                    });
                }
            }
        }
    }

    console.log('Seeding completed successfully!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
