
const BASE_URL = 'http://localhost:3000';
const USER_ID = 'emp-001';

async function verifySummary() {
    console.log("🔍 Verifying Yearly Summary API...");

    try {
        const res = await fetch(`${BASE_URL}/api/leaves/summary?userId=${USER_ID}`);
        if (!res.ok) throw new Error(`API failed: ${res.status}`);

        const data = await res.json();
        console.log("✅ API Response Received");

        if (!data.quarters || data.quarters.length !== 4) {
            throw new Error("Invalid quarters data received");
        }

        console.log("📊 Breakdown:");
        data.quarters.forEach(q => {
            console.log(`   ${q.name}: Taken ${q.taken}, Remaining ${q.remaining}`);
        });

        console.log("🎉 Verification Passed!");
    } catch (err) {
        console.error("❌ Verification Failed:", err);
    }
}

verifySummary();
