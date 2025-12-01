import express from 'express';
import { prisma } from '../lib/prisma.js';
import auth from '../middleware/auth.js';
import logger from '../lib/logger.js';

const router = express.Router();

// Get list of contacts (users)
router.get('/contacts', auth, async (req, res) => {
    try {
        const currentUserId = req.user.id;

        // Get all users except current user
        // In a real app, you might want to filter by role or relationship
        const users = await prisma.user.findMany({
            where: {
                id: { not: currentUserId },
                isActive: true
            },
            select: {
                id: true,
                name: true,
                avatar: true,
                role: true,
                employeeCode: true
            },
            orderBy: { name: 'asc' }
        });

        // For each user, get the last message to show preview
        const contactsWithLastMessage = await Promise.all(users.map(async (user) => {
            const lastMessage = await prisma.message.findFirst({
                where: {
                    OR: [
                        { senderId: currentUserId, receiverId: user.id },
                        { senderId: user.id, receiverId: currentUserId }
                    ]
                },
                orderBy: { createdAt: 'desc' },
                take: 1
            });

            // Count unread messages from this user
            const unreadCount = await prisma.message.count({
                where: {
                    senderId: user.id,
                    receiverId: currentUserId,
                    isRead: false
                }
            });

            return {
                ...user,
                lastMessage: lastMessage ? {
                    content: lastMessage.content,
                    createdAt: lastMessage.createdAt,
                    isMe: lastMessage.senderId === currentUserId
                } : null,
                unreadCount
            };
        }));

        // Sort contacts by last message time (most recent first)
        contactsWithLastMessage.sort((a, b) => {
            const dateA = a.lastMessage ? new Date(a.lastMessage.createdAt) : new Date(0);
            const dateB = b.lastMessage ? new Date(b.lastMessage.createdAt) : new Date(0);
            return dateB - dateA;
        });

        res.json(contactsWithLastMessage);
    } catch (error) {
        logger.error('Get contacts error:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
});

// Get messages with a specific user
router.get('/:userId', auth, async (req, res) => {
    try {
        const currentUserId = req.user.id;
        const otherUserId = req.params.userId;

        const messages = await prisma.message.findMany({
            where: {
                OR: [
                    { senderId: currentUserId, receiverId: otherUserId },
                    { senderId: otherUserId, receiverId: currentUserId }
                ]
            },
            orderBy: { createdAt: 'asc' },
            include: {
                sender: {
                    select: { id: true, name: true, avatar: true }
                }
            }
        });

        // Mark messages as read
        await prisma.message.updateMany({
            where: {
                senderId: otherUserId,
                receiverId: currentUserId,
                isRead: false
            },
            data: { isRead: true }
        });

        res.json(messages);
    } catch (error) {
        logger.error('Get messages error:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
});

// Send a message
router.post('/', auth, async (req, res) => {
    try {
        const { receiverId, content } = req.body;
        const senderId = req.user.id;

        if (!receiverId || !content) {
            return res.status(400).json({ message: 'Thiếu thông tin người nhận hoặc nội dung' });
        }

        const message = await prisma.message.create({
            data: {
                senderId,
                receiverId,
                content
            },
            include: {
                sender: {
                    select: { id: true, name: true, avatar: true }
                }
            }
        });

        res.json(message);
    } catch (error) {
        logger.error('Send message error:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
});

export default router;
