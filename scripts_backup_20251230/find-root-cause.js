#!/usr/bin/env node

/**
 * Find Root Cause - Tìm nguyên nhân gốc rễ của 404
 */

import http from 'http';
import fs from 'fs';
import path from 'path';

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  blue: '\x1b[34m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

log('\n╔═══════════════════════════════════════════════════════════╗', 'cyan');
log('║     TÌM NGUYÊN NHÂN GỐC RỄ - ROUTE 404                    ║', 'cyan');
log('╚═══════════════════════════════════════════════════════════╝', 'cyan');
log('');

// Step 1: Check server.js structure
log('=== BƯỚC 1: KIỂM TRA CẤU TRÚC server.js ===', 'cyan');
const serverJsPath = path.join(process.cwd(), 'server.js');
if (fs.existsSync(serverJsPath)) {
  log('   ✅ server.js tồn tại', 'green');
  const serverContent = fs.readFileSync(serverJsPath, 'utf-8');
  
  // Check routes import
  if (serverContent.includes("import authRoutes")) {
    log('   ✅ authRoutes được import', 'green');
  } else {
    log('   ❌ authRoutes KHÔNG được import', 'red');
  }
  
  // Check routes registration
  if (serverContent.includes("app.use('/api/auth', authRoutes)")) {
    log('   ✅ app.use(\'/api/auth\', authRoutes) được register', 'green');
  } else {
    log('   ❌ app.use(\'/api/auth\', authRoutes) KHÔNG được tìm thấy', 'red');
  }
  
  // Check if routes registered before 404 handler
  const routesIndex = serverContent.indexOf("app.use('/api/auth', authRoutes)");
  const notFoundIndex = serverContent.indexOf("app.use((req, res) => {", routesIndex);
  const status404Index = serverContent.indexOf("status(404)", notFoundIndex);
  
  if (routesIndex !== -1 && (status404Index === -1 || status404Index > routesIndex)) {
    log('   ✅ Routes được register TRƯỚC 404 handler', 'green');
  } else if (routesIndex !== -1 && status404Index !== -1 && status404Index < routesIndex) {
    log('   ❌ Routes được register SAU 404 handler!', 'red');
    log('   💡 Đây là nguyên nhân gốc rễ!', 'yellow');
  }
  
  // Check middleware order
  const corsIndex = serverContent.indexOf('app.use(cors');
  const bodyParserIndex = serverContent.indexOf('express.json');
  const routesRegIndex = serverContent.indexOf("app.use('/api/auth'");
  
  if (corsIndex < bodyParserIndex && bodyParserIndex < routesRegIndex) {
    log('   ✅ Middleware order đúng (CORS -> Body Parser -> Routes)', 'green');
  } else {
    log('   ⚠️  Middleware order có thể sai', 'yellow');
  }
} else {
  log('   ❌ server.js KHÔNG tồn tại', 'red');
}

// Step 2: Check routes/auth.js
log('\n=== BƯỚC 2: KIỂM TRA routes/auth.js ===', 'cyan');
const authRoutesPath = path.join(process.cwd(), 'routes', 'auth.js');
if (fs.existsSync(authRoutesPath)) {
  log('   ✅ routes/auth.js tồn tại', 'green');
  const authContent = fs.readFileSync(authRoutesPath, 'utf-8');
  
  // Check POST /login route
  if (authContent.includes("router.post('/login'")) {
    log('   ✅ router.post(\'/login\') được định nghĩa', 'green');
  } else {
    log('   ❌ router.post(\'/login\') KHÔNG được tìm thấy', 'red');
  }
  
  // Check export
  if (authContent.includes('export default router') || authContent.includes('module.exports')) {
    log('   ✅ router được export', 'green');
  } else {
    log('   ❌ router KHÔNG được export', 'red');
  }
} else {
  log('   ❌ routes/auth.js KHÔNG tồn tại', 'red');
}

// Step 3: Test backend
log('\n=== BƯỚC 3: TEST BACKEND ===', 'cyan');

// Test 3.1: GET /api
log('   3.1. Test GET /api...');
const test1 = new Promise((resolve) => {
  const req = http.get('http://localhost:5000/api', { timeout: 5000 }, (res) => {
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
      if (res.statusCode === 200) {
        log('      ✅ Backend đang chạy', 'green');
        resolve({ running: true, endpoints: JSON.parse(data).endpoints });
      } else {
        log(`      ❌ Backend trả về ${res.statusCode}`, 'red');
        resolve({ running: false, status: res.statusCode });
      }
    });
  });
  
  req.on('error', (err) => {
    log(`      ❌ Backend KHÔNG chạy: ${err.message}`, 'red');
    resolve({ running: false, error: err.message });
  });
  
  req.on('timeout', () => {
    req.destroy();
    log('      ❌ Backend timeout', 'red');
    resolve({ running: false, error: 'Timeout' });
  });
});

const result1 = await test1;

if (!result1.running) {
  log('\n💡 NGUYÊN NHÂN GỐC RỄ: Backend không chạy!', 'yellow');
  log('   → Start backend: node server.js', 'cyan');
  log('');
  process.exit(1);
}

