import { prisma } from './prisma.js';

/**
 * Determines which User IDs the current user is allowed to view data for.
 * Based on Organizational Structure (Manager -> Subordinates).
 * 
 * OPTIMIZED VERSION: Uses Single Query + In-Memory Traversal to avoid N+1 Query Problem.
 * 
 * @param {Object} user - The logged-in user object (req.user)
 * @returns {Promise<string[]|null>} - Array of UserIDs to filter by, or NULL if Full Access.
 */
export const getSafeUserIds = async (user) => {
    if (!user) return [];

    // 1. FULL ACCESS ROLES
    const FULL_ACCESS_ROLES = ['ADMIN', 'BU_HEAD', 'CEO', 'DIRECTOR', 'BOSS'];
    if (FULL_ACCESS_ROLES.includes(user.role) || user.username === 'admin') {
        return null; // No filter (View All)
    }

    // 2. FETCH HIERARCHY (SINGLE QUERY OPTIMIZATION)
    // Instead of querying implicitly in a loop, we fetch the skeleton of the organization once.
    // For 100-1000 employees, this is extremely fast and lightweight (only IDs).
    const allEmployees = await prisma.employee.findMany({
        select: { id: true, managerId: true, userId: true },
        where: { status: 'ACTIVE' }
    });

    // 3. IDENTIFY SELF
    const meEmployee = allEmployees.find(e => e.userId === user.id);

    // If not linked to any employee record, restrict to self only (Safe Fallback)
    if (!meEmployee) {
        return [user.id];
    }

    // 4. IN-MEMORY RECURSIVE TRAVERSAL
    // Much faster than Database Recursion for standard org sizes
    const teamUserIds = new Set();
    teamUserIds.add(user.id); // Always see self

    const queue = [meEmployee.id];

    while (queue.length > 0) {
        const currentManagerId = queue.shift();

        // Find direct subordinates in the loaded array
        const subordinates = allEmployees.filter(e => e.managerId === currentManagerId);

        for (const sub of subordinates) {
            // Add sub's userId to allowed list
            if (sub.userId) {
                teamUserIds.add(sub.userId);
            }
            // Add sub to queue to check for THEIR subordinates (Deep traversal)
            queue.push(sub.id);
        }
    }

    return Array.from(teamUserIds);
};
