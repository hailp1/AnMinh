
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../../.env') });
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('--- UPDATING USERS FOR ORG CHART SYNC ---');

    const passwordHash = await bcrypt.hash('123456', 10);

    // Helper to Upsert User
    const ensureUser = async (code, name, email, role, managerId = null) => {
        const userData = {
            username: code,
            name: name,
            email: email,
            role: role,
            employeeCode: code,
            isActive: true,
            password: passwordHash,
            managerId: managerId
        };

        // Check if exists by email or code
        let user = await prisma.user.findFirst({
            where: {
                OR: [{ email: email }, { employeeCode: code }]
            }
        });

        if (user) {
            console.log(`Updating User: ${name}`);
            user = await prisma.user.update({
                where: { id: user.id },
                data: {
                    role: role,
                    managerId: managerId,
                    name: name
                }
            });
        } else {
            console.log(`Creating User: ${name}`);
            user = await prisma.user.create({ data: userData });
        }
        return user;
    };

    // --- LEVEL 0: BU HEAD ---
    const haiLe = await ensureUser('AM_001', 'Lê Phúc Hải', 'hai.le@amphar.com', 'BU_HEAD', null);

    // --- LEVEL 1: DIRECT REPORTS TO BU HEAD ---

    // 1. RSM Mekong (Vacant)
    const rsmMekong = await ensureUser('VAC_RSM_MK', 'RSM Mekong (Trống)', 'vacant.rsm.mekong@amphar.com', 'RSM', haiLe.id);

    // 2. RSM HCM (Vacant)
    const rsmHcm = await ensureUser('VAC_RSM_HCM', 'RSM HCM (Trống)', 'vacant.rsm.hcm@amphar.com', 'RSM', haiLe.id);

    // 3. RSM SP_HL (Nguyễn Văn Tuấn)
    const tuanNguyen = await ensureUser('AM_002', 'Nguyễn Văn Tuấn', 'tuan.nguyen@amphar.com', 'RSM', haiLe.id);

    // 4. RSM Central (Vacant)
    const rsmCentral = await ensureUser('VAC_RSM_CEN', 'RSM Central (Trống)', 'vacant.rsm.central@amphar.com', 'RSM', haiLe.id);

    // 5. RSM North (Vacant)
    const rsmNorth = await ensureUser('VAC_RSM_NORTH', 'RSM North (Trống)', 'vacant.rsm.north@amphar.com', 'RSM', haiLe.id);


    // --- LEVEL 2: UNDER RSM HCM ---

    // ASM HCM 1 (Vacant) -> Reports to RSM HCM (Vacant)
    const asmHcm1 = await ensureUser('VAC_ASM_HCM1', 'ASM HCM 1 (Trống)', 'vacant.asm.hcm1@amphar.com', 'ASM', rsmHcm.id);


    // --- LEVEL 3: UNDER ASM HCM 1 ---

    // SS HCM 1 (Nguyễn Văn Tú) -> Reports to ASM HCM 1 (Vacant)
    const tuNguyen = await ensureUser('AM_003', 'Nguyễn Văn Tú', 'tu.nguyen@amphar.com', 'SS', asmHcm1.id);


    // --- LEVEL 4: TDVs (Example assignments) ---
    // Assign some TDVs to Tu Nguyen (SS)
    const tdvs = await prisma.user.findMany({ where: { role: 'TDV' }, take: 5 });
    for (const tdv of tdvs) {
        // Only update if not assigned or reassigned for demo
        console.log(`Assigning TDV ${tdv.name} to SS Tú`);
        await prisma.user.update({
            where: { id: tdv.id },
            data: { managerId: tuNguyen.id }
        });
    }

    console.log('--- USER HIERARCHY UPDATED ---');
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
