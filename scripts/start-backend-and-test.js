#!/usr/bin/env node

/**
 * Start Backend and Test - Tự động start backend và test
 */

import http from 'http';
import { exec } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { promisify } from 'util';

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

console.log('\n===============================================================');
console.log('     AUTO START BACKEND VA TEST');
console.log('===============================================================\n');

// Test Backend
function testBackend() {
  return new Promise((resolve) => {
    const req = http.get('http://localhost:5000/api', { timeout: 2000 }, (res) => {
      resolve({ running: true, status: res.statusCode });
    });
    
    req.on('error', () => {
      resolve({ running: false });
    });
    
    req.on('timeout', () => {
      req.destroy();
      resolve({ running: false });
    });
  });
}

async function main() {
  // Step 1: Check if backend is running
  console.log('Buoc 1: Kiem tra Backend...');
  let backendStatus = await testBackend();

  if (backendStatus.running) {
    console.log('   [OK] Backend dang chay!\n');
    console.log('Ban co the test login ngay:\n');
    console.log('   URL: http://localhost:3099/admin/login');
    console.log('   Employee Code: admin');
    console.log('   Password: admin\n');
    return;
  }

  console.log('   [FAIL] Backend KHONG chay!\n');

  // Step 2: Start backend
  console.log('Buoc 2: Dang start Backend...');
  console.log('   -> Mo terminal moi de chay Backend...\n');

  const isWindows = process.platform === 'win32';

  if (isWindows) {
    try {
      await execAsync(`start "Backend Server" cmd /k "cd /d ${rootDir} && echo === BACKEND SERVER === && node server.js"`);
      console.log('   [OK] Da mo terminal Backend!\n');
      console.log('   [WAIT] Dang cho 5 giay de Backend khoi dong...\n');
      
      // Wait 5 seconds
      await new Promise(r => setTimeout(r, 5000));
      
      // Step 3: Test again
      console.log('Buoc 3: Kiem tra lai Backend...');
      let retries = 5;
      let success = false;
      
      for (let i = 1; i <= retries; i++) {
        backendStatus = await testBackend();
        if (backendStatus.running) {
          console.log(`   [OK] Backend DA CHAY sau ${i} lan thu!\n`);
          success = true;
          break;
        }
        if (i < retries) {
          console.log(`   [WAIT] Lan thu ${i}/${retries}... Backend chua san sang`);
          await new Promise(r => setTimeout(r, 2000));
        }
      }
      
      if (success) {
        console.log('===============================================================');
        console.log('     KET QUA');
        console.log('===============================================================\n');
        console.log('[OK] Backend DA CHAY THANH CONG!\n');
        console.log('Ban co the:');
        console.log('   1. Test login: http://localhost:3099/admin/login');
        console.log('   2. Employee Code: admin');
        console.log('   3. Password: admin\n');
      } else {
        console.log('\n[WARN] Backend chua san sang sau 5 lan thu');
        console.log('   -> Kiem tra terminal Backend co loi gi khong');
        console.log('   -> Hoac cho them vai giay va test lai\n');
      }
    } catch (error) {
      console.log('   [WARN] Khong the mo terminal moi');
      console.log('   -> Ban can tu start backend: node server.js\n');
      console.log('   Loi:', error.message);
    }
  } else {
    console.log('   [INFO] He thong khong phai Windows');
    console.log('   -> Ban can tu start backend: node server.js\n');
  }
}

main().catch(console.error);
