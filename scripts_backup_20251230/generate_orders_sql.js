
import fs from 'fs';

async function generateOrders() {
    let sql = '-- Generated Order Data\n';

    // RECONSTRUCT IDs (Must match generate_base_sql.js)
    const tdvIds = [];
    for (let i = 1; i <= 5; i++) {
        tdvIds.push(`USER_TDV00${i}`);
    }
    const prodIds = [];
    const prodPrices = [];
    for (let i = 1; i <= 20; i++) {
        prodIds.push(`PROD_ID_${i}`);
        prodPrices.push(100000 + (i * 5000));
    }

    // Generate ~50 orders per TDV over last 30 days
    let orderGlobalCount = 1;

    for (let t = 0; t < tdvIds.length; t++) {
        const tdvId = tdvIds[t];
        // Assume simplified customer ID logic: CUST_ID_1 to CUST_ID_100 (for first TDV) etc
        // Each TDV has roughly 100 customers: range [t*100 + 1, (t+1)*100]
        const startCust = (t * 100) + 1;
        const endCust = (t + 1) * 100;

        for (let i = 0; i < 50; i++) {
            // Random customer in their list
            const custIdx = Math.floor(Math.random() * (endCust - startCust + 1)) + startCust;
            const custId = `CUST_ID_${custIdx}`;

            const orderId = `ORDER_${t}_${orderGlobalCount}`;
            const orderNum = `ORD-2024-${orderGlobalCount}`;

            // Random date in last 30 days
            const daysAgo = Math.floor(Math.random() * 30);
            const dateStr = `NOW() - interval '${daysAgo} day'`;

            const status = Math.random() > 0.2 ? 'COMPLETED' : 'CONFIRMED';

            // Line items
            const itemCount = Math.floor(Math.random() * 3) + 1;
            let total = 0;
            let itemSql = '';

            for (let k = 0; k < itemCount; k++) {
                const pIdx = Math.floor(Math.random() * prodIds.length);
                const pid = prodIds[pIdx];
                const price = prodPrices[pIdx];
                const qty = Math.floor(Math.random() * 5) + 1;
                const sub = price * qty;
                total += sub;

                const itemId = `ITEM_${orderId}_${k}`;
                itemSql += `INSERT INTO "OrderItem" (id, "orderId", "productId", quantity, price, discount, subtotal, "createdAt", "updatedAt") VALUES ('${itemId}', '${orderId}', '${pid}', ${qty}, ${price}, 0, ${sub}, ${dateStr}, ${dateStr}) ON CONFLICT (id) DO NOTHING;\n`;
            }

            sql += `INSERT INTO "Order" (id, "orderNumber", "userId", "pharmacyId", status, "totalAmount", "paymentStatus", "paymentMethod", "deliveryDate", "createdAt", "updatedAt") VALUES ('${orderId}', '${orderNum}', '${tdvId}', '${custId}', '${status}', ${total}, 'PAID', 'CASH', ${dateStr} + interval '2 day', ${dateStr}, ${dateStr}) ON CONFLICT (id) DO NOTHING;\n`;

            sql += itemSql;
            orderGlobalCount++;
        }
    }

    fs.writeFileSync('scripts/seed_orders.sql', sql);
    console.log('SQL Generated: seed_orders.sql');
}

generateOrders();
