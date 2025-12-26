// Seed Visit Plans for TDV Performance
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function seedVisitPlans() {
    console.log('📅 Seeding Visit Plans...\n');

    // Get TDV users
    const tdvUsers = await prisma.user.findMany({
        where: { role: 'TDV', isActive: true }
    });

    if (tdvUsers.length === 0) {
        console.log('⚠️  No TDV users found. Please seed users first.');
        return;
    }

    // Get pharmacies
    const pharmacies = await prisma.pharmacy.findMany({
        where: { isActive: true },
        take: 500
    });

    if (pharmacies.length === 0) {
        console.log('⚠️  No pharmacies found. Please seed pharmacies first.');
        return;
    }

    console.log(`👤 Found ${tdvUsers.length} TDV users`);
    console.log(`🏪 Found ${pharmacies.length} pharmacies\n`);

    let totalPlans = 0;
    let completedVisits = 0;

    // Generate visit plans for last 3 months
    const today = new Date();
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    for (const tdv of tdvUsers) {
        console.log(`\n👤 Creating visits for ${tdv.name || tdv.employeeCode}...`);

        // Assign 20-30 pharmacies per TDV
        const pharmaciesPerTDV = 20 + Math.floor(Math.random() * 11);
        const assignedPharmacies = pharmacies
            .sort(() => 0.5 - Math.random())
            .slice(0, pharmaciesPerTDV);

        let tdvPlans = 0;
        let tdvCompleted = 0;

        // Generate visits for each week
        const currentDate = new Date(threeMonthsAgo);

        while (currentDate <= today) {
            // Each TDV visits 4-6 pharmacies per week
            const visitsThisWeek = 4 + Math.floor(Math.random() * 3);

            for (let i = 0; i < visitsThisWeek; i++) {
                const pharmacy = assignedPharmacies[Math.floor(Math.random() * assignedPharmacies.length)];

                // Random day of week (Mon-Fri)
                const dayOfWeek = 1 + Math.floor(Math.random() * 5); // 1-5 (Mon-Fri)
                const visitDate = new Date(currentDate);
                visitDate.setDate(visitDate.getDate() + dayOfWeek);

                // Skip if date is in future
                if (visitDate > today) continue;

                // 90% compliance rate (90% of plans are visited)
                const isVisited = Math.random() < 0.9;

                // 65% strike rate (65% of visits result in orders)
                const hasOrder = isVisited && Math.random() < 0.65;

                const status = hasOrder ? 'COMPLETED' :
                    isVisited ? 'COMPLETED' :
                        visitDate < today ? 'MISSED' : 'PLANNED';

                try {
                    const visitPlan = await prisma.visitPlan.create({
                        data: {
                            userId: tdv.id,
                            pharmacyId: pharmacy.id,
                            territoryId: pharmacy.territoryId,
                            visitDate,
                            dayOfWeek,
                            frequency: pharmacy.visitFrequency === 2 ? 'F8' : 'F4',
                            status,
                            purpose: hasOrder ? 'Đặt hàng' : isVisited ? 'Tư vấn sản phẩm' : 'Viếng thăm định kỳ',
                            checkInTime: isVisited ? new Date(visitDate.getTime() + 9 * 60 * 60 * 1000) : null, // 9 AM
                            checkOutTime: isVisited ? new Date(visitDate.getTime() + 10 * 60 * 60 * 1000) : null, // 10 AM
                            completedAt: isVisited ? new Date(visitDate.getTime() + 10 * 60 * 60 * 1000) : null
                        }
                    });

                    tdvPlans++;
                    if (isVisited) tdvCompleted++;

                    // Update pharmacy last visit date
                    if (isVisited && visitDate > (pharmacy.lastVisitDate || new Date(0))) {
                        await prisma.pharmacy.update({
                            where: { id: pharmacy.id },
                            data: { lastVisitDate: visitDate }
                        });
                    }

                } catch (error) {
                    // Skip duplicates
                }
            }

            // Move to next week
            currentDate.setDate(currentDate.getDate() + 7);
        }

        totalPlans += tdvPlans;
        completedVisits += tdvCompleted;

        console.log(`  ✅ Created ${tdvPlans} plans (${tdvCompleted} completed, ${((tdvCompleted / tdvPlans) * 100).toFixed(1)}% MCP)`);
    }

    console.log('\n========================================');
    console.log('✅ Visit Plans Seeded Successfully!');
    console.log('========================================');
    console.log(`📅 Total Plans: ${totalPlans}`);
    console.log(`✅ Completed Visits: ${completedVisits}`);
    console.log(`📊 Overall MCP Rate: ${((completedVisits / totalPlans) * 100).toFixed(1)}%`);
    console.log('========================================');

    // Calculate additional metrics
    const thisMonth = new Date();
    thisMonth.setDate(1);
    thisMonth.setHours(0, 0, 0, 0);

    const thisMonthPlans = await prisma.visitPlan.count({
        where: {
            visitDate: { gte: thisMonth }
        }
    });

    const thisMonthCompleted = await prisma.visitPlan.count({
        where: {
            visitDate: { gte: thisMonth },
            status: { in: ['COMPLETED'] }
        }
    });

    console.log(`\n📊 This Month:`);
    console.log(`   Plans: ${thisMonthPlans}`);
    console.log(`   Completed: ${thisMonthCompleted}`);
    console.log(`   MCP Rate: ${((thisMonthCompleted / thisMonthPlans) * 100).toFixed(1)}%`);
}

async function main() {
    try {
        await seedVisitPlans();
    } catch (error) {
        console.error('❌ Error:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

main().catch(console.error);
