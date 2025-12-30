
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Seeding Products via Prisma...');
    const products = [];
    for (let i = 1; i <= 20; i++) {
        products.push({
            code: `PROD${i.toString().padStart(3, '0')}`,
            name: `Sản phẩm mẫu Prisma ${i}`,
            price: 100000 + (i * 5000),
            unit: 'Hộp',
            packingSpec: 'Hộp 3 vỉ x 10 viên',
            manufacturer: 'AM Pharma',
            countryOfOrigin: 'Vietnam',
            isActive: true
        });
    }

    for (const p of products) {
        await prisma.product.upsert({
            where: { code: p.code },
            update: {},
            create: p
        });
    }
    console.log(`Seeded ${products.length} products.`);
}

main()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
