#!/usr/bin/env node

import http from 'http';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

console.log('\n===============================================================');
console.log('     FIX VA TEST ROUTES');
console.log('===============================================================\n');

async function testBackend() {
  return new Promise((resolve) => {
    const req = http.get('http://localhost:5000/api', { timeout: 2000 }, (res) => {
      resolve({ running: true, status: res.statusCode });
    });
    req.on('error', () => resolve({ running: false }));
    req.on('timeout', () => {
      req.destroy();
      resolve({ running: false });
    });
  });
}

async function testRoute(path, method = 'GET', body = null) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: path,
      method: method,
      timeout: 5000,
    };
    
    if (body) {
      options.headers = {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
      };
    }
    
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        resolve({ status: res.statusCode, body: data });
      });
    });
    
    req.on('error', () => resolve({ status: 0, error: true }));
    req.on('timeout', () => {
      req.destroy();
      resolve({ status: 0, timeout: true });
    });
    
    if (body) {
      req.write(body);
    }
    req.end();
  });
}

// Step 1: Check backend
console.log('Buoc 1: Kiem tra Backend...');
let backendStatus = await testBackend();

if (!backendStatus.running) {
  console.log('   [FAIL] Backend KHONG chay!');
  console.log('\n=> NGUYEN NHAN: Backend khong chay');
  console.log('   Fix: node server.js\n');
  process.exit(1);
}

console.log('   [OK] Backend dang chay\n');

await new Promise(r => setTimeout(r, 500));

// Step 2: Test GET /api/auth/login
console.log('Buoc 2: Test GET /api/auth/login...');
const routeGet = await testRoute('/api/auth/login', 'GET');

if (routeGet.status === 405) {
  console.log('   [OK] Route TON TAI (405 = dung)\n');
} else if (routeGet.status === 404) {
  console.log('   [FAIL] Route KHONG TON TAI (404)');
  console.log(`   Response: ${routeGet.body.substring(0, 200)}\n`);
  console.log('=> NGUYEN NHAN: Routes chua duoc register!');
  console.log('   Kiem tra:');
  console.log('   1. Terminal Backend co "Registering routes..."?');
  console.log('   2. Co loi khi import routes khong?');
  console.log('   3. Restart backend: Ctrl+C va chay lai node server.js\n');
  process.exit(1);
} else {
  console.log(`   [WARN] Status: ${routeGet.status}\n`);
}

await new Promise(r => setTimeout(r, 500));

// Step 3: Test POST /api/auth/login
console.log('Buoc 3: Test POST /api/auth/login...');
const body = JSON.stringify({ employeeCode: 'admin', password: 'admin' });
const routePost = await testRoute('/api/auth/login', 'POST', body);

if (routePost.status === 200) {
  console.log('   [OK] POST route HOAT DONG!\n');
  try {
    const json = JSON.parse(routePost.body);
    console.log(`   User: ${json.user?.name} (${json.user?.role})\n`);
  } catch (e) {}
} else if (routePost.status === 404) {
  console.log('   [FAIL] POST route KHONG TON TAI (404)');
  console.log(`   Response: ${routePost.body.substring(0, 200)}\n`);
  console.log('=> NGUYEN NHAN: Route POST chua duoc register!');
  console.log('   Fix: Kiem tra routes/auth.js co router.post(\'/login\', ...) khong\n');
  process.exit(1);
} else if (routePost.status === 400) {
  console.log('   [WARN] Status 400 - User khong ton tai hoac password sai');
  console.log(`   Response: ${routePost.body.substring(0, 200)}\n`);
  console.log('   => Route TON TAI nhung user chua duoc tao');
  console.log('   Fix: npm run create:users\n');
} else {
  console.log(`   [WARN] Status: ${routePost.status}`);
  console.log(`   Response: ${routePost.body.substring(0, 200)}\n`);
}

// Summary
console.log('===============================================================');
console.log('     KET LUAN');
console.log('===============================================================\n');

if (backendStatus.running && routeGet.status === 405) {
  console.log('[OK] Routes HOAT DONG!\n');
  console.log('Neu van 404 khi login qua Frontend:');
  console.log('  => Van de la o PROXY');
  console.log('  => Restart frontend: cd client && rmdir /s /q node_modules\\.cache && npm start\n');
} else {
  console.log('[FAIL] CO VAN DE VOI ROUTES!\n');
  console.log('Nguyen nhan co the:');
  console.log('  1. Routes chua duoc register (kiem tra backend logs)');
  console.log('  2. Co loi khi import routes');
  console.log('  3. Middleware order sai\n');
  console.log('Fix: Restart backend va xem logs\n');
}

console.log('');

