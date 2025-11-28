#!/usr/bin/env node
/**
 * Auto Check and Fix Script
 * Tự động kiểm tra và sửa các lỗi thường gặp trong hệ thống
 */

import { config } from 'dotenv';
import { PrismaClient } from '@prisma/client';
import http from 'http';
import { readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
config();

const prisma = new PrismaClient();
const issues = [];
const fixes = [];

// Colors for console
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
  console.log(`\n${colors.cyan}=== ${title} ===${colors.reset}\n`);
}

// Check functions
async function checkBackend() {
  logSection('1. Kiểm tra Backend');
  
  return new Promise((resolve) => {
    const req = http.request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 3000,
    }, (res) => {
      if (res.statusCode === 400 || res.statusCode === 401) {
        // 400/401 means backend is running but requires valid credentials
        log('✅ Backend: RUNNING (Port 5000)', 'green');
        resolve(true);
      } else if (res.statusCode === 404) {
        log('⚠️  Backend: RUNNING but route may not exist', 'yellow');
        resolve(true);
      } else {
        log(`⚠️  Backend: Status ${res.statusCode}`, 'yellow');
        resolve(true);
      }
    });

    req.on('error', (err) => {
      if (err.code === 'ECONNREFUSED') {
        log('❌ Backend: NOT RUNNING on port 5000', 'red');
        issues.push({
          type: 'backend',
          issue: 'Backend không chạy trên port 5000',
          fix: 'Chạy: node server.js hoặc cd D:\\newNCSKITORG\\newNCSkit\\AM_BS && node server.js'
        });
      } else {
        log(`❌ Backend Error: ${err.message}`, 'red');
      }
      resolve(false);
    });

    req.on('timeout', () => {
      req.destroy();
      log('❌ Backend: Timeout - không phản hồi', 'red');
      issues.push({
        type: 'backend',
        issue: 'Backend timeout',
        fix: 'Kiểm tra backend có đang chạy không'
      });
      resolve(false);
    });

    req.write(JSON.stringify({ employeeCode: 'AM01', password: 'admin123' }));
    req.end();
  });
}

async function checkDatabase() {
  logSection('2. Kiểm tra Database');
  
  try {
    await prisma.$connect();
    log('✅ Database: CONNECTED', 'green');
    
    const userCount = await prisma.user.count();
    log(`   Users: ${userCount}`, 'reset');
    
    const pharmacyCount = await prisma.pharmacy.count();
    log(`   Pharmacies: ${pharmacyCount}`, 'reset');
    
    const am01 = await prisma.user.findUnique({
      where: { employeeCode: 'AM01' }
    });
    
    if (am01) {
      log(`✅ User AM01: EXISTS (${am01.name}, ${am01.role})`, 'green');
    } else {
      log('❌ User AM01: NOT FOUND', 'red');
      issues.push({
        type: 'database',
        issue: 'User AM01 không tồn tại',
        fix: 'Chạy: node scripts/create-employee-am01.js'
      });
    }
    
    await prisma.$disconnect();
    return true;
  } catch (error) {
    log(`❌ Database Error: ${error.message}`, 'red');
    issues.push({
      type: 'database',
      issue: error.message,
      fix: 'Kiểm tra DATABASE_URL trong .env file'
    });
    return false;
  }
}

function checkEnvVariables() {
  logSection('3. Kiểm tra Environment Variables');
  
  const envPath = join(__dirname, '.env');
  
  if (!existsSync(envPath)) {
    log('❌ .env file: NOT FOUND', 'red');
    issues.push({
      type: 'env',
      issue: '.env file không tồn tại',
      fix: 'Tạo file .env với JWT_SECRET và DATABASE_URL'
    });
    return false;
  }
  
  log('✅ .env file: EXISTS', 'green');
  
  const envContent = readFileSync(envPath, 'utf-8');
  
  if (!envContent.includes('JWT_SECRET=') || !envContent.match(/JWT_SECRET=\s*.{32,}/)) {
    log('❌ JWT_SECRET: NOT DEFINED hoặc quá ngắn', 'red');
    issues.push({
      type: 'env',
      issue: 'JWT_SECRET không được định nghĩa hoặc quá ngắn',
      fix: 'Thêm JWT_SECRET=this_is_a_strong_dev_secret_32_chars_minimum_123456789 vào .env'
    });
  } else {
    log('✅ JWT_SECRET: DEFINED', 'green');
  }
  
  if (!envContent.includes('DATABASE_URL=')) {
    log('❌ DATABASE_URL: NOT DEFINED', 'red');
    issues.push({
      type: 'env',
      issue: 'DATABASE_URL không được định nghĩa',
      fix: 'Thêm DATABASE_URL vào .env'
    });
  } else {
    log('✅ DATABASE_URL: DEFINED', 'green');
  }
  
  return true;
}

