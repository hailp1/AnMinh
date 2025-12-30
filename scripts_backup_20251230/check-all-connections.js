#!/usr/bin/env node

/**
 * Check All Connections - Kiểm tra Backend, Frontend và Database
 */

import http from 'http';
import https from 'https';
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

function logSection(title) {
  log('\n' + '='.repeat(70), 'cyan');
  log(`  ${title}`, 'cyan');
  log('='.repeat(70), 'cyan');
  log('');
}

function logResult(label, success, message = '') {
  const icon = success ? '✅' : '❌';
  const color = success ? 'green' : 'red';
  log(`   ${icon} ${label}: ${success ? 'OK' : 'FAIL'}`, color);
  if (message) {
    log(`      ${message}`, 'yellow');
  }
}

async function checkDatabase() {
  logSection('1. KIỂM TRA DATABASE CONNECTION');
  
  try {
    log('   Đang kết nối database...', 'yellow');
    await prisma.$connect();
    logResult('Database Connection', true, 'Kết nối thành công');
    
    // Test query
    const userCount = await prisma.user.count();
    logResult('Database Query', true, `Tìm thấy ${userCount} users trong database`);
    
    // Check ADMIN user
    const admin = await prisma.user.findUnique({
      where: { employeeCode: 'ADMIN' }
    });
    
    if (admin) {
      logResult('User ADMIN', true, `Tồn tại (${admin.name})`);
    } else {
      logResult('User ADMIN', false, 'Không tồn tại - Cần tạo');
    }
    
    // Check AM01 user
    const am01 = await prisma.user.findUnique({
      where: { employeeCode: 'AM01' }
    });
    
    if (am01) {
      logResult('User AM01', true, `Tồn tại (${am01.name})`);
    } else {
      logResult('User AM01', false, 'Không tồn tại');
    }
    
    // Check tables
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `;
    
    logResult('Database Tables', true, `Có ${tables.length} bảng`);
    
    await prisma.$disconnect();
    return { success: true, userCount, admin: !!admin, am01: !!am01 };
    
  } catch (error) {
    logResult('Database Connection', false, error.message);
    if (error.message.includes("Can't reach database server")) {
      log('      → PostgreSQL không chạy hoặc không kết nối được', 'yellow');
      log('      → Start PostgreSQL service: services.msc', 'yellow');
    }
    return { success: false, error: error.message };
  }
}

async function checkBackend() {
  logSection('2. KIỂM TRA BACKEND SERVER');
  
  return new Promise((resolve) => {
    const startTime = Date.now();
    
    const req = http.request({
      hostname: 'localhost',
      port: 5000,
      path: '/api',
      method: 'GET',
      timeout: 5000,
    }, (res) => {
      const responseTime = Date.now() - startTime;
      logResult('Backend Status', res.statusCode === 200, `Status: ${res.statusCode}, Time: ${responseTime}ms`);
      
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          logResult('Backend API Response', true, `Version: ${json.version}`);
          
          if (json.endpoints) {
            const endpointCount = Object.keys(json.endpoints).length;
            logResult('API Endpoints', true, `Có ${endpointCount} endpoints`);
          }
          
          resolve({ success: true, status: res.statusCode, data: json });
        } catch (e) {
          logResult('Backend API Response', false, 'Không parse được JSON');
          resolve({ success: false, error: 'Invalid JSON' });
        }
      });
    });
    
    req.on('error', (error) => {
      logResult('Backend Connection', false, error.message);
      if (error.code === 'ECONNREFUSED') {
        log('      → Backend không chạy trên port 5000', 'yellow');
        log('      → Start backend: node server.js', 'yellow');
      }
      resolve({ success: false, error: error.message });
    });
    
    req.on('timeout', () => {
      req.destroy();
      logResult('Backend Connection', false, 'Timeout - Không phản hồi trong 5 giây');
      resolve({ success: false, error: 'Timeout' });
    });
    
    req.end();
  });
}

async function checkBackendLogin() {
  logSection('3. KIỂM TRA BACKEND LOGIN ENDPOINT');
  
  return new Promise((resolve) => {
    const body = JSON.stringify({
      employeeCode: 'ADMIN',
      password: 'admin'
    });
    
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
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        if (res.statusCode === 200) {
          try {
            const json = JSON.parse(data);
            logResult('Login Endpoint', true, `Login thành công (User: ${json.user?.name})`);
            resolve({ success: true, status: res.statusCode });
          } catch (e) {
            logResult('Login Endpoint', false, 'Response không phải JSON hợp lệ');
            resolve({ success: false, status: res.statusCode });
          }
        } else if (res.statusCode === 400) {
          try {
            const json = JSON.parse(data);
            logResult('Login Endpoint', false, `Bad Request: ${json.message || 'Mã NV hoặc mật khẩu không đúng'}`);
          } catch (e) {
            logResult('Login Endpoint', false, `Status ${res.statusCode}: ${data.substring(0, 100)}`);
          }
          resolve({ success: false, status: res.statusCode });
        } else if (res.statusCode === 404) {
          logResult('Login Endpoint', false, 'Route không tìm thấy');
          log('      → Backend routes có thể chưa được load đúng', 'yellow');
          resolve({ success: false, status: res.statusCode });
        } else if (res.statusCode === 500) {
          logResult('Login Endpoint', false, 'Server Error - Có thể database không kết nối được');
          resolve({ success: false, status: res.statusCode });
        } else {
          logResult('Login Endpoint', false, `Status ${res.statusCode}`);
          resolve({ success: false, status: res.statusCode });
        }
      });
    });
    
    req.on('error', (error) => {
      logResult('Login Endpoint', false, error.message);
      resolve({ success: false, error: error.message });
    });
    
    req.on('timeout', () => {
      req.destroy();
      logResult('Login Endpoint', false, 'Timeout');
      resolve({ success: false, error: 'Timeout' });
    });
    
    req.write(body);
    req.end();
  });
}

async function checkFrontend() {
  logSection('4. KIỂM TRA FRONTEND SERVER');
  
  const ports = [3099, 3100, 3101, 3000];
  let foundPort = null;
  
  for (const port of ports) {
    const result = await new Promise((resolve) => {
      const req = http.request({
        hostname: 'localhost',
        port: port,
        path: '/',
        method: 'GET',
        timeout: 3000,
      }, (res) => {
        resolve({ success: true, port, status: res.statusCode });
      });
      
      req.on('error', () => {
        resolve({ success: false });
      });
      
      req.on('timeout', () => {
        req.destroy();
        resolve({ success: false });
      });
      
      req.end();
    });
    
    if (result.success) {
      foundPort = result.port;
      logResult('Frontend Status', true, `Đang chạy trên port ${port} (Status: ${result.status})`);
      break;
    }
  }
  
  if (!foundPort) {
    logResult('Frontend Status', false, 'Không tìm thấy trên các port: 3099, 3100, 3101, 3000');
    log('      → Start frontend: cd client && npm start', 'yellow');
  }
  
  return { success: !!foundPort, port: foundPort };
}

async function checkProxy(frontendPort) {
  logSection('5. KIỂM TRA PROXY (Frontend → Backend)');
  
  if (!frontendPort) {
    logResult('Proxy', false, 'Frontend chưa chạy - Không thể test proxy');
    return { success: false, reason: 'Frontend not running' };
  }
  
  return new Promise((resolve) => {
    const req = http.request({
      hostname: 'localhost',
      port: frontendPort,
      path: '/api',
      method: 'GET',
      timeout: 10000,
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        if (res.statusCode === 200) {
          try {
            const json = JSON.parse(data);
            logResult('Proxy Forward', true, 'Proxy đang forward request đến backend');
            logResult('Proxy Response', true, `Backend response: ${json.version || 'OK'}`);
            resolve({ success: true, status: res.statusCode });
          } catch (e) {
            logResult('Proxy Response', false, 'Không parse được response');
            resolve({ success: false });
          }
        } else if (res.statusCode === 404) {
          logResult('Proxy Forward', false, '404 - setupProxy.js chưa được load hoặc không hoạt động');
          log('      → Restart frontend với cache clear', 'yellow');
          resolve({ success: false, status: 404 });
        } else {
          logResult('Proxy Forward', false, `Status ${res.statusCode}`);
          resolve({ success: false, status: res.statusCode });
        }
      });
    });
    
    req.on('error', (error) => {
      logResult('Proxy Connection', false, error.message);
      resolve({ success: false, error: error.message });
    });
    
    req.on('timeout', () => {
      req.destroy();
      logResult('Proxy Connection', false, 'Timeout');
      resolve({ success: false, error: 'Timeout' });
    });
    
    req.end();
  });
}

async function checkProxyLogin(frontendPort) {
  logSection('6. KIỂM TRA PROXY LOGIN (Frontend → Backend)');
  
  if (!frontendPort) {
    logResult('Proxy Login', false, 'Frontend chưa chạy');
    return { success: false };
  }
  
  return new Promise((resolve) => {
    const body = JSON.stringify({
      employeeCode: 'ADMIN',
      password: 'admin'
    });
    
    const req = http.request({
      hostname: 'localhost',
      port: frontendPort,
      path: '/api/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
      },
      timeout: 15000,
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        if (res.statusCode === 200) {
          logResult('Proxy Login', true, 'Login qua proxy thành công');
          resolve({ success: true });
        } else if (res.statusCode === 400) {
          try {
            const json = JSON.parse(data);
            logResult('Proxy Login', false, `Bad Request: ${json.message}`);
          } catch (e) {
            logResult('Proxy Login', false, `Status ${res.statusCode}`);
          }
          resolve({ success: false, status: res.statusCode });
        } else if (res.statusCode === 404) {
          logResult('Proxy Login', false, '404 - Proxy không forward request');
          resolve({ success: false, status: 404 });
        } else {
          logResult('Proxy Login', false, `Status ${res.statusCode}`);
          resolve({ success: false, status: res.statusCode });
        }
      });
    });
    
    req.on('error', (error) => {
      logResult('Proxy Login', false, error.message);
      resolve({ success: false, error: error.message });
    });
    
    req.on('timeout', () => {
      req.destroy();
      logResult('Proxy Login', false, 'Timeout');
      resolve({ success: false });
    });
    
    req.write(body);
    req.end();
  });
}

async function main() {
  log('\n╔══════════════════════════════════════════════════════════════════════════════╗', 'cyan');
  log('║     KIỂM TRA TẤT CẢ KẾT NỐI - BACKEND, FRONTEND, DATABASE                    ║', 'cyan');
  log('╚══════════════════════════════════════════════════════════════════════════════╝', 'cyan');
  
  const results = {
    database: null,
    backend: null,
    backendLogin: null,
    frontend: null,
    proxy: null,
    proxyLogin: null,
  };
  
  // 1. Check Database
  results.database = await checkDatabase();
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // 2. Check Backend
  results.backend = await checkBackend();
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // 3. Check Backend Login
  if (results.backend && results.backend.success) {
    results.backendLogin = await checkBackendLogin();
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // 4. Check Frontend
  results.frontend = await checkFrontend();
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // 5. Check Proxy
  if (results.frontend && results.frontend.success) {
    results.proxy = await checkProxy(results.frontend.port);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 6. Check Proxy Login
    if (results.proxy && results.proxy.success) {
      results.proxyLogin = await checkProxyLogin(results.frontend.port);
    }
  }
  
  // Summary
  logSection('TỔNG KẾT');
  
  const allChecks = [
    { name: 'Database Connection', result: results.database?.success },
    { name: 'Backend Server', result: results.backend?.success },
    { name: 'Backend Login API', result: results.backendLogin?.success },
    { name: 'Frontend Server', result: results.frontend?.success },
    { name: 'Proxy (Frontend → Backend)', result: results.proxy?.success },
    { name: 'Proxy Login', result: results.proxyLogin?.success },
  ];
  
  const successCount = allChecks.filter(c => c.result === true).length;
  const totalCount = allChecks.length;
  
  log(`Kết quả: ${successCount}/${totalCount} checks passed\n`, successCount === totalCount ? 'green' : 'yellow');
  
  allChecks.forEach((check, index) => {
    const icon = check.result === true ? '✅' : '❌';
    const color = check.result === true ? 'green' : 'red';
    log(`${index + 1}. ${icon} ${check.name}`, color);
  });
  
  log('');
  
  // Recommendations
  if (successCount < totalCount) {
    log('📋 KHUYẾN NGHỊ FIX:', 'yellow');
    log('');
    
    if (!results.database?.success) {
      log('1. DATABASE:', 'cyan');
      log('   → Start PostgreSQL service: services.msc', 'white');
      log('   → Hoặc kiểm tra DATABASE_URL trong .env', 'white');
      log('');
    }
    
    if (!results.backend?.success) {
      log('2. BACKEND:', 'cyan');
      log('   → Start backend: node server.js', 'white');
      log('');
    }
    
    if (!results.backendLogin?.success && results.backend?.success) {
      log('3. BACKEND LOGIN:', 'cyan');
      log('   → Tạo user ADMIN: node scripts/create-admin-simple.js', 'white');
      log('   → Hoặc dùng: ADMIN001 / 123456 (từ seed)', 'white');
      log('');
    }
    
    if (!results.frontend?.success) {
      log('4. FRONTEND:', 'cyan');
      log('   → Start frontend: cd client && npm start', 'white');
      log('');
    }
    
    if (!results.proxy?.success && results.frontend?.success) {
      log('5. PROXY:', 'cyan');
      log('   → Restart frontend với cache clear', 'white');
      log('   → Xóa: client/node_modules/.cache', 'white');
      log('   → Restart: cd client && npm start', 'white');
      log('');
    }
  } else {
    log('🎉 TẤT CẢ ĐỀU HOẠT ĐỘNG TỐT!', 'green');
    log('');
    log('✅ Có thể:', 'green');
    log('   - Login trong browser: http://localhost:' + (results.frontend?.port || 3099), 'white');
    log('   - Employee Code: ADMIN', 'white');
    log('   - Password: admin', 'white');
    log('');
  }
  
  log('='.repeat(70), 'cyan');
  log('');
}

main().catch((error) => {
  log(`\n❌ Lỗi không mong đợi: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
});

