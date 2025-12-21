import express from 'express';
import { prisma } from '../lib/prisma.js';
const router = express.Router();

// Get settings
router.get('/', async (req, res) => {
    try {
        const settings = await prisma.systemSetting.findMany();
        // Convert to Object: { company_name: "ABC", ... }
        const result = {};
        settings.forEach(s => result[s.key] = s.value);
        res.json(result);
    } catch (error) {
        console.error('Error fetching settings:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update settings
router.post('/', async (req, res) => {
    try {
        const data = req.body; // { company_name: "New Name", ... }
        if (!data) return res.status(400).json({ message: 'No data provided' });

        const keys = Object.keys(data);

        await prisma.$transaction(
            keys.map(key =>
                prisma.systemSetting.upsert({
                    where: { key: key },
                    update: { value: String(data[key]) },
                    create: { key: key, value: String(data[key]) }
                })
            )
        );
        res.json({ message: 'Cấu hình đã được lưu thành công' });
    } catch (error) {
        console.error('Error saving settings:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

export default router;
