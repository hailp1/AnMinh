#!/usr/bin/env node

/**
 * Auto Fix and Test - Tự động test và fix các vấn đề
 */

import http from 'http';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

console.log('\n╔═══════════════════════════════════════════════════════════╗');
console.log('║     AUTO FIX AND TEST - TỰ ĐỘNG TEST VÀ FIX             ║');
console.log('╚═══════════════════════════════════════════════════════════╝\n');

let results = {
  backend: false,
  routes: false,
  users: false,
  proxy: false
};

// Helper: Test HTTP request
function httpRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        resolve({ status: res.statusCode, body, headers: res.headers });
      });
    });
    
    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Timeout'));
    });
    
    if (data) {
      req.write(data);
    }
    req.end();
  });
}

// Step 1: Test Backend
console.log('📡 Bước 1: Kiểm tra Backend...');
try {
  const response = await httpRequest({
    hostname: 'localhost',
    port: 5000,
    path: '/api',
    method: 'GET',
    timeout: 3000
  });
  
  if (response.status === 200) {
    console.log('   ✅ Backend đang chạy');
    results.backend = true;
  } else {
    console.log(`   ❌ Backend trả về ${response.status}`);
  }
} catch (error) {
  console.log('   ❌ Backend KHÔNG chạy');
  console.log(`   Lỗi: ${error.message}`);
  console.log('');
  console.log('💡 Cần start backend: node server.js');
  console.log('   (Bạn cần tự start backend trong terminal khác)');
}

await new Promise(r => setTimeout(r, 500));

// Step 2: Test Routes
if (results.backend) {
  console.log('\n📋 Bước 2: Kiểm tra Routes...');
  try {
    const response = await httpRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/login',
      method: 'GET',
      timeout: 3000
    });
    
    if (response.status === 405) {
      console.log('   ✅ Route GET /api/auth/login TỒN TẠI (405 = đúng)');
      results.routes = true;
    } else if (response.status === 404) {
      console.log('   ❌ Route KHÔNG TỒN TẠI (404)');
      console.log('   💡 Routes chưa được load - cần restart backend');
    } else {
      console.log(`   ⚠️  Status: ${response.status}`);
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
  }
  
  await new Promise(r => setTimeout(r, 500));
  
  // Test POST route
  try {
    const body = JSON.stringify({ employeeCode: 'admin', password: 'admin' });
    const response = await httpRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
      },
      timeout: 5000
    }, body);
    
    if (response.status === 200) {
      console.log('   ✅ Route POST /api/auth/login HOẠT ĐỘNG');
      const json = JSON.parse(response.body);
      console.log(`   ✅ User: ${json.user?.name} (${json.user?.role})`);
      results.users = true;
    } else if (response.status === 400) {
      console.log('   ⚠️  Status 400 - User không tồn tại hoặc password sai');
      console.log('   💡 Đang tạo user...');
      
      // Tạo user
      const { execSync } = await import('child_process');
      try {
        execSync('node scripts/create-users.js', { 
          cwd: rootDir,
          stdio: 'inherit',
          timeout: 10000
        });
        console.log('   ✅ Đã tạo user');
        results.users = true;
      } catch (e) {
        console.log('   ❌ Không thể tạo user (có thể database không kết nối)');
      }
    } else if (response.status === 404) {
      console.log('   ❌ Route POST KHÔNG TỒN TẠI (404)');
    } else {
      console.log(`   ⚠️  Status: ${response.status}`);
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
  }
}

// Step 3: Test Proxy
console.log('\n🌐 Bước 3: Kiểm tra Proxy...');
const ports = [3099, 3100, 3101, 3000];
for (const port of ports) {
  try {
    const response = await httpRequest({
      hostname: 'localhost',
      port: port,
      path: '/api',
      method: 'GET',
      timeout: 3000
    });
    
    if (response.status === 200) {
      console.log(`   ✅ Frontend đang chạy trên port ${port}`);
      console.log('   ✅ Proxy forward /api đến backend');
      results.proxy = true;
      break;
    }
  } catch (error) {
    // Continue to next port
  }
}

if (!results.proxy) {
  console.log('   ❌ Frontend không chạy hoặc proxy không hoạt động');
  console.log('   💡 Cần start frontend: cd client && npm start');
}

// Summary
console.log('\n╔═══════════════════════════════════════════════════════════╗');
console.log('║     KẾT QUẢ                                               ║');
console.log('╚═══════════════════════════════════════════════════════════╝\n');

const allOk = results.backend && results.routes && results.users && results.proxy;

if (allOk) {
  console.log('✅ TẤT CẢ ĐỀU HOẠT ĐỘNG TỐT!\n');
  console.log('🎉 Bạn có thể login ngay bây giờ:');
  console.log('   - URL: http://localhost:3099/admin/login');
  console.log('   - Employee Code: admin');
  console.log('   - Password: admin\n');
} else {
  console.log('⚠️  MỘT SỐ VẤN ĐỀ CẦN FIX:\n');
  
  if (!results.backend) {
    console.log('❌ Backend không chạy');
    console.log('   → Mở terminal mới và chạy: node server.js\n');
  }
  
  if (!results.routes && results.backend) {
    console.log('❌ Routes chưa được load');
    console.log('   → Restart backend\n');
  }
  
  if (!results.users && results.routes) {
    console.log('❌ User chưa được tạo');
    console.log('   → Chạy: npm run create:users\n');
  }
  
  if (!results.proxy) {
    console.log('❌ Frontend không chạy');
    console.log('   → Mở terminal mới và chạy: cd client && npm start\n');
  }
}

console.log('');

