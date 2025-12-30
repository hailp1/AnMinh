
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../../.env') });
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    console.log('--- CHECKING ORG TREE DATA ---');
    const emps = await prisma.employee.findMany({ include: { position: true, manager: true } });
    console.log(`Total Employees: ${emps.length}`);
    const roots = emps.filter(e => !e.managerId);
    console.log(`Roots: ${roots.length}`);
    const printNode = (node, level = 0) => {
        const indent = '  '.repeat(level);
        console.log(`${indent}|- [${node.position?.code || 'NO_POS'}] ${node.name} (Code: ${node.employeeCode}) - Status: ${node.status}`);
        const children = emps.filter(e => e.managerId === node.id);
        children.forEach(c => printNode(c, level + 1));
    };
    roots.forEach(r => printNode(r));
    console.log('--- END CHECK ---');
}
main().finally(async () => await prisma.$disconnect());
