# DAYFLOW API SPECIFICATION

## Core Endpoints

### Authentication
- `POST /api/auth/register`: Register employee user
- `POST /api/auth/login`: Authenticate email & password, return access & refresh JWT
- `POST /api/auth/refresh`: Issue new access token using valid refresh token
- `GET /api/auth/me`: Get current authenticated user profile
- `POST /api/auth/logout`: Invalidate session

### Employee Management
- `GET /api/employees`: List workforce (HR/Admin)
- `GET /api/employees/me`: Get own employee profile
- `GET /api/employees/{id}`: Get employee by ID
- `POST /api/employees`: Create new employee record
- `PUT /api/employees/{id}`: Update employee details
- `POST /api/employees/{id}/deactivate`: Deactivate employee account

### Attendance System
- `POST /api/attendance/check-in`: Record check-in timestamp
- `POST /api/attendance/check-out`: Record check-out timestamp & compute working hours
- `GET /api/attendance/me`: Own attendance history
- `GET /api/attendance`: All attendance records (HR/Admin)
- `GET /api/attendance/anomalies`: AI statistical attendance risk flags

### Leave Management
- `GET /api/leaves/types`: List leave categories
- `GET /api/leaves/balances`: Get employee leave balance
- `POST /api/leaves/apply`: Submit leave request
- `GET /api/leaves/admin`: Admin approval queue
- `POST /api/leaves/{id}/approve`: Transactional leave approval
- `POST /api/leaves/{id}/reject`: Reject leave request

### Payroll & Payslips
- `GET /api/payroll/me`: Own salary records
- `GET /api/payroll/admin`: All organization payrolls
- `POST /api/payroll/create`: Process payroll record
- `GET /api/payroll/{id}/salary-slip/pdf`: Download computer-generated PDF payslip

### AI Copilot & Insights
- `POST /api/ai/chat`: Permission-aware AI HR Copilot tool calling
- `GET /api/ai/daily-brief`: AI Daily Workforce Brief
