#!/usr/bin/env node

/**
 * Full Detail Debug Script
 * Log chi tiết để tìm đúng nguyên nhân lỗi
 */

import http from 'http';
import https from 'https';
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
  magenta: '\x1b[35m',
  gray: '\x1b[90m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  log('\n' + '='.repeat(60), 'cyan');
  log(`  ${title}`, 'cyan');
  log('='.repeat(60), 'cyan');
  log('');
}

function logSubSection(title) {
  log(`\n--- ${title} ---`, 'yellow');
}

function logDetail(label, value, status = 'info') {
  const statusColor = status === 'ok' ? 'green' : status === 'error' ? 'red' : status === 'warn' ? 'yellow' : 'white';
  const statusIcon = status === 'ok' ? '✅' : status === 'error' ? '❌' : status === 'warn' ? '⚠️' : 'ℹ️';
  
  log(`   ${statusIcon} ${label}:`, statusColor);
  if (typeof value === 'object') {
    console.log(JSON.stringify(value, null, 6));
  } else {
    log(`      ${value}`, 'gray');
  }
}

async function testBackend() {
  logSection('1. TEST BACKEND - CHI TIẾT');
  
  logSubSection('1.1 Test Connection đến Port 5000');
  return new Promise((resolve) => {
    const startTime = Date.now();
    logDetail('Request URL', 'http://localhost:5000/api', 'info');
    logDetail('Method', 'GET', 'info');
    logDetail('Timeout', '3000ms', 'info');
    
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: '/api',
      method: 'GET',
      timeout: 3000,
    };
    
    logDetail('Request options', options, 'info');
    
    const req = http.request(options, (res) => {
      const responseTime = Date.now() - startTime;
      logDetail('Response received', `Status: ${res.statusCode}, Time: ${responseTime}ms`, res.statusCode === 200 ? 'ok' : 'error');
      logDetail('Response headers', JSON.stringify(res.headers, null, 2), 'info');
      
      let data = '';
      res.on('data', (chunk) => { 
        data += chunk;
        logDetail('Data chunk received', `${chunk.length} bytes`, 'info');
      });
      
      res.on('end', () => {
        logDetail('Response complete', `Total size: ${data.length} bytes`, 'info');
        try {
          const json = JSON.parse(data);
          logDetail('Parsed JSON', JSON.stringify(json, null, 2), 'ok');
          logDetail('Backend status', 'RUNNING ✅', 'ok');
          resolve({ success: true, data: json });
        } catch (e) {
          logDetail('Parse error', e.message, 'error');
          logDetail('Raw response', data.substring(0, 200), 'info');
          resolve({ success: false, error: 'Invalid JSON', raw: data });
        }
      });
    });
    
    req.on('error', (error) => {
      const responseTime = Date.now() - startTime;
      logDetail('Request error', error.message, 'error');
      logDetail('Error code', error.code || 'Unknown', 'error');
      logDetail('Response time', `${responseTime}ms`, 'error');
      
      if (error.code === 'ECONNREFUSED') {
        logDetail('Nguyên nhân', 'Backend không chạy hoặc không listen trên port 5000', 'error');
      } else if (error.code === 'ETIMEDOUT') {
        logDetail('Nguyên nhân', 'Backend không phản hồi trong 3 giây', 'error');
      }
      
      resolve({ success: false, error: error.message, code: error.code });
    });
    
    req.on('timeout', () => {
      req.destroy();
      logDetail('Request timeout', 'Không phản hồi trong 3 giây', 'error');
      resolve({ success: false, error: 'Timeout' });
    });
    
    logDetail('Sending request', '...', 'info');
    req.end();
  });
}

