import express from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../lib/prisma.js';

const router = express.Router();

// ================================
// CHANNEL & GEO STRUCTURE
// ================================

// Get all channels
router.get('/channels', async (req, res) => {
    try {
        const channels = await prisma.channel.findMany({ where: { isActive: true }, include: { children: true } });
        res.json(channels);
    } catch (error) { res.status(500).json({ error: error.message }); }
});

router.get('/sub-channels', async (req, res) => {
    try {
        const { channelId } = req.query;
        const subChannels = await prisma.subChannel.findMany({ where: { input: channelId }, include: { channel: true } });
        res.json(subChannels);
    } catch (error) { res.status(500).json({ error: error.message }); }
});

router.get('/geography', async (req, res) => {
    const countries = await prisma.country.findMany({ include: { regions: { include: { areas: { include: { geoTerritories: true } } } } } });
    res.json(countries);
});

router.get('/positions', async (req, res) => {
    const positions = await prisma.orgPosition.findMany({ where: { isActive: true }, include: { reportsTo: true }, orderBy: { level: 'asc' } });
    res.json(positions);
});

// Employee CRUD
router.get('/employees', async (req, res) => {
    const { positionId, managerId } = req.query;
    const where = {};
    if (positionId) where.positionId = positionId;
    if (managerId) where.managerId = managerId;
    const employees = await prisma.employee.findMany({ where, include: { position: true, manager: true }, orderBy: { name: 'asc' } });
    res.json(employees);
});

router.put('/employees/:id', async (req, res) => {
    try {
        const { managerId } = req.body;
        const employee = await prisma.employee.update({ where: { id: req.params.id }, data: req.body });

        if (managerId && employee.userId) {
            const managerEmployee = await prisma.employee.findUnique({ where: { id: managerId } });
            if (managerEmployee?.userId) {
                await prisma.user.update({ where: { id: employee.userId }, data: { managerId: managerEmployee.userId } });
            }
        }
        res.json(employee);
    } catch (error) { res.status(500).json({ error: error.message }); }
});

router.get('/org-chart', async (req, res) => {
    try {
        const employees = await prisma.employee.findMany({
            where: { status: { in: ['ACTIVE', 'VACANT'] } },
            include: { position: true, manager: true, subordinates: true }
        });
        const topLevel = employees.filter(e => !e.managerId);
        const buildTree = (emp) => ({
            id: emp.id,
            name: emp.name,
            employeeCode: emp.employeeCode,
            position: emp.position?.name,
            subordinates: employees.filter(e => e.managerId === emp.id).map(buildTree)
        });
        res.json(topLevel.map(buildTree));
    } catch (error) { res.status(500).json({ error: error.message }); }
});

// ================================
// ORG SYNC: MAP EXISTING USERS TO ORG CHART
// ================================

