
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import fetch from 'node-fetch'; // Backend usually has access to fetch in node 18+, or I use axios if installed. 
// Prisma check is safest first step.

const prisma = new PrismaClient();
const API_URL = 'http://localhost:5000/api';

async function main() {
    console.log('--- DEBUGGING ADMIN FEATURES ---');

    // 1. CHECK COUNTS
    try {
        const userCount = await prisma.user.count();
        const prodCount = await prisma.product.count();
        console.log(`[DB] Users: ${userCount}`);
        console.log(`[DB] Products: ${prodCount}`);
    } catch (e) {
        console.error('[DB] Count failed:', e.message);
    }

    // 2. LOGIN AS ADMIN
    let token = null;
    try {
        // Ensure Admin exists/updated
        // We know SS001 exists from seed, let's try that or ADMIN if restored
        // restore_admin.js created ADMIN/123456
        const loginRes = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ employeeCode: 'ADMIN', password: '123456' })
        });

        if (loginRes.ok) {
            const data = await loginRes.json();
            token = data.token;
            console.log('[API] Login ADMIN: SUCCESS');
        } else {
            console.error('[API] Login ADMIN: FAILED', await loginRes.text());
        }

    } catch (e) {
        console.error('[API] Login Error:', e.message);
    }

    if (!token) return;

    // 3. GET USERS
    try {
        const res = await fetch(`${API_URL}/users/admin/users`, {
            headers: { 'x-auth-token': token }
        });
        if (res.ok) {
            const users = await res.json();
            console.log(`[API] GET /admin/users: SUCCESS (Count: ${users.length})`);
        } else {
            console.error(`[API] GET /admin/users: FAILED (${res.status})`, await res.text());
        }
    } catch (e) { console.error(e.message); }

    // 4. GET PRODUCTS
    try {
        const res = await fetch(`${API_URL}/products`, {
            headers: { 'x-auth-token': token }
        });
        if (res.ok) {
            const prods = await res.json();
            console.log(`[API] GET /products: SUCCESS (Count: ${prods.length})`);
        } else {
            console.error(`[API] GET /products: FAILED (${res.status})`, await res.text());
        }
    } catch (e) { console.error(e.message); }

    // 5. CREATE WAREHOUSE
    try {
        const payload = {
            code: `WH_${Date.now().toString().slice(-10)}`, // Max 20 chars
            name: 'Kho Test Debug',
            address: 'Test Addr'
        };
        const res = await fetch(`${API_URL}/inventory/warehouses`, {
            method: 'POST',
            headers: {
                'x-auth-token': token,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (res.ok) {
            console.log('[API] CREATE /inventory/warehouses: SUCCESS');
            const wh = await res.json();
            // Cleanup
            await prisma.warehouse.delete({ where: { id: wh.id } });
            console.log('[API] Cleanup: Deleted test warehouse');
        } else {
            console.error(`[API] CREATE /inventory/warehouses: FAILED (${res.status})`, await res.text());
        }
    } catch (e) { console.error(e.message); }
}

main().finally(() => prisma.$disconnect());
