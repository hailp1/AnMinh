#!/usr/bin/env node

import http from 'http';

console.log('\n===============================================================');
console.log('     TEST ROUTES TRUC TIEP');
console.log('===============================================================\n');

// Test 1: Backend
console.log('1. Test Backend...');
const test1 = new Promise((resolve) => {
  const req = http.get('http://localhost:5000/api', { timeout: 3000 }, (res) => {
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
      if (res.statusCode === 200) {
        console.log('   [OK] Backend chay');
        resolve(true);
      } else {
        console.log(`   [FAIL] Status: ${res.statusCode}`);
        resolve(false);
      }
    });
  });
  req.on('error', () => {
    console.log('   [FAIL] Backend KHONG chay!');
    resolve(false);
  });
});

const backendOk = await test1;

if (!backendOk) {
  console.log('\n=> Backend khong chay! Start backend: node server.js\n');
  process.exit(1);
}

await new Promise(r => setTimeout(r, 500));

// Test 2: GET /api/auth/login
console.log('2. Test GET /api/auth/login (should 405)...');
const test2 = new Promise((resolve) => {
  const req = http.get('http://localhost:5000/api/auth/login', { timeout: 3000 }, (res) => {
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
      if (res.statusCode === 405) {
        console.log('   [OK] Route TON TAI (405 = dung)');
        resolve(true);
      } else if (res.statusCode === 404) {
        console.log('   [FAIL] Route KHONG TON TAI (404)');
        console.log(`   Response: ${data.substring(0, 200)}`);
        resolve(false);
      } else {
        console.log(`   [WARN] Status: ${res.statusCode}`);
        console.log(`   Response: ${data.substring(0, 200)}`);
        resolve(false);
      }
    });
  });
  req.on('error', () => {
    console.log('   [FAIL] Error');
    resolve(false);
  });
});

const routeGetOk = await test2;

if (!routeGetOk) {
  console.log('\n=> Route chua duoc register!');
  console.log('   Kiem tra:');
  console.log('   1. Backend logs co "Registering routes..."?');
  console.log('   2. Co loi khi import routes khong?');
  console.log('   3. Restart backend\n');
  process.exit(1);
}

await new Promise(r => setTimeout(r, 500));

// Test 3: POST /api/auth/login
console.log('3. Test POST /api/auth/login...');
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
        console.log('   [OK] POST route HOAT DONG!');
        try {
          const json = JSON.parse(data);
          console.log(`   User: ${json.user?.name} (${json.user?.role})`);
        } catch (e) {}
        resolve(true);
      } else if (res.statusCode === 404) {
        console.log('   [FAIL] POST route KHONG TON TAI (404)');
        console.log(`   Response: ${data.substring(0, 200)}`);
        resolve(false);
      } else {
        console.log(`   [WARN] Status: ${res.statusCode}`);
        try {
          const json = JSON.parse(data);
          console.log(`   Response: ${json.message || data.substring(0, 200)}`);
        } catch (e) {
          console.log(`   Response: ${data.substring(0, 200)}`);
        }
        resolve(true); // Route tồn tại nhưng có lỗi khác
      }
    });
  });
  req.on('error', () => {
    console.log('   [FAIL] Error');
    resolve(false);
  });
  req.write(body);
  req.end();
});

const routePostOk = await test3;

console.log('\n===============================================================');
console.log('     KET QUA');
console.log('===============================================================\n');

if (backendOk && routeGetOk && routePostOk) {
  console.log('[OK] TAT CA DEU HOAT DONG!\n');
  console.log('Neu van 404 khi login qua Frontend:');
  console.log('  -> Van de la o PROXY');
  console.log('  -> Restart frontend\n');
} else {
  console.log('[FAIL] CO VAN DE!\n');
  if (!routeGetOk || !routePostOk) {
    console.log('Van de: Routes chua duoc register dung');
    console.log('  -> Kiem tra terminal Backend co loi gi khong');
    console.log('  -> Restart backend\n');
  }
}

console.log('');

