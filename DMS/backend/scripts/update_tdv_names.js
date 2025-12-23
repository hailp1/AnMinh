import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Danh sách tên tiếng Việt thật
const vietnameseNames = [
    'Nguyễn Văn Hùng',
    'Trần Thị Mai',
    'Lê Hoàng Nam',
    'Phạm Thị Lan',
    'Hoàng Minh Tuấn',
    'Võ Thị Hương',
    'Đặng Quốc Bảo',
    'Bùi Thị Nga',
    'Đỗ Văn Thành',
    'Ngô Thị Linh',
    'Dương Minh Khoa',
    'Lý Thị Thu',
    'Vũ Đức Anh',
    'Phan Thị Hà',
    'Trương Văn Long',
    'Đinh Thị Trang',
    'Hồ Quang Minh',
    'Mai Thị Hồng',
    'Tô Văn Phúc',
    'Lưu Thị Yến',
    'Cao Minh Đức',
    'Chu Thị Hoa',
    'La Văn Sơn',
    'Tạ Thị Nhung',
    'Ông Minh Tâm',
    'Thái Thị Vân',
    'Hà Văn Kiên',
    'Lâm Thị Xuân',
    'Tăng Quốc Huy',
    'Đoàn Thị Phương'
];

async function updateTDVNames() {
    console.log('🔄 Updating TDV names to Vietnamese...\n');

    const tdvs = await prisma.user.findMany({
        where: { role: 'TDV' },
        orderBy: { employeeCode: 'asc' }
    });

    console.log(`Found ${tdvs.length} TDVs to update\n`);

    for (let i = 0; i < tdvs.length && i < vietnameseNames.length; i++) {
        const tdv = tdvs[i];
        const newName = vietnameseNames[i];

        await prisma.user.update({
            where: { id: tdv.id },
            data: { name: newName }
        });

        console.log(`✅ ${tdv.employeeCode}: ${tdv.name} → ${newName}`);
    }

    console.log(`\n✅ Updated ${Math.min(tdvs.length, vietnameseNames.length)} TDV names successfully!`);
}

updateTDVNames()
    .catch(e => {
        console.error('❌ Update failed:', e);
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());