async function testFrontend() {
  logSection('2. TEST FRONTEND - CHI TIẾT');
  
  const ports = [3099, 3100, 3101, 3000];
  let foundPort = null;
  
  for (const port of ports) {
    logSubSection(`2.${port - 3098} Test Port ${port}`);
    
    const result = await new Promise((resolve) => {
      const startTime = Date.now();
      logDetail('Testing port', port.toString(), 'info');
      
      const req = http.request({
        hostname: 'localhost',
        port: port,
        path: '/',
        method: 'GET',
        timeout: 2000,
      }, (res) => {
        const responseTime = Date.now() - startTime;
        logDetail('Response received', `Status: ${res.statusCode}, Time: ${responseTime}ms`, 'ok');
        logDetail('Content-Type', res.headers['content-type'] || 'Unknown', 'info');
        resolve({ success: true, port });
      });
      
      req.on('error', (error) => {
        logDetail('No response', error.code || error.message, 'warn');
        resolve({ success: false });
      });
      
      req.on('timeout', () => {
        req.destroy();
        logDetail('Timeout', 'No response', 'warn');
        resolve({ success: false });
      });
      
      req.end();
    });
    
    if (result.success) {
      foundPort = port;
      logDetail('Frontend found', `Port ${port}`, 'ok');
      break;
    }
  }
  
  if (!foundPort) {
    logDetail('Frontend status', 'NOT RUNNING ❌', 'error');
    logDetail('Nguyên nhân', 'Không tìm thấy frontend trên bất kỳ port nào (3099, 3100, 3101, 3000)', 'error');
  }
  
  return foundPort;
}

async function testProxy(frontendPort) {
  logSection('3. TEST PROXY - CHI TIẾT');
  
  if (!frontendPort) {
    logDetail('Cannot test', 'Frontend chưa chạy', 'warn');
    return { success: false, reason: 'Frontend not running' };
  }
  
  logSubSection('3.1 Test GET /api qua Proxy');
  return new Promise((resolve) => {
    const startTime = Date.now();
    const url = `http://localhost:${frontendPort}/api`;
    logDetail('Request URL', url, 'info');
    logDetail('Method', 'GET', 'info');
    logDetail('Expected', 'Proxy forward to http://localhost:5000/api', 'info');
    
    const req = http.request({
      hostname: 'localhost',
      port: frontendPort,
      path: '/api',
      method: 'GET',
      timeout: 5000,
      headers: {
        'Origin': `http://localhost:${frontendPort}`,
        'Accept': 'application/json',
      }
    }, (res) => {
      const responseTime = Date.now() - startTime;
      logDetail('Response received', `Status: ${res.statusCode}, Time: ${responseTime}ms`, res.statusCode === 200 ? 'ok' : 'error');
      logDetail('Content-Type', res.headers['content-type'] || 'Unknown', 'info');
      logDetail('Response headers', JSON.stringify(res.headers, null, 2), 'info');
      
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        logDetail('Response size', `${data.length} bytes`, 'info');
        
        if (res.statusCode === 404) {
          logDetail('PROXY STATUS', 'KHÔNG HOẠT ĐỘNG ❌', 'error');
          logDetail('Nguyên nhân', 'setupProxy.js chưa được load hoặc không hoạt động', 'error');
          logDetail('Response body', data.substring(0, 200), 'error');
          resolve({ success: false, status: 404, body: data });
        } else if (res.statusCode === 200) {
          try {
            const json = JSON.parse(data);
            logDetail('PROXY STATUS', 'HOẠT ĐỘNG ✅', 'ok');
            logDetail('Parsed response', JSON.stringify(json, null, 2), 'ok');
            resolve({ success: true, data: json });
          } catch (e) {
            logDetail('Parse error', e.message, 'error');
            logDetail('Raw response', data.substring(0, 200), 'info');
            resolve({ success: false, parseError: e.message });
          }
        } else {
          logDetail('PROXY STATUS', `Unexpected status ${res.statusCode}`, 'warn');
          logDetail('Response body', data.substring(0, 200), 'info');
          resolve({ success: false, status: res.statusCode, body: data });
        }
      });
    });
    
    req.on('error', (error) => {
      logDetail('Request error', error.message, 'error');
      logDetail('Error code', error.code || 'Unknown', 'error');
      if (error.code === 'ECONNREFUSED') {
        logDetail('Nguyên nhân', 'Frontend không chạy hoặc không listen trên port này', 'error');
      }
      resolve({ success: false, error: error.message });
    });
    
    req.on('timeout', () => {
      req.destroy();
      logDetail('Request timeout', 'Frontend không phản hồi', 'error');
      resolve({ success: false, error: 'Timeout' });
    });
    
    logDetail('Sending request', '...', 'info');
    req.end();
  });
}

