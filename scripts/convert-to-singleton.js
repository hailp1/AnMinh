#!/usr/bin/env node
/**
 * Script to convert all Prisma files to use singleton pattern
 * Replaces "const prisma = new PrismaClient()" with singleton import
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Find all JS files in prisma/ and scripts/ directories
const prismaFiles = glob.sync('DMS/backend/prisma/*.js');
const scriptFiles = glob.sync('DMS/backend/scripts/*.js');
const allFiles = [...prismaFiles, ...scriptFiles];

let updatedCount = 0;
let skippedCount = 0;

console.log(`\nFound ${allFiles.length} files to process...\n`);

allFiles.forEach(filePath => {
    const fileName = path.basename(filePath);
    let content = fs.readFileSync(filePath, 'utf8');

    // Check if already using singleton
    if (content.includes('from "../lib/prisma.js"') || content.includes('from "../../lib/prisma.js"')) {
        console.log(`SKIP: ${fileName} - Already using singleton`);
        skippedCount++;
        return;
    }

    // Check if creates new PrismaClient
    if (!content.includes('const prisma = new PrismaClient()')) {
        console.log(`SKIP: ${fileName} - No PrismaClient instantiation`);
        skippedCount++;
        return;
    }

    // Determine import path
    const importPath = filePath.includes('/prisma/') ? '../lib/prisma.js' : '../lib/prisma.js';

    // Replace imports
    content = content.replace(
        /import \{ PrismaClient \} from ['"]@prisma\/client['"];?/g,
        `import { prisma } from '${importPath}';`
    );

    content = content.replace(
        /const \{ PrismaClient \} = require\(['"]@prisma\/client['"]\);?/g,
        `const { prisma } = require('${importPath}');`
    );

    // Remove prisma instantiation line
    content = content.replace(/const prisma = new PrismaClient\(\);?\r?\n?/g, '');

    // Write back
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`UPDATE: ${fileName}`);
    updatedCount++;
});

console.log('\n========================================');
console.log('Conversion Complete!');
console.log(`Total files: ${allFiles.length}`);
console.log(`Updated: ${updatedCount}`);
console.log(`Skipped: ${skippedCount}`);
console.log('========================================\n');
