
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../../.env') });

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    console.log('--- RESTRUCTURING ORG CHART (COMPLEX HIERARCHY) ---');

    // 1. Ensure Positions Exist
    const positions = ['BU_HEAD', 'RSM', 'ASM', 'SS', 'TDV'];
    const posMap = {};

    for (const code of positions) {
        let pos = await prisma.orgPosition.findUnique({ where: { code } });
        if (!pos) {
            console.log(`Creating Position: ${code}`);
            pos = await prisma.orgPosition.create({
                data: { code, name: code, level: positions.indexOf(code) + 1, isActive: true }
            });
        }
        posMap[code] = pos.id;
    }

    // 2. Helper to Create/Update Employee Node
    const ensureNode = async (code, name, positionCode, managerId, userEmail = null) => {
        // Try to find by code
        let emp = await prisma.employee.findUnique({ where: { employeeCode: code } });

        let userId = null;
        if (userEmail) {
            const user = await prisma.user.findFirst({ where: { email: userEmail } });
            if (user) userId = user.id;
            else console.log(`Warning: User ${userEmail} not found for ${name}`);
        }

        const data = {
            name: name,
            positionId: posMap[positionCode],
            managerId: managerId,
            status: userEmail ? 'ACTIVE' : 'VACANT',
            userId: userId
        };

        if (emp) {
            console.log(`Updating Node: ${code} (${name})`);
            emp = await prisma.employee.update({ where: { id: emp.id }, data });
        } else {
            console.log(`Creating Node: ${code} (${name})`);
            emp = await prisma.employee.create({
                data: { employeeCode: code, ...data }
            });
        }
        return emp;
    };

    // --- LEVEL 0: BU HEAD ---
    // Hải (hai.le@amphar.com)
    // Note: Use existing BU Head record if exists to prevent ID shift, or update by code AM_001
    const buHead = await ensureNode('AM_001', 'Lê Phúc Hải', 'BU_HEAD', null, 'hai.le@amphar.com');

    // --- LEVEL 1: RSMs ---

    // 1. RSM Mekong (Vacant)
    await ensureNode('VACANT_RSM_MK', 'RSM Mekong (Trống)', 'RSM', buHead.id, null);

    // 2. RSM HCM (Vacant) -> Parent of HCM branch
    const rsmHcm = await ensureNode('VACANT_RSM_HCM', 'RSM HCM (Trống)', 'RSM', buHead.id, null);

    // 3. RSM SP_HL (Tuấn - Use existing User)
    // tuan.nguyen@amphar.com
    await ensureNode('AM_002', 'Nguyễn Văn Tuấn', 'RSM', buHead.id, 'tuan.nguyen@amphar.com');

    // 4. RSM Central (Vacant)
    await ensureNode('VACANT_RSM_CEN', 'RSM Central (Trống)', 'RSM', buHead.id, null);

    // 5. RSM North (Vacant)
    await ensureNode('VACANT_RSM_NORTH', 'RSM North (Trống)', 'RSM', buHead.id, null);


    // --- LEVEL 2: UNDER RSM HCM ---

    // ASM HCM 1 (Vacant)
    const asmHcm1 = await ensureNode('VACANT_ASM_HCM1', 'ASM HCM 1 (Trống)', 'ASM', rsmHcm.id, null);


    // --- LEVEL 3: UNDER ASM HCM 1 ---

    // SS HCM 1 (Tú - Use existing User)
    // tu.nguyen@amphar.com -> AM_003
    await ensureNode('AM_003', 'Nguyễn Văn Tú', 'SS', asmHcm1.id, 'tu.nguyen@amphar.com');

    console.log('--- RESTRUCTURE COMPLETE ---');
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