async function testLoginEndpoint() {
  logSection('4. TEST LOGIN ENDPOINT - CHI TIẾT');
  
  logSubSection('4.1 Test POST /api/auth/login trực tiếp đến Backend');
  
  return new Promise((resolve) => {
    const startTime = Date.now();
    const url = 'http://localhost:5000/api/auth/login';
    const body = JSON.stringify({
      employeeCode: 'AM01',
      password: 'admin123'
    });
    
    logDetail('Request URL', url, 'info');
    logDetail('Method', 'POST', 'info');
    logDetail('Request body', body, 'info');
    logDetail('Content-Type', 'application/json', 'info');
    
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
        'Accept': 'application/json',
      },
      timeout: 10000,
    };
    
    logDetail('Request options', JSON.stringify(options, null, 2), 'info');
    
    const req = http.request(options, (res) => {
      const responseTime = Date.now() - startTime;
      logDetail('Response received', `Status: ${res.statusCode}, Time: ${responseTime}ms`, res.statusCode === 200 ? 'ok' : 'error');
      logDetail('Content-Type', res.headers['content-type'] || 'Unknown', 'info');
      logDetail('Response headers', JSON.stringify(res.headers, null, 2), 'info');
      
      let data = '';
      res.on('data', (chunk) => { 
        data += chunk;
        logDetail('Data chunk', `${chunk.length} bytes`, 'info');
      });
      
      res.on('end', () => {
        logDetail('Response complete', `Total size: ${data.length} bytes`, 'info');
        
        if (res.statusCode === 404) {
          logDetail('LOGIN ENDPOINT', 'KHÔNG TÌM THẤY ❌', 'error');
          logDetail('Nguyên nhân', 'Route /api/auth/login không được register trong backend', 'error');
          logDetail('Response body', data, 'error');
          resolve({ success: false, status: 404, body: data });
        } else if (res.statusCode === 400) {
          logDetail('LOGIN ENDPOINT', 'BAD REQUEST ⚠️', 'warn');
          logDetail('Nguyên nhân', 'Có thể user không tồn tại hoặc password sai', 'warn');
          try {
            const json = JSON.parse(data);
            logDetail('Error message', json.message || 'Unknown', 'warn');
          } catch (e) {
            logDetail('Response body', data, 'warn');
          }
          resolve({ success: false, status: 400, body: data });
        } else if (res.statusCode === 500) {
          logDetail('LOGIN ENDPOINT', 'SERVER ERROR ❌', 'error');
          logDetail('Nguyên nhân', 'Backend có lỗi khi xử lý request (có thể database không kết nối được)', 'error');
          try {
            const json = JSON.parse(data);
            logDetail('Error message', json.message || 'Unknown', 'error');
            logDetail('Error details', json.error || 'None', 'error');
          } catch (e) {
            logDetail('Response body', data, 'error');
          }
          resolve({ success: false, status: 500, body: data });
        } else if (res.statusCode === 200) {
          try {
            const json = JSON.parse(data);
            logDetail('LOGIN ENDPOINT', 'HOẠT ĐỘNG ✅', 'ok');
            logDetail('User', json.user?.name || 'Unknown', 'ok');
            logDetail('Role', json.user?.role || 'Unknown', 'ok');
            logDetail('Token', json.token ? `${json.token.substring(0, 20)}...` : 'None', 'ok');
            resolve({ success: true, data: json });
          } catch (e) {
            logDetail('Parse error', e.message, 'error');
            logDetail('Raw response', data.substring(0, 200), 'error');
            resolve({ success: false, parseError: e.message });
          }
        } else {
          logDetail('LOGIN ENDPOINT', `Unexpected status ${res.statusCode}`, 'warn');
          logDetail('Response body', data.substring(0, 200), 'info');
          resolve({ success: false, status: res.statusCode, body: data });
        }
      });
    });
    
    req.on('error', (error) => {
      const responseTime = Date.now() - startTime;
      logDetail('Request error', error.message, 'error');
      logDetail('Error code', error.code || 'Unknown', 'error');
      logDetail('Response time', `${responseTime}ms`, 'error');
      
      if (error.code === 'ECONNREFUSED') {
        logDetail('Nguyên nhân', 'Backend không chạy hoặc không listen trên port 5000', 'error');
      } else if (error.code === 'ETIMEDOUT') {
        logDetail('Nguyên nhân', 'Backend không phản hồi trong 10 giây', 'error');
      }
      
      resolve({ success: false, error: error.message, code: error.code });
    });
    
    req.on('timeout', () => {
      req.destroy();
      logDetail('Request timeout', 'Backend không phản hồi trong 10 giây', 'error');
      logDetail('Nguyên nhân', 'Backend có thể đang xử lý request quá lâu hoặc bị hang', 'error');
      resolve({ success: false, error: 'Timeout' });
    });
    
    logDetail('Sending request', '...', 'info');
    req.write(body);
    req.end();
  });
}

