#!/usr/bin/env node

import http from 'http';

console.log('\n╔═══════════════════════════════════════════════════════════╗');
console.log('║     KIỂM TRA NGUYÊN NHÂN GỐC RỄ - 404 ROUTE             ║');
console.log('╚═══════════════════════════════════════════════════════════╝\n');

let results = {
  backend: false,
  routeGet: false,
  routePost: false,
  proxy: false
};

// Test 1: Backend
console.log('1. Kiểm tra Backend...');
const test1 = new Promise((resolve) => {
  const req = http.get('http://localhost:5000/api', { timeout: 3000 }, (res) => {
    if (res.statusCode === 200) {
      console.log('   ✅ Backend đang chạy\n');
      results.backend = true;
      resolve(true);
    } else {
      console.log(`   ❌ Backend trả về ${res.statusCode}\n`);
      resolve(false);
    }
  });
  
  req.on('error', () => {
    console.log('   ❌ Backend KHÔNG chạy!\n');
    console.log('💡 ĐÂY LÀ NGUYÊN NHÂN GỐC RỄ!\n');
    console.log('   → Start backend: node server.js\n');
    resolve(false);
  });
});

const backendOk = await test1;

if (!backendOk) {
  process.exit(1);
}

await new Promise(r => setTimeout(r, 500));

// Test 2: Route GET
console.log('2. Kiểm tra Route GET /api/auth/login...');
const test2 = new Promise((resolve) => {
  const req = http.get('http://localhost:5000/api/auth/login', { timeout: 3000 }, (res) => {
    if (res.statusCode === 405) {
      console.log('   ✅ Route TỒN TẠI (405 = Method Not Allowed, đúng)\n');
      results.routeGet = true;
      resolve(true);
    } else if (res.statusCode === 404) {
      console.log('   ❌ Route KHÔNG TỒN TẠI (404)\n');
      console.log('💡 ĐÂY LÀ NGUYÊN NHÂN GỐC RỄ!\n');
      console.log('   → Routes chưa được register trong backend\n');
      console.log('   → Kiểm tra server.js line 212: app.use(\'/api/auth\', authRoutes)\n');
      console.log('   → Restart backend: node server.js\n');
      resolve(false);
    } else {
      console.log(`   ⚠️  Status: ${res.statusCode}\n`);
      resolve(false);
    }
  });
  
  req.on('error', () => {
    console.log('   ❌ Error\n');
    resolve(false);
  });
});

const routeGetOk = await test2;

await new Promise(r => setTimeout(r, 500));

// Test 3: Route POST
console.log('3. Kiểm tra Route POST /api/auth/login...');
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
        console.log('   ✅ POST route HOẠT ĐỘNG (200 OK)\n');
        results.routePost = true;
        resolve(true);
      } else if (res.statusCode === 404) {
        console.log('   ❌ POST route KHÔNG TỒN TẠI (404)\n');
        console.log('💡 ĐÂY LÀ NGUYÊN NHÂN GỐC RỄ!\n');
        console.log('   → Route POST chưa được register\n');
        console.log('   → Kiểm tra routes/auth.js line 61: router.post(\'/login\', ...)\n');
        resolve(false);
      } else if (res.statusCode === 400) {
        console.log('   ⚠️  Status 400 - User không tồn tại hoặc password sai\n');
        console.log('   → Tạo user: npm run create:users\n');
        results.routePost = true; // Route tồn tại nhưng user sai
        resolve(true);
      } else {
        console.log(`   ⚠️  Status: ${res.statusCode}\n`);
        resolve(false);
      }
    });
  });
  
  req.on('error', () => {
    console.log('   ❌ Error\n');
    resolve(false);
  });
  
  req.write(body);
  req.end();
});

const routePostOk = await test3;

await new Promise(r => setTimeout(r, 500));

// Test 4: Proxy
console.log('4. Kiểm tra Proxy (Frontend -> Backend)...');
const ports = [3099, 3100, 3101, 3000];
let proxyOk = false;

for (const port of ports) {
  const test4 = new Promise((resolve) => {
    const req = http.get(`http://localhost:${port}/api`, { timeout: 3000 }, (res) => {
      if (res.statusCode === 200) {
        console.log(`   ✅ Frontend đang chạy trên port ${port}`);
        console.log('   ✅ Proxy forward /api đến backend\n');
        results.proxy = true;
        proxyOk = true;
        resolve(true);
      } else if (res.statusCode === 404) {
        console.log(`   ❌ Proxy trả về 404 trên port ${port}\n`);
        resolve(false);
      } else {
        resolve(false);
      }
    });
    
    req.on('error', () => resolve(false));
    req.on('timeout', () => { req.destroy(); resolve(false); });
  });
  
  if (await test4) break;
}

if (!proxyOk) {
  console.log('   ❌ Frontend không chạy hoặc proxy không hoạt động\n');
  console.log('   → Start frontend: cd client && npm start\n');
}

// Summary
console.log('╔═══════════════════════════════════════════════════════════╗');
console.log('║     KẾT LUẬN                                              ║');
console.log('╚═══════════════════════════════════════════════════════════╝\n');

if (backendOk && routeGetOk && routePostOk) {
  console.log('✅ Backend routes HOẠT ĐỘNG TỐT!\n');
  
  if (!proxyOk) {
    console.log('⚠️  Nếu vẫn 404 khi login qua Frontend:\n');
    console.log('   → Vấn đề là ở PROXY hoặc Frontend\n');
    console.log('   → Restart frontend với cache clear:\n');
    console.log('     cd client\n');
    console.log('     rmdir /s /q node_modules\\.cache\n');
    console.log('     npm start\n');
  } else {
    console.log('✅ Tất cả đều OK!\n');
    console.log('💡 Nếu vẫn 404, kiểm tra:\n');
    console.log('   → Browser console có lỗi gì không\n');
    console.log('   → Backend logs có hiển thị request không\n');
    console.log('   → Frontend logs có hiển thị proxy logs không\n');
  }
} else {
  console.log('❌ ĐÃ TÌM THẤY VẤN ĐỀ:\n');
  if (!backendOk) {
    console.log('   1. Backend không chạy\n');
    console.log('      → Fix: node server.js\n');
  }
  if (!routeGetOk) {
    console.log('   2. Routes chưa được register\n');
    console.log('      → Fix: Restart backend\n');
  }
  if (!routePostOk && backendOk && routeGetOk) {
    console.log('   3. Route POST có vấn đề\n');
    console.log('      → Fix: Kiểm tra routes/auth.js\n');
  }
}

console.log('');

