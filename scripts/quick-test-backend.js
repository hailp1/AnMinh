#!/usr/bin/env node

import http from 'http';

console.log('\n=== QUICK TEST BACKEND ===\n');

// Test 1: Check if backend is running
console.log('1. Testing GET /api...');
const req1 = http.get('http://localhost:5000/api', (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    if (res.statusCode === 200) {
      console.log('   ✅ Backend is running!');
      try {
        const json = JSON.parse(data);
        console.log(`   Version: ${json.version}`);
      } catch (e) {
        console.log('   ⚠️  Response is not JSON');
      }
      testLogin();
    } else {
      console.log(`   ❌ Backend returned ${res.statusCode}`);
      process.exit(1);
    }
  });
});

req1.on('error', (err) => {
  console.log(`   ❌ Backend is NOT running: ${err.message}`);
  console.log('\n💡 Start backend: node server.js\n');
  process.exit(1);
});

// Test 2: Test login
function testLogin() {
  console.log('\n2. Testing POST /api/auth/login...');
  
  const body = JSON.stringify({ employeeCode: 'admin', password: 'admin' });
  const req2 = http.request({
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
        console.log('   ✅ Login endpoint works!');
        try {
          const json = JSON.parse(data);
          console.log(`   User: ${json.user?.name}`);
          console.log(`   Role: ${json.user?.role}`);
        } catch (e) {
          console.log('   ⚠️  Response is not JSON');
        }
        console.log('\n✅ All tests passed!\n');
        process.exit(0);
      } else if (res.statusCode === 404) {
        console.log(`   ❌ 404 - Route not found!`);
        console.log('   💡 Backend routes may not be loaded');
        console.log('   💡 Try restarting backend: node server.js\n');
        process.exit(1);
      } else {
        console.log(`   ⚠️  Status: ${res.statusCode}`);
        console.log(`   Response: ${data.substring(0, 200)}`);
        process.exit(1);
      }
    });
  });

  req2.on('error', (err) => {
    console.log(`   ❌ Error: ${err.message}`);
    process.exit(1);
  });

  req2.on('timeout', () => {
    req2.destroy();
    console.log('   ❌ Timeout');
    process.exit(1);
  });

  req2.write(body);
  req2.end();
}

