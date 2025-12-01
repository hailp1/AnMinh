import express from 'express';
import { prisma } from '../lib/prisma.js';

const router = express.Router();

// GET /api/loyalty/points/:pharmacyId - Lấy điểm tích lũy của nhà thuốc
router.get('/points/:pharmacyId', async (req, res) => {
  try {
    let loyaltyPoint = await prisma.loyaltyPoint.findUnique({
      where: { pharmacyId: req.params.pharmacyId },
      include: {
        transactions: {
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
      },
    });

    // Tạo nếu chưa có
    if (!loyaltyPoint) {
      loyaltyPoint = await prisma.loyaltyPoint.create({
        data: {
          pharmacyId: req.params.pharmacyId,
          points: 0,
          earnedPoints: 0,
          usedPoints: 0,
          expiredPoints: 0,
        },
      });
    }

    res.json(loyaltyPoint);
  } catch (error) {
    console.error('Error fetching loyalty points:', error);
    res.status(500).json({ error: 'Lỗi khi lấy điểm tích lũy' });
  }
});

// POST /api/loyalty/points/:pharmacyId/earn - Tích điểm
router.post('/points/:pharmacyId/earn', async (req, res) => {
  try {
    const { points, orderId, description, expiresAt } = req.body;

    if (!points || points <= 0) {
      return res.status(400).json({ error: 'Số điểm không hợp lệ' });
    }

    // Lấy hoặc tạo loyalty point
    let loyaltyPoint = await prisma.loyaltyPoint.findUnique({
      where: { pharmacyId: req.params.pharmacyId },
    });

    if (!loyaltyPoint) {
      loyaltyPoint = await prisma.loyaltyPoint.create({
        data: {
          pharmacyId: req.params.pharmacyId,
          points: 0,
          earnedPoints: 0,
          usedPoints: 0,
          expiredPoints: 0,
        },
      });
    }

    // Tạo transaction
    const transaction = await prisma.loyaltyTransaction.create({
      data: {
        loyaltyPointId: loyaltyPoint.id,
        orderId,
        type: 'EARNED',
        points,
        description: description || `Tích điểm từ đơn hàng`,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      },
    });

    // Cập nhật điểm
    await prisma.loyaltyPoint.update({
      where: { id: loyaltyPoint.id },
      data: {
        points: loyaltyPoint.points + points,
        earnedPoints: loyaltyPoint.earnedPoints + points,
      },
    });

    const updated = await prisma.loyaltyPoint.findUnique({
      where: { id: loyaltyPoint.id },
      include: {
        transactions: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    res.json(updated);
  } catch (error) {
    console.error('Error earning points:', error);
    res.status(500).json({ error: 'Lỗi khi tích điểm' });
  }
});

// GET /api/loyalty/rewards - Lấy danh sách phần thưởng
router.get('/rewards', async (req, res) => {
  try {
    const { isActive } = req.query;
    
    const where = {};
    if (isActive !== undefined) where.isActive = isActive === 'true';

    const rewards = await prisma.loyaltyReward.findMany({
      where,
      include: {
        redemptions: {
          take: 10,
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: { pointsRequired: 'asc' },
    });

    res.json(rewards);
  } catch (error) {
    console.error('Error fetching rewards:', error);
    res.status(500).json({ error: 'Lỗi khi lấy danh sách phần thưởng' });
  }
});

// POST /api/loyalty/redeem - Đổi điểm lấy thưởng
router.post('/redeem', async (req, res) => {
  try {
    const { loyaltyPointId, rewardId } = req.body;

    if (!loyaltyPointId || !rewardId) {
      return res.status(400).json({ error: 'Thiếu thông tin bắt buộc' });
    }

    // Lấy thông tin
    const loyaltyPoint = await prisma.loyaltyPoint.findUnique({
      where: { id: loyaltyPointId },
    });

    const reward = await prisma.loyaltyReward.findUnique({
      where: { id: rewardId },
    });

    if (!loyaltyPoint || !reward) {
      return res.status(404).json({ error: 'Không tìm thấy thông tin' });
    }

    // Kiểm tra điểm
    if (loyaltyPoint.points < reward.pointsRequired) {
      return res.status(400).json({ error: 'Điểm không đủ để đổi thưởng' });
    }

    // Kiểm tra stock
    if (reward.stock !== null && reward.stock <= 0) {
      return res.status(400).json({ error: 'Phần thưởng đã hết' });
    }

    // Tạo redemption
    const redemption = await prisma.loyaltyRedemption.create({
      data: {
        loyaltyPointId,
        rewardId,
        pointsUsed: reward.pointsRequired,
        status: 'PENDING',
      },
    });

    // Trừ điểm
    await prisma.loyaltyPoint.update({
      where: { id: loyaltyPointId },
      data: {
        points: loyaltyPoint.points - reward.pointsRequired,
        usedPoints: loyaltyPoint.usedPoints + reward.pointsRequired,
      },
    });

    // Tạo transaction
    await prisma.loyaltyTransaction.create({
      data: {
        loyaltyPointId,
        type: 'USED',
        points: -reward.pointsRequired,
        description: `Đổi điểm lấy ${reward.name}`,
      },
    });

    // Giảm stock
    if (reward.stock !== null) {
      await prisma.loyaltyReward.update({
        where: { id: rewardId },
        data: {
          stock: reward.stock - 1,
        },
      });
    }

    const updated = await prisma.loyaltyRedemption.findUnique({
      where: { id: redemption.id },
      include: {
        reward: true,
        loyaltyPoint: true,
      },
    });

    res.json(updated);
  } catch (error) {
    console.error('Error redeeming reward:', error);
    res.status(500).json({ error: 'Lỗi khi đổi thưởng' });
  }
});

// POST /api/loyalty/rewards - Tạo phần thưởng mới
router.post('/rewards', async (req, res) => {
  try {
    const {
      name,
      description,
      pointsRequired,
      rewardType,
      rewardValue,
      image,
      stock,
      isActive,
      startDate,
      endDate,
    } = req.body;

    if (!name || !pointsRequired || !rewardType) {
      return res.status(400).json({ error: 'Thiếu thông tin bắt buộc' });
    }

    const reward = await prisma.loyaltyReward.create({
      data: {
        name,
        description,
        pointsRequired,
        rewardType,
        rewardValue,
        image,
        stock,
        isActive: isActive !== undefined ? isActive : true,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
      },
    });

    res.status(201).json(reward);
  } catch (error) {
    console.error('Error creating reward:', error);
    res.status(500).json({ error: 'Lỗi khi tạo phần thưởng' });
  }
});

export default router;

