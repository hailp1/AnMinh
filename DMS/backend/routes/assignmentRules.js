import express from 'express';
import { prisma } from '../lib/prisma.js';

const router = express.Router();

// ================================
// ASSIGNMENT RULES ENGINE
// ================================

// Get all rules
router.get('/', async (req, res) => {
    try {
        const { ruleType, isActive } = req.query;

        const where = {};
        if (ruleType) where.ruleType = ruleType;
        if (isActive !== undefined) where.isActive = isActive === 'true';

        const rules = await prisma.assignmentRule.findMany({
            where,
            orderBy: [{ priority: 'asc' }, { createdAt: 'desc' }]
        });

        res.json(rules);
    } catch (error) {
        console.error('Get rules error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get single rule
router.get('/:id', async (req, res) => {
    try {
        const rule = await prisma.assignmentRule.findUnique({ where: { id: req.params.id } });
        if (!rule) return res.status(404).json({ error: 'Rule not found' });
        res.json(rule);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create rule
router.post('/', async (req, res) => {
    try {
        const { name, description, ruleType, priority, conditions, actionType,
            assignToUserId, assignToTerritoryId, assignToRoleId,
            sendNotification, notificationTemplate } = req.body;

        // Validate conditions format
        if (!conditions || !Array.isArray(conditions)) {
            return res.status(400).json({ error: 'Conditions must be an array' });
        }

        const rule = await prisma.assignmentRule.create({
            data: {
                name,
                description,
                ruleType,
                priority: priority || 100,
                conditions,
                actionType,
                assignToUserId,
                assignToTerritoryId,
                assignToRoleId,
                sendNotification: sendNotification ?? true,
                notificationTemplate
            }
        });

        res.status(201).json(rule);
    } catch (error) {
        console.error('Create rule error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Update rule
router.put('/:id', async (req, res) => {
    try {
        const rule = await prisma.assignmentRule.update({
            where: { id: req.params.id },
            data: req.body
        });
        res.json(rule);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Toggle rule active status
router.patch('/:id/toggle', async (req, res) => {
    try {
        const rule = await prisma.assignmentRule.findUnique({ where: { id: req.params.id } });
        if (!rule) return res.status(404).json({ error: 'Rule not found' });

        const updated = await prisma.assignmentRule.update({
            where: { id: req.params.id },
            data: { isActive: !rule.isActive }
        });

        res.json(updated);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete rule
router.delete('/:id', async (req, res) => {
    try {
        await prisma.assignmentRule.delete({ where: { id: req.params.id } });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ================================
// RULE EXECUTION
// ================================

// Evaluate rules for an object
router.post('/evaluate', async (req, res) => {
    try {
        const { objectType, objectData } = req.body;

        // Get active rules for this type, ordered by priority
        const rules = await prisma.assignmentRule.findMany({
            where: { ruleType: objectType, isActive: true },
            orderBy: { priority: 'asc' }
        });

        // Evaluate each rule
        for (const rule of rules) {
            const conditions = rule.conditions;
            let allMatch = true;

            for (const cond of conditions) {
                const fieldValue = objectData[cond.field];
                let matches = false;

                switch (cond.operator) {
                    case 'equals':
                        matches = fieldValue === cond.value;
                        break;
                    case 'not_equals':
                        matches = fieldValue !== cond.value;
                        break;
                    case 'contains':
                        matches = String(fieldValue).toLowerCase().includes(String(cond.value).toLowerCase());
                        break;
                    case 'starts_with':
                        matches = String(fieldValue).toLowerCase().startsWith(String(cond.value).toLowerCase());
                        break;
                    case 'greater_than':
                        matches = parseFloat(fieldValue) > parseFloat(cond.value);
                        break;
                    case 'less_than':
                        matches = parseFloat(fieldValue) < parseFloat(cond.value);
                        break;
                    case 'in':
                        matches = Array.isArray(cond.value) && cond.value.includes(fieldValue);
                        break;
                    default:
                        matches = fieldValue === cond.value;
                }

                if (!matches) {
                    allMatch = false;
                    break;
                }
            }

            if (allMatch) {
                // Rule matched - return assignment
                await prisma.assignmentRule.update({
                    where: { id: rule.id },
                    data: {
                        executionCount: { increment: 1 },
                        lastExecutedAt: new Date()
                    }
                });

                return res.json({
                    matched: true,
                    rule: {
                        id: rule.id,
                        name: rule.name,
                        actionType: rule.actionType
                    },
                    assignment: {
                        userId: rule.assignToUserId,
                        territoryId: rule.assignToTerritoryId,
                        roleId: rule.assignToRoleId
                    },
                    sendNotification: rule.sendNotification
                });
            }
        }

        // No rule matched
        res.json({ matched: false, message: 'No matching rule found' });

    } catch (error) {
        console.error('Evaluate rules error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Auto-assign customer based on rules
router.post('/auto-assign-customer/:customerId', async (req, res) => {
    try {
        const customer = await prisma.pharmacy.findUnique({ where: { id: req.params.customerId } });
        if (!customer) return res.status(404).json({ error: 'Customer not found' });

        // Build object data for evaluation
        const objectData = {
            district: customer.district,
            city: customer.city,
            segment: customer.customerSegment,
            channel: customer.distributionChannel,
            tier: customer.customerTier
        };

        // Get active rules
        const rules = await prisma.assignmentRule.findMany({
            where: { ruleType: 'CUSTOMER', isActive: true },
            orderBy: { priority: 'asc' }
        });

        let assignedTo = null;
        let matchedRule = null;

        for (const rule of rules) {
            const conditions = rule.conditions;
            let allMatch = true;

            for (const cond of conditions) {
                const fieldValue = objectData[cond.field];
                let matches = false;

                switch (cond.operator) {
                    case 'equals':
                        matches = fieldValue === cond.value;
                        break;
                    case 'contains':
                        matches = String(fieldValue || '').toLowerCase().includes(String(cond.value).toLowerCase());
                        break;
                    case 'in':
                        matches = cond.value?.includes?.(fieldValue);
                        break;
                    default:
                        matches = fieldValue === cond.value;
                }

                if (!matches) {
                    allMatch = false;
                    break;
                }
            }

            if (allMatch) {
                assignedTo = rule.assignToUserId;
                matchedRule = rule;
                break;
            }
        }

        if (assignedTo) {
            // Update customer
            await prisma.pharmacy.update({
                where: { id: customer.id },
                data: { assignedUserId: assignedTo }
            });

            // Log history
            await prisma.assignmentHistory.create({
                data: {
                    objectType: 'Customer',
                    objectId: customer.id,
                    fromUserId: customer.assignedUserId,
                    toUserId: assignedTo,
                    assignmentMethod: 'AUTO_RULE',
                    ruleId: matchedRule.id,
                    reason: `Auto-assigned by rule: ${matchedRule.name}`
                }
            });

            // Update rule execution count
            await prisma.assignmentRule.update({
                where: { id: matchedRule.id },
                data: {
                    executionCount: { increment: 1 },
                    lastExecutedAt: new Date()
                }
            });

            res.json({
                success: true,
                customerId: customer.id,
                assignedTo,
                ruleName: matchedRule.name
            });
        } else {
            res.json({
                success: false,
                message: 'No matching rule found for this customer'
            });
        }

    } catch (error) {
        console.error('Auto-assign error:', error);
        res.status(500).json({ error: error.message });
    }
});

// ================================
// ASSIGNMENT HISTORY
// ================================

router.get('/history', async (req, res) => {
    try {
        const { objectType, objectId, userId, limit } = req.query;

        const where = {};
        if (objectType) where.objectType = objectType;
        if (objectId) where.objectId = objectId;
        if (userId) where.toUserId = userId;

        const history = await prisma.assignmentHistory.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            take: limit ? parseInt(limit) : 50
        });

        res.json(history);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Manual assignment with history
router.post('/manual-assign', async (req, res) => {
    try {
        const { objectType, objectId, toUserId, toTerritoryId, reason, assignedBy } = req.body;

        let fromUserId = null;
        let fromTerritoryId = null;

        // Get current assignment based on object type
        if (objectType === 'Customer') {
            const customer = await prisma.pharmacy.findUnique({ where: { id: objectId } });
            if (customer) {
                fromUserId = customer.assignedUserId;

                // Update customer
                await prisma.pharmacy.update({
                    where: { id: objectId },
                    data: { assignedUserId: toUserId }
                });
            }
        }

        // Log history
        const history = await prisma.assignmentHistory.create({
            data: {
                objectType,
                objectId,
                fromUserId,
                toUserId,
                fromTerritoryId,
                toTerritoryId,
                assignmentMethod: 'MANUAL',
                assignedBy,
                reason
            }
        });

        res.json({
            success: true,
            history
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ================================
// SEED DEFAULT RULES
// ================================

router.post('/seed', async (req, res) => {
    try {
        const rules = [
            {
                name: 'Assign Q1 Customers to TDV001',
                description: 'Auto-assign District 1 customers to TDV001',
                ruleType: 'CUSTOMER',
                priority: 10,
                conditions: [{ field: 'district', operator: 'contains', value: 'Quận 1' }],
                actionType: 'ASSIGN_TO_USER',
                assignToUserId: 'TDV001'
            },
            {
                name: 'Assign Q3 Customers to TDV002',
                description: 'Auto-assign District 3 customers to TDV002',
                ruleType: 'CUSTOMER',
                priority: 20,
                conditions: [{ field: 'district', operator: 'contains', value: 'Quận 3' }],
                actionType: 'ASSIGN_TO_USER',
                assignToUserId: 'TDV002'
            },
            {
                name: 'Assign Key Accounts',
                description: 'Auto-assign Key Account segment to senior TDV',
                ruleType: 'CUSTOMER',
                priority: 5,
                conditions: [{ field: 'segment', operator: 'equals', value: 'KEY_ACCOUNT' }],
                actionType: 'ASSIGN_TO_USER',
                assignToUserId: 'TDV001'
            },
            {
                name: 'Assign Hospital Channel',
                description: 'Hospital channel customers to specialized TDV',
                ruleType: 'CUSTOMER',
                priority: 15,
                conditions: [{ field: 'channel', operator: 'equals', value: 'HOSPITAL' }],
                actionType: 'ASSIGN_TO_USER',
                assignToUserId: 'TDV002'
            }
        ];

        const created = [];
        for (const r of rules) {
            const rule = await prisma.assignmentRule.create({ data: r });
            created.push(rule);
        }

        res.json({
            success: true,
            message: `Created ${created.length} assignment rules`,
            rules: created
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
