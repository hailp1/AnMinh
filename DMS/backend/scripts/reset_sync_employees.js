
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// If running inside container, env vars already set. Ideally we don't reload .env which might conflict.
// But dotenv safe if var exists.
dotenv.config({ path: path.join(__dirname, '../../.env') });

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    console.log('--- RESETTING & SYNCING EMPLOYEES FROM USERS ---');

    // Debug environment
    if (process.env.DATABASE_URL) {
        // Mask password
        const masked = process.env.DATABASE_URL.replace(/:([^:@]+)@/, ':****@');
        console.log(`Using Database: ${masked}`);
    } else {
        console.error('ERROR: DATABASE_URL is not defined.');
        process.exit(1);
    }

    try {
        // 1. Delete All Employees
        try {
            await prisma.employee.deleteMany({});
        } catch (e) {
            console.log('Error deleting employees, trying to unlink first...');
            await prisma.employee.updateMany({ data: { managerId: null } });
            await prisma.employee.deleteMany({});
        }

        console.log('Deleted all existing employees.');

        // 2. Fetch All Users
        const users = await prisma.user.findMany({
            where: { isActive: true },
            include: { manager: true }
        });
        console.log(`Found ${users.length} active users.`);

        // 3. Ensure Positions exist
        const positions = ['CEO', 'BU_HEAD', 'RSM', 'ASM', 'SS', 'TDV', 'TSM', 'ADMIN', 'QL'];
        const posMap = {};

        for (const code of positions) {
            let p = await prisma.orgPosition.findUnique({ where: { code } });
            if (!p) {
                console.log(`Creating missing Position: ${code}`);
                p = await prisma.orgPosition.create({
                    data: {
                        code,
                        name: code,
                        level: positions.indexOf(code),
                        isActive: true
                    }
                });
            }
            posMap[code] = p.id;
        }

        // 4. Create Employees & Map IDs
        const allowedRoles = ['CEO', 'BU_HEAD', 'RSM', 'ASM', 'SS', 'TSM', 'TDV', 'ADMIN', 'QL'];
        const userToEmpMap = {}; // UserId -> EmployeeId

        for (const u of users) {
            const role = u.role ? u.role.toUpperCase() : 'UNKNOWN';

            // STRICT FILTERING: Skip roles not in the whitelist
            // Specifically excludes: KT, DRIVER, IT, ACCOUNTANT, FINANCE, DELIVERY, WAREHOUSE
            if (!allowedRoles.includes(role)) {
                console.log(`Skipping excluded role: ${role} - User: ${u.name}`);
                continue;
            }

            // Map User Role to Position Code
            let posCode = 'TDV'; // Default fallback

            if (role === 'ADMIN') posCode = 'BU_HEAD'; // Map Admin to highest level
            else if (role === 'QL') posCode = 'ASM'; // Map generic Manager to ASM
            else if (['CEO', 'BU_HEAD', 'RSM', 'ASM', 'SS', 'TDV', 'TSM'].includes(role)) {
                posCode = role === 'TSM' ? 'SS' : role;
            }

            // Fallback if posCode not in map
            if (!posMap[posCode]) posCode = 'TDV';

            const emp = await prisma.employee.create({
                data: {
                    employeeCode: u.employeeCode || `EMP_${u.username}`,
                    name: u.name || u.username,
                    email: u.email,
                    phone: u.phone,
                    userId: u.id,
                    positionId: posMap[posCode],
                    status: 'ACTIVE'
                }
            });
            userToEmpMap[u.id] = emp.id;
            // console.log(`Created: ${emp.name} [${posCode}]`);
        }
        console.log(`Updated ${Object.keys(userToEmpMap).length} Employees.`);

        // 5. Link Managers
        for (const u of users) {
            if (u.managerId && userToEmpMap[u.managerId] && userToEmpMap[u.id]) {
                const empId = userToEmpMap[u.id];
                const managerEmpId = userToEmpMap[u.managerId];

                await prisma.employee.update({
                    where: { id: empId },
                    data: { managerId: managerEmpId }
                });
                // console.log(`Linked: ${u.name} -> reports to -> ${u.manager?.name}`);
            }
        }

        console.log('--- SYNC COMPLETE ---');

    } catch (error) {
        console.error('SYNC FAILED:', error);
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
