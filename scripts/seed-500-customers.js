import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Bắt đầu tạo 500 khách hàng tại TP.HCM...');

    // 1. Đảm bảo TDV001 và TDV002 tồn tại
    const hashedPassword = await bcrypt.hash('123456', 10);

    const tdvCodes = ['TDV001', 'TDV002'];
    const tdvs = [];

    for (const code of tdvCodes) {
        let user = await prisma.user.findUnique({ where: { employeeCode: code } });
        if (!user) {
            console.log(`Creating user ${code}...`);
            user = await prisma.user.create({
                data: {
                    name: code === 'TDV001' ? 'Nguyễn Văn An' : 'Trần Thị Bình',
                    employeeCode: code,
                    email: `${code.toLowerCase()}@anminh.com`,
                    phone: code === 'TDV001' ? '0900000001' : '0900000002',
                    password: hashedPassword,
                    role: 'TDV',
                    isActive: true,
                }
            });
        }
        tdvs.push(user);
    }

    // 2. Lấy Region HCM (hoặc tạo nếu chưa có)
    let hcmRegion = await prisma.region.findFirst({ where: { code: 'HCM' } });
    if (!hcmRegion) {
        hcmRegion = await prisma.region.create({
            data: { code: 'HCM', name: 'Thành phố Hồ Chí Minh', description: 'TP.HCM' }
        });
    }

    // 3. Lấy Territories HCM (hoặc tạo)
    const hcmDistricts = [
        { code: 'Q1', name: 'Quận 1', lat: 10.7769, lng: 106.7009 },
        { code: 'Q3', name: 'Quận 3', lat: 10.7820, lng: 106.6900 },
        { code: 'Q4', name: 'Quận 4', lat: 10.7570, lng: 106.7010 },
        { code: 'Q5', name: 'Quận 5', lat: 10.7594, lng: 106.6672 },
        { code: 'Q7', name: 'Quận 7', lat: 10.7314, lng: 106.7214 },
        { code: 'Q10', name: 'Quận 10', lat: 10.7679, lng: 106.6669 },
        { code: 'BT', name: 'Bình Thạnh', lat: 10.8100, lng: 106.7100 },
        { code: 'TB', name: 'Tân Bình', lat: 10.8014, lng: 106.6583 },
        { code: 'GV', name: 'Gò Vấp', lat: 10.8383, lng: 106.6883 },
        { code: 'TP', name: 'Tân Phú', lat: 10.7900, lng: 106.6300 },
    ];

    const territories = [];
    for (const dist of hcmDistricts) {
        let territory = await prisma.territory.findFirst({ where: { code: dist.code } });
        if (!territory) {
            // Cần businessUnitId, lấy cái đầu tiên hoặc tạo dummy
            let bu = await prisma.businessUnit.findFirst({ where: { regionId: hcmRegion.id } });
            if (!bu) {
                bu = await prisma.businessUnit.create({
                    data: { code: 'BU_HCM_1', name: 'Khối HCM 1', regionId: hcmRegion.id }
                });
            }
            territory = await prisma.territory.create({
                data: {
                    code: dist.code,
                    name: dist.name,
                    regionId: hcmRegion.id,
                    businessUnitId: bu.id
                }
            });
        }
        territories.push({ ...territory, baseLat: dist.lat, baseLng: dist.lng });
    }

    // 4. Tạo 500 Pharmacies
    const pharmacyNames = ['An Tâm', 'Bình An', 'Chính Tâm', 'Dân Sinh', 'Hòa Bình', 'Khánh An', 'Minh Châu', 'Phúc An', 'Thanh Tâm', 'Vạn Phước'];
    const pharmacyTypes = ['Nhà thuốc', 'Quầy thuốc', 'Dược phẩm'];

    const pharmaciesData = [];
    const assignmentsData = [];
    const pharmacyRepData = [];

    console.log('Generating data...');

    for (let i = 0; i < 500; i++) {
        const territory = territories[Math.floor(Math.random() * territories.length)];
        const tdv = tdvs[Math.floor(Math.random() * tdvs.length)]; // Randomly assign to TDV001 or TDV002

        // Random coordinate offset
        const lat = territory.baseLat + (Math.random() - 0.5) * 0.04;
        const lng = territory.baseLng + (Math.random() - 0.5) * 0.04;

        const name = `${pharmacyTypes[Math.floor(Math.random() * pharmacyTypes.length)]} ${pharmacyNames[Math.floor(Math.random() * pharmacyNames.length)]} ${i + 1}`;
        const code = `KH_HCM_${String(i + 1).padStart(4, '0')}`;

        // Create pharmacy
        // Note: createMany doesn't return IDs easily in all DBs, but Prisma supports it for Postgres.
        // However, to link assignments, it's safer to create one by one or use a transaction.
        // For 500, one by one is fast enough.

        const pharmacy = await prisma.pharmacy.create({
            data: {
                code,
                name,
                phone: `028${Math.floor(Math.random() * 10000000)}`,
                address: `${Math.floor(Math.random() * 200)} Đường số ${Math.floor(Math.random() * 20)}, ${territory.name}, TP.HCM`,
                province: 'TP.HCM',
                district: territory.name,
                ward: `Phường ${Math.floor(Math.random() * 15) + 1}`,
                latitude: lat,
                longitude: lng,
                territoryId: territory.id,
                isActive: true,
                isVerified: true
            }
        });

        // Assign to TDV
        await prisma.customerAssignment.create({
            data: {
                userId: tdv.id,
                pharmacyId: pharmacy.id,
                territoryId: territory.id,
                isActive: true,
                notes: 'Phân bổ tự động'
            }
        });

        // Also create PharmacyRepPharmacy for compatibility
        await prisma.pharmacyRepPharmacy.create({
            data: {
                userId: tdv.id,
                pharmacyId: pharmacy.id
            }
        });

        if ((i + 1) % 50 === 0) console.log(`Created ${i + 1}/500 pharmacies...`);
    }

    console.log('✅ Hoàn tất tạo 500 khách hàng và phân bổ cho TDV001, TDV002.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
