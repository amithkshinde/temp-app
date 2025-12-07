
import { Leave } from "./types";

// Mock Queue
const QUEUE: EmailPayload[] = [];
const PROCESS_DELAY_MS = 1000;

// Config
const EMAIL_FROM = "no-reply@twistopen.in";
const MANAGEMENT_EMAIL = "amith.shinde@twistopen.in";
const BRAND_COLOR = "#ee236B";

// --- Types ---
export interface EmailPayload {
    to: string;
    subject: string;
    html: string;
}

export interface InAppNotification {
    id: string;
    userId: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
    read: boolean;
    createdAt: string;
}

// --- Templates ---

const generateBaseHtml = (content: string, cta?: { label: string, url: string }) => `
<!DOCTYPE html>
<html>
<body style="font-family: sans-serif; line-height: 1.6; color: #333;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    ${content}
    ${cta ? `
      <div style="margin-top: 30px; text-align: center;">
        <a href="${cta.url}" style="background-color: ${BRAND_COLOR}; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">
          ${cta.label}
        </a>
      </div>
    ` : ''}
    <div style="margin-top: 40px; border-top: 1px solid #eee; padding-top: 20px; font-size: 12px; color: #999;">
      <p>Twist Open Leave Tracker &copy; ${new Date().getFullYear()}</p>
    </div>
  </div>
</body>
</html>
`;

export const getLeaveRequestTemplate = (leave: Leave, requesterName: string) => {
    const approveUrl = `http://localhost:3000/action/leave?token=${btoa(leave.id)}&action=approve`;
    // In real app, token would be a secure signed JWT

    return generateBaseHtml(`
        <h2>New Leave Request</h2>
        <p><strong>${requesterName}</strong> has requested leave.</p>
        <ul>
            <li><strong>Type:</strong> ${leave.reason}</li>
            <li><strong>Dates:</strong> ${leave.startDate} to ${leave.endDate}</li>
        </ul>
        <p>Please review strictly.</p>
        <p>
           <a href="${approveUrl}" style="color: ${BRAND_COLOR};">Direct Approve</a> | 
           <a href="http://localhost:3000/action/leave?token=${btoa(leave.id)}&action=reject" style="color: red;">Direct Reject</a>
        </p>
    `, { label: "View in Dashboard", url: "http://localhost:3000/management/dashboard" });
};

export const getDecisionTemplate = (leave: Leave, status: 'approved' | 'rejected') => {
    const isApproved = status === 'approved';
    const color = isApproved ? BRAND_COLOR : '#ef4444';

    return generateBaseHtml(`
        <h2 style="color: ${color};">Leave ${isApproved ? 'Approved' : 'Rejected'}</h2>
        <p>Your leave request for <strong>${leave.startDate}</strong> to <strong>${leave.endDate}</strong> has been <strong>${status}</strong>.</p>
        ${!isApproved ? '<p>Please contact your manager for details.</p>' : ''}
    `, { label: "View Balance", url: "http://localhost:3000/employee/dashboard" });
};

export const getWarningTemplate = (userName: string, usedCount: number) => {
    return generateBaseHtml(`
        <h2>Policy Breach Warning</h2>
        <p>User <strong>${userName}</strong> has selected ${usedCount} public holidays, referencing the soft limit of 10.</p>
    `, { label: "Manage Holidays", url: "http://localhost:3000/management/holidays" });
};

// --- Service ---

export const sendEmail = async (payload: EmailPayload) => {
    // Simulate Queue
    console.log(`[Queue] Enqueuing email to ${payload.to}...`);
    QUEUE.push(payload);

    return new Promise<void>((resolve) => {
        setTimeout(() => {
            const item = QUEUE.shift();
            if (item) {
                console.log(`
=========================================
[MOCK EMAIL SENT]
To: ${item.to}
From: ${EMAIL_FROM}
Reply-To: ${MANAGEMENT_EMAIL}
Subject: ${item.subject}
HTML Body Length: ${item.html.length} chars
CTA Color Check: ${item.html.includes(BRAND_COLOR) ? 'PASS' : 'FAIL'}
=========================================
                `);
            }
            resolve();
        }, PROCESS_DELAY_MS);
    });
};

export const notifyManagement = async (subject: string, html: string) => {
    return sendEmail({
        to: MANAGEMENT_EMAIL,
        subject,
        html
    });
};
