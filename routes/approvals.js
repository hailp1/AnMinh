import express from 'express';
import { prisma } from '../lib/prisma.js';

const router = express.Router();

// GET /api/approvals - Lấy danh sách yêu cầu phê duyệt
router.get('/', async (req, res) => {
  try {
    const { requesterId, status, requestType, priority } = req.query;
    
    const where = {};
    if (requesterId) where.requesterId = requesterId;
    if (status) where.status = status;
    if (requestType) where.requestType = requestType;
    if (priority) where.priority = priority;

    const requests = await prisma.approvalRequest.findMany({
      where,
      include: {
        requester: {
          select: {
            id: true,
            name: true,
            employeeCode: true,
          },
        },
        order: {
          include: {
            pharmacy: true,
            user: true,
          },
        },
        actions: {
          include: {
            approver: {
              select: {
                id: true,
                name: true,
                employeeCode: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(requests);
  } catch (error) {
    console.error('Error fetching approval requests:', error);
    res.status(500).json({ error: 'Lỗi khi lấy danh sách yêu cầu phê duyệt' });
  }
});

// GET /api/approvals/pending - Lấy yêu cầu chờ phê duyệt
router.get('/pending', async (req, res) => {
  try {
    const { approverId } = req.query;

    const requests = await prisma.approvalRequest.findMany({
      where: {
        status: 'PENDING',
      },
      include: {
        requester: {
          select: {
            id: true,
            name: true,
            employeeCode: true,
          },
        },
        order: {
          include: {
            pharmacy: true,
            user: true,
          },
        },
        actions: {
          include: {
            approver: true,
          },
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'asc' },
      ],
    });

    res.json(requests);
  } catch (error) {
    console.error('Error fetching pending approvals:', error);
    res.status(500).json({ error: 'Lỗi khi lấy yêu cầu chờ phê duyệt' });
  }
});

// GET /api/approvals/:id - Lấy chi tiết yêu cầu
router.get('/:id', async (req, res) => {
  try {
    const request = await prisma.approvalRequest.findUnique({
      where: { id: req.params.id },
      include: {
        requester: true,
        order: {
          include: {
            pharmacy: true,
            user: true,
            items: {
              include: {
                product: true,
              },
            },
          },
        },
        actions: {
          include: {
            approver: true,
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!request) {
      return res.status(404).json({ error: 'Không tìm thấy yêu cầu phê duyệt' });
    }

    res.json(request);
  } catch (error) {
    console.error('Error fetching approval request:', error);
    res.status(500).json({ error: 'Lỗi khi lấy thông tin yêu cầu' });
  }
});

// POST /api/approvals - Tạo yêu cầu phê duyệt
router.post('/', async (req, res) => {
  try {
    const {
      requestType,
      title,
      description,
      requesterId,
      orderId,
      amount,
      priority,
      totalSteps,
    } = req.body;

    if (!requestType || !title || !requesterId) {
      return res.status(400).json({ error: 'Thiếu thông tin bắt buộc' });
    }

    const request = await prisma.approvalRequest.create({
      data: {
        requestType,
        title,
        description,
        requesterId,
        orderId,
        amount,
        priority: priority || 'NORMAL',
        status: 'PENDING',
        currentStep: 1,
        totalSteps: totalSteps || 1,
      },
      include: {
        requester: true,
        order: true,
      },
    });

    res.status(201).json(request);
  } catch (error) {
    console.error('Error creating approval request:', error);
    res.status(500).json({ error: 'Lỗi khi tạo yêu cầu phê duyệt' });
  }
});

// POST /api/approvals/:id/approve - Phê duyệt yêu cầu
router.post('/:id/approve', async (req, res) => {
  try {
    const { approverId, comment } = req.body;

    if (!approverId) {
      return res.status(400).json({ error: 'Thiếu thông tin người phê duyệt' });
    }

    const request = await prisma.approvalRequest.findUnique({
      where: { id: req.params.id },
    });

    if (!request) {
      return res.status(404).json({ error: 'Không tìm thấy yêu cầu' });
    }

    if (request.status !== 'PENDING') {
      return res.status(400).json({ error: 'Yêu cầu không ở trạng thái chờ phê duyệt' });
    }

    // Tạo action
    await prisma.approvalAction.create({
      data: {
        requestId: request.id,
        approverId,
        action: 'APPROVE',
        comment,
        step: request.currentStep,
      },
    });

    // Kiểm tra xem đã đủ bước chưa
    const isLastStep = request.currentStep >= request.totalSteps;
    
    const updatedRequest = await prisma.approvalRequest.update({
      where: { id: req.params.id },
      data: {
        status: isLastStep ? 'APPROVED' : 'PENDING',
        currentStep: isLastStep ? request.currentStep : request.currentStep + 1,
        approvedAt: isLastStep ? new Date() : null,
      },
      include: {
        requester: true,
        order: true,
        actions: {
          include: {
            approver: true,
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    // Nếu là phê duyệt đơn hàng và đã được phê duyệt, cập nhật trạng thái đơn hàng
    if (isLastStep && request.requestType === 'ORDER' && request.orderId) {
      await prisma.order.update({
        where: { id: request.orderId },
        data: {
          status: 'CONFIRMED',
        },
      });
    }

    res.json(updatedRequest);
  } catch (error) {
    console.error('Error approving request:', error);
    res.status(500).json({ error: 'Lỗi khi phê duyệt yêu cầu' });
  }
});

// POST /api/approvals/:id/reject - Từ chối yêu cầu
router.post('/:id/reject', async (req, res) => {
  try {
    const { approverId, comment, rejectionReason } = req.body;

    if (!approverId) {
      return res.status(400).json({ error: 'Thiếu thông tin người phê duyệt' });
    }

    const request = await prisma.approvalRequest.findUnique({
      where: { id: req.params.id },
    });

    if (!request) {
      return res.status(404).json({ error: 'Không tìm thấy yêu cầu' });
    }

    // Tạo action
    await prisma.approvalAction.create({
      data: {
        requestId: request.id,
        approverId,
        action: 'REJECT',
        comment: comment || rejectionReason,
        step: request.currentStep,
      },
    });

    const updatedRequest = await prisma.approvalRequest.update({
      where: { id: req.params.id },
      data: {
        status: 'REJECTED',
        rejectedAt: new Date(),
        rejectionReason: rejectionReason || comment,
      },
      include: {
        requester: true,
        order: true,
        actions: {
          include: {
            approver: true,
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    res.json(updatedRequest);
  } catch (error) {
    console.error('Error rejecting request:', error);
    res.status(500).json({ error: 'Lỗi khi từ chối yêu cầu' });
  }
});

export default router;

