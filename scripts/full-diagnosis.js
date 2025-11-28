#!/usr/bin/env node

/**
 * Full System Diagnosis - Kiểm tra toàn bộ hệ thống
 */

import http from 'http';
import { PrismaClient } from '@prisma/client';
import { config } from 'dotenv';

config();

const prisma = new PrismaClient();

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
log('║     CHẨN ĐOÁN HỆ THỐNG - FULL DIAGNOSIS                   ║', 'cyan');
log('╚═══════════════════════════════════════════════════════════╝', 'cyan');
log('');

// Test 1: Database
log('=== 1. KIỂM TRA DATABASE ===', 'cyan');
async function testDatabase() {
  try {
    await prisma.$connect();
    log('   ✅ Database connected', 'green');
    
    const userCount = await prisma.user.count();
    log(`   ✅ Users in database: ${userCount}`, 'green');
    
    const admin = await prisma.user.findUnique({ where: { employeeCode: 'ADMIN' } });
    if (admin) {
      log(`   ✅ User ADMIN exists`, 'green');
    } else {
      log(`   ❌ User ADMIN NOT found`, 'red');
      log(`   💡 Run: npm run create:users`, 'yellow');
    }
    
    await prisma.$disconnect();
    return { success: true, admin: !!admin };
  } catch (error) {
    log(`   ❌ Database error: ${error.message}`, 'red');
    if (error.message.includes("Can't reach database server")) {
      log('   💡 PostgreSQL không chạy! Start service: services.msc', 'yellow');
    }
    return { success: false, error: error.message };
  }
}

// Test 2: Backend API
log('=== 2. KIỂM TRA BACKEND API ===', 'cyan');
function testBackendAPI() {
  return new Promise((resolve) => {
    const req = http.get('http://localhost:5000/api', { timeout: 5000 }, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          log('   ✅ Backend is running', 'green');
          try {
            const json = JSON.parse(data);
            log(`   ✅ API Version: ${json.version}`, 'green');
            resolve({ success: true, status: 200 });
          } catch (e) {
            log('   ⚠️  Response is not JSON', 'yellow');
            resolve({ success: false, error: 'Invalid JSON' });
          }
        } else {
          log(`   ❌ Backend returned ${res.statusCode}`, 'red');
          resolve({ success: false, status: res.statusCode });
        }
      });
    });
    
    req.on('error', (err) => {
      log(`   ❌ Backend NOT running: ${err.message}`, 'red');
      log('   💡 Start backend: node server.js', 'yellow');
      resolve({ success: false, error: err.message });
    });
    
    req.on('timeout', () => {
      req.destroy();
      log('   ❌ Backend timeout', 'red');
      resolve({ success: false, error: 'Timeout' });
    });
  });
}

// Test 3: Backend Login
log('=== 3. KIỂM TRA BACKEND LOGIN ===', 'cyan');
function testBackendLogin() {
  return new Promise((resolve) => {
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
          log('   ✅ Login endpoint works!', 'green');
          try {
            const json = JSON.parse(data);
            log(`   ✅ User: ${json.user?.name} (${json.user?.role})`, 'green');
            log(`   ✅ Token received`, 'green');
            resolve({ success: true, status: 200 });
          } catch (e) {
            log('   ⚠️  Response is not JSON', 'yellow');
            resolve({ success: false, error: 'Invalid JSON' });
          }
        } else if (res.statusCode === 404) {
          log(`   ❌ 404 - Route not found!`, 'red');
          log('   💡 Backend routes may not be loaded', 'yellow');
          log('   💡 Check server.js - routes should be registered', 'yellow');
          log(`   Response: ${data.substring(0, 200)}`, 'yellow');
          resolve({ success: false, status: 404 });
        } else {
          log(`   ⚠️  Status: ${res.statusCode}`, 'yellow');
          log(`   Response: ${data.substring(0, 200)}`, 'yellow');
          resolve({ success: false, status: res.statusCode });
        }
      });
    });
    
    req.on('error', (err) => {
      log(`   ❌ Error: ${err.message}`, 'red');
      resolve({ success: false, error: err.message });
    });
    
    req.on('timeout', () => {
      req.destroy();
      log('   ❌ Timeout', 'red');
      resolve({ success: false, error: 'Timeout' });
    });
    
    req.write(body);
    req.end();
  });
}

