#!/usr/bin/env node

/**
 * Test login trực tiếp đến backend
 */

import http from 'http';

const body = JSON.stringify({
  employeeCode: 'admin',
  password: 'admin'
});

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(body),
  },
  timeout: 5000,
};

console.log('\n=== TEST LOGIN TRỰC TIẾP ĐẾN BACKEND ===\n');
console.log('URL: http://localhost:5000/api/auth/login');
console.log('Body:', JSON.stringify({ employeeCode: 'admin', password: 'admin' }));
console.log('\nĐang gửi request...\n');

const req = http.request(options, (res) => {
  console.log(`Status Code: ${res.statusCode}`);
  console.log(`Headers:`, res.headers);
  console.log('\nResponse Body:');
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      console.log(JSON.stringify(json, null, 2));
      
      if (res.statusCode === 200) {
        console.log('\n✅ LOGIN THÀNH CÔNG!');
        console.log(`   User: ${json.user?.name}`);
        console.log(`   Role: ${json.user?.role}`);
      } else {
        console.log('\n❌ LOGIN THẤT BẠI');
        console.log(`   Message: ${json.message || 'Unknown error'}`);
      }
    } catch (e) {
      console.log(data);
      console.log('\n❌ Response không phải JSON hợp lệ');
    }
    console.log('');
    process.exit(res.statusCode === 200 ? 0 : 1);
  });
});

req.on('error', (error) => {
  console.error('\n❌ LỖI KẾT NỐI:', error.message);
  if (error.code === 'ECONNREFUSED') {
    console.error('\n💡 Backend không chạy trên port 5000!');
    console.error('   → Start backend: node server.js');
  }
  process.exit(1);
});

req.on('timeout', () => {
  req.destroy();
  console.error('\n❌ TIMEOUT - Backend không phản hồi trong 5 giây');
  process.exit(1);
});

req.write(body);
req.end();

