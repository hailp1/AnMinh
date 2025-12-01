#!/usr/bin/env node

/**
 * Quick Status Check Script
 */

import http from 'http';

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function checkBackend() {
  return new Promise((resolve) => {
    const req = http.request({
      hostname: 'localhost',
      port: 5000,
      path: '/api',
      method: 'GET',
      timeout: 2000,
    }, (res) => {
      resolve({ success: true, status: res.statusCode });
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
}

async function checkFrontend() {
  return new Promise((resolve) => {
    const req = http.request({
      hostname: 'localhost',
      port: 3099,
      path: '/',
      method: 'GET',
      timeout: 2000,
    }, (res) => {
      resolve({ success: true, status: res.statusCode });
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
}

async function main() {
  log('\n╔═══════════════════════════════════════════════════════════╗', 'cyan');
  log('║     KIỂM TRA TRẠNG THÁI DỰ ÁN                            ║', 'cyan');
  log('╚═══════════════════════════════════════════════════════════╝\n', 'cyan');
  
  log('1. Kiểm tra Backend (Port 5000)...', 'cyan');
  const backend = await checkBackend();
  if (backend.success) {
    log('   ✅ Backend: ĐANG CHẠY', 'green');
  } else {
    log('   ❌ Backend: KHÔNG CHẠY', 'red');
    log('   → Cần start: node server.js', 'yellow');
  }
  
  log('\n2. Kiểm tra Frontend (Port 3099)...', 'cyan');
  const frontend = await checkFrontend();
  if (frontend.success) {
    log('   ✅ Frontend: ĐANG CHẠY', 'green');
  } else {
    log('   ❌ Frontend: KHÔNG CHẠY', 'red');
    log('   → Cần start: cd client && npm start', 'yellow');
  }
  
  log('\n╔═══════════════════════════════════════════════════════════╗', 'cyan');
  log('║     KẾT QUẢ                                               ║', 'cyan');
  log('╚═══════════════════════════════════════════════════════════╝\n', 'cyan');
  
  if (!backend.success && !frontend.success) {
    log('❌ CẢ HAI SERVER ĐỀU KHÔNG CHẠY!', 'red');
    log('\n📋 GIẢI PHÁP:', 'yellow');
    log('   1. Chạy: node scripts/start-servers.js', 'cyan');
    log('   2. HOẶC chạy thủ công:', 'cyan');
    log('      Terminal 1: node server.js', 'white');
    log('      Terminal 2: cd client && npm start', 'white');
  } else if (!backend.success) {
    log('❌ Backend KHÔNG CHẠY', 'red');
    log('   → Start: node server.js', 'yellow');
  } else if (!frontend.success) {
    log('❌ Frontend KHÔNG CHẠY', 'red');
    log('   → Start: cd client && npm start', 'yellow');
  } else {
    log('✅ CẢ HAI SERVER ĐỀU ĐANG CHẠY!', 'green');
    log('\n🌐 URLs:', 'cyan');
    log('   Backend:  http://localhost:5000', 'white');
    log('   Frontend: http://localhost:3099', 'white');
  }
  
  log('');
}

main().catch(console.error);

