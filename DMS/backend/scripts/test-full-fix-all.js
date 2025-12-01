#!/usr/bin/env node

/**
 * Full System Test & Fix All Script
 * Test toàn diện và fix tất cả lỗi
 */

import http from 'http';
import { PrismaClient } from '@prisma/client';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

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

function checkmark(pass) {
  return pass ? '✅' : '❌';
}

const issues = [];
const fixed = [];

async function testBackend() {
  log('\n=== 1. KIỂM TRA BACKEND ===', 'cyan');
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: '/api',
      method: 'GET',
      timeout: 3000,
    };
    
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          log(`${checkmark(true)} Backend: RUNNING`, 'green');
          log(`   Message: ${json.message || 'OK'}`, 'white');
          resolve(true);
        } catch (e) {
          log(`${checkmark(false)} Backend: INVALID RESPONSE`, 'red');
          issues.push('Backend trả response không hợp lệ');
          resolve(false);
        }
      });
    });
    
    req.on('error', (error) => {
      log(`${checkmark(false)} Backend: NOT RUNNING`, 'red');
      log(`   Error: ${error.message}`, 'red');
      issues.push('Backend không chạy trên port 5000');
      resolve(false);
    });
    
    req.on('timeout', () => {
      req.destroy();
      log(`${checkmark(false)} Backend: TIMEOUT`, 'red');
      issues.push('Backend không phản hồi (timeout)');
      resolve(false);
    });
    
    req.end();
  });
}

function testFrontend() {
  log('\n=== 2. KIỂM TRA FRONTEND ===', 'cyan');
  // Check if any frontend port is listening
  const ports = [3099, 3100, 3101, 3000];
  // For Windows, we can't easily check listening ports, so we try to connect
  return new Promise((resolve) => {
    let foundPort = null;
    let checked = 0;
    
    ports.forEach(port => {
      const req = http.request({
        hostname: 'localhost',
        port: port,
        path: '/',
        method: 'GET',
        timeout: 1000,
      }, (res) => {
        foundPort = port;
        log(`${checkmark(true)} Frontend: RUNNING on port ${port}`, 'green');
        resolve(true);
      });
      
      req.on('error', () => {
        checked++;
        if (checked === ports.length && !foundPort) {
          log(`${checkmark(false)} Frontend: NOT RUNNING`, 'red');
          issues.push('Frontend không chạy');
          resolve(false);
        }
      });
      
      req.on('timeout', () => {
        req.destroy();
        checked++;
        if (checked === ports.length && !foundPort) {
          log(`${checkmark(false)} Frontend: NOT RUNNING`, 'red');
          issues.push('Frontend không chạy');
          resolve(false);
        }
      });
      
      req.end();
    });
    
    setTimeout(() => {
      if (!foundPort && checked === ports.length) {
        log(`${checkmark(false)} Frontend: NOT RUNNING`, 'red');
        issues.push('Frontend không chạy');
        resolve(false);
      }
    }, 1500);
  });
}

function testProxy(frontendPort) {
  log('\n=== 3. KIỂM TRA PROXY ===', 'cyan');
  if (!frontendPort) {
    log('⚠️  Proxy: Không thể test (frontend chưa chạy)', 'yellow');
    return Promise.resolve(false);
  }
  
  return new Promise((resolve) => {
    const req = http.request({
      hostname: 'localhost',
      port: frontendPort,
      path: '/api',
      method: 'GET',
      timeout: 3000,
    }, (res) => {
      if (res.statusCode === 200) {
        log(`${checkmark(true)} Proxy: HOẠT ĐỘNG`, 'green');
        resolve(true);
      } else {
        log(`${checkmark(false)} Proxy: Response status ${res.statusCode}`, 'red');
        issues.push('Proxy không hoạt động - setupProxy.js chưa được load');
        resolve(false);
      }
    });
    
    req.on('error', () => {
      log(`${checkmark(false)} Proxy: KHÔNG HOẠT ĐỘNG (404)`, 'red');
      issues.push('Proxy không hoạt động - setupProxy.js chưa được load');
      resolve(false);
    });
    
    req.on('timeout', () => {
      req.destroy();
      log(`${checkmark(false)} Proxy: TIMEOUT`, 'red');
      issues.push('Proxy timeout');
      resolve(false);
    });
    
    req.end();
  });
}

function testDatabase() {
  log('\n=== 4. KIỂM TRA DATABASE ===', 'cyan');
  const envFile = join(rootDir, '.env');
  
  if (!fs.existsSync(envFile)) {
    log(`${checkmark(false)} .env file: NOT FOUND`, 'red');
    issues.push('.env file không tồn tại');
    return Promise.resolve(false);
  }
  
  const envContent = fs.readFileSync(envFile, 'utf8');
  
  if (envContent.includes('DATABASE_URL')) {
    log(`${checkmark(true)} DATABASE_URL: DEFINED`, 'green');
  } else {
    log(`${checkmark(false)} DATABASE_URL: NOT DEFINED`, 'red');
    issues.push('DATABASE_URL chưa được define trong .env');
  }
  
  if (envContent.includes('JWT_SECRET')) {
    log(`${checkmark(true)} JWT_SECRET: DEFINED`, 'green');
  } else {
    log(`${checkmark(false)} JWT_SECRET: NOT DEFINED`, 'red');
    issues.push('JWT_SECRET chưa được define trong .env');
  }
  
  // Test database connection
  return prisma.$connect()
    .then(() => {
      log(`${checkmark(true)} Database: CONNECTED`, 'green');
      return prisma.$disconnect().then(() => true);
    })
    .catch((error) => {
      log(`${checkmark(false)} Database: CONNECTION FAILED`, 'red');
      log(`   Error: ${error.message}`, 'red');
      issues.push(`Database không kết nối được: ${error.message}`);
      return false;
    });
}

