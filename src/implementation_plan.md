
## Phase 4: Manager Calendar, Workflows & Notifications

### Objectives
1.  **Unified Calendar**: Use  for Managers (Team View).
2.  **Workflow**: Range-based approval UI.
3.  **Notifications**: Send emails to specific manager address.
4.  **Cancellation**: Logic for employees to cancel.

### Implementation Details

#### [MODIFY] [src/components/dashboard/calendar-view.tsx](file:///Users/amithkshinde/Desktop/Leave Tracker/temp-app/src/components/dashboard/calendar-view.tsx)
-   **Props**: Add ,  (for approval modal).
-   **Rendering**:
    -   If , render multiple leaves on the same day.
    -   Use small badges/dots or stacked bars for multiple employees.
    -   **Conflict**: If >2 leaves on a day, show "Conflict" indicator (Red Border/Icon).
-   **Interaction**: Click on a "Team Leave" opens  instead of .

#### [NEW] [src/components/dashboard/approval-modal.tsx](file:///Users/amithkshinde/Desktop/Leave Tracker/temp-app/src/components/dashboard/approval-modal.tsx)
-   Modal to show Leave Details (Who, When, Reason).
-   Buttons: Approve (Green), Reject (Red).
-   Shows "Range: Oct 21-25" if it's a multi-day leave.

#### [MODIFY] [src/app/api/leaves/route.ts](file:///Users/amithkshinde/Desktop/Leave Tracker/temp-app/src/app/api/leaves/route.ts)
-   On  (Create):
    -   Call .

#### [MODIFY] [src/app/api/leaves/[id]/approve/route.ts](file:///Users/amithkshinde/Desktop/Leave Tracker/temp-app/src/app/api/leaves/[id]/approve/route.ts)
-   On Success: Call .

#### [MODIFY] [src/app/api/leaves/[id]/reject/route.ts](file:///Users/amithkshinde/Desktop/Leave Tracker/temp-app/src/app/api/leaves/[id]/reject/route.ts)
-   On Success: Call .

#### [MODIFY] [src/lib/notifications.ts](file:///Users/amithkshinde/Desktop/Leave Tracker/temp-app/src/lib/notifications.ts)
-   Update  to log actual content for "Amith Shinde".
-   Implement  (hardcoded email) and .

#### [MODIFY] [src/components/dashboard/leave-modal.tsx](file:///Users/amithkshinde/Desktop/Leave Tracker/temp-app/src/components/dashboard/leave-modal.tsx)
-   Add "Cancel Leave" button if  AND .
-   Call  or .

#### [NEW] [src/app/api/leaves/[id]/cancel/route.ts](file:///Users/amithkshinde/Desktop/Leave Tracker/temp-app/src/app/api/leaves/[id]/cancel/route.ts)
-   Handle Employee cancellation.
-   Call  ("Leave Cancelled by Employee").
