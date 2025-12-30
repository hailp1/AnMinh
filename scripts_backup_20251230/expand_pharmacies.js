import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Helper to get random item from array
const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

// Helper to generate random coordinates near HCMC
function getRandomLoc(centerLat, centerLng, radiusInKm) {
    const y0 = centerLat;
    const x0 = centerLng;
    const rd = radiusInKm / 111300;
    const u = Math.random();
    const v = Math.random();
    const w = rd * Math.sqrt(u);
    const t = 2 * Math.PI * v;
    const x = w * Math.cos(t);
    const y = w * Math.sin(t);
    return { lat: y + y0, lng: x + x0 };
}

// Danh sách tên nhà thuốc thật
const pharmacyPrefixes = [
    'Nhà Thuốc An Khang',
    'Nhà Thuốc Bảo Châu',
    'Nhà Thuốc Cẩm Tú',
    'Nhà Thuốc Đức Minh',
    'Nhà Thuốc Gia Phúc',
    'Nhà Thuốc Hạnh Phúc',
    'Nhà Thuốc Kim Anh',
    'Nhà Thuốc Long Châu',
    'Nhà Thuốc Mai Hương',
    'Nhà Thuốc Ngọc Lan',
    'Nhà Thuốc Phương Nam',
    'Nhà Thuốc Quốc Dân',
    'Nhà Thuốc Sức Khỏe',
    'Nhà Thuốc Tâm Đức',
    'Nhà Thuốc Uy Tín',
    'Nhà Thuốc Vạn Phúc',
    'Nhà Thuốc Xuân Mai',
    'Nhà Thuốc Yên Bình',
    'Nhà Thuốc Thành Công',
    'Nhà Thuốc Hòa Bình',
    'Nhà Thuốc Minh Châu',
    'Nhà Thuốc Thiên Phúc',
    'Nhà Thuốc Đại Phát',
    'Nhà Thuốc Tân Phát',
    'Nhà Thuốc Hoàng Gia',
    'Nhà Thuốc Thanh Hương',
    'Nhà Thuốc Bình An',
    'Nhà Thuốc Phúc Lộc',
    'Nhà Thuốc Tường Vi',
    'Nhà Thuốc Hồng Phúc'
];

const streetNames = [
    'Nguyễn Huệ', 'Lê Lợi', 'Trần Hưng Đạo', 'Hai Bà Trưng',
    'Võ Văn Tần', 'Pasteur', 'Cách Mạng Tháng 8', 'Lý Thường Kiệt',
    'Điện Biên Phủ', 'Hoàng Văn Thụ', 'Phan Xích Long', 'Nguyễn Thị Minh Khai',
    'Lê Văn Sỹ', 'Nguyễn Đình Chiểu', 'Trường Chinh', 'Xô Viết Nghệ Tĩnh'
];

async function updateAndExpandPharmacies() {
    console.log('🏥 Updating and Expanding Pharmacy Data...\n');

    // 1. Update existing 100 pharmacies with real names
    console.log('📝 Step 1: Updating existing 100 pharmacies...');
    const existingPharmacies = await prisma.pharmacy.findMany({
        orderBy: { code: 'asc' },
        take: 100
    });

    for (let i = 0; i < existingPharmacies.length; i++) {
        const pharmacy = existingPharmacies[i];
        const prefix = getRandom(pharmacyPrefixes);
        const street = getRandom(streetNames);
        const number = Math.floor(Math.random() * 500) + 1;

        await prisma.pharmacy.update({
            where: { id: pharmacy.id },
            data: {
                name: prefix,
                address: `${number} ${street}, ${pharmacy.district}, TP.HCM`
            }
        });

        if ((i + 1) % 20 === 0) {
            console.log(`   Updated ${i + 1}/100 pharmacies...`);
        }
    }
    console.log('✅ Updated 100 existing pharmacies\n');

    // 2. Create 300 new pharmacies
    console.log('📝 Step 2: Creating 300 new pharmacies...');
    const territories = await prisma.territory.findMany();
    const hcmCenter = { lat: 10.7769, lng: 106.7009 };

    const newPharmacies = [];
    for (let i = 101; i <= 400; i++) {
        const code = `KH${i.toString().padStart(4, '0')}`;
        const prefix = getRandom(pharmacyPrefixes);
        const street = getRandom(streetNames);
        const number = Math.floor(Math.random() * 500) + 1;
        const terr = getRandom(territories);
        const loc = getRandomLoc(hcmCenter.lat, hcmCenter.lng, 15);

        const pharmacy = await prisma.pharmacy.create({
            data: {
                code,
                name: prefix,
                address: `${number} ${street}, ${terr.name}, TP.HCM`,
                district: terr.districts[0],
                province: 'Hồ Chí Minh',
                phone: `090${Math.floor(Math.random() * 10000000).toString().padStart(7, '0')}`,
                type: 'PHARMACY',
                channel: 'OTC',
                status: 'ACTIVE',
                latitude: loc.lat,
                longitude: loc.lng,
                territoryId: terr.id,
                visitFrequency: Math.floor(Math.random() * 3) + 2
            }
        });

        newPharmacies.push(pharmacy);

        if (i % 50 === 0) {
            console.log(`   Created ${i - 100}/300 new pharmacies...`);
        }
    }
    console.log('✅ Created 300 new pharmacies\n');

    // 3. Assign new pharmacies to TDVs
    console.log('📝 Step 3: Assigning new pharmacies to TDVs...');
    const tdvs = await prisma.user.findMany({
        where: { role: 'TDV' },
        orderBy: { employeeCode: 'asc' }
    });

    let assignmentCount = 0;
    for (let i = 0; i < newPharmacies.length; i++) {
        const pharmacy = newPharmacies[i];
        const tdv = tdvs[i % tdvs.length]; // Distribute evenly

        await prisma.customerAssignment.create({
            data: {
                userId: tdv.id,
                pharmacyId: pharmacy.id,
                territoryId: pharmacy.territoryId,
                assignedBy: 'SYSTEM',
                isActive: true
            }
        });

        assignmentCount++;
    }

    console.log(`✅ Assigned ${assignmentCount} new customers to ${tdvs.length} TDVs\n`);

    // Summary
    const totalPharmacies = await prisma.pharmacy.count();
    const totalAssignments = await prisma.customerAssignment.count();

    console.log('📊 Summary:');
    console.log(`   Total Pharmacies: ${totalPharmacies}`);
    console.log(`   Total Assignments: ${totalAssignments}`);
    console.log(`   Pharmacies per TDV: ~${Math.floor(totalPharmacies / tdvs.length)}`);

    // Sample names
    const samples = await prisma.pharmacy.findMany({
        take: 5,
        orderBy: { code: 'asc' }
    });

    console.log('\n📋 Sample Pharmacy Names:');
    samples.forEach(p => {
        console.log(`   ${p.code}: ${p.name} - ${p.address}`);
    });
}

updateAndExpandPharmacies()
    .catch(e => {
        console.error('❌ Update failed:', e);
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());
