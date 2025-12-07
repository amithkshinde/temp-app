
# Leave Tracker MVP

A comprehensive Leave Management System built with **Next.js 14**, **TypeScript**, and **TailwindCSS**.

## Quick Start (One-Click)

Launch the project instantly without manual setup:

### macOS / Linux
Open your terminal and run:
```bash
chmod +x run_mac.sh && ./run_mac.sh
```

### Windows
Double-click `run_win.cmd` in your folder.

---

## Features

- **Role-Based Dashboards**:
  - **Employee**: View balance, apply for leave, track status.
  - **Management**: Team overview, approve/reject requests, analytics.
- **Interactive Calendar**: Custom-built calendar with support for ranges, public holidays, and status indicators.
- **Analytics**: Reliability scores, leave trends, and CSV export.
- **Notifications**: Email (simulated) and in-app alerts.
- **Robust Auth**: Secure authentication flow with demo mode support.

## Getting Started

### Prerequisites
- Node.js 18+
- npm

### Installation

```bash
npm install
```

### Environment Variables
Create a `.env.local` file (optional, as defaults are mocked):

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
JWT_SECRET=this-is-a-secret-key-for-demo-only
```

### Running the App

```bash
npm run dev
# Open http://localhost:3000
```

### Storybook
View the component library and interaction states:

```bash
npm run storybook
# Open http://localhost:6006
```

### Running Tests

```bash
# Unit & Integration Tests requires configuration
# npm test 

# Automated Smoke Test (E2E Simulation)
node scripts/smoke-test.js
```

## Project Structure

- `src/app`: Next.js App Router pages and API routes.
- `src/components`: Reusable UI components (Calendar, Stats, etc.).
- `src/lib`: Utilities, types, and helper functions.
- `src/context`: React Context providers (Auth, Notification).
- `src/data`: In-memory mock data (resets on server restart).

## Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| **Employee** | `alice@company.com` | `password123` |
| **Manager** | `david@company.com` | `password123` |

*Or use the "Explore Demo" buttons on the login page.*