router.post('/seed-demo-request', async (req, res) => {
    try {
        logger.info('SYNCING EXISTING USERS TO ORG CHART...');

        // 1. Check Pre-requisites
        const positions = await prisma.orgPosition.findMany();
        const getPosId = (code) => positions.find(p => p.code === code)?.id;
        if (!getPosId('BU_HEAD')) return res.status(400).json({ error: 'System positions missing.' });

        // 2. CLEAN UP ONLY OLD EMPLOYEES & LINKS (KEEP USERS)
        // We delete employees to rebuild the tree connection, but we KEEP Users.
        // Also clean transactional data to ensure fresh start if wanted:
        await prisma.$transaction([
            prisma.visitPlan.deleteMany(),
            prisma.orderItem.deleteMany(),
            prisma.order.deleteMany(),
            prisma.customerAssignment.deleteMany(),
            prisma.territoryKPI.deleteMany(),
            prisma.product.deleteMany(),
            prisma.pharmacy.deleteMany(),
            prisma.customerAssignment.deleteMany(),

            // Delete existing employee records to rebuild (BUT KEEP USERS)
            prisma.employee.deleteMany({ where: { employeeCode: { not: 'ADMIN_SYS' } } })
        ]);

        logger.info('Structure Cleaned. Mapping Users...');

        await prisma.$transaction(async (tx) => {
            const passwordHash = await bcrypt.hash('123456', 10);

            // Helper: Create/Update Manager User & Employee
            const ensureManager = async (code, name, posCode, parentId, email) => {
                // 1. Ensure User exists
                let user = await tx.user.findFirst({ where: { OR: [{ username: code }, { email: email }] } });
                if (!user) {
                    user = await tx.user.create({
                        data: {
                            username: code,
                            password: passwordHash,
                            fullName: name,
                            email: email,
                            role: posCode === 'BU_HEAD' ? 'ADMIN' : 'MANAGER',
                            isActive: true
                        }
                    });
                }

                // 2. Create Employee Record linked to User
                const employee = await tx.employee.create({
                    data: {
                        employeeCode: code,
                        name: user.fullName || name,
                        positionId: getPosId(posCode),
                        managerId: parentId,
                        status: 'ACTIVE',
                        email: user.email,
                        userId: user.id
                    }
                });
                return employee;
            };

            // --- LEVEL 0 & 1: MANAGERS ---
            const buHead = await ensureManager('AM_001', 'Lê Phúc Hải', 'BU_HEAD', null, 'hai.le@amphar.com');
            const rsmTuan = await ensureManager('AM_002', 'Nguyễn Văn Tuấn', 'RSM', buHead.id, 'tuan.nguyen@amphar.com');
            const ssTu = await ensureManager('AM_003', 'Nguyễn Văn Tú', 'TSM', buHead.id, 'tu.nguyen@amphar.com');

            // --- LEVEL 2: ASSIGN EXISTING TDV USERS ---
            // 1. Get all users with role TDV
            const existingTdvs = await tx.user.findMany({
                where: { role: { in: ['TDV', 'PHARMACY_REP'] }, isActive: true },
                orderBy: { createdAt: 'asc' }
            });

            logger.info(`Found ${existingTdvs.length} existing TDVs to assign.`);

            if (existingTdvs.length === 0) {
                // FALLBACK: If no TDVs exist, create some placeholders so the chart isn't empty
                logger.info('No existing TDVs found. Creating placeholders...');
                for (let i = 1; i <= 20; i++) {
                    const code = `TDV${String(i).padStart(3, '0')}`;
                    const u = await tx.user.create({
                        data: {
                            username: code,
                            password: passwordHash,
                            fullName: `Trình Dược Viên ${i}`,
                            email: `tdv${i}@test.com`,
                            role: 'TDV'
                        }
                    });
                    existingTdvs.push(u);
                }
            }

            // 2. Distribute TDVs (60% to Tuan, 40% to Tu of remaining)
            const splitIndex = Math.ceil(existingTdvs.length * 0.6);
            const tuanList = existingTdvs.slice(0, splitIndex);
            const tuList = existingTdvs.slice(splitIndex);

            // Helper: Link User to Employee Record
            const assignToManager = async (userList, managerId) => {
                for (const user of userList) {
                    // Create Employee record for this User
                    // Use user.employeeCode if available, else username
                    const empCode = user.employeeCode || user.username || `EMP_${user.id.substring(0, 6)}`;

                    await tx.employee.create({
                        data: {
                            employeeCode: empCode,
                            name: user.fullName || user.username, // Use User's real name
                            positionId: getPosId('TDV'),
                            managerId: managerId,
                            status: 'ACTIVE',
                            email: user.email,
                            userId: user.id // IMPORTANT: Link to existing User
                        }
                    });

                    // Optional: Update User managerId for direct lookups
                    await tx.user.update({
                        where: { id: user.id },
                        data: { managerId: (await tx.employee.findUnique({ where: { id: managerId } })).userId }
                    });
                }
            };

            await assignToManager(tuanList, rsmTuan.id);
            await assignToManager(tuList, ssTu.id);

            logger.info(`Assigned ${tuanList.length} TDVs to Mr. Tuan`);
            logger.info(`Assigned ${tuList.length} TDVs to Mr. Tu`);
        });

        res.json({ success: true, message: 'Đã cập nhật Org Chart và gán các User TDV có sẵn vào hệ thống thành công!' });
    } catch (error) {
        console.error('Org Sync error:', error);
        res.status(500).json({ error: error.message });
    }
});

export default router;
