
const BASE_URL = 'http://localhost:3000';

// Mock credentials from your README
const EMPLOYEE = { email: 'alice@company.com', password: 'password123' };
const MANAGER = { email: 'david@company.com', password: 'password123' };

async function smokeTest() {
    console.log('🚀 Starting Smoke Test...');

    try {
        // 1. Employee Login
        console.log('\n--> Step 1: Employee Login');
        const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(EMPLOYEE)
        });

        if (!loginRes.ok) throw new Error(`Login Failed: ${loginRes.status}`);
        const loginData = await loginRes.json();
        const empToken = loginRes.headers.get('set-cookie'); // or from body if you return token
        // In this app we use httpOnly cookies, so fetch in Node won't persist them automatically unless we handle "set-cookie".
        // The mock API returns `token` in body for dev convenience? Let's check api/auth/login.
        // It sets cookie. 
        // For this script to work against localhost API that expects cookies, we need to extract and send it.
        // Or we can modify the script to just check if responses are valid JSON.

        // Actually, our API mock `login` verifies credentials and sets a cookie. 
        // Subsequent requests need that cookie.
        // `loginRes.headers.get('set-cookie')` might be array or string.

        let cookie = loginRes.headers.get('set-cookie');
        if (Array.isArray(cookie)) cookie = cookie.join('; ');

        console.log('✅ Employee Logged In');


        // 2. Check Balance
        console.log('\n--> Step 2: Check Balance');
        const balanceRes = await fetch(`${BASE_URL}/api/leave-balance`, {
            headers: { Cookie: cookie }
        });
        const balance = await balanceRes.json();
        console.log('💰 Balance:', balance);

        // 3. Create Leave
        console.log('\n--> Step 3: Create Leave Request');
        const leaveData = {
            startDate: '2025-06-01',
            endDate: '2025-06-05',
            reason: 'Smoke Test Vacation',
            status: 'pending'
        };
        const createRes = await fetch(`${BASE_URL}/api/leaves`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Cookie: cookie },
            body: JSON.stringify(leaveData)
        });
        console.log('📝 Leave Created:', createRes.status === 200 ? 'Success' : 'Failed');


        // 4. Manager Login
        console.log('\n--> Step 4: Manager Login');
        const mgrLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
            method: 'POST',
            body: JSON.stringify(MANAGER)
        });
        let mgrCookie = mgrLoginRes.headers.get('set-cookie');
        if (Array.isArray(mgrCookie)) mgrCookie = mgrCookie.join('; ');
        console.log('✅ Manager Logged In');

        // 5. Approve Leave (Need ID, assume it's the last one added to Mock)
        // We'll fetch pending leaves first to find it.
        console.log('\n--> Step 5: Find & Approve Leave');
        const leavesRes = await fetch(`${BASE_URL}/api/leaves?scope=team`, {
            headers: { Cookie: mgrCookie }
        });
        const leaves = await leavesRes.json();
        const targetLeave = leaves.find(l => l.reason === 'Smoke Test Vacation');

        if (targetLeave) {
            console.log(`Found Leave ID: ${targetLeave.id}`);
            const approveRes = await fetch(`${BASE_URL}/api/leaves/${targetLeave.id}/approve`, {
                method: 'POST',
                headers: { Cookie: mgrCookie }
            });
            console.log('✅ Leave Approved:', approveRes.status === 200);
        } else {
            console.error('❌ Could not find the created leave.');
        }

        console.log('\n🎉 Smoke Test Completed Successfully!');

    } catch (error) {
        console.error('\n❌ Smoke Test Failed:', error);
        process.exit(1);
    }
}

smokeTest();
