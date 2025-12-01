import express from 'express';
import { prisma } from '../lib/prisma.js';

const router = express.Router();

// GET /api/trade-activities - Lấy danh sách hoạt động thương mại
router.get('/', async (req, res) => {
  try {
    const { status, type, organizerId } = req.query;
    
    const where = {};
    if (status) where.status = status;
    if (type) where.type = type;
    if (organizerId) where.organizerId = organizerId;

    const activities = await prisma.tradeActivity.findMany({
      where,
      include: {
        organizer: {
          select: {
            id: true,
            name: true,
            employeeCode: true,
          },
        },
      },
      orderBy: { startDate: 'desc' },
    });

    res.json(activities);
  } catch (error) {
    console.error('Error fetching trade activities:', error);
    res.status(500).json({ error: 'Lỗi khi lấy danh sách hoạt động thương mại' });
  }
});

// GET /api/trade-activities/:id - Lấy chi tiết hoạt động
router.get('/:id', async (req, res) => {
  try {
    const activity = await prisma.tradeActivity.findUnique({
      where: { id: req.params.id },
      include: {
        organizer: true,
      },
    });

    if (!activity) {
      return res.status(404).json({ error: 'Không tìm thấy hoạt động' });
    }

    res.json(activity);
  } catch (error) {
    console.error('Error fetching trade activity:', error);
    res.status(500).json({ error: 'Lỗi khi lấy thông tin hoạt động' });
  }
});

// POST /api/trade-activities - Tạo hoạt động mới
router.post('/', async (req, res) => {
  try {
    const {
      code,
      name,
      type,
      description,
      location,
      startDate,
      endDate,
      budget,
      organizerId,
      participants = [],
    } = req.body;

    if (!code || !name || !type || !startDate || !endDate) {
      return res.status(400).json({ error: 'Thiếu thông tin bắt buộc' });
    }

    const activity = await prisma.tradeActivity.create({
      data: {
        code,
        name,
        type,
        description,
        location,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        budget,
        organizerId,
        participants,
        status: 'PLANNED',
      },
      include: {
        organizer: true,
      },
    });

    res.status(201).json(activity);
  } catch (error) {
    console.error('Error creating trade activity:', error);
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Mã hoạt động đã tồn tại' });
    }
    res.status(500).json({ error: 'Lỗi khi tạo hoạt động' });
  }
});

// PUT /api/trade-activities/:id - Cập nhật hoạt động
router.put('/:id', async (req, res) => {
  try {
    const {
      name,
      type,
      description,
      location,
      startDate,
      endDate,
      budget,
      actualCost,
      status,
      organizerId,
      participants,
      results,
    } = req.body;

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (type !== undefined) updateData.type = type;
    if (description !== undefined) updateData.description = description;
    if (location !== undefined) updateData.location = location;
    if (startDate !== undefined) updateData.startDate = new Date(startDate);
    if (endDate !== undefined) updateData.endDate = new Date(endDate);
    if (budget !== undefined) updateData.budget = budget;
    if (actualCost !== undefined) updateData.actualCost = actualCost;
    if (status !== undefined) updateData.status = status;
    if (organizerId !== undefined) updateData.organizerId = organizerId;
    if (participants !== undefined) updateData.participants = participants;
    if (results !== undefined) updateData.results = results;

    const activity = await prisma.tradeActivity.update({
      where: { id: req.params.id },
      data: updateData,
      include: {
        organizer: true,
      },
    });

    res.json(activity);
  } catch (error) {
    console.error('Error updating trade activity:', error);
    res.status(500).json({ error: 'Lỗi khi cập nhật hoạt động' });
  }
});

// DELETE /api/trade-activities/:id - Xóa hoạt động
router.delete('/:id', async (req, res) => {
  try {
    await prisma.tradeActivity.delete({
      where: { id: req.params.id },
    });

    res.json({ message: 'Xóa hoạt động thành công' });
  } catch (error) {
    console.error('Error deleting trade activity:', error);
    res.status(500).json({ error: 'Lỗi khi xóa hoạt động' });
  }
});


export default router;