function checkFrontendFiles() {
  logSection('4. Kiểm tra Frontend Files');
  
  const setupProxyPath = join(__dirname, 'client', 'src', 'setupProxy.js');
  const packageJsonPath = join(__dirname, 'client', 'package.json');
  
  // Check setupProxy.js
  if (existsSync(setupProxyPath)) {
    log('✅ setupProxy.js: EXISTS', 'green');
    
    const proxyContent = readFileSync(setupProxyPath, 'utf-8');
    
    if (!proxyContent.includes('localhost:5000')) {
      log('⚠️  setupProxy.js: Target có thể sai', 'yellow');
      issues.push({
        type: 'frontend',
        issue: 'setupProxy.js target không đúng',
        fix: 'Kiểm tra target trong setupProxy.js phải là http://localhost:5000'
      });
    }
  } else {
    log('❌ setupProxy.js: NOT FOUND', 'red');
    issues.push({
      type: 'frontend',
      issue: 'setupProxy.js không tồn tại',
      fix: 'Tạo file client/src/setupProxy.js'
    });
  }
  
  // Check package.json
  if (existsSync(packageJsonPath)) {
    try {
      const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
      log('✅ package.json: VALID JSON', 'green');
      
      if (!packageJson.dependencies['http-proxy-middleware']) {
        log('❌ http-proxy-middleware: NOT INSTALLED', 'red');
        issues.push({
          type: 'frontend',
          issue: 'http-proxy-middleware chưa được cài đặt',
          fix: 'cd client && npm install http-proxy-middleware'
        });
      } else {
        log('✅ http-proxy-middleware: INSTALLED', 'green');
      }
      
      if (packageJson.proxy) {
        log('⚠️  package.json: Có field "proxy" có thể conflict với setupProxy.js', 'yellow');
        issues.push({
          type: 'frontend',
          issue: 'package.json có field proxy conflict',
          fix: 'Xóa field "proxy" khỏi package.json'
        });
      }
    } catch (error) {
      log(`❌ package.json: INVALID JSON - ${error.message}`, 'red');
      issues.push({
        type: 'frontend',
        issue: 'package.json có lỗi JSON',
        fix: 'Sửa lỗi JSON trong package.json'
      });
    }
  } else {
    log('❌ package.json: NOT FOUND', 'red');
  }
  
  return true;
}

function checkBackendFiles() {
  logSection('5. Kiểm tra Backend Files');
  
  const serverPath = join(__dirname, 'server.js');
  const authRoutePath = join(__dirname, 'routes', 'auth.js');
  
  if (!existsSync(serverPath)) {
    log('❌ server.js: NOT FOUND', 'red');
    return false;
  }
  
  log('✅ server.js: EXISTS', 'green');
  
  const serverContent = readFileSync(serverPath, 'utf-8');
  
  if (!serverContent.includes("app.use('/api/auth'")) {
    log('❌ /api/auth route: NOT REGISTERED', 'red');
    issues.push({
      type: 'backend',
      issue: '/api/auth route chưa được đăng ký',
      fix: 'Thêm app.use(\'/api/auth\', authRoutes) vào server.js'
    });
  } else {
    log('✅ /api/auth route: REGISTERED', 'green');
  }
  
  if (!existsSync(authRoutePath)) {
    log('❌ routes/auth.js: NOT FOUND', 'red');
    issues.push({
      type: 'backend',
      issue: 'routes/auth.js không tồn tại',
      fix: 'Tạo file routes/auth.js với route /login'
    });
  } else {
    log('✅ routes/auth.js: EXISTS', 'green');
  }
  
  return true;
}

async function checkProxy() {
  logSection('6. Kiểm tra Proxy');
  
  return new Promise((resolve) => {
    const req = http.request({
      hostname: 'localhost',
      port: 3099,
      path: '/api/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'http://localhost:3099'
      },
      timeout: 5000,
    }, (res) => {
      if (res.statusCode === 200 || res.statusCode === 400 || res.statusCode === 401) {
        log('✅ Proxy: WORKING', 'green');
        resolve(true);
      } else if (res.statusCode === 404) {
        log('❌ Proxy: 404 - Proxy không hoạt động', 'red');
        issues.push({
          type: 'proxy',
          issue: 'Proxy trả 404 - setupProxy.js chưa được load',
          fix: 'Restart frontend: cd client && npm start (đợi Compiled successfully!)'
        });
        resolve(false);
      } else {
        log(`⚠️  Proxy: Status ${res.statusCode}`, 'yellow');
        resolve(true);
      }
    });

    req.on('error', (err) => {
      if (err.code === 'ECONNREFUSED') {
        log('❌ Proxy: Frontend không chạy trên port 3099', 'red');
        issues.push({
          type: 'proxy',
          issue: 'Frontend không chạy',
          fix: 'Chạy frontend: cd client && npm start'
        });
      } else {
        log(`❌ Proxy Error: ${err.message}`, 'red');
      }
      resolve(false);
    });

    req.on('timeout', () => {
      req.destroy();
      log('❌ Proxy: Timeout', 'red');
      resolve(false);
    });

    req.write(JSON.stringify({ employeeCode: 'AM01', password: 'admin123' }));
    req.end();
  });
}

// Main function
async function main() {
  console.log(`${colors.blue}
╔═══════════════════════════════════════════════════════╗
║     AUTO CHECK & FIX SCRIPT                          ║
║     Tự động kiểm tra và sửa lỗi hệ thống             ║
╚═══════════════════════════════════════════════════════╝
${colors.reset}`);

  // Run all checks
  await checkBackend();
  await checkDatabase();
  checkEnvVariables();
  checkFrontendFiles();
  checkBackendFiles();
  await checkProxy();

  // Summary
  logSection('TÓM TẮT');
  
  if (issues.length === 0) {
    log('✅ Tất cả checks đều PASS!', 'green');
    log('\n🎉 Hệ thống hoạt động tốt!', 'green');
  } else {
    log(`⚠️  Tìm thấy ${issues.length} vấn đề:\n`, 'yellow');
    
    issues.forEach((issue, index) => {
      log(`${index + 1}. [${issue.type.toUpperCase()}] ${issue.issue}`, 'red');
      log(`   💡 Fix: ${issue.fix}\n`, 'cyan');
    });
    
    log(`\n📝 Để tự động sửa, chạy:`, 'yellow');
    log(`   node auto-fix.js`, 'cyan');
  }
  
  console.log('');
}

// Run
main().catch(console.error).finally(() => {
  process.exit(0);
});