await new Promise(r => setTimeout(r, 500));

// Test 3.2: GET /api/auth/login (should return 405)
log('   3.2. Test GET /api/auth/login (should return 405)...');
const test2 = new Promise((resolve) => {
  const req = http.get('http://localhost:5000/api/auth/login', { timeout: 5000 }, (res) => {
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
      if (res.statusCode === 405) {
        log('      ✅ Route /api/auth/login TỒN TẠI (405 = Method Not Allowed, đúng)', 'green');
        resolve({ exists: true });
      } else if (res.statusCode === 404) {
        log('      ❌ Route /api/auth/login KHÔNG TỒN TẠI (404)', 'red');
        resolve({ exists: false, status: 404 });
      } else {
        log(`      ⚠️  Status: ${res.statusCode}`, 'yellow');
        resolve({ exists: false, status: res.statusCode });
      }
    });
  });
  
  req.on('error', (err) => {
    log(`      ❌ Error: ${err.message}`, 'red');
    resolve({ exists: false, error: err.message });
  });
});

const result2 = await test2;

if (!result2.exists) {
  log('\n💡 NGUYÊN NHÂN GỐC RỄ: Route chưa được register!', 'yellow');
  log('   → Kiểm tra server.js line ~212', 'cyan');
  log('   → Đảm bảo: app.use(\'/api/auth\', authRoutes)', 'cyan');
  log('   → Restart backend sau khi fix', 'cyan');
  log('');
  process.exit(1);
}

await new Promise(r => setTimeout(r, 500));

// Test 3.3: POST /api/auth/login
log('   3.3. Test POST /api/auth/login...');
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
        log('      ✅ POST /api/auth/login HOẠT ĐỘNG (200 OK)', 'green');
        try {
          const json = JSON.parse(data);
          log(`      ✅ User: ${json.user?.name} (${json.user?.role})`, 'green');
        } catch (e) {}
        resolve({ success: true });
      } else if (res.statusCode === 404) {
        log('      ❌ POST /api/auth/login KHÔNG TỒN TẠI (404)', 'red');
        log(`      Response: ${data.substring(0, 200)}`, 'yellow');
        resolve({ success: false, status: 404 });
      } else {
        log(`      ⚠️  Status: ${res.statusCode}`, 'yellow');
        try {
          const json = JSON.parse(data);
          log(`      Response: ${json.message || data.substring(0, 200)}`, 'yellow');
        } catch (e) {
          log(`      Response: ${data.substring(0, 200)}`, 'yellow');
        }
        resolve({ success: false, status: res.statusCode });
      }
    });
  });
  
  req.on('error', (err) => {
    log(`      ❌ Error: ${err.message}`, 'red');
    resolve({ success: false, error: err.message });
  });
  
  req.write(body);
  req.end();
});

const result3 = await test3;

if (!result3.success && result3.status === 404) {
  log('\n💡 NGUYÊN NHÂN GỐC RỄ: POST route chưa được register!', 'yellow');
  log('   → Kiểm tra routes/auth.js line ~61', 'cyan');
  log('   → Đảm bảo: router.post(\'/login\', ...)', 'cyan');
  log('   → Restart backend sau khi fix', 'cyan');
  log('');
  process.exit(1);
}

// Step 4: Test Proxy
log('\n=== BƯỚC 4: TEST PROXY ===', 'cyan');
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
          log(`   ✅ Frontend đang chạy trên port ${port}`, 'green');
          log(`   ✅ Proxy forward /api đến backend`, 'green');
          resolve({ success: true, port });
        } else if (res.statusCode === 404) {
          log(`   ❌ Proxy trả về 404 trên port ${port}`, 'red');
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
  log('   ❌ Frontend không chạy', 'red');
}

// Summary
log('\n╔═══════════════════════════════════════════════════════════╗', 'cyan');
log('║     KẾT LUẬN - NGUYÊN NHÂN GỐC RỄ                         ║', 'cyan');
log('╚═══════════════════════════════════════════════════════════╝', 'cyan');
log('');

if (result1.running && result2.exists && result3.success) {
  log('✅ Backend routes HOẠT ĐỘNG TỐT!', 'green');
  log('');
  log('💡 Nếu vẫn 404 khi login qua Frontend:', 'yellow');
  log('   → Vấn đề là ở PROXY hoặc Frontend', 'cyan');
  log('   → Restart frontend: cd client && rmdir /s /q node_modules\\.cache && npm start', 'cyan');
  log('   → Kiểm tra setupProxy.js có được load trong terminal Frontend', 'cyan');
} else {
  log('❌ ĐÃ TÌM THẤY NGUYÊN NHÂN GỐC RỄ:', 'red');
  if (!result1.running) {
    log('   1. Backend không chạy', 'red');
    log('      → Fix: node server.js', 'cyan');
  } else if (!result2.exists || (result3.status === 404)) {
    log('   2. Routes chưa được register đúng', 'red');
    log('      → Fix: Kiểm tra server.js và routes/auth.js', 'cyan');
    log('      → Restart backend sau khi fix', 'cyan');
  }
}

log('');

