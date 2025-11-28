import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma.js';
import logger from '../lib/logger.js';
import { validateLogin, validateRegister } from '../middleware/validation.js';

const router = express.Router();

// GET /api/auth/login - Thông tin về endpoint (không phải để login)
router.get('/login', (req, res) => {
    res.status(405).json({
        message: 'Method không được phép. Sử dụng POST method để đăng nhập.',
        info: {
            method: 'POST',
            endpoint: '/api/auth/login',
            body: {
                employeeCode: 'string (required)',
                password: 'string (required)'
            },
            example: {
                employeeCode: 'AM01',
                password: 'admin123'
            }
        }
    });
});

// Đăng ký (disabled trừ khi bật ALLOW_REGISTER)
router.post('/register', validateRegister, async (req, res) => {
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
        // Check removed as server.js handles it

        jwt.sign(payload, secret, { expiresIn: '7d' }, (err, token) => {
            if (err) throw err;
            res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
        });
    } catch (error) {
        logger.error('Register error:', {
            message: error.message,
            stack: error.stack,
            email: req.body?.email
        });
        res.status(500).json({ message: 'Lỗi server' });
    }
});

// Đăng nhập bằng Mã NV
router.post('/login', validateLogin, async (req, res) => {
    try {
        // Log request để debug
        logger.debug('Login request received:', {
            method: req.method,
            url: req.url,
            contentType: req.headers['content-type'],
            hasBody: !!req.body,
            bodyKeys: req.body ? Object.keys(req.body) : []
        });

        const { employeeCode, password } = req.body;

        if (!employeeCode || !password) {
            logger.warn('Missing credentials:', { hasEmployeeCode: !!employeeCode, hasPassword: !!password });
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
        // Check removed as server.js handles it

        jwt.sign(
            payload,
            secret,
            { expiresIn: '7d' },
            (err, token) => {
                if (err) {
                    logger.error('JWT sign error:', err);
                    return res.status(500).json({ message: 'Lỗi tạo token' });
                }
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
        logger.error('Login error:', {
            message: error.message,
            stack: error.stack,
            employeeCode: req.body?.employeeCode
        });
        res.status(500).json({
            message: 'Lỗi server',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

export default router;