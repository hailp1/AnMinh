import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const count = await prisma.pharmacy.count();
    const productCount = await prisma.product.count();
    const tdv1 = await prisma.customerAssignment.count({ where: { user: { employeeCode: 'TDV001' } } });
    const tdv2 = await prisma.customerAssignment.count({ where: { user: { employeeCode: 'TDV002' } } });

    console.log(`Total Pharmacies: ${count}`);
    console.log(`Total Products: ${productCount}`);
    console.log(`TDV001 Assignments: ${tdv1}`);
    console.log(`TDV002 Assignments: ${tdv2}`);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
