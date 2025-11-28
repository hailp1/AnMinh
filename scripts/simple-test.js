#!/usr/bin/env node

import http from 'http';

console.log('\n===============================================================');
console.log('     KIEM TRA NGUYEN NHAN GOC RE - 404 ROUTE');
console.log('===============================================================\n');

// Test 1: Backend
console.log('1. Kiem tra Backend...');
const test1 = new Promise((resolve) => {
  const req = http.get('http://localhost:5000/api', { timeout: 3000 }, (res) => {
    if (res.statusCode === 200) {
      console.log('   [OK] Backend dang chay\n');
      resolve(true);
    } else {
      console.log(`   [FAIL] Backend tra ve ${res.statusCode}\n`);
      resolve(false);
    }
  });
  
  req.on('error', () => {
    console.log('   [FAIL] Backend KHONG chay!\n');
    console.log('=> DAY LA NGUYEN NHAN GOC RE!\n');
    console.log('   -> Start backend: node server.js\n');
    resolve(false);
  });
});

const backendOk = await test1;

if (!backendOk) {
  process.exit(1);
}

await new Promise(r => setTimeout(r, 500));

// Test 2: Route GET
console.log('2. Kiem tra Route GET /api/auth/login...');
const test2 = new Promise((resolve) => {
  const req = http.get('http://localhost:5000/api/auth/login', { timeout: 3000 }, (res) => {
    if (res.statusCode === 405) {
      console.log('   [OK] Route TON TAI (405 = dung)\n');
      resolve(true);
    } else if (res.statusCode === 404) {
      console.log('   [FAIL] Route KHONG TON TAI (404)\n');
      console.log('=> Routes chua duoc register!\n');
      resolve(false);
    } else {
      console.log(`   [WARN] Status: ${res.statusCode}\n`);
      resolve(false);
    }
  });
  
  req.on('error', () => {
    console.log('   [FAIL] Error\n');
    resolve(false);
  });
});

const routeGetOk = await test2;

await new Promise(r => setTimeout(r, 500));

// Test 3: Route POST
console.log('3. Kiem tra Route POST /api/auth/login...');
const test3 = new Promise((resolve) => {
  const body = JSON.stringify({ employeeCode: 'admin', password: 'admin' });
  const req = http.request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/auth/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(body),
    },
    timeout: 5000,
  }, (res) => {
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
      if (res.statusCode === 200) {
        console.log('   [OK] POST route HOAT DONG (200 OK)\n');
        const json = JSON.parse(data);
        console.log(`   [OK] User: ${json.user?.name} (${json.user?.role})\n`);
        resolve(true);
      } else if (res.statusCode === 404) {
        console.log('   [FAIL] POST route KHONG TON TAI (404)\n');
        resolve(false);
      } else if (res.statusCode === 400) {
        console.log('   [WARN] Status 400 - User khong ton tai hoac password sai\n');
        console.log('   -> Tao user: npm run create:users\n');
        resolve(true); // Route tồn tại
      } else {
        console.log(`   [WARN] Status: ${res.statusCode}\n`);
        resolve(false);
      }
    });
  });
  
  req.on('error', () => {
    console.log('   [FAIL] Error\n');
    resolve(false);
  });
  
  req.write(body);
  req.end();
});

const routePostOk = await test3;

// Summary
console.log('===============================================================');
console.log('     KET LUAN');
console.log('===============================================================\n');

if (backendOk && routeGetOk && routePostOk) {
  console.log('[OK] TAT CA DEU HOAT DONG TOT!\n');
  console.log('Ban co the login ngay bay gio:');
  console.log('   - URL: http://localhost:3099/admin/login');
  console.log('   - Employee Code: admin');
  console.log('   - Password: admin\n');
} else {
  console.log('[FAIL] CO VAN DE CAN FIX:\n');
  if (!backendOk) {
    console.log('   1. Backend khong chay');
    console.log('      -> Fix: node server.js\n');
  }
  if (!routeGetOk) {
    console.log('   2. Routes chua duoc register');
    console.log('      -> Fix: Restart backend\n');
  }
  if (!routePostOk && backendOk && routeGetOk) {
    console.log('   3. Route POST co van de');
    console.log('      -> Fix: Kiem tra routes/auth.js\n');
  }
}

console.log('');

