import express from 'express';
import { prisma } from '../lib/prisma.js';
import adminAuth from '../middleware/adminAuth.js';

const router = express.Router();

// Get all system settings
router.get('/init-table', async (req, res) => {
    try {
        await prisma.$executeRawUnsafe(`
            CREATE TABLE IF NOT EXISTS "SystemSetting" (
                "id" TEXT NOT NULL,
                "key" TEXT NOT NULL,
                "value" TEXT,
                "description" TEXT,
                "isActive" BOOLEAN NOT NULL DEFAULT true,
                "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                "updatedAt" TIMESTAMP(3) NOT NULL,
                CONSTRAINT "SystemSetting_pkey" PRIMARY KEY ("id")
            );
        `);
        // Check index separately or ignore if fails (usually safe with simple raw creation)
        try {
            await prisma.$executeRawUnsafe(`CREATE UNIQUE INDEX "SystemSetting_key_key" ON "SystemSetting"("key");`);
        } catch (e) { /* Index might exist */ }

        res.json({ message: 'Table initialized' });
    } catch (error) {
        console.error('Init table error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get all system settings
router.get('/settings', async (req, res) => {
    try {
        const settings = await prisma.$queryRaw`SELECT * FROM "SystemSetting"`;
        const settingsObj = {};
        if (Array.isArray(settings)) {
            settings.reduce((acc, curr) => {
                acc[curr.key] = curr.value;
                return acc;
            }, settingsObj);
        }
        res.json(settingsObj);
    } catch (error) {
        if (error.message.includes('does not exist')) return res.json({});
        console.error('Error fetching system settings:', error);
        res.status(500).json({ error: 'Lỗi server' });
    }
});

// Update system settings
router.put('/settings', adminAuth, async (req, res) => {
    try {
        const settings = req.body;

        await prisma.$transaction(async (tx) => {
            for (const [key, value] of Object.entries(settings)) {
                const strValue = value === null || value === undefined ? '' : String(value);

                const existing = await tx.$queryRaw`SELECT id FROM "SystemSetting" WHERE key = ${key}`;
                if (existing && existing.length > 0) {
                    await tx.$executeRaw`UPDATE "SystemSetting" SET value = ${strValue}, "updatedAt" = NOW() WHERE key = ${key}`;
                } else {
                    const id = (await import('crypto')).randomUUID();
                    await tx.$executeRaw`INSERT INTO "SystemSetting" (id, key, value, "isActive", "createdAt", "updatedAt") VALUES (${id}, ${key}, ${strValue}, true, NOW(), NOW())`;
                }
            }
        });

        // Return updated settings
        const currentSettings = await prisma.$queryRaw`SELECT * FROM "SystemSetting"`;
        const settingsObj = {};
        if (Array.isArray(currentSettings)) {
            currentSettings.reduce((acc, curr) => {
                acc[curr.key] = curr.value;
                return acc;
            }, settingsObj);
        }
        res.json(settingsObj);
    } catch (error) {
        console.error('Error updating system settings:', error);
        res.status(500).json({ error: 'Lỗi server: ' + error.message });
    }
});

// Generate SQL Backup
router.get('/backup/sql', adminAuth, async (req, res) => {
    const { exec } = await import('child_process');
    const env = { ...process.env, PGPASSWORD: process.env.DB_PASSWORD || 'password' }; // Fallback for dev
    const dbUser = process.env.DB_USER || 'postgres';
    const dbHost = process.env.DB_HOST || 'dms_postgres';
    const dbName = process.env.DB_NAME || 'dms_db';

    const filename = `backup_dms_${new Date().toISOString().replace(/[:.]/g, '-')}.sql`;

    res.setHeader('Content-Type', 'application/x-sql');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    const child = exec(`pg_dump -h ${dbHost} -U ${dbUser} -d ${dbName} --clean --if-exists`, { env });

    child.stdout.pipe(res);

    child.stderr.on('data', (data) => {
        console.error('pg_dump error:', data);
    });

    child.on('error', (err) => {
        console.error('Backup process failed:', err);
        if (!res.headersSent) res.status(500).send('Backup failed');
    });
});

// Seed Real Data for Demo
router.get('/seed-real-data', async (req, res) => {
    try {
        console.log('Starting seed real data...');

        // 1. UPDATE CUSTOMER COORDINATES FIRST (Focus HCM)
        // Center of HCM: 10.7769, 106.7009
        const customers = await prisma.pharmacy.findMany();
        let updatedCoordsCount = 0;

        // We need these coordinates for the Visit Check-in
        const updatedCustomers = [];

        for (const cust of customers) {
            // Random offset around +/- 0.05 degrees (approx 5km radius)
            // Use address hash to be deterministic if run multiple times? No, random is fine for mock.
            const latOffset = (Math.random() - 0.5) * 0.1;
            const lngOffset = (Math.random() - 0.5) * 0.1;

            const lat = 10.7769 + latOffset;
            const lng = 106.7009 + lngOffset;

            const updated = await prisma.pharmacy.update({
                where: { id: cust.id },
                data: {
                    latitude: lat,
                    longitude: lng
                }
            });
            updatedCustomers.push(updated);
            updatedCoordsCount++;
        }
        console.log(`Updated coordinates for ${updatedCoordsCount} customers.`);

        // 2. SIMULATE LOGIN ACTIVITY (Create Check-in VisitPlan) FOR 15 SRS
        const tdvs = await prisma.user.findMany({
            where: { role: 'TDV' },
            take: 15
        });

        const today = new Date(); // Current system time
        const startOfDay = new Date(today.setHours(0, 0, 0, 0));
        const endOfDay = new Date(today.setHours(23, 59, 59, 999));

        // Clean up today's visits for these users to avoid duplicates
        await prisma.visitPlan.deleteMany({
            where: {
                userId: { in: tdvs.map(u => u.id) },
                visitDate: { gte: startOfDay, lte: endOfDay }
            }
        });

        let visitsCreated = 0;
        const now = new Date();

        for (const tdv of tdvs) {
            // Check-in time: Randomly within the last 4 hours
            // This ensures they appear "Active" recently
            const randomMinutesAgo = Math.floor(Math.random() * 240);
            const checkInTime = new Date(now.getTime() - randomMinutesAgo * 60000);

            // Pick a random customer to check in with
            if (updatedCustomers.length > 0) {
                const randomCust = updatedCustomers[Math.floor(Math.random() * updatedCustomers.length)];

                // Create Visit Plan & Check In
                await prisma.visitPlan.create({
                    data: {
                        userId: tdv.id,
                        pharmacyId: randomCust.id,
                        visitDate: now, // Use exact current date/time object for visitDate context
                        status: 'IN_PROGRESS', // Currently working
                        checkInTime: checkInTime,
                        checkInLat: randomCust.latitude,
                        checkInLng: randomCust.longitude,
                        purpose: 'Chăm sóc khách hàng sáng',
                        notes: 'Simulated Check-in via Seed'
                    }
                });
                visitsCreated++;
            }
        }
        console.log(`Simulated check-ins for ${visitsCreated} TDVs.`);

        // 3. ASSIGN ROUTES (F4, spread Mon-Sat or T2-T7) for TDVs
        // We will assign available customers to available TDVs.
        // Each TDV gets ~ 40 customers distributed over 6 days.
        let assignedRoutesCount = 0;
        if (tdvs.length > 0 && updatedCustomers.length > 0) {

            // Distribute customers chunks to TDVs
            const customersPerRep = Math.floor(updatedCustomers.length / tdvs.length);

            for (let i = 0; i < tdvs.length; i++) {
                const rep = tdvs[i];
                const repCustomers = updatedCustomers.slice(i * customersPerRep, (i + 1) * customersPerRep);

                // Assign these customers to days 2-7
                for (let j = 0; j < repCustomers.length; j++) {
                    const cust = repCustomers[j];
                    const day = (j % 6) + 2; // 2 (Mon) to 7 (Sat)

                    try {
                        // Create Route for Rep
                        await prisma.route.upsert({
                            where: {
                                userId_pharmacyId_dayOfWeek: {
                                    userId: rep.id,
                                    pharmacyId: cust.id,
                                    dayOfWeek: day
                                }
                            },
                            update: {
                                frequency: 'F4',
                                isActive: true
                            },
                            create: {
                                userId: rep.id,
                                pharmacyId: cust.id,
                                dayOfWeek: day,
                                frequency: 'F4',
                                isActive: true,
                                visitOrder: j
                            }
                        });
                        assignedRoutesCount++;

                        // Also update Customer Assignment table
                        await prisma.customerAssignment.create({
                            data: {
                                userId: rep.id,
                                pharmacyId: cust.id,
                                assignedBy: 'SYSTEM_SEED',
                                isActive: true
                            }
                        }).catch(() => { }); // Ignore unique constraint or already exists

                    } catch (e) {
                        // Likely duplicate assignment
                    }
                }
            }
        }
        console.log(`Assigned ${assignedRoutesCount} route entries.`);

        res.json({
            success: true,
            summary: {
                checkInsCreated: visitsCreated,
                coordinatesUpdated: updatedCoordsCount,
                routesAssigned: assignedRoutesCount
            }
        });

    } catch (error) {
        console.error('Seed real data error:', error);
        res.status(500).json({ error: error.message });
    }
});

export default router;
