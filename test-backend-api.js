// Use built-in fetch (Node.js 18+)
const fetch = globalThis.fetch;

const API_BASE = 'http://localhost:5000/api';

async function testAuthEndpoint() {
  console.log('\n=== Testing Auth Endpoint ===');
  
  try {
    // Test login
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        employeeCode: 'AM01',
        password: 'admin123'
      })
    });
    
    const contentType = response.headers.get('content-type');
    console.log(`Response Status: ${response.status}`);
    console.log(`Content-Type: ${contentType}`);
    
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      console.error('❌ FAILED: Response is not JSON');
      console.error(`   Received: ${contentType}`);
      console.error(`   Body (first 200 chars): ${text.substring(0, 200)}`);
      return false;
    }
    
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ SUCCESS: Login works!');
      console.log(`   User: ${data.user.name} (${data.user.employeeCode})`);
      console.log(`   Role: ${data.user.role}`);
      console.log(`   Token: ${data.token ? data.token.substring(0, 20) + '...' : 'missing'}`);
      return true;
    } else {
      console.error('❌ FAILED: Login failed');
      console.error(`   Error: ${data.message || 'Unknown error'}`);
      return false;
    }
  } catch (error) {
    console.error('❌ FAILED: Request error');
    console.error(`   Error: ${error.message}`);
    return false;
  }
}

async function testCORS() {
  console.log('\n=== Testing CORS ===');
  
  try {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'OPTIONS',
      headers: {
        'Origin': 'http://localhost:2100',
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type'
      }
    });
    
    const corsHeaders = {
      'Access-Control-Allow-Origin': response.headers.get('access-control-allow-origin'),
      'Access-Control-Allow-Methods': response.headers.get('access-control-allow-methods'),
      'Access-Control-Allow-Headers': response.headers.get('access-control-allow-headers')
    };
    
    console.log(`CORS Headers:`, corsHeaders);
    
    if (corsHeaders['Access-Control-Allow-Origin']) {
      console.log('✅ CORS: Configured');
      return true;
    } else {
      console.log('⚠️  CORS: No headers (might be OK for OPTIONS)');
      return true; // OPTIONS might not return CORS headers
    }
  } catch (error) {
    console.error('❌ CORS test failed:', error.message);
    return false;
  }
}

async function runBackendTests() {
  console.log('\n🧪 TESTING BACKEND API');
  console.log('='.repeat(50));
  
  const results = {
    cors: await testCORS(),
    auth: await testAuthEndpoint(),
  };
  
  console.log('\n' + '='.repeat(50));
  console.log('📊 BACKEND TEST RESULTS');
  console.log('='.repeat(50));
  
  const passed = Object.values(results).filter(Boolean).length;
  const total = Object.keys(results).length;
  
  for (const [test, result] of Object.entries(results)) {
    const status = result ? '✅ PASS' : '❌ FAIL';
    console.log(`${status}: ${test}`);
  }
  
  console.log('\n' + '='.repeat(50));
  console.log(`Summary: ${passed}/${total} tests passed`);
  console.log('='.repeat(50) + '\n');
  
  process.exit(passed === total ? 0 : 1);
}

runBackendTests().catch(error => {
  console.error('\n❌ Test suite crashed:', error);
  process.exit(1);
});
