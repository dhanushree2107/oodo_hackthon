# DAYFLOW DATABASE SCHEMA & DESIGN

## Core Schema Tables

- `users`: User identity, hashed passwords, roles, MFA & lockout state.
- `employees`: Employee profile code, department reference, joining date, base salary structure.
- `departments`: Organization department registry.
- `designations`: Job titles and grades.
- `attendance`: Shift check-in/out timestamps, total working minutes, overtime, status.
- `leave_types`: Leave policies (Paid, Sick, Casual, Unpaid, Emergency).
- `leave_balances`: Allocated, used, and pending days per employee.
- `leave_requests`: Applied leave dates, reason, status, manager remarks.
- `payroll`: Payroll period, base salary, total allowances, total deductions, net pay.
- `payroll_items`: Detailed allowances and tax item line breakdowns.
- `documents`: Uploaded document metadata, mime-type, owner reference.
- `notifications`: User in-app notifications and unread statuses.
- `audit_logs`: System audit trail of all sensitive operations.
- `security_events`: Failed logins and security flags.
