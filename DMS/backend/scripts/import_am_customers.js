
import { PrismaClient } from '@prisma/client';
import XLSX from 'xlsx';

const prisma = new PrismaClient();
const filePath = '/app/AM_Cus.xlsx';

const mapHeader = (header) => {
    if (!header) return null;
    const h = String(header).toLowerCase();

    // Only map explicit code headers
    if (h.includes('mã kh')) return 'code';

    if (h.includes('nhà thuốc') || h.includes('khách hàng') || h.includes('nha thuoc')) return 'name';
    if (h.includes('địa chỉ') || h.includes('dia chi')) return 'address';
    if (h.includes('loại') || h.includes('loai')) return 'classification';
    if (h.includes('kênh') || h.includes('channel')) return 'channel';
    if (h.includes('khu vực') || h.includes('khu vuc')) return 'rawRegion';
    if (h.includes('hình thức') || h.includes('hinh thuc')) return 'organizationType';
    if (h.includes('người đứng đầu') || h.includes('chủ')) return 'ownerName';
    if (h.includes('dược sĩ') || h.includes('duoc si')) return 'pharmacistName';
    if (h.includes('nhân viên bán')) return 'staffName';
    if (h.includes('đt người quản lý') || h.includes('sđt')) return 'phone';
    if (h.includes('đt đặt hàng') || h.includes('dat hang')) return 'orderPhone';
    if (h.includes('tần độ') || h.includes('tan do')) return 'orderFrequency';
    if (h.includes('lk toàn phần') || h.includes('lk')) return 'linkCode';
    if (h.includes('chain')) return 'isChain';
    return null;
};

async function main() {
    try {
        console.log(`Reading file: ${filePath}`);
        const workbook = XLSX.readFile(filePath);
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

        if (data.length === 0) return;

        const headers = data[0];
        const idxMap = {};

        headers.forEach((h, i) => {
            const key = mapHeader(h);
            if (key) {
                if (idxMap[key] === undefined) idxMap[key] = i;
            }
        });

        // Heuristics
        if (idxMap.name === undefined) idxMap.name = 1;

        // Check if Code column (Index 2 usually) has data?
        // If not, we will generator.

        // KA column detection for linkCode/managerCode?
        let kaIndex = -1;
        if (data.length > 1) {
            data[1].forEach((val, i) => {
                if (String(val).includes('KA001')) kaIndex = i;
            });
        }

        let count = 0;
        for (let i = 1; i < data.length; i++) {
            const row = data[i];
            if (!row || row.length === 0) continue;

            let code = null;

            // Try explicit
            if (idxMap.code !== undefined && row[idxMap.code]) {
                code = String(row[idxMap.code]).trim();
            }

            // If code missing OR is "KA001" (generic), generate unique
            if (!code || code === 'KA001') {
                const stt = row[0];
                if (stt) {
                    code = `KH_${String(stt).padStart(4, '0')}`;
                } else {
                    code = `KH_ROW_${i}`;
                }
            }

            const getVal = (key) => (idxMap[key] !== undefined && row[idxMap[key]]) ? String(row[idxMap[key]]).trim() : null;
            const name = idxMap.name !== undefined ? String(row[idxMap.name]) : 'Unknown';

            const pharmacyData = {
                name: name,
                code: code,
                address: getVal('address'),
                classification: getVal('classification'),
                channel: getVal('channel'),
                rawRegion: getVal('rawRegion'),
                organizationType: getVal('organizationType'),
                ownerName: getVal('ownerName'),
                pharmacistName: getVal('pharmacistName'),
                staffName: getVal('staffName'),
                phone: getVal('phone'),
                orderPhone: getVal('orderPhone'),
                orderFrequency: getVal('orderFrequency'),
                linkCode: getVal('linkCode'), // or use row[kaIndex]?
                isChain: getVal('isChain') ? (['yes', 'co', 't', 'true'].includes(String(getVal('isChain')).toLowerCase())) : false,
                isActive: true
            };

            // If KA index found and linkCode not mapped, use it
            if (!pharmacyData.linkCode && kaIndex !== -1 && row[kaIndex]) {
                pharmacyData.linkCode = String(row[kaIndex]);
            }

            // Remove undefined keys
            Object.keys(pharmacyData).forEach(key => pharmacyData[key] === null && delete pharmacyData[key]);

            try {
                await prisma.pharmacy.upsert({
                    where: { code: code },
                    update: pharmacyData,
                    create: { ...pharmacyData, isActive: true }
                });
                count++;
            } catch (rowError) {
                // console.error(`Error on row ${i}:`, rowError.message);
            }
        }

        console.log(`Successfully processed ${count} customers.`);

    } catch (e) {
        console.error('Import failed:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
