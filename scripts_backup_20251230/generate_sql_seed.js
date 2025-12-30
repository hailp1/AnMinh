
import fs from 'fs';

// Hardcoded hash for '123456'
const HASHED_PASS = '$2a$10$abcdefghijklmnopqrstuvwxyz123456';

function getRandomLoc(centerLat, centerLng, radiusInKm) {
    const y0 = centerLat;
    const x0 = centerLng;
    const rd = radiusInKm / 111300;
    const u = Math.random();
    const v = Math.random();
    const w = rd * Math.sqrt(u);
    const t = 2 * Math.PI * v;
    const x = w * Math.cos(t);
    const y = w * Math.sin(t);
    return { lat: y + y0, lng: x + x0 };
}

async function generate() {
    let sql = '-- Generated Seed Data\n';
    sql += 'BEGIN;\n\n';

    // 1. REGION, BU, TERRITORY
    const regionId = 'REGION_SOUTH_ID';
    const buId = 'BU_HCM_ID';
    const terrIds = [];

    // Use concrete UUIDs where possible or string IDs if allowed by schema (Schema says String @id @default(uuid()), so string IDs are fine)
    // Actually schema uses uuid(), but we can insert our own strings if they don't collision with existing uuids.
    // Ideally usage of gen_random_uuid() is better but let's stick to our predictable strings for demo stability or use valid UUIDs if validation enforces format.
    // Postgres uuid column enforces format. If the columns are 'text', it's fine.
    // Schema: id String @id @default(uuid()). In Prisma this maps to Text usually unless @db.Uuid.
    // Let's assume Text.

    // Clean data first? 
    // sql += 'TRUNCATE TABLE "VisitPlan", "Route", "CustomerAssignment", "Pharmacy", "Product", "User", "Territory", "BusinessUnit", "Region" CASCADE;\n';
    // Risks foreign key issues if not cascaded properly. Let's rely on ON CONFLICT for now or just append.

    sql += `INSERT INTO "Region" (id, code, name, "createdAt", "updatedAt") VALUES ('${regionId}', 'SOUTH', 'Miền Nam', NOW(), NOW()) ON CONFLICT (code) DO NOTHING;\n`;
    sql += `INSERT INTO "BusinessUnit" (id, code, name, "regionId", "createdAt", "updatedAt") VALUES ('${buId}', 'BU_HCM', 'HCM Business Unit', '${regionId}', NOW(), NOW()) ON CONFLICT (code) DO NOTHING;\n`;

    const dists = ['Q1', 'Q3', 'Q5', 'Q10', 'TanBinh', 'BinhThanh'];
    dists.forEach((d, i) => {
        const tid = `TERR_ID_${d}`;
        terrIds.push(tid);
        sql += `INSERT INTO "Territory" (id, code, name, "businessUnitId", "regionId", districts, "createdAt", "updatedAt") VALUES ('${tid}', 'TER_${d}', 'Khu vực ${d}', '${buId}', '${regionId}', ARRAY['${d}'], NOW(), NOW()) ON CONFLICT (code) DO NOTHING;\n`;
    });

    // 2. USERS
    const ssId = 'USER_SS001';
    sql += `INSERT INTO "User" (id, "employeeCode", username, name, email, password, role, "isActive", channel, "createdAt", "updatedAt") VALUES ('${ssId}', 'SS001', 'SS001', 'Nguyễn Văn Quản Lý', 'ss001@ammedtech.com', '${HASHED_PASS}', 'MANAGER', true, 'OTC', NOW(), NOW()) ON CONFLICT ("employeeCode") DO NOTHING;\n`;

    const tdvIds = [];
    for (let i = 1; i <= 5; i++) {
        const uid = `USER_TDV00${i}`;
        const code = `TDV${i.toString().padStart(3, '0')}`;
        tdvIds.push(uid);
        sql += `INSERT INTO "User" (id, "employeeCode", username, name, email, password, role, "managerId", "isActive", channel, "regionId", "createdAt", "updatedAt") VALUES ('${uid}', '${code}', '${code}', 'Trình Dược Viên ${i}', '${code.toLowerCase()}@ammedtech.com', '${HASHED_PASS}', 'TDV', '${ssId}', true, 'OTC', '${regionId}', NOW(), NOW()) ON CONFLICT ("employeeCode") DO NOTHING;\n`;
    }

    // 3. PRODUCTS
    const prodIds = [];
    for (let i = 1; i <= 20; i++) {
        const pid = `PROD_ID_${i}`;
        const code = `PROD${i.toString().padStart(3, '0')}`;
        prodIds.push(pid);
        const price = 100000 + (i * 5000);
        sql += `INSERT INTO "Product" (id, code, name, price, unit, "packingSpec", manufacturer, "countryOfOrigin", "isActive", "createdAt", "updatedAt") VALUES ('${pid}', '${code}', 'Sản phẩm mẫu AM ${i}', ${price}, 'Hộp', 'Hộp 3 vỉ x 10 viên', 'AM Pharma', 'Vietnam', true, NOW(), NOW()) ON CONFLICT (code) DO NOTHING;\n`;
    }

    // 4. CUSTOMERS & ASSIGNMENTS & ROUTES (500)
    const hcmCenter = { lat: 10.7769, lng: 106.7009 };
    const customersPerTDV = 500 / 5;
    let custGlobalIndex = 1;

    for (let tdvIndex = 0; tdvIndex < tdvIds.length; tdvIndex++) {
        const tdvId = tdvIds[tdvIndex];

        for (let j = 0; j < customersPerTDV; j++) {
            const cid = `CUST_ID_${custGlobalIndex}`;
            const code = `KH${custGlobalIndex.toString().padStart(4, '0')}`;
            const terrId = terrIds[Math.floor(Math.random() * terrIds.length)];
            const loc = getRandomLoc(hcmCenter.lat, hcmCenter.lng, 10);

            sql += `INSERT INTO "Pharmacy" (id, code, name, "tradeName", address, district, province, phone, type, channel, status, latitude, longitude, "territoryId", "visitFrequency", "createdAt", "updatedAt") VALUES ('${cid}', '${code}', 'Nhà Thuốc Demo ${custGlobalIndex}', 'Nhà Thuốc Số ${custGlobalIndex}', 'Số ${custGlobalIndex} Đường Demo, HCM', 'Q1', 'Hồ Chí Minh', '0901234567', 'PHARMACY', 'OTC', 'ACTIVE', ${loc.lat}, ${loc.lng}, '${terrId}', 4, NOW(), NOW()) ON CONFLICT (code) DO NOTHING;\n`;

            const assignId = `ASSIGN_${tdvIndex}_${custGlobalIndex}`;
            // Use ON CONFLICT DO NOTHING for assignments too if re-running
            // But Assignment doesn't have a unique key on (userId, pharmacyId) EXCEPT maybe implicitly.
            // Let's assume safe insert since IDs are deterministic here
            sql += `INSERT INTO "CustomerAssignment" (id, "userId", "pharmacyId", "territoryId", "assignedBy", "isActive", "createdAt", "updatedAt") VALUES ('${assignId}', '${tdvId}', '${cid}', '${terrId}', 'SYSTEM', true, NOW(), NOW()) ON CONFLICT (id) DO NOTHING;\n`;

            const dayOfWeek = Math.floor(Math.random() * 6) + 1;
            const routeId = `ROUTE_${tdvIndex}_${custGlobalIndex}`;
            sql += `INSERT INTO "Route" (id, "userId", "pharmacyId", "dayOfWeek", frequency, "visitOrder", "createdAt", "updatedAt") VALUES ('${routeId}', '${tdvId}', '${cid}', ${dayOfWeek}, 'F4', 1, NOW(), NOW()) ON CONFLICT (id) DO NOTHING;\n`;

            const vpId = `VP_${tdvIndex}_${custGlobalIndex}`;
            sql += `INSERT INTO "VisitPlan" (id, "userId", "pharmacyId", "territoryId", "visitDate", status, "dayOfWeek", "createdAt", "updatedAt") VALUES ('${vpId}', '${tdvId}', '${cid}', '${terrId}', NOW() + interval '1 day', 'PLANNED', ${dayOfWeek}, NOW(), NOW()) ON CONFLICT (id) DO NOTHING;\n`;

            custGlobalIndex++;
        }
    }

    sql += 'COMMIT;\n';

    fs.writeFileSync('scripts/seed_output.sql', sql);
    console.log('SQL Generated: seed_output.sql');
}

generate();
