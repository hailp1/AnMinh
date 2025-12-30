#!/usr/bin/env node

/**
 * Full System Test Script
 * Kiểm tra toàn bộ hệ thống trước khi login
 */

import { PrismaClient } from '@prisma/client';
import { config } from 'dotenv';
import http from 'http';

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

async function checkDatabase() {
  log('\n📊 KIỂM TRA DATABASE', 'cyan');
  log('='.repeat(50), 'cyan');
  
  try {
    await prisma.$connect();
    log(`${checkmark(true)} Database: CONNECTED`, 'green');
    
    // Check user AM01
    const user = await prisma.user.findUnique({
      where: { employeeCode: 'AM01' }
    });
    
    if (user) {
      log(`${checkmark(true)} User AM01: EXISTS`, 'green');
      log(`   - Name: ${user.name}`, 'white');
      log(`   - Role: ${user.role}`, 'white');
      log(`   - Active: ${user.isActive ? 'Yes' : 'No'}`, user.isActive ? 'green' : 'red');
      return true;
    } else {
      log(`${checkmark(false)} User AM01: NOT FOUND`, 'red');
      log('   → Cần tạo user AM01', 'yellow');
      return false;
    }
  } catch (error) {
    log(`${checkmark(false)} Database: ERROR`, 'red');
    log(`   Error: ${error.message}`, 'red');
    return false;
  } finally {
    await prisma.$disconnect();
  }
}

function checkBackend() {
  return new Promise((resolve) => {
    log('\n🔧 KIỂM TRA BACKEND', 'cyan');
    log('='.repeat(50), 'cyan');
    
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
          log(`   Status: ${res.statusCode}`, 'white');
          resolve(true);
        } catch (e) {
          log(`${checkmark(false)} Backend: INVALID RESPONSE`, 'red');
          resolve(false);
        }
      });
    });
    
    req.on('error', (error) => {
      log(`${checkmark(false)} Backend: NOT RUNNING`, 'red');
      log(`   Error: ${error.message}`, 'red');
      log(`   → Cần chạy: node server.js`, 'yellow');
      resolve(false);
    });
    
    req.on('timeout', () => {
      req.destroy();
      log(`${checkmark(false)} Backend: TIMEOUT`, 'red');
      log(`   → Backend không phản hồi`, 'yellow');
      resolve(false);
    });
    
    req.end();
  });
}

function checkEnv() {
  log('\n🔐 KIỂM TRA ENVIRONMENT', 'cyan');
  log('='.repeat(50), 'cyan');
  
  const required = ['DATABASE_URL', 'JWT_SECRET'];
  let allOk = true;
  
  for (const key of required) {
    if (process.env[key]) {
      log(`${checkmark(true)} ${key}: DEFINED`, 'green');
    } else {
      log(`${checkmark(false)} ${key}: NOT DEFINED`, 'red');
      allOk = false;
    }
  }
  
  return allOk;
}

async function testLogin() {
  return new Promise((resolve) => {
    log('\n🔑 TEST LOGIN ENDPOINT', 'cyan');
    log('='.repeat(50), 'cyan');
    
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
            log(`${checkmark(true)} Login: SUCCESS`, 'green');
            log(`   User: ${json.user?.name || 'Unknown'}`, 'white');
            log(`   Token: ${json.token.substring(0, 20)}...`, 'white');
            resolve(true);
          } else {
            log(`${checkmark(false)} Login: FAILED`, 'red');
            log(`   Status: ${res.statusCode}`, 'red');
            log(`   Message: ${json.message || 'Unknown error'}`, 'red');
            resolve(false);
          }
        } catch (e) {
          log(`${checkmark(false)} Login: INVALID RESPONSE`, 'red');
          log(`   Response: ${data.substring(0, 100)}`, 'red');
          resolve(false);
        }
      });
    });
    
    req.on('error', (error) => {
      log(`${checkmark(false)} Login: ERROR`, 'red');
      log(`   Error: ${error.message}`, 'red');
      log(`   → Backend không chạy hoặc không kết nối được`, 'yellow');
      resolve(false);
    });
    
    req.on('timeout', () => {
      req.destroy();
      log(`${checkmark(false)} Login: TIMEOUT`, 'red');
      resolve(false);
    });
    
    req.write(postData);
    req.end();
  });
}

async function main() {
  log('\n╔═══════════════════════════════════════════════════════╗', 'cyan');
  log('║     FULL SYSTEM TEST - KIỂM TRA TOÀN BỘ HỆ THỐNG     ║', 'cyan');
  log('╚═══════════════════════════════════════════════════════╝', 'cyan');
  
  const results = {
    env: checkEnv(),
    database: await checkDatabase(),
    backend: await checkBackend(),
    login: false,
  };
  
  if (results.backend) {
    results.login = await testLogin();
  }
  
  // Summary
  log('\n╔═══════════════════════════════════════════════════════╗', 'cyan');
  log('║                    TỔNG KẾT                           ║', 'cyan');
  log('╚═══════════════════════════════════════════════════════╝', 'cyan');
  
  log(`\n${checkmark(results.env)} Environment Variables`, results.env ? 'green' : 'red');
  log(`${checkmark(results.database)} Database & User AM01`, results.database ? 'green' : 'red');
  log(`${checkmark(results.backend)} Backend Server`, results.backend ? 'green' : 'red');
  log(`${checkmark(results.login)} Login Endpoint`, results.login ? 'green' : 'red');
  
  const allPass = results.env && results.database && results.backend && results.login;
  
  if (allPass) {
    log('\n✅ TẤT CẢ ĐỀU OK! Có thể login được!', 'green');
    log('\n📝 Hướng dẫn:', 'cyan');
    log('   1. Khởi động frontend: cd client && npm start', 'white');
    log('   2. Mở browser: http://localhost:3099', 'white');
    log('   3. Login với: AM01 / admin123', 'white');
    process.exit(0);
  } else {
    log('\n❌ CÓ VẤN ĐỀ CẦN SỬA!', 'red');
    log('\n📝 Hướng dẫn fix:', 'yellow');
    
    if (!results.env) {
      log('   → Kiểm tra file .env có DATABASE_URL và JWT_SECRET', 'white');
    }
    if (!results.database) {
      log('   → Chạy: node scripts/create-employee-am01.js', 'white');
    }
    if (!results.backend) {
      log('   → Chạy: node server.js', 'white');
    }
    if (!results.login) {
      log('   → Kiểm tra backend đã chạy và user AM01 tồn tại', 'white');
    }
    
    process.exit(1);
  }
}

main().catch((error) => {
  log(`\n❌ Lỗi không mong đợi: ${error.message}`, 'red');
  process.exit(1);
});