async function testProxyLogin(frontendPort) {
  logSection('5. TEST LOGIN QUA PROXY - CHI TIẾT');
  
  if (!frontendPort) {
    logDetail('Cannot test', 'Frontend chưa chạy', 'warn');
    return { success: false, reason: 'Frontend not running' };
  }
  
  logSubSection('5.1 Test POST /api/auth/login qua Proxy');
  
  return new Promise((resolve) => {
    const startTime = Date.now();
    const url = `http://localhost:${frontendPort}/api/auth/login`;
    const body = JSON.stringify({
      employeeCode: 'AM01',
      password: 'admin123'
    });
    
    logDetail('Request URL', url, 'info');
    logDetail('Method', 'POST', 'info');
    logDetail('Request body', body, 'info');
    logDetail('Expected flow', `Frontend (${frontendPort}) -> Proxy -> Backend (5000)`, 'info');
    
    const req = http.request({
      hostname: 'localhost',
      port: frontendPort,
      path: '/api/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
        'Origin': `http://localhost:${frontendPort}`,
        'Accept': 'application/json',
      },
      timeout: 15000,
    }, (res) => {
      const responseTime = Date.now() - startTime;
      logDetail('Response received', `Status: ${res.statusCode}, Time: ${responseTime}ms`, res.statusCode === 200 ? 'ok' : 'error');
      logDetail('Content-Type', res.headers['content-type'] || 'Unknown', 'info');
      logDetail('Response headers', JSON.stringify(res.headers, null, 2), 'info');
      
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        logDetail('Response size', `${data.length} bytes`, 'info');
        
        if (res.statusCode === 404) {
          logDetail('PROXY LOGIN', '404 NOT FOUND ❌', 'error');
          logDetail('Nguyên nhân', 'setupProxy.js chưa được load hoặc không forward request', 'error');
          logDetail('Response body', data, 'error');
          resolve({ success: false, status: 404, body: data });
        } else if (res.statusCode === 200) {
          try {
            const json = JSON.parse(data);
            logDetail('PROXY LOGIN', 'THÀNH CÔNG ✅', 'ok');
            logDetail('User', json.user?.name || 'Unknown', 'ok');
            logDetail('Role', json.user?.role || 'Unknown', 'ok');
            resolve({ success: true, data: json });
          } catch (e) {
            logDetail('Parse error', e.message, 'error');
            logDetail('Raw response', data.substring(0, 200), 'error');
            resolve({ success: false, parseError: e.message });
          }
        } else {
          logDetail('PROXY LOGIN', `Status ${res.statusCode}`, res.statusCode >= 500 ? 'error' : 'warn');
          logDetail('Response body', data.substring(0, 200), 'info');
          resolve({ success: false, status: res.statusCode, body: data });
        }
      });
    });
    
    req.on('error', (error) => {
      logDetail('Request error', error.message, 'error');
      logDetail('Error code', error.code || 'Unknown', 'error');
      if (error.code === 'ECONNREFUSED') {
        logDetail('Nguyên nhân', 'Frontend không chạy hoặc không listen', 'error');
      }
      resolve({ success: false, error: error.message });
    });
    
    req.on('timeout', () => {
      req.destroy();
      logDetail('Request timeout', 'Frontend/Proxy không phản hồi trong 15 giây', 'error');
      logDetail('Nguyên nhân', 'Proxy có thể không forward request hoặc backend không phản hồi', 'error');
      resolve({ success: false, error: 'Timeout' });
    });
    
    logDetail('Sending request', '...', 'info');
    req.write(body);
    req.end();
  });
}

