const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

const API_URL = 'http://localhost:5000/api';

async function simulate() {
    try {
        console.log('1. Logging in as TDV001...');
        const loginRes = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ employeeCode: 'TDV001', password: '123456' })
        });
        const loginData = await loginRes.json();

        if (!loginData.token) {
            console.error('Login failed:', loginData);
            return;
        }
        const token = loginData.token;
        const userId = loginData.user.id;
        console.log('Login success! Token:', token.substring(0, 20) + '...');

        console.log('2. Getting pharmacies...');
        const pharmRes = await fetch(`${API_URL}/pharmacies`, {
            headers: { 'x-auth-token': token }
        });
        const pharmacies = await pharmRes.json();

        if (pharmacies.length === 0) {
            console.error('No pharmacies found.');
            return;
        }
        const pharmacy = pharmacies[0];
        console.log(`Selected Pharmacy: ${pharmacy.name} (${pharmacy.id})`);

        console.log('3. Performing Check-in...');
        const checkInRes = await fetch(`${API_URL}/visit-plans/check-in`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-auth-token': token
            },
            body: JSON.stringify({
                userId: userId,
                pharmacyId: pharmacy.id,
                latitude: 10.7769, // Mock location (Saigon)
                longitude: 106.7009
            })
        });
        const visit = await checkInRes.json();
        console.log('Check-in success! Visit ID:', visit.id);
        console.log('Check Web Map NOW to see the scooter icon!');

        // Wait 30 seconds to allow verification
        console.log('Waiting 30 seconds before Check-out...');
        await new Promise(resolve => setTimeout(resolve, 30000));

        console.log('4. Performing Check-out...');
        const checkOutRes = await fetch(`${API_URL}/visit-plans/check-out`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-auth-token': token
            },
            body: JSON.stringify({
                visitId: visit.id,
                latitude: 10.7770,
                longitude: 106.7010,
                notes: 'Simulation complete'
            })
        });
        const updatedVisit = await checkOutRes.json();
        console.log('Check-out success!', updatedVisit.status);

    } catch (error) {
        console.error('Simulation error:', error);
    }
}

simulate();
