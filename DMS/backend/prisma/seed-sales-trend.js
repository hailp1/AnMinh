// Seed Sales Data for Biz Review Trends
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function seedSalesData() {
    console.log('📊 Seeding Sales Data for Biz Review Trends...');

    // Get users (TDV)
    const tdvUsers = await prisma.user.findMany({
        where: { role: 'TDV' },
        take: 10
    });

    if (tdvUsers.length === 0) {
        console.log('⚠️  No TDV users found. Please seed users first.');
        return;
    }

    // Get pharmacies
    const pharmacies = await prisma.pharmacy.findMany({
        where: { isActive: true },
        take: 100
    });

    if (pharmacies.length === 0) {
        console.log('⚠️  No pharmacies found. Please seed pharmacies first.');
        return;
    }

    // Get products
    const products = await prisma.product.findMany({
        where: { isActive: true },
        take: 50
    });

    if (products.length === 0) {
        console.log('⚠️  No products found. Please seed products first.');
        return;
    }

    console.log(`📝 Found ${tdvUsers.length} TDVs, ${pharmacies.length} pharmacies, ${products.length} products`);

    // Generate sales data for last 12 months with realistic trends
    const months = [
        { month: 1, year: 2024, name: 'Jan 2024', growth: 1.0, orders: 80 },
        { month: 2, year: 2024, name: 'Feb 2024', growth: 1.05, orders: 85 },
        { month: 3, year: 2024, name: 'Mar 2024', growth: 1.12, orders: 95 },
        { month: 4, year: 2024, name: 'Apr 2024', growth: 1.08, orders: 90 },
        { month: 5, year: 2024, name: 'May 2024', growth: 1.15, orders: 100 },
        { month: 6, year: 2024, name: 'Jun 2024', growth: 1.20, orders: 110 },
        { month: 7, year: 2024, name: 'Jul 2024', growth: 1.18, orders: 105 },
        { month: 8, year: 2024, name: 'Aug 2024', growth: 1.25, orders: 120 },
        { month: 9, year: 2024, name: 'Sep 2024', growth: 1.30, orders: 130 },
        { month: 10, year: 2024, name: 'Oct 2024', growth: 1.35, orders: 140 },
        { month: 11, year: 2024, name: 'Nov 2024', growth: 1.42, orders: 150 },
        { month: 12, year: 2024, name: 'Dec 2024', growth: 1.50, orders: 160 }
    ];

    let totalOrders = 0;
    let totalRevenue = 0;

    for (const monthData of months) {
        console.log(`\n📅 Creating orders for ${monthData.name}...`);

        const ordersToCreate = monthData.orders;
        let monthOrders = 0;
        let monthRevenue = 0;

        for (let i = 0; i < ordersToCreate; i++) {
            try {
                // Random date in the month
                const day = Math.floor(Math.random() * 28) + 1;
                const orderDate = new Date(monthData.year, monthData.month - 1, day);

                // Random TDV and pharmacy
                const tdv = tdvUsers[Math.floor(Math.random() * tdvUsers.length)];
                const pharmacy = pharmacies[Math.floor(Math.random() * pharmacies.length)];

                // Generate order items (2-8 products per order)
                const numItems = Math.floor(Math.random() * 7) + 2;
                const orderItems = [];
                let orderTotal = 0;

                for (let j = 0; j < numItems; j++) {
                    const product = products[Math.floor(Math.random() * products.length)];
                    const quantity = Math.floor(Math.random() * 10) + 1;
                    const price = product.price || 100000;
                    const subtotal = quantity * price;

                    orderItems.push({
                        productId: product.id,
                        quantity,
                        price,
                        subtotal,
                        discount: 0
                    });

                    orderTotal += subtotal;
                }

                // Apply growth factor to simulate business growth
                orderTotal = Math.floor(orderTotal * monthData.growth);

                // Create order
                const orderNumber = `ORD-${monthData.year}${String(monthData.month).padStart(2, '0')}-${String(i + 1).padStart(4, '0')}`;

                const order = await prisma.order.create({
                    data: {
                        orderNumber,
                        userId: tdv.id,
                        pharmacyId: pharmacy.id,
                        status: 'COMPLETED',
                        totalAmount: orderTotal,
                        discount: 0,
                        paymentStatus: 'PAID',
                        paymentMethod: Math.random() > 0.5 ? 'BANK_TRANSFER' : 'CASH',
                        deliveryDate: new Date(orderDate.getTime() + 2 * 24 * 60 * 60 * 1000), // +2 days
                        createdAt: orderDate,
                        updatedAt: orderDate,
                        items: {
                            create: orderItems
                        }
                    }
                });

                monthOrders++;
                monthRevenue += orderTotal;

                if ((i + 1) % 20 === 0) {
                    console.log(`  ✅ Created ${i + 1}/${ordersToCreate} orders...`);
                }
            } catch (error) {
                console.log(`  ⚠️  Error creating order: ${error.message}`);
            }
        }

        totalOrders += monthOrders;
        totalRevenue += monthRevenue;

        console.log(`  ✅ ${monthData.name}: ${monthOrders} orders, ${(monthRevenue / 1000000).toFixed(2)}M VND`);
    }

    console.log('\n========================================');
    console.log('✅ Sales Data Seeded Successfully!');
    console.log('========================================');
    console.log(`📊 Total Orders: ${totalOrders}`);
    console.log(`💰 Total Revenue: ${(totalRevenue / 1000000).toFixed(2)}M VND`);
    console.log(`📈 Average Order Value: ${(totalRevenue / totalOrders / 1000).toFixed(0)}K VND`);
    console.log('========================================');
    console.log('\n📈 Monthly Trend Summary:');
    console.log('  Jan 2024: Baseline (100%)');
    console.log('  Feb 2024: +5% growth');
    console.log('  Mar 2024: +12% growth');
    console.log('  Apr 2024: +8% growth');
    console.log('  May 2024: +15% growth');
    console.log('  Jun 2024: +20% growth');
    console.log('  Jul 2024: +18% growth');
    console.log('  Aug 2024: +25% growth');
    console.log('  Sep 2024: +30% growth');
    console.log('  Oct 2024: +35% growth');
    console.log('  Nov 2024: +42% growth');
    console.log('  Dec 2024: +50% growth');
    console.log('\n🎯 This data will show clear upward trend in Biz Review!');
}

async function main() {
    try {
        await seedSalesData();
    } catch (error) {
        console.error('❌ Error seeding sales data:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    });
