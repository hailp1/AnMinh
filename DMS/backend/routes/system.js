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

export default router;
