
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const DEVICES = [
    'iPhone 13 Pro', 'iPhone 14', 'iPhone 15 Pro Max',
    'Samsung Galaxy S23', 'Samsung Galaxy A54',
    'Oppo Reno 10', 'Xiaomi Redmi Note 12'
];

const LOCATIONS_HCM = [
    { lat: 10.7769, lng: 106.7009 }, // Quan 1
    { lat: 10.7932, lng: 106.6853 }, // Phu Nhuan
    { lat: 10.7626, lng: 106.6602 }, // Quan 5
    { lat: 10.8407, lng: 106.6575 }, // Go Vap
    { lat: 10.8231, lng: 106.6297 }, // Quan 12
    { lat: 10.7324, lng: 106.7218 }  // Quan 7
];

const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];
const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const seedLiveTracking = async () => {
    console.log('🚀 Seeding Live Tracking Demo Data (70% Active)...');

    try {
        // 1. Get all TDVs
        const tdvs = await prisma.user.findMany({
            where: { role: 'TDV' }
        });

        console.log(`Found ${tdvs.length} TDVs.`);

        // 2. Clear today's visits to prevent duplicate/messy data
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Only delete check-in visits, keep planned ones ideally, but for demo simplicity we clean up
        // Or better: Update existing planned visits to Checked In? 
        // Let's create new ones for simplicity. 
        await prisma.visit.deleteMany({
            where: {
                createdAt: { gte: today },
                checkInLat: { not: null } // Delete historical check-ins of today
            }
        });

        // 3. Create Visits
        let activeCount = 0;

        for (const tdv of tdvs) {
            // 70% Chance to be Active
            const isActive = Math.random() < 0.7;

            if (isActive) {
                // Pick a random pharmacy to "visit"
                const pharmacy = await prisma.pharmacy.findFirst({
                    orderBy: {
                        // Random trick: Prisma doesn't support random order easily, just take first 50 skip random
                        id: 'asc'
                    },
                    skip: getRandomInt(0, 50)
                }) || await prisma.pharmacy.findFirst();

                if (!pharmacy) {
                    console.log('⚠️ No pharmacy found, skipping.');
                    continue;
                }

                // Generate Random Location near base points
                const baseLoc = getRandom(LOCATIONS_HCM);
                const lat = baseLoc.lat + (Math.random() - 0.5) * 0.05; // +/- 2km range
                const lng = baseLoc.lng + (Math.random() - 0.5) * 0.05;

                // Meta Data
                const meta = {
                    device: getRandom(DEVICES),
                    battery: getRandomInt(40, 98),
                    appVersion: '2.1.0',
                    signal: getRandom(['4G', '5G', 'WiFi']),
                    lastAction: 'Check-in tại nhà thuốc'
                };

                // Create Daily Route Structure if needed (optional)

                // Create Visit
                await prisma.visit.create({
                    data: {
                        repId: tdv.id,
                        pharmacyId: pharmacy.id,
                        checkInLat: lat,
                        checkInLng: lng,
                        checkInDistance: getRandomInt(5, 50), // 5m - 50m
                        status: 'CHECKED_IN',
                        actualArrival: new Date(),
                        notes: JSON.stringify(meta), // STORE META HERE
                        checkInPhoto: 'https://via.placeholder.com/150'
                    }
                });

                activeCount++;
            }
        }

        console.log(`✅ Seeded ${activeCount} active TDVs out of ${tdvs.length} total.`);

    } catch (error) {
        console.error('Error seeding live tracking:', error);
    } finally {
        await prisma.$disconnect();
    }
};

seedLiveTracking();