async function checkFiles() {
  logSection('6. KIỂM TRA FILES - CHI TIẾT');
  
  const files = [
    { path: join(rootDir, 'client', 'src', 'setupProxy.js'), name: 'setupProxy.js', critical: true },
    { path: join(rootDir, 'client', 'config-overrides.js'), name: 'config-overrides.js', critical: true },
    { path: join(rootDir, 'server.js'), name: 'server.js', critical: true },
    { path: join(rootDir, 'routes', 'auth.js'), name: 'routes/auth.js', critical: true },
    { path: join(rootDir, '.env'), name: '.env', critical: true },
  ];
  
  for (const file of files) {
    logSubSection(`6.${files.indexOf(file) + 1} Check ${file.name}`);
    
    if (fs.existsSync(file.path)) {
      logDetail('File exists', 'YES ✅', 'ok');
      const stats = fs.statSync(file.path);
      logDetail('File size', `${stats.size} bytes`, 'info');
      logDetail('Modified', stats.mtime.toISOString(), 'info');
      
      if (file.name.includes('setupProxy.js')) {
        const content = fs.readFileSync(file.path, 'utf8');
        if (content.includes('createProxyMiddleware')) {
          logDetail('Proxy middleware', 'FOUND ✅', 'ok');
        } else {
          logDetail('Proxy middleware', 'NOT FOUND ❌', 'error');
        }
        if (content.includes('localhost:5000')) {
          logDetail('Backend URL', 'Correct (localhost:5000) ✅', 'ok');
        } else {
          logDetail('Backend URL', 'INCORRECT ❌', 'error');
        }
      }
      
      if (file.name.includes('config-overrides.js')) {
        const content = fs.readFileSync(file.path, 'utf8');
        if (content.includes('setupProxy')) {
          logDetail('setupProxy loading', 'CONFIGURED ✅', 'ok');
        } else {
          logDetail('setupProxy loading', 'NOT CONFIGURED ❌', 'error');
        }
      }
    } else {
      logDetail('File exists', 'NO ❌', 'error');
      if (file.critical) {
        logDetail('Critical file missing', 'REQUIRED ❌', 'error');
      }
    }
  }
}

