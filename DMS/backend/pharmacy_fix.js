import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const pharmacyNames = [
    'Nhà Thuốc Long Châu', 'Nhà Thuốc Phương Chính', 'Nhà Thuốc An Khang',
    'Nhà Thuốc Bảo Châu', 'Nhà Thuốc Cẩm Tú', 'Nhà Thuốc Đức Minh',
    'Nhà Thuốc Bác Sĩ Hùng', 'Nhà Thuốc Dược Sĩ Mai', 'Nhà Thuốc Dược Sĩ Lan',
    'Nhà Thuốc Bác Sĩ Tuấn', 'Nhà Thuốc Dược Sĩ Hương', 'Nhà Thuốc Bác Sĩ Nam',
    'Nhà Thuốc Sài Gòn', 'Nhà Thuốc Tân Bình', 'Nhà Thuốc Bình Thạnh',
    'Nhà Thuốc Gò Vấp', 'Nhà Thuốc Phú Nhuận', 'Nhà Thuốc Thủ Đức',
    'Nhà Thuốc Gia Phúc', 'Nhà Thuốc Hạnh Phúc', 'Nhà Thuốc Kim Anh',
    'Nhà Thuốc Mai Hương', 'Nhà Thuốc Ngọc Lan', 'Nhà Thuốc Phương Nam',
    'Nhà Thuốc Quốc Dân', 'Nhà Thuốc Sức Khỏe', 'Nhà Thuốc Tâm Đức',
    'Nhà Thuốc Uy Tín', 'Nhà Thuốc Vạn Phúc', 'Nhà Thuốc Xuân Mai',
    'Nhà Thuốc Yên Bình', 'Nhà Thuốc Thành Công', 'Nhà Thuốc Hòa Bình',
    'Nhà Thuốc Minh Châu', 'Nhà Thuốc Thiên Phúc', 'Nhà Thuốc Đại Phát',
    'Nhà Thuốc Tân Phát', 'Nhà Thuốc Hoàng Gia', 'Nhà Thuốc Thanh Hương',
    'Nhà Thuốc Bình An', 'Nhà Thuốc Phúc Lộc', 'Nhà Thuốc Tường Vi',
    'Nhà Thuốc Hồng Phúc', 'Nhà Thuốc Thiên Ân', 'Nhà Thuốc Quang Minh',
    'Nhà Thuốc Tân Tiến', 'Nhà Thuốc Đông Y', 'Nhà Thuốc Tây Y',
    'Nhà Thuốc Kết Hợp', 'Nhà Thuốc Gia Đình', 'Nhà Thuốc Cộng Đồng',
    'Nhà Thuốc 24h Sài Gòn', 'Nhà Thuốc 24h Tân Bình', 'Nhà Thuốc 24h Phú Nhuận',
    'Nhà Thuốc Tim Mạch', 'Nhà Thuốc Tiểu Đường', 'Nhà Thuốc Xương Khớp',
    'Nhà Thuốc Da Liễu', 'Nhà Thuốc Nhi Khoa', 'Nhà Thuốc Phụ Khoa'
];

const extendedNames = [];
pharmacyNames.forEach(name => {
    extendedNames.push(name);
    for (let i = 1; i <= 8; i++) {
        extendedNames.push(`${name} Chi Nhánh ${i}`);
    }
});

async function fixDuplicateNames() {
    console.log('🔧 Fixing duplicate pharmacy names...\n');

    const pharmacies = await prisma.pharmacy.findMany({
        orderBy: { code: 'asc' }
    });

    console.log(`Found ${pharmacies.length} pharmacies to update`);

    const usedNames = new Set();
    let updateCount = 0;

    for (const pharmacy of pharmacies) {
        let newName;
        let attempts = 0;

        do {
            if (attempts < extendedNames.length) {
                newName = extendedNames[attempts];
            } else {
                const baseName = pharmacyNames[attempts % pharmacyNames.length];
                const suffix = Math.floor(attempts / pharmacyNames.length) + 1;
                newName = `${baseName} ${suffix}`;
            }
            attempts++;
        } while (usedNames.has(newName) && attempts < 1000);

        usedNames.add(newName);

        await prisma.pharmacy.update({
            where: { id: pharmacy.id },
            data: { name: newName }
        });

        updateCount++;

        if (updateCount % 50 === 0) {
            console.log(`   Updated ${updateCount}/${pharmacies.length} pharmacies...`);
        }
    }

    console.log(`\n✅ Updated ${updateCount} pharmacy names`);

    const duplicateCheck = await prisma.pharmacy.groupBy({
        by: ['name'],
        _count: { name: true },
        having: {
            name: {
                _count: {
                    gt: 1
                }
            }
        }
    });

    if (duplicateCheck.length > 0) {
        console.log(`\n⚠️  Warning: Still found ${duplicateCheck.length} duplicate names`);
    } else {
        console.log('\n✅ No duplicate names found!');
    }

    const samples = await prisma.pharmacy.findMany({
        take: 10,
        orderBy: { code: 'asc' }
    });

    console.log('\n📋 Sample Pharmacy Names:');
    samples.forEach(p => {
        console.log(`   ${p.code}: ${p.name}`);
    });
}

fixDuplicateNames()
    .catch(e => {
        console.error('❌ Failed:', e);
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());
