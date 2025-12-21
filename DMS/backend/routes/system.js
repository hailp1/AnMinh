import express from 'express';
import { prisma } from '../lib/prisma.js';
import adminAuth from '../middleware/adminAuth.js';

const router = express.Router();

// Get all system settings
router.get('/settings', async (req, res) => {
    try {
        const settings = await prisma.systemSetting.findMany();
        // Convert array to object
        const settingsObj = settings.reduce((acc, curr) => {
            acc[curr.key] = curr.value;
            return acc;
        }, {});
        res.json(settingsObj);
    } catch (error) {
        console.error('Error fetching system settings:', error);
        res.status(500).json({ error: 'Lỗi server' });
    }
});

// Update system settings
router.put('/settings', adminAuth, async (req, res) => {
    try {
        const settings = req.body; // Expect key-value object
        const updates = [];

        for (const [key, value] of Object.entries(settings)) {
            // Ensure value is a string
            const strValue = value === null || value === undefined ? '' : String(value);

            updates.push(
                prisma.systemSetting.upsert({
                    where: { key },
                    update: { value: strValue },
                    create: { key, value: strValue }
                })
            );
        }

        await prisma.$transaction(updates);

        // Return updated settings
        const currentSettings = await prisma.systemSetting.findMany();
        const settingsObj = currentSettings.reduce((acc, curr) => {
            acc[curr.key] = curr.value;
            return acc;
        }, {});

        res.json(settingsObj);
    } catch (error) {
        console.error('Error updating system settings:', error);
        res.status(500).json({ error: 'Lỗi server' });
    }
});

// Generate SQL Backup
router.get('/backup/sql', adminAuth, async (req, res) => {
    const { exec } = await import('child_process');

    // Parse DATABASE_URL for credentials if needed, or rely on env vars
    // Assuming container has PGPASSWORD, PGUSER, PGDATABASE env vars or we use connection string
    // Env vars in docker-compose usually map to Postgres container defaults

    // Using pg_dump from postgresql-client
    // Setup env for pg_dump
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

export default router;