// Test 4: Frontend
log('=== 4. KIỂM TRA FRONTEND ===', 'cyan');
function testFrontend() {
  return new Promise((resolve) => {
    const ports = [3099, 3100, 3101, 3000];
    let found = false;
    
    function testPort(port, index) {
      if (found || index >= ports.length) {
        if (!found) {
          log('   ❌ Frontend NOT running on any port', 'red');
          log('   💡 Start frontend: cd client && npm start', 'yellow');
          resolve({ success: false });
        }
        return;
      }
      
      const req = http.get(`http://localhost:${port}`, { timeout: 3000 }, (res) => {
        found = true;
        log(`   ✅ Frontend is running on port ${port}`, 'green');
        resolve({ success: true, port });
      });
      
      req.on('error', () => {
        testPort(ports[index + 1], index + 1);
      });
      
      req.on('timeout', () => {
        req.destroy();
        testPort(ports[index + 1], index + 1);
      });
    }
    
    testPort(ports[0], 0);
  });
}

// Test 5: Proxy
log('=== 5. KIỂM TRA PROXY ===', 'cyan');
function testProxy(port) {
  if (!port) {
    log('   ⏭️  Skip (Frontend not running)', 'yellow');
    return Promise.resolve({ success: false, reason: 'Frontend not running' });
  }
  
  return new Promise((resolve) => {
    const req = http.get(`http://localhost:${port}/api`, { timeout: 10000 }, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          log('   ✅ Proxy works!', 'green');
          resolve({ success: true });
        } else if (res.statusCode === 404) {
          log('   ❌ Proxy returns 404', 'red');
          log('   💡 setupProxy.js may not be loaded', 'yellow');
          log('   💡 Restart frontend with cache clear', 'yellow');
          resolve({ success: false, status: 404 });
        } else {
          log(`   ⚠️  Status: ${res.statusCode}`, 'yellow');
          resolve({ success: false, status: res.statusCode });
        }
      });
    });
    
    req.on('error', (err) => {
      log(`   ❌ Error: ${err.message}`, 'red');
      resolve({ success: false, error: err.message });
    });
    
    req.on('timeout', () => {
      req.destroy();
      log('   ❌ Timeout', 'red');
      resolve({ success: false });
    });
  });
}

// Main
async function main() {
  const results = {};
  
  results.db = await testDatabase();
  await new Promise(r => setTimeout(r, 500));
  
  results.api = await testBackendAPI();
  await new Promise(r => setTimeout(r, 500));
  
  if (results.api.success) {
    results.login = await testBackendLogin();
    await new Promise(r => setTimeout(r, 500));
  }
  
  results.frontend = await testFrontend();
  await new Promise(r => setTimeout(r, 500));
  
  if (results.frontend.success) {
    results.proxy = await testProxy(results.frontend.port);
  }
  
  // Summary
  log('\n╔═══════════════════════════════════════════════════════════╗', 'cyan');
  log('║     TỔNG KẾT                                                ║', 'cyan');
  log('╚═══════════════════════════════════════════════════════════╝', 'cyan');
  log('');
  
  const checks = [
    { name: 'Database', result: results.db?.success },
    { name: 'Backend API', result: results.api?.success },
    { name: 'Backend Login', result: results.login?.success },
    { name: 'Frontend', result: results.frontend?.success },
    { name: 'Proxy', result: results.proxy?.success },
  ];
  
  const passed = checks.filter(c => c.result === true).length;
  log(`Kết quả: ${passed}/${checks.length} checks passed\n`, passed === checks.length ? 'green' : 'yellow');
  
  checks.forEach((check, i) => {
    const icon = check.result === true ? '✅' : '❌';
    const color = check.result === true ? 'green' : 'red';
    log(`${i + 1}. ${icon} ${check.name}`, color);
  });
  
  log('');
  
  // Recommendations
  if (passed < checks.length) {
    log('📋 KHUYẾN NGHỊ:', 'yellow');
    log('');
    
    if (!results.db?.success) {
      log('→ Start PostgreSQL service', 'cyan');
    }
    if (!results.api?.success) {
      log('→ Start backend: node server.js', 'cyan');
    }
    if (!results.login?.success && results.api?.success) {
      log('→ Check backend routes registration in server.js', 'cyan');
      log('→ Ensure app.use(\'/api/auth\', authRoutes) is BEFORE 404 handler', 'cyan');
      log('→ Restart backend after code changes', 'cyan');
    }
    if (!results.frontend?.success) {
      log('→ Start frontend: cd client && npm start', 'cyan');
    }
    if (!results.proxy?.success && results.frontend?.success) {
      log('→ Restart frontend with cache clear', 'cyan');
      log('→ Check setupProxy.js is loaded (see frontend logs)', 'cyan');
    }
  } else {
    log('🎉 TẤT CẢ ĐỀU HOẠT ĐỘNG TỐT!', 'green');
  }
  
  log('');
  
  await prisma.$disconnect();
}

main().catch(console.error);

