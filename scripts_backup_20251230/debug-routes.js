#!/usr/bin/env node

/**
 * Debug Routes - Tìm nguyên nhân gốc rễ của 404
 */

import http from 'http';

console.log('\n╔═══════════════════════════════════════════════════════════╗');
console.log('║     DEBUG ROUTES - TÌM NGUYÊN NHÂN GỐC RỄ                ║');
console.log('╚═══════════════════════════════════════════════════════════╝\n');

// Test 1: Check backend is running
console.log('1. Kiểm tra Backend có chạy không...');
const test1 = new Promise((resolve) => {
  const req = http.get('http://localhost:5000/api', { timeout: 5000 }, (res) => {
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
      if (res.statusCode === 200) {
        console.log('   ✅ Backend đang chạy');
        try {
          const json = JSON.parse(data);
          console.log(`   ✅ API Version: ${json.version}`);
          console.log(`   ✅ Endpoints: ${Object.keys(json.endpoints || {}).length} routes`);
          resolve({ success: true, endpoints: json.endpoints });
        } catch (e) {
          console.log('   ⚠️  Response không phải JSON');
          resolve({ success: false });
        }
      } else {
        console.log(`   ❌ Backend trả về ${res.statusCode}`);
        resolve({ success: false, status: res.statusCode });
      }
    });
  });
  
  req.on('error', (err) => {
    console.log(`   ❌ Backend KHÔNG chạy: ${err.message}`);
    console.log('\n💡 NGUYÊN NHÂN GỐC RỄ: Backend không chạy!');
    console.log('   → Start backend: node server.js\n');
    resolve({ success: false, error: err.message });
  });
  
  req.on('timeout', () => {
    req.destroy();
    console.log('   ❌ Backend timeout');
    resolve({ success: false, error: 'Timeout' });
  });
});

