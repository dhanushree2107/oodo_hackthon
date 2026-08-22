# DAYFLOW — AI-POWERED HUMAN RESOURCE OPERATING SYSTEM

> **Every workday, perfectly aligned.**

DAYFLOW is a full-stack, enterprise-grade Human Resource Operating System featuring React 18, TypeScript, Vite, Tailwind CSS, Python FastAPI, PostgreSQL database persistence, PDF payslip generation, real-time WebSockets telemetry, permission-aware AI HR Copilot, and statistical attendance intelligence.

---

## 🚀 Key Features

1. **Role-Based Access Control (RBAC)**: Super Admin, HR Officer, and Employee roles with granular authorization enforcement.
2. **Smart Attendance Engine**: Check-in / check-out controls, automated working hours and overtime computation, late arrival flags, and AI attendance anomaly detection.
3. **Transactional Leave Workflows**: Automatic working day calculations, balance verification, overlap prevention, atomic balance updating, and instant employee notification.
4. **Payroll & Computer-Generated PDF Payslips**: Compensation structure management, allowance/deduction breakdowns, and official PDF payslips via ReportLab.
5. **Permission-Aware AI HR Copilot**: Conversational AI assistant with secure SQL function calling that checks RBAC permissions before returning data.
6. **Workforce Intelligence & AI Daily Brief**: Morning executive telemetry report and Workforce Pulse alerts.
7. **Document Vault**: Category-based secure document upload and file downloads.
8. **Admin Security Center & Immutable Audit Logging**: Failed login monitoring, active sessions list, and immutable audit trail.
9. **Real-time WebSockets Hub**: Live notification broadcast and status heartbeat.

---

## 🛠️ Technology Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Lucide Icons, Recharts, Axios, React Router v6.
- **Backend**: Python 3.13, FastAPI, SQLAlchemy 2.0 (Async), Alembic, Pydantic v2, Pytest, ReportLab.
- **Database**: PostgreSQL (`postgresql+asyncpg://...`) with SQLite (`sqlite+aiosqlite:///...`) fallback for instant zero-setup local dev.
- **DevOps**: Docker, docker-compose, GitHub Actions CI/CD.

---

## 💻 Local Quick Start

### 1. Backend Setup
```bash
cd backend
python -m pip install -r requirements.txt
python -m pip install email-validator
python seed.py
python -m uvicorn app.main:app --port 8000 --reload
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

The application will be accessible at:
- **Frontend App**: `http://localhost:5173`
- **FastAPI OpenAPI Swagger**: `http://localhost:8000/docs`

---

## 🔑 Preset Demo Accounts

| Role | Email | Password |
| :--- | :--- | :--- |
| **Super Admin** | `admin@dayflow.io` | `Admin@1234` |
| **HR Officer** | `hr@dayflow.io` | `HrOfficer@1234` |
| **Employee** | `john.doe@dayflow.io` | `Employee@1234` |
| **Employee** | `sarah.connor@dayflow.io` | `Employee@1234` |

---

## 🧪 Testing

Run backend tests:
```bash
$env:PYTHONPATH="backend"; python -m pytest backend/tests/test_api.py
```
