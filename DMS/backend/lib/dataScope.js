import { prisma } from './prisma.js';

/**
 * Determines which User IDs the current user is allowed to view data for.
 * Based on Organizational Structure (Manager -> Subordinates).
 * 
 * @param {Object} user - The logged-in user object (req.user)
 * @returns {Promise<string[]|null>} - Array of UserIDs to filter by, or NULL if Full Access.
 */
export const getSafeUserIds = async (user) => {
    if (!user) return [];

    // 1. FULL ACCESS ROLES
    // ADMIN, BU_HEAD, CEO see EVERYTHING
    const FULL_ACCESS_ROLES = ['ADMIN', 'BU_HEAD', 'CEO', 'DIRECTOR', 'BOSS'];
    // Check role or employee code prefixes if role isn't set perfectly
    if (FULL_ACCESS_ROLES.includes(user.role) || user.username === 'admin') {
        return null; // No filter
    }

    // 2. LIMITED ACCESS (Managers & TDV)
    // First, find the Employee record linked to this User
    const meEmployee = await prisma.employee.findFirst({
        where: { userId: user.id }
    });

    // If not an employee (e.g. standalone user), can only see self
    if (!meEmployee) {
        return [user.id];
    }

    // Recursive search for all subordinates
    const teamUserIds = [user.id]; // Always include self
    const queue = [meEmployee.id]; // Start with my Employee ID

    while (queue.length > 0) {
        const currentManagerId = queue.shift();

        // Find direct reports
        const directs = await prisma.employee.findMany({
            where: { managerId: currentManagerId },
            select: { id: true, userId: true }
        });

        for (const emp of directs) {
            // Add their User ID to the allowed list (if they have one)
            if (emp.userId) {
                teamUserIds.push(emp.userId);
            }
            // Add their Employee ID to queue to find THEIR subordinates (Level 2, 3...)
            queue.push(emp.id);
        }
    }

    return teamUserIds;
};
