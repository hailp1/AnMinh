#!/usr/bin/env node

/**
 * Start Project Now - Khởi chạy dự án ngay
 */

import { spawn } from 'child_process';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname);
const clientDir = path.join(rootDir, 'client');

console.log('\n╔═══════════════════════════════════════════════════════════╗');
console.log('║     KHỞI CHẠY DỰ ÁN - KIỂM TRA VÀ START                  ║');
console.log('╚═══════════════════════════════════════════════════════════╝\n');

// Kiểm tra Backend
async function checkBackend() {
  return new Promise((resolve) => {
    const req = http.request({
      hostname: 'localhost',
      port: 5000,
      path: '/api',
      timeout: 2000,
    }, (res) => {
      resolve(true);
    });
    
    req.on('error', () => resolve(false));
    req.on('timeout', () => { req.destroy(); resolve(false); });
    req.end();
  });
}

// Kiểm tra Frontend
async function checkFrontend() {
  return new Promise((resolve) => {
    const req = http.request({
      hostname: 'localhost',
      port: 3099,
      timeout: 2000,
    }, (res) => {
      resolve(true);
    });
    
    req.on('error', () => resolve(false));
    req.on('timeout', () => { req.destroy(); resolve(false); });
    req.end();
  });
}

// Start Backend
function startBackend() {
  console.log('📦 Khởi động Backend Server...');
  const backend = spawn('node', ['server.js'], {
    cwd: rootDir,
    stdio: 'inherit',
    shell: true
  });
  
  backend.on('error', (err) => {
    console.error('❌ Lỗi Backend:', err.message);
  });
  
  return backend;
}

// Start Frontend
function startFrontend() {
  console.log('📦 Khởi động Frontend Server...');
  const frontend = spawn('npm', ['start'], {
    cwd: clientDir,
    stdio: 'inherit',
    shell: true
  });
  
  frontend.on('error', (err) => {
    console.error('❌ Lỗi Frontend:', err.message);
  });
  
  return frontend;
}

// Main
async function main() {
  console.log('🔍 Kiểm tra trạng thái...\n');
  
  const backendRunning = await checkBackend();
  const frontendRunning = await checkFrontend();
  
  if (backendRunning) {
    console.log('✅ Backend: ĐANG CHẠY (http://localhost:5000)');
  } else {
    console.log('❌ Backend: KHÔNG CHẠY');
    console.log('   → Đang khởi động...\n');
    startBackend();
    await new Promise(resolve => setTimeout(resolve, 3000));
  }
  
  if (frontendRunning) {
    console.log('✅ Frontend: ĐANG CHẠY (http://localhost:3099)');
  } else {
    console.log('❌ Frontend: KHÔNG CHẠY');
    console.log('   → Đang khởi động...\n');
    startFrontend();
  }
  
  console.log('\n╔═══════════════════════════════════════════════════════════╗');
  console.log('║     ✅ ĐÃ KHỞI CHẠY!                                       ║');
  console.log('╚═══════════════════════════════════════════════════════════╝\n');
  console.log('🌐 URLs:');
  console.log('   Backend:  http://localhost:5000');
  console.log('   Frontend: http://localhost:3099');
  console.log('\n⏳ Đợi Frontend compile (30-60 giây)...');
  console.log('   Sau đó mở browser: http://localhost:3099\n');
  console.log('⚠️  Nhấn Ctrl+C để dừng servers\n');
}

main().catch(console.error);