async function checkDatabase() {
  logSection('7. KIỂM TRA DATABASE - CHI TIẾT');
  
  logSubSection('7.1 Check .env file');
  const envFile = join(rootDir, '.env');
  if (!fs.existsSync(envFile)) {
    logDetail('.env file', 'NOT FOUND ❌', 'error');
    return { success: false, error: '.env file not found' };
  }
  
  logDetail('.env file', 'EXISTS ✅', 'ok');
  const envContent = fs.readFileSync(envFile, 'utf8');
  
  logSubSection('7.2 Check DATABASE_URL');
  if (envContent.includes('DATABASE_URL')) {
    const match = envContent.match(/DATABASE_URL=(.+)/);
    if (match) {
      const dbUrl = match[1].trim().replace(/^["']|["']$/g, '');
      logDetail('DATABASE_URL', 'DEFINED ✅', 'ok');
      logDetail('Database URL (masked)', dbUrl.replace(/:[^:@]+@/, ':****@'), 'info');
      
      // Parse database URL
      try {
        const url = new URL(dbUrl);
        logDetail('Database host', url.hostname, 'info');
        logDetail('Database port', url.port || '5432 (default)', 'info');
        logDetail('Database name', url.pathname.substring(1), 'info');
      } catch (e) {
        logDetail('Parse URL error', e.message, 'warn');
      }
    } else {
      logDetail('DATABASE_URL', 'FORMAT ERROR ❌', 'error');
    }
  } else {
    logDetail('DATABASE_URL', 'NOT DEFINED ❌', 'error');
    return { success: false, error: 'DATABASE_URL not defined' };
  }
  
  logSubSection('7.3 Check JWT_SECRET');
  if (envContent.includes('JWT_SECRET')) {
    logDetail('JWT_SECRET', 'DEFINED ✅', 'ok');
  } else {
    logDetail('JWT_SECRET', 'NOT DEFINED ❌', 'error');
  }
  
  logSubSection('7.4 Test Database Connection');
  try {
    logDetail('Attempting connection', '...', 'info');
    await prisma.$connect();
    logDetail('Database connection', 'SUCCESS ✅', 'ok');
    
    // Test query
    const userCount = await prisma.user.count();
    logDetail('Users in database', userCount.toString(), 'ok');
    
    // Check AM01 user
    const user = await prisma.user.findUnique({
      where: { employeeCode: 'AM01' }
    });
    
    if (user) {
      logDetail('User AM01', 'EXISTS ✅', 'ok');
      logDetail('User name', user.name, 'ok');
      logDetail('User role', user.role, 'ok');
      logDetail('User active', user.isActive ? 'YES ✅' : 'NO ❌', user.isActive ? 'ok' : 'error');
    } else {
      logDetail('User AM01', 'NOT FOUND ❌', 'error');
      logDetail('Nguyên nhân', 'User AM01 không tồn tại trong database', 'error');
    }
    
    await prisma.$disconnect();
    return { success: true, userCount, user };
  } catch (error) {
    logDetail('Database connection', 'FAILED ❌', 'error');
    logDetail('Error message', error.message, 'error');
    logDetail('Error code', error.code || 'Unknown', 'error');
    
    if (error.message.includes('Can\'t reach database server')) {
      logDetail('Nguyên nhân', 'PostgreSQL không chạy hoặc không kết nối được', 'error');
      logDetail('Giải pháp', 'Start PostgreSQL service hoặc kiểm tra DATABASE_URL', 'warn');
    } else if (error.message.includes('Authentication failed')) {
      logDetail('Nguyên nhân', 'Sai username/password trong DATABASE_URL', 'error');
    } else if (error.message.includes('database') && error.message.includes('does not exist')) {
      logDetail('Nguyên nhân', 'Database name không tồn tại', 'error');
    }
    
    return { success: false, error: error.message };
  }
}

async function checkBackendRoutes() {
  logSection('8. KIỂM TRA BACKEND ROUTES - CHI TIẾT');
  
  const serverFile = join(rootDir, 'server.js');
  if (!fs.existsSync(serverFile)) {
    logDetail('server.js', 'NOT FOUND ❌', 'error');
    return;
  }
  
  const serverContent = fs.readFileSync(serverFile, 'utf8');
  
  logSubSection('8.1 Check auth route registration');
  if (serverContent.includes("app.use('/api/auth'")) {
    logDetail('Auth route', 'REGISTERED ✅', 'ok');
    const match = serverContent.match(/app\.use\('\/api\/auth',\s*(\w+Routes)/);
    if (match) {
      logDetail('Route variable', match[1], 'ok');
    }
  } else {
    logDetail('Auth route', 'NOT REGISTERED ❌', 'error');
  }
  
  logSubSection('8.2 Check auth.js route file');
  const authRouteFile = join(rootDir, 'routes', 'auth.js');
  if (fs.existsSync(authRouteFile)) {
    logDetail('auth.js file', 'EXISTS ✅', 'ok');
    const authContent = fs.readFileSync(authRouteFile, 'utf8');
    
    if (authContent.includes("router.post('/login'")) {
      logDetail('POST /login route', 'DEFINED ✅', 'ok');
    } else {
      logDetail('POST /login route', 'NOT DEFINED ❌', 'error');
    }
    
    if (authContent.includes("router.get('/login'")) {
      logDetail('GET /login route', 'DEFINED (405 handler) ✅', 'ok');
    }
  } else {
    logDetail('auth.js file', 'NOT FOUND ❌', 'error');
  }
}

async function main() {
  log('\n╔═══════════════════════════════════════════════════════════╗', 'cyan');
  log('║     FULL DETAIL DEBUG - TÌM ĐÚNG NGUYÊN NHÂN              ║', 'cyan');
  log('╚═══════════════════════════════════════════════════════════╝', 'cyan');
  
  const results = {
    backend: null,
    frontend: null,
    proxy: null,
    loginDirect: null,
    loginProxy: null,
    database: null,
  };
  
  // Test Backend
  results.backend = await testBackend();
  
  // Test Frontend
  results.frontend = await testFrontend();
  
  // Test Proxy
  results.proxy = await testProxy(results.frontend);
  
  // Test Login Endpoint (direct)
  if (results.backend && results.backend.success) {
    results.loginDirect = await testLoginEndpoint();
  }
  
  // Test Login qua Proxy
  if (results.frontend) {
    results.loginProxy = await testProxyLogin(results.frontend);
  }
  
  // Check Files
  await checkFiles();
  
  // Check Database
  results.database = await checkDatabase();
  
  // Check Backend Routes
  await checkBackendRoutes();
  
  // Summary
  logSection('TỔNG KẾT - NGUYÊN NHÂN LỖI');
  
  const issues = [];
  
  if (!results.backend || !results.backend.success) {
    issues.push({
      level: 'CRITICAL',
      issue: 'Backend không chạy',
      fix: 'Chạy: node server.js',
    });
  }
  
  if (!results.frontend) {
    issues.push({
      level: 'CRITICAL',
      issue: 'Frontend không chạy',
      fix: 'Chạy: cd client && npm start',
    });
  }
  
  if (!results.proxy || !results.proxy.success) {
    issues.push({
      level: 'CRITICAL',
      issue: 'Proxy không hoạt động',
      fix: 'Restart frontend với cache clear: cd client && rmdir /s /q node_modules\\.cache && npm start',
    });
  }
  
  if (!results.database || !results.database.success) {
    issues.push({
      level: 'CRITICAL',
      issue: 'Database không kết nối được',
      fix: 'Start PostgreSQL service hoặc kiểm tra DATABASE_URL trong .env',
    });
  }
  
  if (results.loginDirect && !results.loginDirect.success && results.loginDirect.status === 404) {
    issues.push({
      level: 'ERROR',
      issue: 'Route /api/auth/login không tìm thấy trong backend',
      fix: 'Kiểm tra routes/auth.js và server.js',
    });
  }
  
  if (results.loginProxy && !results.loginProxy.success && results.loginProxy.status === 404) {
    issues.push({
      level: 'CRITICAL',
      issue: 'Proxy không forward request đến backend',
      fix: 'Restart frontend và kiểm tra setupProxy.js được load',
    });
  }
  
  if (issues.length === 0) {
    log('\n✅ KHÔNG TÌM THẤY VẤN ĐỀ! Hệ thống hoạt động tốt!', 'green');
    log('\n📝 Có thể login:', 'cyan');
    log('   http://localhost:' + (results.frontend || 3099), 'white');
    log('   Employee Code: AM01', 'white');
    log('   Password: admin123', 'white');
  } else {
    log(`\n❌ TÌM THẤY ${issues.length} VẤN ĐỀ:`, 'red');
    log('');
    
    issues.forEach((issue, index) => {
      const levelColor = issue.level === 'CRITICAL' ? 'red' : 'yellow';
      log(`${index + 1}. [${issue.level}] ${issue.issue}`, levelColor);
      log(`   Fix: ${issue.fix}`, 'cyan');
      log('');
    });
  }
  
  log('='.repeat(60), 'cyan');
  log('');
}

main().catch((error) => {
  log(`\n❌ Lỗi không mong đợi: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
});

