
import XLSX from 'xlsx';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const filePath = 'd:/AM_DMS/data/AM_Cus.xlsx';
const outputPath = path.join(__dirname, 'headers.log');

try {
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

    let output = '';

    const row0 = data[0];
    output += '--- Row 0 Breakdown ---\n';
    row0.forEach((col, idx) => {
        output += `${idx}: ${col}\n`;
    });

    const row1 = data[1];
    output += '--- Row 1 Breakdown ---\n';
    if (row1) {
        row1.forEach((col, idx) => {
            output += `${idx}: ${col}\n`;
        });
    }

    fs.writeFileSync(outputPath, output);
    console.log(`Written to ${outputPath}`);

} catch (error) {
    console.error(error);
}
