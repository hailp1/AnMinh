
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
    console.log('STARTING SETUP (Manual Logic - Fixed Fields)...');
    const user = await prisma.user.findFirst({ where: { employeeCode: 'KA001' } });
    if (!user) { console.error('NO USER KA001'); return; }

    const pharmacies = await prisma.pharmacy.findMany({ take: 10 });
    if (pharmacies.length === 0) { console.error('NO PHARMACIES'); return; }

    // Assign
    for (const p of pharmacies) {
        const existing = await prisma.customerAssignment.findFirst({
            where: { userId: user.id, pharmacyId: p.id }
        });
        if (existing) {
            await prisma.customerAssignment.update({
                where: { id: existing.id },
                data: { isActive: true }
            });
        } else {
            await prisma.customerAssignment.create({
                data: { userId: user.id, pharmacyId: p.id, isActive: true }
            });
        }
    }
    console.log('Assignments done.');

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < 5; i++) {
        const p = pharmacies[i];

        await prisma.visitPlan.deleteMany({
            where: { userId: user.id, pharmacyId: p.id, visitDate: { gte: today } }
        });

        await prisma.visitPlan.create({
            data: {
                userId: user.id,
                pharmacyId: p.id,
                visitDate: new Date(),
                visitTime: `0${8 + i}:00`,
                purpose: 'Demo Check',
                status: 'PLANNED'
            }
        });
        console.log(`Plan created for ${p.name}`);
    }
    console.log('DONE.');
}
main().catch(console.error).finally(() => prisma.$disconnect());
