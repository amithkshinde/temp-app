
# API Documentation

## Authentication

### POST `/api/auth/login`
- **Body**: `{ "email": "...", "password": "..." }`
- **Response**: `{ "token": "...", "user": { ... } }`

### GET `/api/users/me`
- **Headers**: `Cookie: auth-token=...`
- **Response**: `{ "user": { ... } }`

---

## Leaves

### GET `/api/leaves`
- **Query**: 
  - `year`: Filter by year.
  - `scope`: `self` (default) or `team` (manager only).
  - `date`: Filter by approximate date (ISO).
- **Response**: `[ { "id": "...", "startDate": "...", "status": "..." }, ... ]`

### POST `/api/leaves`
- **Body**: `{ "startDate": "...", "endDate": "...", "reason": "...", "status": "pending" }`
- **Response**: `{ "success": true }`

### POST `/api/leaves/:id/approve`
- **Role**: Management
- **Response**: `{ "success": true }`

### POST `/api/leaves/:id/reject`
- **Role**: Management
- **Response**: `{ "success": true }`

---

## Insights & Analytics

### GET `/api/leave-balance`
- **Response**: `{ "allocated": 20, "taken": 5, "remaining": 15, ... }`

### GET `/api/insights`
- **Role**: Management
- **Response**: `{ "activeToday": 2, "pendingRequests": 5, "topLeavers": [...] }`

### GET `/api/insights/analytics`
- **Role**: Management
- **Response**: `{ "reliabilityTable": [...], "trends": [...], "deptStats": {...} }`

### GET `/api/insights/export`
- **Role**: Management
- **Response**: `text/csv` download.

---

## Public Holidays

### GET `/api/holidays`
- **Response**: `[ { "date": "...", "name": "..." }, ... ]`

### POST `/api/holidays/selection`
- **Role**: Employee
- **Body**: `{ "selections": [ "2025-01-01", ... ] }`
- **Response**: `{ "success": true }`