test1.then(async (result1) => {
  if (!result1.success) {
    process.exit(1);
  }

  await new Promise(r => setTimeout(r, 500));

  // Test 2: Check GET /api/auth/login
  console.log('\n2. Kiểm tra GET /api/auth/login (should return 405)...');
  const test2 = new Promise((resolve) => {
    const req = http.get('http://localhost:5000/api/auth/login', { timeout: 5000 }, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 405) {
          console.log('   ✅ Route /api/auth/login TỒN TẠI (405 = Method Not Allowed, đúng vì GET không được phép)');
          resolve({ success: true, routeExists: true });
        } else if (res.statusCode === 404) {
          console.log('   ❌ Route /api/auth/login KHÔNG TỒN TẠI (404)');
          console.log('\n💡 NGUYÊN NHÂN GỐC RỄ: Route chưa được register!');
          console.log('   → Kiểm tra server.js: app.use(\'/api/auth\', authRoutes)');
          resolve({ success: false, routeExists: false });
        } else {
          console.log(`   ⚠️  Status: ${res.statusCode}`);
          console.log(`   Response: ${data.substring(0, 200)}`);
          resolve({ success: false, status: res.statusCode });
        }
      });
    });
    
    req.on('error', (err) => {
      console.log(`   ❌ Error: ${err.message}`);
      resolve({ success: false, error: err.message });
    });
  });

  const result2 = await test2;
  
  if (!result2.success || !result2.routeExists) {
    process.exit(1);
  }

  await new Promise(r => setTimeout(r, 500));

  // Test 3: Check POST /api/auth/login
  console.log('\n3. Kiểm tra POST /api/auth/login...');
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
      timeout: 10000,
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          console.log('   ✅ POST /api/auth/login HOẠT ĐỘNG (200 OK)');
          try {
            const json = JSON.parse(data);
            console.log(`   ✅ User: ${json.user?.name} (${json.user?.role})`);
            console.log(`   ✅ Token received`);
          } catch (e) {
            console.log('   ⚠️  Response không phải JSON');
          }
          resolve({ success: true });
        } else if (res.statusCode === 404) {
          console.log('   ❌ POST /api/auth/login KHÔNG TỒN TẠI (404)');
          console.log('\n💡 NGUYÊN NHÂN GỐC RỄ: Route POST chưa được register!');
          console.log('   → Kiểm tra routes/auth.js: router.post(\'/login\', ...)');
          resolve({ success: false, status: 404 });
        } else {
          console.log(`   ⚠️  Status: ${res.statusCode}`);
          try {
            const json = JSON.parse(data);
            console.log(`   Response: ${json.message || data.substring(0, 200)}`);
          } catch (e) {
            console.log(`   Response: ${data.substring(0, 200)}`);
          }
          resolve({ success: false, status: res.statusCode });
        }
      });
    });
    
    req.on('error', (err) => {
      console.log(`   ❌ Error: ${err.message}`);
      resolve({ success: false, error: err.message });
    });
    
    req.write(body);
    req.end();
  });

  const result3 = await test3;
  
  if (!result3.success && result3.status === 404) {
    process.exit(1);
  }

  await new Promise(r => setTimeout(r, 500));

  // Test 4: Check proxy
  console.log('\n4. Kiểm tra Proxy (Frontend -> Backend)...');
  const ports = [3099, 3100, 3101, 3000];
  let frontendPort = null;
  
  for (const port of ports) {
    const test4 = new Promise((resolve) => {
      const req = http.get(`http://localhost:${port}/api`, { timeout: 5000 }, (res) => {
        frontendPort = port;
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
          if (res.statusCode === 200) {
            console.log(`   ✅ Frontend đang chạy trên port ${port}`);
            console.log(`   ✅ Proxy forward /api đến backend`);
            resolve({ success: true, port });
          } else if (res.statusCode === 404) {
            console.log(`   ❌ Proxy trả về 404 trên port ${port}`);
            console.log('\n💡 NGUYÊN NHÂN GỐC RỄ: Proxy không hoạt động!');
            console.log('   → setupProxy.js chưa được load');
            console.log('   → Restart frontend với cache clear');
            resolve({ success: false, status: 404, port });
          } else {
            resolve({ success: false, status: res.statusCode, port });
          }
        });
      });
      
      req.on('error', () => {
        resolve({ success: false, port });
      });
      
      req.on('timeout', () => {
        req.destroy();
        resolve({ success: false, port });
      });
    });
    
    const result4 = await test4;
    if (result4.success) {
      break;
    }
  }
  
  if (!frontendPort) {
    console.log('   ❌ Frontend không chạy trên bất kỳ port nào');
    console.log('\n💡 NGUYÊN NHÂN GỐC RỄ: Frontend không chạy!');
    console.log('   → Start frontend: cd client && npm start\n');
  }

  // Summary
  console.log('\n╔═══════════════════════════════════════════════════════════╗');
  console.log('║     KẾT LUẬN                                              ║');
  console.log('╚═══════════════════════════════════════════════════════════╝\n');
  
  if (result1.success && result2.routeExists && result3.success) {
    console.log('✅ Backend routes HOẠT ĐỘNG TỐT!');
    console.log('\n💡 Nếu vẫn 404 khi login qua Frontend:');
    console.log('   → Vấn đề là ở PROXY hoặc Frontend');
    console.log('   → Restart frontend với cache clear');
    console.log('   → Kiểm tra setupProxy.js có được load không\n');
  } else {
    console.log('❌ NGUYÊN NHÂN GỐC RỄ:');
    if (!result1.success) {
      console.log('   → Backend không chạy');
      console.log('   → Fix: node server.js\n');
    } else if (!result2.routeExists) {
      console.log('   → Route /api/auth/login chưa được register');
      console.log('   → Fix: Kiểm tra server.js line ~209');
      console.log('          app.use(\'/api/auth\', authRoutes);\n');
    } else if (result3.status === 404) {
      console.log('   → Route POST /api/auth/login chưa được register');
      console.log('   → Fix: Kiểm tra routes/auth.js line ~61');
      console.log('          router.post(\'/login\', ...);\n');
    }
  }
  
  console.log('');
});

