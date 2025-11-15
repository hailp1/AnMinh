import express from 'express';
import { prisma } from '../lib/prisma.js';

const router = express.Router();

// GET /api/kpi/targets - Lấy danh sách mục tiêu KPI
router.get('/targets', async (req, res) => {
  try {
    const { userId, period, periodType } = req.query;
    
    const where = {};
    if (userId) where.userId = userId;
    if (period) where.period = period;
    if (periodType) where.periodType = periodType;

    const targets = await prisma.kpiTarget.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            employeeCode: true,
          },
        },
        results: true,
      },
      orderBy: { period: 'desc' },
    });

    res.json(targets);
  } catch (error) {
    console.error('Error fetching KPI targets:', error);
    res.status(500).json({ error: 'Lỗi khi lấy danh sách mục tiêu KPI' });
  }
});

// POST /api/kpi/targets - Tạo mục tiêu KPI mới
router.post('/targets', async (req, res) => {
  try {
    const {
      userId,
      period,
      periodType,
      targetSales,
      targetOrders,
      targetVisits,
      targetNewCustomers,
    } = req.body;

    if (!userId || !period || !periodType) {
      return res.status(400).json({ error: 'Thiếu thông tin bắt buộc' });
    }

    const target = await prisma.kpiTarget.create({
      data: {
        userId,
        period,
        periodType,
        targetSales: targetSales || 0,
        targetOrders: targetOrders || 0,
        targetVisits: targetVisits || 0,
        targetNewCustomers: targetNewCustomers || 0,
      },
      include: {
        user: true,
      },
    });

    res.status(201).json(target);
  } catch (error) {
    console.error('Error creating KPI target:', error);
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Mục tiêu KPI cho kỳ này đã tồn tại' });
    }
    res.status(500).json({ error: 'Lỗi khi tạo mục tiêu KPI' });
  }
});

// GET /api/kpi/results - Lấy kết quả KPI
router.get('/results', async (req, res) => {
  try {
    const { userId, period } = req.query;
    
    const where = {};
    if (userId) where.userId = userId;
    if (period) where.period = period;

    const results = await prisma.kpiResult.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            employeeCode: true,
          },
        },
        target: true,
        incentives: true,
      },
      orderBy: { period: 'desc' },
    });

    res.json(results);
  } catch (error) {
    console.error('Error fetching KPI results:', error);
    res.status(500).json({ error: 'Lỗi khi lấy kết quả KPI' });
  }
});

// POST /api/kpi/calculate/:targetId - Tính toán kết quả KPI
router.post('/calculate/:targetId', async (req, res) => {
  try {
    const { targetId } = req.params;

    const target = await prisma.kpiTarget.findUnique({
      where: { id: targetId },
      include: {
        user: true,
      },
    });

    if (!target) {
      return res.status(404).json({ error: 'Không tìm thấy mục tiêu KPI' });
    }

    // Tính toán kết quả thực tế
    const startDate = new Date(target.period + '-01');
    const endDate = new Date(startDate);
    if (target.periodType === 'MONTH') {
      endDate.setMonth(endDate.getMonth() + 1);
    } else if (target.periodType === 'QUARTER') {
      endDate.setMonth(endDate.getMonth() + 3);
    } else {
      endDate.setFullYear(endDate.getFullYear() + 1);
    }

    // Tính doanh số và số đơn hàng
    const orders = await prisma.order.findMany({
      where: {
        userId: target.userId,
        createdAt: {
          gte: startDate,
          lt: endDate,
        },
        status: { not: 'CANCELLED' },
      },
    });

    const actualSales = orders.reduce((sum, o) => sum + o.totalAmount, 0);
    const actualOrders = orders.length;

    // Tính số lần viếng thăm
    const visits = await prisma.visitPlan.findMany({
      where: {
        userId: target.userId,
        visitDate: {
          gte: startDate,
          lt: endDate,
        },
        status: 'COMPLETED',
      },
    });
    const actualVisits = visits.length;

    // Tính khách hàng mới
    const newCustomers = await prisma.customerAssignment.findMany({
      where: {
        userId: target.userId,
        assignedAt: {
          gte: startDate,
          lt: endDate,
        },
      },
    });
    const actualNewCustomers = newCustomers.length;

    // Tính tỷ lệ đạt
    const achievementRate = target.targetSales > 0 
      ? (actualSales / target.targetSales) * 100 
      : 0;

    // Tạo hoặc cập nhật kết quả
    const result = await prisma.kpiResult.upsert({
      where: { targetId },
      update: {
        actualSales,
        actualOrders,
        actualVisits,
        actualNewCustomers,
        achievementRate,
        calculatedAt: new Date(),
      },
      create: {
        targetId,
        userId: target.userId,
        period: target.period,
        actualSales,
        actualOrders,
        actualVisits,
        actualNewCustomers,
        achievementRate,
      },
      include: {
        target: true,
        user: true,
      },
    });

    res.json(result);
  } catch (error) {
    console.error('Error calculating KPI:', error);
    res.status(500).json({ error: 'Lỗi khi tính toán KPI' });
  }
});

// GET /api/kpi/incentives - Lấy danh sách thưởng
router.get('/incentives', async (req, res) => {
  try {
    const { userId, period, status } = req.query;
    
    const where = {};
    if (userId) where.userId = userId;
    if (period) where.period = period;
    if (status) where.status = status;

    const incentives = await prisma.incentive.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            employeeCode: true,
          },
        },
        kpiResult: {
          include: {
            target: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(incentives);
  } catch (error) {
    console.error('Error fetching incentives:', error);
    res.status(500).json({ error: 'Lỗi khi lấy danh sách thưởng' });
  }
});

// POST /api/kpi/incentives - Tạo thưởng mới
router.post('/incentives', async (req, res) => {
  try {
    const {
      userId,
      period,
      kpiResultId,
      type,
      amount,
      description,
    } = req.body;

    if (!userId || !period || !type || !amount) {
      return res.status(400).json({ error: 'Thiếu thông tin bắt buộc' });
    }

    const incentive = await prisma.incentive.create({
      data: {
        userId,
        period,
        kpiResultId,
        type,
        amount,
        description,
        status: 'PENDING',
      },
      include: {
        user: true,
        kpiResult: true,
      },
    });

    res.status(201).json(incentive);
  } catch (error) {
    console.error('Error creating incentive:', error);
    res.status(500).json({ error: 'Lỗi khi tạo thưởng' });
  }
});

// PUT /api/kpi/incentives/:id/approve - Phê duyệt thưởng
router.put('/incentives/:id/approve', async (req, res) => {
  try {
    const incentive = await prisma.incentive.update({
      where: { id: req.params.id },
      data: {
        status: 'APPROVED',
      },
      include: {
        user: true,
      },
    });

    res.json(incentive);
  } catch (error) {
    console.error('Error approving incentive:', error);
    res.status(500).json({ error: 'Lỗi khi phê duyệt thưởng' });
  }
});

// PUT /api/kpi/incentives/:id/pay - Thanh toán thưởng
router.put('/incentives/:id/pay', async (req, res) => {
  try {
    const incentive = await prisma.incentive.update({
      where: { id: req.params.id },
      data: {
        status: 'PAID',
        paidAt: new Date(),
      },
      include: {
        user: true,
      },
    });

    res.json(incentive);
  } catch (error) {
    console.error('Error paying incentive:', error);
    res.status(500).json({ error: 'Lỗi khi thanh toán thưởng' });
  }
});

export default router;

