import express from 'express';
import { prisma } from '../lib/prisma.js';

const router = express.Router();

// ================================
// ROLE HIERARCHY (Salesforce-style)
// ================================

// Get all roles with hierarchy
router.get('/roles', async (req, res) => {
    try {
        const roles = await prisma.role.findMany({
            include: {
                parent: true,
                children: {
                    include: { children: true }
                },
                users: true,
                permissions: true,
                _count: { select: { users: true } }
            },
            orderBy: [{ level: 'asc' }, { name: 'asc' }]
        });

        // Build tree structure
        const buildTree = (roles, parentId = null) => {
            return roles
                .filter(r => r.parentId === parentId)
                .map(r => ({
                    ...r,
                    children: buildTree(roles, r.id)
                }));
        };

        const hierarchy = buildTree(roles);

        res.json({
            roles,
            hierarchy,
            total: roles.length
        });
    } catch (error) {
        console.error('Get roles error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get single role
router.get('/roles/:id', async (req, res) => {
    try {
        const role = await prisma.role.findUnique({
            where: { id: req.params.id },
            include: {
                parent: true,
                children: true,
                users: true,
                permissions: true
            }
        });
        if (!role) return res.status(404).json({ error: 'Role not found' });
        res.json(role);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create role
router.post('/roles', async (req, res) => {
    try {
        const { code, name, nameVi, parentId, level, accessLevel, dataScope,
            canViewSubordinates, canEditSubordinates, canDeleteSubordinates, description } = req.body;

        // Validate parent exists
        if (parentId) {
            const parent = await prisma.role.findUnique({ where: { id: parentId } });
            if (!parent) return res.status(400).json({ error: 'Parent role not found' });
        }

        const role = await prisma.role.create({
            data: {
                code,
                name,
                nameVi,
                parentId,
                level: level ?? (parentId ? 1 : 0),
                accessLevel: accessLevel || 'PRIVATE',
                dataScope: dataScope || 'OWN',
                canViewSubordinates: canViewSubordinates ?? true,
                canEditSubordinates: canEditSubordinates ?? false,
                canDeleteSubordinates: canDeleteSubordinates ?? false,
                description
            },
            include: { parent: true }
        });

        res.status(201).json(role);
    } catch (error) {
        console.error('Create role error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Update role
router.put('/roles/:id', async (req, res) => {
    try {
        const { name, nameVi, parentId, level, accessLevel, dataScope,
            canViewSubordinates, canEditSubordinates, canDeleteSubordinates, description, isActive } = req.body;

        // Validate: cannot set parent to self or descendant
        if (parentId) {
            if (parentId === req.params.id) {
                return res.status(400).json({ error: 'Role cannot be its own parent' });
            }

            // Check if parentId is a descendant
            const checkDescendant = async (roleId, targetId) => {
                const children = await prisma.role.findMany({ where: { parentId: roleId } });
                for (const child of children) {
                    if (child.id === targetId) return true;
                    if (await checkDescendant(child.id, targetId)) return true;
                }
                return false;
            };

            if (await checkDescendant(req.params.id, parentId)) {
                return res.status(400).json({ error: 'Cannot set descendant as parent (circular reference)' });
            }
        }

        const role = await prisma.role.update({
            where: { id: req.params.id },
            data: {
                name,
                nameVi,
                parentId,
                level,
                accessLevel,
                dataScope,
                canViewSubordinates,
                canEditSubordinates,
                canDeleteSubordinates,
                description,
                isActive
            },
            include: { parent: true, children: true }
        });

        res.json(role);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete role
router.delete('/roles/:id', async (req, res) => {
    try {
        // Check if role has children
        const children = await prisma.role.findMany({ where: { parentId: req.params.id } });
        if (children.length > 0) {
            return res.status(400).json({ error: 'Cannot delete role with child roles. Remove or reassign children first.' });
        }

        // Check if role has users
        const users = await prisma.roleUser.findMany({ where: { roleId: req.params.id } });
        if (users.length > 0) {
            return res.status(400).json({ error: 'Cannot delete role with assigned users. Remove user assignments first.' });
        }

        await prisma.role.delete({ where: { id: req.params.id } });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Assign user to role
router.post('/roles/:roleId/users', async (req, res) => {
    try {
        const { userId, isPrimary } = req.body;

        // Check role exists
        const role = await prisma.role.findUnique({ where: { id: req.params.roleId } });
        if (!role) return res.status(404).json({ error: 'Role not found' });

        // If primary, unset other primary roles for this user
        if (isPrimary) {
            await prisma.roleUser.updateMany({
                where: { userId },
                data: { isPrimary: false }
            });
        }

        const roleUser = await prisma.roleUser.upsert({
            where: { userId_roleId: { userId, roleId: req.params.roleId } },
            create: {
                userId,
                roleId: req.params.roleId,
                isPrimary: isPrimary ?? true,
                assignedBy: req.body.assignedBy
            },
            update: { isPrimary: isPrimary ?? true }
        });

        res.json(roleUser);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Remove user from role
router.delete('/roles/:roleId/users/:userId', async (req, res) => {
    try {
        await prisma.roleUser.delete({
            where: { userId_roleId: { userId: req.params.userId, roleId: req.params.roleId } }
        });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ================================
// ROLE PERMISSIONS
// ================================

// Get permissions for role
router.get('/roles/:roleId/permissions', async (req, res) => {
    try {
        const permissions = await prisma.rolePermission.findMany({
            where: { roleId: req.params.roleId }
        });
        res.json(permissions);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Set permission
router.post('/roles/:roleId/permissions', async (req, res) => {
    try {
        const { objectType, canRead, canCreate, canEdit, canDelete, canExport, restrictedFields } = req.body;

        const permission = await prisma.rolePermission.upsert({
            where: { roleId_objectType: { roleId: req.params.roleId, objectType } },
            create: {
                roleId: req.params.roleId,
                objectType,
                canRead: canRead ?? true,
                canCreate: canCreate ?? false,
                canEdit: canEdit ?? false,
                canDelete: canDelete ?? false,
                canExport: canExport ?? false,
                restrictedFields: restrictedFields || []
            },
            update: { canRead, canCreate, canEdit, canDelete, canExport, restrictedFields }
        });

        res.json(permission);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get user's effective permissions
router.get('/user-permissions/:userId', async (req, res) => {
    try {
        const userRoles = await prisma.roleUser.findMany({
            where: { userId: req.params.userId },
            include: {
                role: {
                    include: { permissions: true, parent: true }
                }
            }
        });

        // Merge permissions from all roles (most permissive wins)
        const effectivePermissions = {};

        for (const ur of userRoles) {
            for (const perm of ur.role.permissions) {
                if (!effectivePermissions[perm.objectType]) {
                    effectivePermissions[perm.objectType] = {
                        canRead: false,
                        canCreate: false,
                        canEdit: false,
                        canDelete: false,
                        canExport: false
                    };
                }

                effectivePermissions[perm.objectType].canRead = effectivePermissions[perm.objectType].canRead || perm.canRead;
                effectivePermissions[perm.objectType].canCreate = effectivePermissions[perm.objectType].canCreate || perm.canCreate;
                effectivePermissions[perm.objectType].canEdit = effectivePermissions[perm.objectType].canEdit || perm.canEdit;
                effectivePermissions[perm.objectType].canDelete = effectivePermissions[perm.objectType].canDelete || perm.canDelete;
                effectivePermissions[perm.objectType].canExport = effectivePermissions[perm.objectType].canExport || perm.canExport;
            }
        }

        // Get data scope from primary role
        const primaryRole = userRoles.find(ur => ur.isPrimary)?.role;

        res.json({
            userId: req.params.userId,
            roles: userRoles.map(ur => ({ id: ur.role.id, code: ur.role.code, name: ur.role.name, isPrimary: ur.isPrimary })),
            dataScope: primaryRole?.dataScope || 'OWN',
            accessLevel: primaryRole?.accessLevel || 'PRIVATE',
            permissions: effectivePermissions
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ================================
// SEED DEFAULT ROLES
// ================================

router.post('/seed-roles', async (req, res) => {
    try {
        const roles = [
            { code: 'CEO', name: 'Chief Executive Officer', nameVi: 'Tổng Giám Đốc', level: 0, dataScope: 'ALL', accessLevel: 'ALL' },
            { code: 'BU_HEAD', name: 'Business Unit Head', nameVi: 'Giám đốc Đơn vị', level: 1, dataScope: 'ALL', accessLevel: 'READ_WRITE', parentCode: 'CEO' },
            { code: 'RSM', name: 'Regional Sales Manager', nameVi: 'Giám đốc Vùng', level: 2, dataScope: 'REGION', accessLevel: 'READ_WRITE', parentCode: 'BU_HEAD' },
            { code: 'ASM', name: 'Area Sales Manager', nameVi: 'Giám đốc Khu vực', level: 3, dataScope: 'AREA', accessLevel: 'READ_WRITE', parentCode: 'RSM' },
            { code: 'TSM', name: 'Territory Sales Manager', nameVi: 'Giám đốc Địa bàn', level: 4, dataScope: 'TERRITORY', accessLevel: 'READ_WRITE', parentCode: 'ASM' },
            { code: 'TDV', name: 'Territory Development Representative', nameVi: 'Trình Dược Viên', level: 5, dataScope: 'OWN', accessLevel: 'PRIVATE', parentCode: 'TSM' }
        ];

        const created = [];
        const roleMap = {};

        for (const r of roles) {
            const parentId = r.parentCode ? roleMap[r.parentCode] : null;

            const role = await prisma.role.upsert({
                where: { code: r.code },
                create: {
                    code: r.code,
                    name: r.name,
                    nameVi: r.nameVi,
                    level: r.level,
                    dataScope: r.dataScope,
                    accessLevel: r.accessLevel,
                    parentId,
                    canViewSubordinates: true,
                    canEditSubordinates: r.level <= 2,
                    canDeleteSubordinates: r.level <= 1
                },
                update: {
                    name: r.name,
                    nameVi: r.nameVi,
                    level: r.level,
                    dataScope: r.dataScope,
                    accessLevel: r.accessLevel,
                    parentId
                }
            });

            roleMap[r.code] = role.id;
            created.push(role);
        }

        // Create default permissions
        const objectTypes = ['Customer', 'Order', 'Product', 'Report', 'User', 'Territory', 'Visit'];

        for (const role of created) {
            for (const obj of objectTypes) {
                const isAdmin = role.level <= 1;
                const isManager = role.level <= 3;

                await prisma.rolePermission.upsert({
                    where: { roleId_objectType: { roleId: role.id, objectType: obj } },
                    create: {
                        roleId: role.id,
                        objectType: obj,
                        canRead: true,
                        canCreate: isManager || obj === 'Order' || obj === 'Visit',
                        canEdit: isManager,
                        canDelete: isAdmin,
                        canExport: isManager || obj === 'Report'
                    },
                    update: {}
                });
            }
        }

        res.json({
            success: true,
            message: `Created ${created.length} roles with permissions`,
            roles: created
        });
    } catch (error) {
        console.error('Seed roles error:', error);
        res.status(500).json({ error: error.message });
    }
});

export default router;
