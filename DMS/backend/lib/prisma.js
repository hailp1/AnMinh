import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis;

// Create Prisma client with optimized settings
export const prisma = globalForPrisma.prisma || new PrismaClient({
    log: process.env.NODE_ENV === 'development'
        ? ['query', 'error', 'warn']
        : ['error'],
    errorFormat: 'minimal',
});

// Reuse instance in development to prevent hot-reload issues
if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prisma;
}

// Graceful shutdown - disconnect on process termination
const cleanup = async () => {
    console.log('Disconnecting Prisma Client...');
    await prisma.$disconnect();
    process.exit(0);
};

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
process.on('beforeExit', async () => {
    await prisma.$disconnect();
});