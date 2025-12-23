import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

function getRandomNovemberDate() {
    const start = new Date('2024-11-01');
    const end = new Date('2024-11-30');
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

async function createAdditionalOrders() {
    console.log('📦 Creating additional orders for new pharmacies...\n');

    const newPharmacies = await prisma.pharmacy.findMany({
        where: {
            code: {
                gte: 'KH0101'
            }
        }
    });

    const products = await prisma.product.findMany();

    console.log(`Creating orders for ${newPharmacies.length} new pharmacies...`);

    let orderCount = 0;
    const existingOrderCount = await prisma.order.count();

    for (const pharmacy of newPharmacies) {
        const ordersForThisPharmacy = Math.floor(Math.random() * 2) + 1;

        const assignment = await prisma.customerAssignment.findFirst({
            where: { pharmacyId: pharmacy.id }
        });

        if (!assignment) continue;

        for (let i = 0; i < ordersForThisPharmacy; i++) {
            const orderDate = getRandomNovemberDate();
            const orderNumber = `ORD-2024-11-${(existingOrderCount + orderCount + 1).toString().padStart(4, '0')}`;

            const itemCount = Math.floor(Math.random() * 5) + 1;
            const orderItems = [];
            let totalAmount = 0;

            for (let j = 0; j < itemCount; j++) {
                const product = getRandom(products);
                const quantity = Math.floor(Math.random() * 10) + 1;
                const price = product.price;
                const subtotal = price * quantity;
                totalAmount += subtotal;

                orderItems.push({
                    productId: product.id,
                    quantity,
                    price,
                    subtotal
                });
            }

            await prisma.order.create({
                data: {
                    orderNumber,
                    userId: assignment.userId,
                    pharmacyId: pharmacy.id,
                    status: getRandom(['COMPLETED', 'CONFIRMED', 'DELIVERED']),
                    totalAmount,
                    paymentStatus: 'PAID',
                    paymentMethod: getRandom(['CASH', 'TRANSFER', 'COD']),
                    deliveryDate: new Date(orderDate.getTime() + 2 * 24 * 60 * 60 * 1000),
                    createdAt: orderDate,
                    updatedAt: orderDate,
                    items: {
                        create: orderItems
                    }
                }
            });

            orderCount++;
        }

        if (orderCount % 50 === 0) {
            console.log(`   Created ${orderCount} orders...`);
        }
    }

    console.log(`\n✅ Created ${orderCount} additional orders`);

    const totalOrders = await prisma.order.count();
    const totalPharmacies = await prisma.pharmacy.count();
    const totalRevenue = await prisma.order.aggregate({
        _sum: { totalAmount: true }
    });

    console.log('\n📊 Final Summary:');
    console.log(`   Total Pharmacies: ${totalPharmacies}`);
    console.log(`   Total Orders: ${totalOrders}`);
    console.log(`   Total Revenue: ${(totalRevenue._sum.totalAmount / 1000000).toFixed(1)}M VNĐ`);
}

createAdditionalOrders()
    .catch(e => {
        console.error('❌ Failed:', e);
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());
