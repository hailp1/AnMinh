import http from 'http';

const BACKEND_URL = 'http://localhost:5000';
const TIMEOUT = 3000;

function checkBackendHealth() {
  return new Promise((resolve) => {
    const req = http.get(`${BACKEND_URL}/api`, { timeout: TIMEOUT }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          resolve({ status: 'healthy', message: 'Backend đang chạy' });
        } else {
          resolve({ status: 'unhealthy', message: `Backend trả status ${res.statusCode}` });
        }
      });
    });

    req.on('error', (err) => {
      resolve({ status: 'unhealthy', message: `Backend không phản hồi: ${err.message}` });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({ status: 'unhealthy', message: 'Backend timeout' });
    });
  });
}

async function main() {
  console.log('🔍 Đang kiểm tra Backend health...\n');
  const result = await checkBackendHealth();
  
  if (result.status === 'healthy') {
    console.log('✅ Backend: HEALTHY');
    console.log(`   ${result.message}\n`);
    
    // Test login endpoint
    console.log('🔍 Đang test login endpoint...\n');
    const loginTest = await new Promise((resolve) => {
      const loginReq = http.request({
        hostname: 'localhost',
        port: 5000,
        path: '/api/auth/login',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        timeout: TIMEOUT
      }, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          if (res.statusCode === 405 || res.statusCode === 400) {
            resolve({ status: 'ok', message: 'Login endpoint hoạt động (nhận được response)' });
          } else {
            resolve({ status: 'error', message: `Login endpoint trả status ${res.statusCode}` });
          }
        });
      });

      loginReq.on('error', (err) => {
        resolve({ status: 'error', message: `Login endpoint error: ${err.message}` });
      });

      loginReq.on('timeout', () => {
        loginReq.destroy();
        resolve({ status: 'error', message: 'Login endpoint timeout' });
      });

      loginReq.write(JSON.stringify({ employeeCode: 'AM01', password: 'admin123' }));
      loginReq.end();
    });

    console.log(`✅ Login endpoint: ${loginTest.status === 'ok' ? 'OK' : 'ERROR'}`);
    console.log(`   ${loginTest.message}\n`);
    
    process.exit(0);
  } else {
    console.log('❌ Backend: UNHEALTHY');
    console.log(`   ${result.message}\n`);
    console.log('💡 Giải pháp:');
    console.log('   1. Khởi động backend: node server.js');
    console.log('   2. Hoặc double-click: start-backend.bat');
    console.log('   3. Kiểm tra .env file có DATABASE_URL và JWT_SECRET\n');
    process.exit(1);
  }
}

main();

