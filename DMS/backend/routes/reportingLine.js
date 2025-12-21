import express from 'express';
import { prisma } from '../lib/prisma.js';

const router = express.Router();

// ================================
// REPORTING LINE VALIDATION
// ================================

// Get reporting line config
router.get('/config', async (req, res) => {
    try {
        const configs = await prisma.reportingLineConfig.findMany({
            orderBy: { positionId: 'asc' }
        });
        res.json(configs);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create/Update config
router.post('/config', async (req, res) => {
    try {
        const { positionId, reportsToPositionId, maxSubordinates, requiresApproval,
            allowSkipLevel, allowCrossFunction } = req.body;

        const config = await prisma.reportingLineConfig.upsert({
            where: { positionId },
            create: {
                positionId,
                reportsToPositionId,
                maxSubordinates,
                requiresApproval: requiresApproval ?? false,
                allowSkipLevel: allowSkipLevel ?? false,
                allowCrossFunction: allowCrossFunction ?? false
            },
            update: {
                reportsToPositionId,
                maxSubordinates,
                requiresApproval,
                allowSkipLevel,
                allowCrossFunction
            }
        });

        res.json(config);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ================================
// VALIDATE REPORTING LINE CHANGE
// ================================

router.post('/validate', async (req, res) => {
    try {
        const { employeeId, proposedManagerId } = req.body;

        const errors = [];
        const warnings = [];

        // Get employee and proposed manager
        const employee = await prisma.employee.findUnique({
            where: { id: employeeId },
            include: { position: true, manager: true }
        });

        if (!employee) {
            return res.status(404).json({ error: 'Employee not found' });
        }

        const proposedManager = proposedManagerId ? await prisma.employee.findUnique({
            where: { id: proposedManagerId },
            include: { position: true, subordinates: true }
        }) : null;

        // Get reporting config
        const config = await prisma.reportingLineConfig.findUnique({
            where: { positionId: employee.positionId }
        });

        // Validation 1: Cannot report to self
        if (employeeId === proposedManagerId) {
            errors.push('Employee cannot report to themselves');
        }

        // Validation 2: Check for circular reference
        if (proposedManagerId) {
            const checkCircular = async (managerId, targetId, visited = new Set()) => {
                if (visited.has(managerId)) return false;
                if (managerId === targetId) return true;
                visited.add(managerId);

                const manager = await prisma.employee.findUnique({ where: { id: managerId } });
                if (manager?.managerId) {
                    return checkCircular(manager.managerId, targetId, visited);
                }
                return false;
            };

            if (await checkCircular(proposedManagerId, employeeId)) {
                errors.push('Circular reporting line detected. The proposed manager is a subordinate of this employee.');
            }
        }

        // Validation 3: Check max subordinates
        if (proposedManager && config?.maxSubordinates) {
            const currentSubCount = proposedManager.subordinates.length;
            if (!employee.managerId || employee.managerId !== proposedManagerId) {
                if (currentSubCount >= config.maxSubordinates) {
                    errors.push(`Proposed manager has reached maximum subordinates limit (${config.maxSubordinates})`);
                }
            }
        }

        // Validation 4: Check skip level
        if (proposedManager && !config?.allowSkipLevel) {
            const employeeLevel = employee.position?.level || 0;
            const managerLevel = proposedManager.position?.level || 0;

            if (employeeLevel - managerLevel > 1) {
                warnings.push('Warning: Skip-level reporting detected. Employee position is more than 1 level below manager.');
            }
        }

        // Validation 5: Check cross-function (different channels/territories)
        if (proposedManager && !config?.allowCrossFunction) {
            if (employee.channelId && proposedManager.channelId &&
                employee.channelId !== proposedManager.channelId) {
                warnings.push('Warning: Cross-functional reporting detected. Employee and manager are in different channels.');
            }
        }

        // Validation 6: Requires approval
        if (config?.requiresApproval && employee.managerId !== proposedManagerId) {
            warnings.push('This change requires approval from HR or senior management.');
        }

        res.json({
            valid: errors.length === 0,
            errors,
            warnings,
            employee: {
                id: employee.id,
                name: employee.name,
                position: employee.position?.name,
                currentManager: employee.manager?.name
            },
            proposedManager: proposedManager ? {
                id: proposedManager.id,
                name: proposedManager.name,
                position: proposedManager.position?.name,
                currentSubordinates: proposedManager.subordinates.length
            } : null,
            requiresApproval: config?.requiresApproval
        });

    } catch (error) {
        console.error('Validate reporting line error:', error);
        res.status(500).json({ error: error.message });
    }
});

// ================================
// CHANGE REQUESTS
// ================================

// Get pending requests
router.get('/requests', async (req, res) => {
    try {
        const { status } = req.query;

        const where = {};
        if (status) where.status = status;

        const requests = await prisma.reportingChangeRequest.findMany({
            where,
            orderBy: { createdAt: 'desc' }
        });

        res.json(requests);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create change request
router.post('/requests', async (req, res) => {
    try {
        const { employeeId, proposedManagerId, reason, effectiveDate, requestedBy } = req.body;

        // Validate first
        const employee = await prisma.employee.findUnique({ where: { id: employeeId } });
        if (!employee) return res.status(404).json({ error: 'Employee not found' });

        const request = await prisma.reportingChangeRequest.create({
            data: {
                employeeId,
                currentManagerId: employee.managerId,
                proposedManagerId,
                reason,
                effectiveDate: new Date(effectiveDate),
                requestedBy,
                status: 'PENDING'
            }
        });

        res.status(201).json(request);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Approve/Reject request
router.patch('/requests/:id/review', async (req, res) => {
    try {
        const { status, reviewedBy, reviewNotes } = req.body;

        if (!['APPROVED', 'REJECTED'].includes(status)) {
            return res.status(400).json({ error: 'Invalid status. Must be APPROVED or REJECTED' });
        }

        const request = await prisma.reportingChangeRequest.findUnique({ where: { id: req.params.id } });
        if (!request) return res.status(404).json({ error: 'Request not found' });
        if (request.status !== 'PENDING') {
            return res.status(400).json({ error: 'Request has already been reviewed' });
        }

        // Update request
        const updated = await prisma.reportingChangeRequest.update({
            where: { id: req.params.id },
            data: {
                status,
                reviewedBy,
                reviewedAt: new Date(),
                reviewNotes
            }
        });

        // If approved, apply the change
        if (status === 'APPROVED') {
            await prisma.employee.update({
                where: { id: request.employeeId },
                data: { managerId: request.proposedManagerId }
            });
        }

        res.json(updated);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ================================
// SEED DEFAULT CONFIG
// ================================

router.post('/seed-config', async (req, res) => {
    try {
        // Get positions
        const positions = await prisma.orgPosition.findMany();

        const configs = [];
        const positionMap = {};
        positions.forEach(p => { positionMap[p.code] = p.id; });

        const hierarchy = [
            { code: 'BU_HEAD', reportsTo: null, max: null, approval: true },
            { code: 'RSM', reportsTo: 'BU_HEAD', max: 8, approval: false },
            { code: 'ASM', reportsTo: 'RSM', max: 6, approval: false },
            { code: 'TSM', reportsTo: 'ASM', max: 8, approval: false },
            { code: 'TDV', reportsTo: 'TSM', max: null, approval: false }
        ];

        for (const h of hierarchy) {
            if (!positionMap[h.code]) continue;

            const config = await prisma.reportingLineConfig.upsert({
                where: { positionId: positionMap[h.code] },
                create: {
                    positionId: positionMap[h.code],
                    reportsToPositionId: h.reportsTo ? positionMap[h.reportsTo] : null,
                    maxSubordinates: h.max,
                    requiresApproval: h.approval,
                    allowSkipLevel: false,
                    allowCrossFunction: false
                },
                update: {}
            });
            configs.push(config);
        }

        res.json({
            success: true,
            message: `Created ${configs.length} reporting line configs`,
            configs
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
