import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma.js';

const router = express.Router();

// Đăng ký (disabled trừ khi bật ALLOW_REGISTER)
router.post('/register', async (req, res) => {
    if (process.env.ALLOW_REGISTER !== 'true') {
        return res.status(403).json({ message: 'Chức năng đăng ký đã bị vô hiệu hóa' });
    }
    try {
        const { name, email, password, role } = req.body;
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) return res.status(400).json({ message: 'Email đã được sử dụng' });
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const user = await prisma.user.create({
            data: { name, email, password: hashedPassword, role: role?.toUpperCase() || 'USER' }
        });
        const payload = { user: { id: user.id, role: user.role } };
        const secret = process.env.JWT_SECRET;
        if (!secret) return res.status(500).json({ message: 'Thiếu JWT_SECRET' });
        jwt.sign(payload, secret, { expiresIn: '7d' }, (err, token) => {
            if (err) throw err;
            res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Lỗi server');
    }
});

// Đăng nhập bằng Mã NV
router.post('/login', async (req, res) => {
    try {
        const { employeeCode, password } = req.body;

        if (!employeeCode || !password) {
            return res.status(400).json({ message: 'Vui lòng nhập Mã NV và mật khẩu' });
        }

        // Kiểm tra user tồn tại bằng employeeCode
        const user = await prisma.user.findUnique({ 
            where: { employeeCode: employeeCode.toUpperCase().trim() } 
        });
        
        if (!user) {
            return res.status(400).json({ message: 'Mã NV hoặc mật khẩu không đúng' });
        }

        // Kiểm tra user có active không
        if (!user.isActive) {
            return res.status(403).json({ message: 'Tài khoản đã bị khóa' });
        }

        // Kiểm tra password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Mã NV hoặc mật khẩu không đúng' });
        }

        // Tạo JWT token
        const payload = {
            user: {
                id: user.id,
                role: user.role
            }
        };

        const secret = process.env.JWT_SECRET;
        if (!secret) return res.status(500).json({ message: 'Thiếu JWT_SECRET' });
        jwt.sign(
            payload,
            secret,
            { expiresIn: '7d' },
            (err, token) => {
                if (err) throw err;
                res.json({ 
                    token, 
                    user: { 
                        id: user.id, 
                        name: user.name, 
                        employeeCode: user.employeeCode,
                        email: user.email, 
                        phone: user.phone,
                        role: user.role 
                    } 
                });
            }
        );
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
});

export default router;