
const BASE_URL = 'http://localhost:3000';

async function verifyInsights() {
    console.log("🔍 Verifying Manager Insights API...");

    try {
        const res = await fetch(`${BASE_URL}/api/insights/analytics?department=Engineering`);
        if (!res.ok) throw new Error(`API failed: ${res.status}`);

        const data = await res.json();
        console.log("✅ API Response Received");

        console.log("🔥 Heatmap Data Points:", Object.keys(data.heatmap || {}).length);
        console.log("🏆 Top Leavers:", data.topLeavers.length);
        if (data.topLeavers.length > 0) console.log("   Top 1:", data.topLeavers[0]);

        console.log("📅 Upcoming Long Leaves:", data.upcomingLongLeaves.length);
        console.log("📈 Trend Months:", data.trends.length);

        console.log("✅ Verification Passed!");
    } catch (err) {
        console.error("❌ Verification Failed:", err);
    }
}

verifyInsights();
