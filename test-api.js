// Test script để kiểm tra các API endpoints
const API_BASE = 'http://localhost:5000/api';

async function testEndpoints() {
  console.log('🔍 BẮT ĐẦU KIỂM TRA HỆ THỐNG...\n');

  // 1. Test API info
  console.log('1️⃣ Kiểm tra API Info...');
  try {
    const res = await fetch(`${API_BASE}`);
    const data = await res.json();
    console.log('✅ API Info:', data.message);
    console.log('📋 Endpoints:', Object.keys(data.endpoints).length, 'endpoints');
  } catch (error) {
    console.log('❌ Lỗi:', error.message);
  }

  // 2. Test Login
  console.log('\n2️⃣ Kiểm tra Login...');
  let token = null;
  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        employeeCode: 'ADMIN001',
        password: '123456'
      })
    });
    const data = await res.json();
    if (data.token) {
      token = data.token;
      console.log('✅ Login thành công');
      console.log('👤 User:', data.user.name, '-', data.user.role);
    } else {
      console.log('❌ Login thất bại:', data.message);
    }
  } catch (error) {
    console.log('❌ Lỗi:', error.message);
  }

  if (!token) {
    console.log('\n⚠️ Không có token, dừng test');
    return;
  }

  // 3. Test Dashboard Stats
  console.log('\n3️⃣ Kiểm tra Dashboard Stats...');
  try {
    const res = await fetch(`${API_BASE}/dashboard/stats`, {
      headers: { 'x-auth-token': token }
    });
    const data = await res.json();
    console.log('✅ Dashboard Stats:');
    console.log('   - Total Customers:', data.stats.totalCustomers);
    console.log('   - Total Orders:', data.stats.totalOrders);
    console.log('   - Total Revenue:', data.stats.totalRevenue);
    console.log('   - Active Reps:', data.stats.activeReps);
    console.log('   - Recent Orders:', data.recentOrders?.length || 0);
  } catch (error) {
    console.log('❌ Lỗi:', error.message);
  }

  // 4. Test Orders
  console.log('\n4️⃣ Kiểm tra Orders...');
  try {
    const res = await fetch(`${API_BASE}/orders`, {
      headers: { 'x-auth-token': token }
    });
    const data = await res.json();
    console.log('✅ Orders:', data.length, 'đơn hàng');
    if (data.length > 0) {
      console.log('   - Order đầu tiên:', data[0].orderNumber || data[0].id);
      console.log('   - Khách hàng:', data[0].pharmacy?.name || 'N/A');
      console.log('   - Tổng tiền:', data[0].totalAmount);
    }
  } catch (error) {
    console.log('❌ Lỗi:', error.message);
  }

  // 5. Test Users
  console.log('\n5️⃣ Kiểm tra Users...');
  try {
    const res = await fetch(`${API_BASE}/users/admin/users`, {
      headers: { 'x-auth-token': token }
    });
    const data = await res.json();
    console.log('✅ Users:', data.length, 'người dùng');
    const roles = {};
    data.forEach(u => {
      roles[u.role] = (roles[u.role] || 0) + 1;
    });
    console.log('   - Phân bổ:', roles);
  } catch (error) {
    console.log('❌ Lỗi:', error.message);
  }

  // 6. Test Pharmacies
  console.log('\n6️⃣ Kiểm tra Pharmacies...');
  try {
    const res = await fetch(`${API_BASE}/pharmacies`, {
      headers: { 'x-auth-token': token }
    });
    const data = await res.json();
    console.log('✅ Pharmacies:', data.length, 'nhà thuốc');
    if (data.length > 0) {
      console.log('   - Nhà thuốc đầu tiên:', data[0].code, '-', data[0].name);
    }
  } catch (error) {
    console.log('❌ Lỗi:', error.message);
  }

  // 7. Test Routes
  console.log('\n7️⃣ Kiểm tra Routes...');
  try {
    const res = await fetch(`${API_BASE}/routes`, {
      headers: { 'x-auth-token': token }
    });
    const data = await res.json();
    console.log('✅ Routes:', data.length, 'lộ trình');
    if (data.length > 0) {
      console.log('   - Route đầu tiên:', data[0].name);
      console.log('   - TDV:', data[0].repName);
      console.log('   - Số khách hàng:', data[0].customerCount || data[0].customers?.length || 0);
    }
  } catch (error) {
    console.log('❌ Lỗi:', error.message);
  }

  // 8. Test Products
  console.log('\n8️⃣ Kiểm tra Products...');
  try {
    const res = await fetch(`${API_BASE}/products`, {
      headers: { 'x-auth-token': token }
    });
    const data = await res.json();
    console.log('✅ Products:', data.length, 'sản phẩm');
    if (data.length > 0) {
      console.log('   - Sản phẩm đầu tiên:', data[0].code, '-', data[0].name);
    }
  } catch (error) {
    console.log('❌ Lỗi:', error.message);
  }

  console.log('\n✅ HOÀN THÀNH KIỂM TRA!\n');
}

// Run test
testEndpoints().catch(console.error);
