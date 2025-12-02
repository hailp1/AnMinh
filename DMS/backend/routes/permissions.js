import express from 'express';
import { prisma } from '../lib/prisma.js';

const router = express.Router();

// Lấy tất cả cấu hình phân quyền
router.get('/', async (req, res) => {
    try {
        const configs = await prisma.permissionConfig.findMany();
        res.json(configs);
    } catch (error) {
        console.error('Error fetching permissions:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
});

// Cập nhật cấu hình phân quyền cho một Role
router.post('/', async (req, res) => {
    try {
        const { role, permissions } = req.body;

        if (!role || !permissions) {
            return res.status(400).json({ message: 'Thiếu thông tin role hoặc permissions' });
        }

        const config = await prisma.permissionConfig.upsert({
            where: { role },
            update: { permissions },
            create: { role, permissions }
        });

        res.json(config);
    } catch (error) {
        console.error('Error updating permissions:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
});

// Helper: Lấy quyền của user hiện tại (dùng cho frontend check)
router.get('/my-permissions', async (req, res) => {
    try {
        // Giả sử middleware auth đã gán req.user
        // Nếu chưa có middleware auth ở đây, cần check lại
        // Tạm thời lấy userId từ query để test hoặc giả định middleware đã chạy
        const userId = req.user?.id;
        if (!userId) {
            // Fallback for dev/test without full auth middleware on this route yet
            // return res.status(401).json({ message: 'Unauthorized' });
        }

        // Logic thực tế: Lấy role của user -> Lấy permission config
        // ...
        res.json({ message: "Not implemented yet" });
    } catch (error) {
        res.status(500).json({ message: 'Error' });
    }
});

export default router;
