
const BASE_URL = 'http://localhost:3000';

async function verifyUsersAPI() {
    console.log("🔍 Verifying Users API...");
    try {
        const res = await fetch(`${BASE_URL}/api/users?role=employee`);
        if (!res.ok) throw new Error(`API failed: ${res.status}`);
        const users = await res.json();

        console.log(`✅ Employees Found: ${users.length}`);
        if (users.length > 0) {
            console.log("   Sample:", users[0].name, users[0].department);
        }

        console.log("Passed.");
    } catch (err) {
        console.error("❌ Failed:", err);
    }
}

verifyUsersAPI();
