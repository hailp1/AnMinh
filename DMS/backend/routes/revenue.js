import express from 'express';
import { prisma } from '../lib/prisma.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Lấy thống kê doanh thu
router.get('/', auth, async (req, res) => {
  try {
    const { userId, pharmacyId, startDate, endDate, month, year } = req.query;

    let where = {};

    // Filter by user role
    if (req.user.role === 'PHARMACY_REP' || req.user.role === 'TDV') {
      where.userId = req.user.id;
    } else if (req.user.role === 'PHARMACY') {
      // Lấy thống kê của nhà thuốc
      const pharmacy = await prisma.pharmacy.findFirst({
        where: { phone: req.user.phone },
      });
      if (pharmacy) {
        where.pharmacyId = pharmacy.id;
      }
    }

    // Filter by userId if provided
    if (userId) {
      where.userId = userId;
    }

    // Filter by pharmacyId if provided
    if (pharmacyId) {
      where.pharmacyId = pharmacyId;
    }

    // Filter by month/year if provided
    if (month) {
      where.month = parseInt(month);
    }
    if (year) {
      where.year = parseInt(year);
    }

    // If startDate/endDate provided, calculate from orders instead
    if (startDate || endDate) {
      // Get revenue stats from orders
      const ordersWhere = {};
      
      if (req.user.role === 'PHARMACY_REP' || req.user.role === 'TDV') {
        ordersWhere.userId = req.user.id;
      } else if (req.user.role === 'PHARMACY') {
        const pharmacy = await prisma.pharmacy.findFirst({
          where: { phone: req.user.phone },
        });
        if (pharmacy) {
          ordersWhere.pharmacyId = pharmacy.id;
        }
      }

      if (userId) ordersWhere.userId = userId;
      if (pharmacyId) ordersWhere.pharmacyId = pharmacyId;

      if (startDate) {
        ordersWhere.createdAt = { ...ordersWhere.createdAt, gte: new Date(startDate) };
      }
      if (endDate) {
        ordersWhere.createdAt = { ...ordersWhere.createdAt, lte: new Date(endDate) };
      }
      ordersWhere.status = 'COMPLETED';

      const orders = await prisma.order.findMany({
        where: ordersWhere,
        select: {
          totalAmount: true,
          createdAt: true,
        },
      });

      const totalAmount = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
      const orderCount = orders.length;

      return res.json({
        totalAmount,
        orderCount,
        period: {
          startDate: startDate || null,
          endDate: endDate || null,
        },
      });
    }

    // Get revenue stats from RevenueStat table
    const stats = await prisma.revenueStat.findMany({
      where,
      orderBy: [{ year: 'desc' }, { month: 'desc' }],
      take: 12,
    });

    // Calculate totals
    const totalAmount = stats.reduce((sum, stat) => sum + (stat.totalAmount || 0), 0);
    const orderCount = stats.reduce((sum, stat) => sum + (stat.orderCount || 0), 0);

    res.json({
      stats,
      totalAmount,
      orderCount,
    });
  } catch (error) {
    console.error('Error fetching revenue stats:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
});

export default router;

