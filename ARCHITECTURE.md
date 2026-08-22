# DAYFLOW SYSTEM ARCHITECTURE

## System Overview

```
[ React 18 + TS Frontend (Vite) ]
              │
         REST / WebSockets
              ▼
   [ FastAPI Async Application ]
     ├── Auth & RBAC Middleware
     ├── AI Tool Calling Service
     ├── Attendance & Leave Engines
     ├── Payroll & PDF Generator
     └── Audit & Security Logger
              │
       SQLAlchemy 2.0 ORM
              ▼
[ PostgreSQL / SQLite Database ]
```

## Security & Permission Layer
All API endpoints pass through Pydantic input validation, JWT token extraction, and `RoleChecker` dependency injection (`SUPER_ADMIN`, `HR_OFFICER`, `EMPLOYEE`).

## AI Copilot Architecture
```
User Query -> Intent Detection -> RBAC Permission Check -> Approved Tool Query -> SQL Aggregation -> Sanitized AI Reply
```
Unrestricted SQL generation by LLMs is strictly prohibited. AI tools call explicit, hardened ORM methods.
