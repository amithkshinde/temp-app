
// This is a manual test procedure guidance, as we can't fully automate UI interactions here easily without E2E.
// But we can verify the Context Logic via a small node test if we abstract it, or just rely on the manual smoke test steps.

console.log("To Verify Notification Center:");
console.log("1. Open http://localhost:3000");
console.log("2. Login as Employee (alice@company.com)");
console.log("3. Submit a Leave Request.");
console.log("   -> Check: Bell icon should update? (Self notification 'Submitted' added)");
console.log("   -> Check: Dropdown shows 'Leave Request Submitted'");
console.log("4. Logout.");
console.log("5. Login as Manager (david@company.com)");
console.log("   -> Check: Bell icon should show badge?");
console.log("   -> Check: Dropdown shows 'New Leave Request from Alice Employee'");
console.log("6. Approve the request.");
console.log("7. Logout.");
console.log("8. Login as Employee.");
console.log("   -> Check: Bell icon shows badge.");
console.log("   -> Check: Dropdown shows 'Your leave request was Approved'");
console.log("9. Click 'Mark all read' -> Badge disappears.");
