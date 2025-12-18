import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

const uploadDir = 'uploads';

// Configure storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Organize by Year-Month/UserId
        const userId = req.body.userId || 'unknown';
        const date = new Date();
        const monthDir = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        const targetDir = path.join(uploadDir, monthDir, userId);

        if (!fs.existsSync(targetDir)) {
            fs.mkdirSync(targetDir, { recursive: true });
        }
        cb(null, targetDir);
    },
    filename: (req, file, cb) => {
        // Filename: CustomerCode_Timestamp_UUID.ext
        const customerCode = req.body.customerCode || 'NOCUST';
        const timestamp = Date.now();
        const ext = path.extname(file.originalname);
        cb(null, `${customerCode}_${timestamp}_${uuidv4()}${ext}`);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Chỉ chấp nhận file ảnh'));
        }
    }
});

// Upload endpoint
router.post('/', upload.single('image'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Vui lòng chọn ảnh' });
        }

        // Return the URL (Need to construct relative path from uploads root)
        // req.file.path is absolute or relative to cwd. 
        // We want URL like /uploads/2023-12/user123/file.jpg

        // Normalize path separators to /
        const relativePath = path.relative(process.cwd(), req.file.path).split(path.sep).join('/');

        const protocol = req.protocol;
        const host = req.get('host');
        const imageUrl = `${protocol}://${host}/${relativePath}`;

        res.json({ url: imageUrl });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ message: 'Lỗi upload ảnh' });
    }
});

export default router;
