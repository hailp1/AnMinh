
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../../.env') });

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    console.log('--- SEEDING BIZ REVIEW DATA ---');

    // 1. FIX HIERARCHY & RE-SYNC MANAGERS
    // Ensure all TDVs report to SS Tú (AM_003) if they have no manager
    const ssTu = await prisma.user.findFirst({ where: { employeeCode: 'AM_003' } });
    if (ssTu) {
        // Update Users
        const { count } = await prisma.user.updateMany({
            where: { role: 'TDV', managerId: null },
            data: { managerId: ssTu.id }
        });
        console.log(`Assigned ${count} orphan TDVs to SS Tú.`);

        // Sync Employee Managers
        const users = await prisma.user.findMany({ where: { isActive: true } });
        const employees = await prisma.employee.findMany({});

        // Map User ID to Employee
        const userMap = {}; // userId -> user
        users.forEach(u => userMap[u.id] = u);

        const empMap = {}; // userId -> employee
        employees.forEach(e => {
            if (e.userId) empMap[e.userId] = e;
        });

        for (const u of users) {
            if (empMap[u.id] && u.managerId) {
                // Find manager's employee
                const mgrEmp = empMap[u.managerId];
                if (mgrEmp) {
                    await prisma.employee.update({
                        where: { id: empMap[u.id].id },
                        data: { managerId: mgrEmp.id }
                    });
                }
            }
        }
        console.log('Re-synced Employee hierarchy.');
    }

    // 2. PREPARE DATA
    const tdvs = await prisma.user.findMany({ where: { role: 'TDV' } });
    const pharmacies = await prisma.pharmacy.findMany({ take: 50 });
    const products = await prisma.product.findMany({ take: 20 });

    if (tdvs.length === 0 || pharmacies.length === 0 || products.length === 0) {
        console.log('Skipping seed: Not enough master data (TDV, Pharmacy, or Product).');
        return;
    }

    // 3. GENERATE ORDERS & VISITS (Past 30 days)
    const now = new Date();

    console.log('Generating Orders and Visits...');

    for (const tdv of tdvs) {
        // Creates 10-20 visits per TDV
        const visitCount = 10 + Math.floor(Math.random() * 10);

        for (let i = 0; i < visitCount; i++) {
            // Random Date in last 30 days
            const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() - Math.floor(Math.random() * 30));
            const pharmacy = pharmacies[Math.floor(Math.random() * pharmacies.length)];

            // 70% Completed, 30% Skipped/Planned
            const status = Math.random() > 0.3 ? 'COMPLETED' : 'PLANNED';

            // Create Visit Plan
            const visit = await prisma.visitPlan.create({
                data: {
                    userId: tdv.id,
                    pharmacyId: pharmacy.id,
                    visitDate: date,
                    status: status,
                    checkInTime: status === 'COMPLETED' ? date : null,
                    checkOutTime: status === 'COMPLETED' ? new Date(date.getTime() + 15 * 60000) : null
                }
            });

            // 50% Strike Rate (Order created if Visit Completed)
            if (status === 'COMPLETED' && Math.random() > 0.5) {
                // Determine Order Amount
                const numItems = 1 + Math.floor(Math.random() * 5);
                let totalAmount = 0;
                const orderItems = [];

                for (let k = 0; k < numItems; k++) {
                    const prod = products[Math.floor(Math.random() * products.length)];
                    const qty = 1 + Math.floor(Math.random() * 10);
                    const price = prod.price || 100000;
                    const subtotal = qty * price;

                    totalAmount += subtotal;
                    orderItems.push({
                        productId: prod.id,
                        quantity: qty,
                        price: price,
                        subtotal: subtotal
                    });
                }

                if (totalAmount > 0) {
                    await prisma.order.create({
                        data: {
                            orderNumber: `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
                            userId: tdv.id,
                            pharmacyId: pharmacy.id,
                            status: 'COMPLETED',
                            totalAmount: totalAmount,
                            createdAt: date, // Backdate order
                            items: {
                                create: orderItems
                            }
                        }
                    });
                }
            }
        }
    }

    console.log('--- SEEDING COMPLETE ---');
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
