const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

async function testLogin() {
    try {
        const response = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                employeeCode: 'HAILP',
                password: 'Admin@12345'
            })
        });

        const data = await response.json();
        console.log('Status:', response.status);
        console.log('Data:', data);

        if (data.token) {
            console.log('Token received. Testing Admin Route...');
            const adminRes = await fetch('http://localhost:5000/api/users/admin/users', {
                headers: { 'x-auth-token': data.token }
            });
            console.log('Admin Route Status:', adminRes.status);
            if (adminRes.status === 200) {
                console.log('Admin Access: SUCCESS');
            } else {
                console.log('Admin Access: FAILED');
            }
        }

    } catch (error) {
        console.error('Error:', error);
    }
}

testLogin();
