import express from 'express';
import { prisma } from '../lib/prisma.js';
const router = express.Router();

// Get settings
router.get('/', async (req, res) => {
    try {
        const settings = await prisma.$queryRaw`SELECT * FROM "SystemSetting"`;
        const result = {};
        if (Array.isArray(settings)) {
            settings.forEach(s => result[s.key] = s.value);
        }
        res.json(result);
    } catch (error) {
        // If table doesn't exist, return empty
        if (error.message.includes('does not exist')) return res.json({});
        console.error('Error fetching settings:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update settings
router.post('/', async (req, res) => {
    try {
        const data = req.body;
        if (!data) return res.status(400).json({ message: 'No data provided' });

        const keys = Object.keys(data);

        // Use transaction with raw queries
        await prisma.$transaction(async (tx) => {
            for (const key of keys) {
                const val = String(data[key]);
                // Check if exists
                const existing = await tx.$queryRaw`SELECT id FROM "SystemSetting" WHERE key = ${key}`;
                if (existing && existing.length > 0) {
                    await tx.$executeRaw`UPDATE "SystemSetting" SET value = ${val}, "updatedAt" = NOW() WHERE key = ${key}`;
                } else {
                    const id = (await import('crypto')).randomUUID();
                    await tx.$executeRaw`INSERT INTO "SystemSetting" (id, key, value, "isActive", "createdAt", "updatedAt") VALUES (${id}, ${key}, ${val}, true, NOW(), NOW())`;
                }
            }
        });

        res.json({ message: 'Cấu hình đã được lưu thành công' });
    } catch (error) {
        console.error('Error saving settings:', error);
        res.status(500).json({ message: 'Server error: ' + error.message });
    }
});

export default router;
