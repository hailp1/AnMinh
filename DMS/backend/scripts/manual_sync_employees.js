
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../../.env') });

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    console.log('--- MANUAL SYNC EMPLOYEES START ---');

    // 1. Get Positions
    const posTdv = await prisma.orgPosition.findFirst({ where: { code: 'TDV' } });
    if (!posTdv) {
        console.error('ERROR: Position TDV not found in DB.');
        return;
    }

    // 2. Get Users TDV
    const users = await prisma.user.findMany({ where: { role: 'TDV' } });
    console.log(`Found ${users.length} TDV users in User table.`);

    // 3. Get Manager (Default to any RSM or BU_HEAD if no RSM)
    let manager = await prisma.employee.findFirst({ where: { position: { code: 'RSM' } } });
    if (!manager) {
        manager = await prisma.employee.findFirst({ where: { position: { code: 'BU_HEAD' } } });
    }

    const managerId = manager?.id;
    console.log(`Assigning new employees to Manager: ${manager?.name} (ID: ${managerId || 'None'})`);

    if (!managerId) {
        console.error('WARNING: No Manager found. Employees will have no supervisor.');
    }

    // 4. Create Employee if missing or link if exists
    let createdCount = 0;
    for (const u of users) {
        const code = u.employeeCode || u.username;
        // Search by UserID OR Code
        const existing = await prisma.employee.findFirst({
            where: {
                OR: [
                    { userId: u.id },
                    { employeeCode: code }
                ]
            }
        });

        if (!existing) {
            console.log(`Creating Employee record for User: ${u.username} (${u.fullName})...`);
            try {
                await prisma.employee.create({
                    data: {
                        employeeCode: code,
                        name: u.fullName || u.username,
                        positionId: posTdv.id,
                        managerId: managerId,
                        userId: u.id,
                        status: 'ACTIVE',
                        email: u.email
                    }
                });
                createdCount++;
            } catch (err) {
                console.error(`Failed to create ${code}:`, err.message);
            }
        } else {
            // Found existing employee -> Ensure it is linked to this user
            console.log(`Employee exists for ${u.username} (ID: ${existing.id}). Checking links...`);
            const updates = {};
            if (existing.userId !== u.id) updates.userId = u.id;
            if (!existing.managerId && managerId) updates.managerId = managerId;

            if (Object.keys(updates).length > 0) {
                await prisma.employee.update({
                    where: { id: existing.id },
                    data: updates
                });
                console.log(`-> Updated Employee link: userId=${updates.userId || 'ok'}, managerId=${updates.managerId || 'ok'}`);
            }
        }
    }
    console.log(`--- SYNC COMPLETE. Created ${createdCount} new employees. ---`);
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
