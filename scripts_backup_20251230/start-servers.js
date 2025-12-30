#!/usr/bin/env node

/**
 * Start Both Servers Script
 */

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

console.log('\n╔═══════════════════════════════════════════════════════════╗');
console.log('║     KHỞI ĐỘNG CẢ HAI SERVER                              ║');
console.log('╚═══════════════════════════════════════════════════════════╝\n');

// Start Backend
console.log('1. Khởi động Backend Server...');
const backend = spawn('node', ['server.js'], {
  cwd: rootDir,
  stdio: 'inherit',
  shell: true
});

backend.on('error', (err) => {
  console.error('❌ Lỗi khi start Backend:', err.message);
});

// Start Frontend (sau 3 giây)
setTimeout(() => {
  console.log('\n2. Khởi động Frontend Server...');
  const frontend = spawn('npm', ['start'], {
    cwd: path.join(rootDir, 'client'),
    stdio: 'inherit',
    shell: true
  });
  
  frontend.on('error', (err) => {
    console.error('❌ Lỗi khi start Frontend:', err.message);
  });
}, 3000);

console.log('\n✅ Đã khởi động cả hai server!');
console.log('   Backend:  http://localhost:5000');
console.log('   Frontend: http://localhost:3099\n');
console.log('⚠️  Nhấn Ctrl+C để dừng cả hai server\n');

