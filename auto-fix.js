#!/usr/bin/env node
/**
 * Auto Fix Script
 * Tự động sửa các lỗi thường gặp
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import http from 'http';

const execAsync = promisify(exec);

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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

async function fixPackageJson() {
  log('\n🔧 Fixing package.json...', 'cyan');
  
  const packageJsonPath = join(__dirname, 'client', 'package.json');
  
  if (!existsSync(packageJsonPath)) {
    log('❌ package.json not found', 'red');
    return false;
  }
  
  try {
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
    
    // Remove proxy field if exists
    if (packageJson.proxy) {
      delete packageJson.proxy;
      writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
      log('✅ Removed "proxy" field from package.json', 'green');
      return true;
    }
    
    log('✅ package.json is OK', 'green');
    return false;
  } catch (error) {
    log(`❌ Error fixing package.json: ${error.message}`, 'red');
    return false;
  }
}

async function createSetupProxy() {
  log('\n🔧 Creating setupProxy.js...', 'cyan');
  
  const setupProxyPath = join(__dirname, 'client', 'src', 'setupProxy.js');
  
  if (existsSync(setupProxyPath)) {
    log('✅ setupProxy.js already exists', 'green');
    return false;
  }
  
  const setupProxyContent = `const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://localhost:5000',
      changeOrigin: true,
      ws: false,
      logLevel: 'debug',
      secure: false,
      onError: (err, req, res) => {
        console.error('Proxy error:', err.message);
        res.status(500).json({ 
          error: 'Proxy error: Backend server không khả dụng',
          message: err.message 
        });
      },
      onProxyReq: (proxyReq, req, res) => {
        console.log(\`[Proxy] \${req.method} \${req.url} -> http://localhost:5000\${req.url}\`);
      },
    })
  );
};
`;

  try {
    writeFileSync(setupProxyPath, setupProxyContent);
    log('✅ Created setupProxy.js', 'green');
    return true;
  } catch (error) {
    log(`❌ Error creating setupProxy.js: ${error.message}`, 'red');
    return false;
  }
}

async function checkAndInstallDependencies() {
  log('\n🔧 Checking dependencies...', 'cyan');
  
  const packageJsonPath = join(__dirname, 'client', 'package.json');
  
  if (!existsSync(packageJsonPath)) {
    log('❌ package.json not found', 'red');
    return false;
  }
  
  try {
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
    
    if (!packageJson.dependencies['http-proxy-middleware']) {
      log('📦 Installing http-proxy-middleware...', 'yellow');
      try {
        await execAsync('cd client && npm install http-proxy-middleware', { cwd: __dirname });
        log('✅ Installed http-proxy-middleware', 'green');
        return true;
      } catch (error) {
        log(`❌ Error installing: ${error.message}`, 'red');
        return false;
      }
    }
    
    log('✅ Dependencies OK', 'green');
    return false;
  } catch (error) {
    log(`❌ Error checking dependencies: ${error.message}`, 'red');
    return false;
  }
}

async function checkProxyAfterFix() {
  log('\n🔧 Checking proxy after fixes...', 'cyan');
  
  // Wait a bit for frontend to potentially reload
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  return new Promise((resolve) => {
    const req = http.request({
      hostname: 'localhost',
      port: 3099,
      path: '/api/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 3000,
    }, (res) => {
      if (res.statusCode === 200 || res.statusCode === 400 || res.statusCode === 401) {
        log('✅ Proxy: WORKING after fixes!', 'green');
        resolve(true);
      } else {
        log(`⚠️  Proxy: Still ${res.statusCode} - Frontend may need restart`, 'yellow');
        resolve(false);
      }
    });

    req.on('error', () => {
      log('⚠️  Proxy: Frontend may not be running or needs restart', 'yellow');
      resolve(false);
    });

    req.on('timeout', () => {
      req.destroy();
      log('⚠️  Proxy: Timeout - Frontend may need restart', 'yellow');
      resolve(false);
    });

    req.write(JSON.stringify({ employeeCode: 'AM01', password: 'admin123' }));
    req.end();
  });
}

async function main() {
  console.log(`${colors.cyan}
╔═══════════════════════════════════════════════════════╗
║           AUTO FIX SCRIPT                             ║
║           Tự động sửa các lỗi thường gặp              ║
╚═══════════════════════════════════════════════════════╝
${colors.reset}`);

  let fixed = 0;
  
  if (await fixPackageJson()) fixed++;
  if (await createSetupProxy()) fixed++;
  if (await checkAndInstallDependencies()) fixed++;
  
  if (fixed > 0) {
    log(`\n✅ Đã sửa ${fixed} vấn đề!`, 'green');
    log('\n📝 Bước tiếp theo:', 'yellow');
    log('   ⚠️  Frontend CẦN restart để áp dụng changes!', 'yellow');
    log('   1. Stop frontend (Ctrl+C trong terminal npm start)', 'cyan');
    log('   2. Restart: cd client && npm start', 'cyan');
    log('   3. Đợi "Compiled successfully!"', 'cyan');
    log('   4. Chạy check lại: npm run check', 'cyan');
  } else {
    log('\n✅ Không có lỗi cần sửa trong code!', 'green');
    
    // Check if proxy is still not working
    const http = (await import('http')).default;
    log('\n⚠️  Proxy vẫn trả 404 - Có thể frontend chưa compile xong hoặc cần restart', 'yellow');
    log('\n📝 Giải pháp:', 'yellow');
    log('   1. Kiểm tra cửa sổ PowerShell Frontend:', 'cyan');
    log('      - Tìm dòng "Compiled successfully!"', 'white');
    log('      - Nếu chưa thấy, đợi thêm 30-60 giây', 'white');
    log('   2. Nếu đã compile xong mà vẫn lỗi:', 'cyan');
    log('      - Dừng frontend (Ctrl+C)', 'white');
    log('      - Restart: cd client && npm start', 'white');
    log('      - Đợi compile xong rồi test lại', 'white');
  }
  
  console.log('');
}

main().catch(console.error);

