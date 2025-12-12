
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

### Database Setup (Required)
Initialize the SQLite database and seed it with test data (Users, Leaves, Holidays):

```bash
# Generate Prisma Client
npx prisma generate

# Push schema to database (creates dev.db)
npx prisma db push

# Seed database with initial data
npx tsx prisma/seed.ts
```

### Environment Variables
Create a `.env` file if needed, but the default `DATABASE_URL` is configured for local SQLite.

```env
DATABASE_URL="file:./dev.db"
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

## Project Structure

- `src/app`: Next.js App Router pages and API routes.
- `src/components`: Reusable UI components (Calendar, Stats, etc.).
- `src/lib`: Utilities, types, and helper functions.
- `src/context`: React Context providers (Auth, Notification).
- `prisma`: Database schema and seed script.

## Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| **Employee** | `alice@twistopen.in` | `password123` |
| **Manager** | `bob@twistopen.in` | `password123` |

*Or use the "Explore Demo" buttons on the login page.*

<!-- Trigger Vercel Rebuild: 2025-12-12T13:40:03+05:30 -->
