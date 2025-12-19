import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma.js';
import logger from '../lib/logger.js';
import { validateLogin, validateRegister } from '../middleware/validation.js';

const router = express.Router();

// GET /api/auth/login - Info endpoint
router.get('/login', (req, res) => {
    res.status(405).json({
        message: 'Method not allowed. Use POST to login.',
        info: {
            method: 'POST',
            endpoint: '/api/auth/login',
            body: {
                employeeCode: 'string (required)',
                password: 'string (required)'
            }
        }
    });
});

// Register (disabled unless ALLOW_REGISTER=true)
router.post('/register', validateRegister, async (req, res) => {
    if (process.env.ALLOW_REGISTER !== 'true') {
        return res.status(403).json({ message: 'Registration disabled' });
    }
    try {
        const { name, email, password, role } = req.body;
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) return res.status(400).json({ message: 'Email already in use' });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await prisma.user.create({
            data: { name, email, password: hashedPassword, role: role?.toUpperCase() || 'USER' }
        });

        const payload = { user: { id: user.id, role: user.role } };
        const secret = process.env.JWT_SECRET;

        jwt.sign(payload, secret, { expiresIn: '7d' }, (err, token) => {
            if (err) throw err;
            res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
        });
    } catch (error) {
        logger.error('Register error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Login
router.post('/login', validateLogin, async (req, res) => {
    try {
        const { employeeCode, username, password } = req.body;
        const loginId = employeeCode || username;

        if (!loginId || !password) {
            return res.status(400).json({ message: 'Vui lòng nhập Tên đăng nhập và mật khẩu' });
        }

        // Find user by username (mapped from employeeCode/username) - Case insensitive
        const user = await prisma.user.findFirst({
            where: {
                OR: [
                    { username: { equals: loginId.trim(), mode: 'insensitive' } },
                    { employeeCode: { equals: loginId.trim(), mode: 'insensitive' } }
                ]
            }
        });

        if (!user) {
            logger.info(`LOGIN FAILED: User not found: "${loginId}"`);
            return res.status(400).json({ message: 'Tên đăng nhập hoặc mật khẩu không đúng' });
        }

        logger.info(`LOGIN DEBUG: User found: ${user.username}, Role: ${user.role}, Hash: ${user.password.substring(0, 10)}...`);

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            logger.info(`LOGIN FAILED: Password mismatch for user: ${user.username}`);
            return res.status(400).json({ message: 'Tên đăng nhập hoặc mật khẩu không đúng' });
        }

        // Create Token
        const payload = {
            user: {
                id: user.id,
                role: user.role
            }
        };

        const secret = process.env.JWT_SECRET;

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
                        name: user.name || user.username,
                        username: user.username,
                        role: user.role
                    }
                });
            }
        );
    } catch (error) {
        logger.error('Login error:', error);
        res.status(500).json({
            message: 'Lỗi server',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

export default router;