function testLoginEndpoint() {
  log('\n=== 5. KIỂM TRA LOGIN ENDPOINT ===', 'cyan');
  return new Promise((resolve) => {
    const postData = JSON.stringify({
      employeeCode: 'AM01',
      password: 'admin123'
    });
    
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      },
      timeout: 5000,
    };
    
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (res.statusCode === 200 && json.token) {
            log(`${checkmark(true)} Login Endpoint: HOẠT ĐỘNG`, 'green');
            log(`   User: ${json.user?.name || 'Unknown'}`, 'white');
            log(`   Role: ${json.user?.role || 'Unknown'}`, 'white');
            resolve(true);
          } else {
            log(`${checkmark(false)} Login Endpoint: FAILED`, 'red');
            log(`   Status: ${res.statusCode}`, 'red');
            log(`   Message: ${json.message || 'Unknown error'}`, 'red');
            if (res.statusCode === 404) {
              issues.push('Route /api/auth/login không tìm thấy');
            }
            resolve(false);
          }
        } catch (e) {
          log(`${checkmark(false)} Login Endpoint: INVALID RESPONSE`, 'red');
          log(`   Response: ${data.substring(0, 100)}`, 'red');
          issues.push('Login endpoint trả response không hợp lệ');
          resolve(false);
        }
      });
    });
    
    req.on('error', (error) => {
      log(`${checkmark(false)} Login Endpoint: FAILED`, 'red');
      log(`   Error: ${error.message}`, 'red');
      issues.push('Login endpoint không truy cập được');
      resolve(false);
    });
    
    req.on('timeout', () => {
      req.destroy();
      log(`${checkmark(false)} Login Endpoint: TIMEOUT`, 'red');
      issues.push('Login endpoint timeout');
      resolve(false);
    });
    
    req.write(postData);
    req.end();
  });
}

function testFiles() {
  log('\n=== 6. KIỂM TRA FILES ===', 'cyan');
  const setupProxyPath = join(rootDir, 'client', 'src', 'setupProxy.js');
  if (fs.existsSync(setupProxyPath)) {
    log(`${checkmark(true)} setupProxy.js: EXISTS`, 'green');
  } else {
    log(`${checkmark(false)} setupProxy.js: NOT FOUND`, 'red');
    issues.push('setupProxy.js không tồn tại');
  }
  
  const configOverridesPath = join(rootDir, 'client', 'config-overrides.js');
  if (fs.existsSync(configOverridesPath)) {
    log(`${checkmark(true)} config-overrides.js: EXISTS`, 'green');
  } else {
    log(`${checkmark(false)} config-overrides.js: NOT FOUND`, 'red');
    issues.push('config-overrides.js không tồn tại');
  }
}

async function main() {
  log('\n╔═══════════════════════════════════════════════════════════╗', 'cyan');
  log('║     FULL SYSTEM TEST & FIX ALL - KIỂM TRA TOÀN DIỆN      ║', 'cyan');
  log('╚═══════════════════════════════════════════════════════════╝', 'cyan');
  
  const backendRunning = await testBackend();
  const frontendRunning = await testFrontend();
  await testProxy(3099); // Default port
  await testDatabase();
  if (backendRunning) {
    await testLoginEndpoint();
  }
  testFiles();
  
  // Summary
  log('\n╔═══════════════════════════════════════════════════════════╗', 'cyan');
  log('║                    TỔNG KẾT                               ║', 'cyan');
  log('╚═══════════════════════════════════════════════════════════╝', 'cyan');
  
  if (issues.length === 0) {
    log('\n✅ TẤT CẢ ĐỀU OK! Hệ thống sẵn sàng!', 'green');
    log('\n📝 Hướng dẫn login:', 'cyan');
    if (frontendRunning) {
      log('   1. Mở browser: http://localhost:3099', 'white');
    } else {
      log('   1. Start frontend: cd client && npm start', 'white');
    }
    log('   2. Login với: AM01 / admin123', 'white');
    process.exit(0);
  } else {
    log(`\n❌ TÌM THẤY ${issues.length} VẤN ĐỀ:`, 'red');
    issues.forEach((issue, index) => {
      log(`   ${index + 1}. ${issue}`, 'yellow');
    });
    log('\n💡 GIẢI PHÁP:', 'cyan');
    log('');
    
    if (issues.includes('Backend không chạy trên port 5000')) {
      log('1. START BACKEND:', 'yellow');
      log('   cd D:\\newNCSKITORG\\newNCSkit\\AM_BS', 'cyan');
      log('   node server.js', 'cyan');
      log('');
    }
    
    if (issues.includes('Frontend không chạy')) {
      log('2. START FRONTEND:', 'yellow');
      log('   cd client', 'cyan');
      log('   npm start', 'cyan');
      log('');
    }
    
    if (issues.includes('Proxy không hoạt động - setupProxy.js chưa được load')) {
      log('3. FIX PROXY:', 'yellow');
      log('   - Dừng frontend (Ctrl+C)', 'white');
      log('   - Xóa cache: Remove-Item -Recurse -Force node_modules\\.cache', 'white');
      log('   - Restart: npm start', 'white');
      log('');
    }
    
    log('HOẶC dùng script start cả hai:', 'yellow');
    log('   .\\scripts\\start-all.ps1', 'cyan');
    log('');
    
    process.exit(1);
  }
}

main().catch((error) => {
  log(`\n❌ Lỗi không mong đợi: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
});

