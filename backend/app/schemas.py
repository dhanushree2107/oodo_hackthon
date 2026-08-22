from pydantic import BaseModel
from typing import Optional, List
import datetime

# Auth Schemas
class LoginRequest(BaseModel):
    email: str
    password: str

class RegisterRequest(BaseModel):
    full_name: str
    employee_code: str
    email: str
    password: str
    department: str
    role: str = "employee" # employee or hr_admin

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str
    user_id: int
    email: str
    full_name: str
    employee_id: Optional[int] = None
    employee_code: Optional[str] = None
    department: Optional[str] = None
    job_title: Optional[str] = None

class UserOut(BaseModel):
    id: int
    email: str
    role: str
    is_active: bool

    class Config:
        from_attributes = True

# Employee Schemas
class EmployeeOut(BaseModel):
    id: int
    user_id: Optional[int]
    employee_code: str
    full_name: str
    department: str
    job_title: str
    joining_date: datetime.date
    phone: Optional[str] = None
    address: Optional[str] = None
    avatar_url: Optional[str] = None
    base_salary: float
    status: str

    class Config:
        from_attributes = True

class EmployeeUpdate(BaseModel):
    phone: Optional[str] = None
    address: Optional[str] = None
    avatar_url: Optional[str] = None

# Attendance Schemas
class CheckInRequest(BaseModel):
    location: Optional[str] = "Main Office"

class CheckOutRequest(BaseModel):
    pass

class AttendanceOut(BaseModel):
    id: int
    employee_id: int
    employee_name: Optional[str] = None
    employee_code: Optional[str] = None
    department: Optional[str] = None
    date: datetime.date
    check_in: Optional[str]
    check_out: Optional[str]
    status: str
    hours_worked: float

    class Config:
        from_attributes = True

# Leave Schemas
class LeaveCreateRequest(BaseModel):
    leave_type: str # paid, sick, unpaid
    start_date: datetime.date
    end_date: datetime.date
    reason: str

class LeaveReviewRequest(BaseModel):
    status: Optional[str] = None # approved, rejected
    approver_comment: Optional[str] = None
    comment: Optional[str] = None

class LeaveRequestOut(BaseModel):
    id: int
    employee_id: int
    employee_name: Optional[str] = None
    employee_email: Optional[str] = None
    department: Optional[str] = None
    leave_type: str
    start_date: datetime.date
    end_date: datetime.date
    reason: str
    status: str
    approver_comment: Optional[str] = None
    reviewed_by: Optional[int] = None
    reviewed_at: Optional[datetime.datetime] = None
    created_at: datetime.datetime
    email_sent: Optional[bool] = None
    email_error: Optional[str] = None
    success: Optional[bool] = True

    class Config:
        from_attributes = True

# Payroll Schemas
class PayrollOut(BaseModel):
    id: int
    employee_id: int
    employee_name: Optional[str] = None
    pay_period: str
    basic_salary: float
    allowances: float
    deductions: float
    net_salary: float
    status: str

    class Config:
        from_attributes = True

# Insight Schemas
class WorkforceInsightOut(BaseModel):
    id: int
    signal: str
    severity: str
    department: str
    evidence: str
    explanation: str
    recommended_action: str
    affected_count: int
    is_reviewed: bool
    created_at: datetime.datetime

    class Config:
        from_attributes = True

# Notification Schemas
class NotificationOut(BaseModel):
    id: int
    title: str
    message: str
    type: str
    is_read: bool
    created_at: datetime.datetime

    class Config:
        from_attributes = True

# Consolidated HR Dashboard Schema
class HRDashboardSummary(BaseModel):
    total_employees: int
    present_today: int
    on_leave: int
    pending_approvals: int
    attendance_risk: int
    payroll_alerts: int

class HRDashboardResponse(BaseModel):
    summary: HRDashboardSummary
    attendance_breakdown: dict # {present: X, late: Y, absent: Z, leave: W}
    weekly_trend: List[dict] # [{day: "Mon", present: 110, late: 8, absent: 6}, ...]
    insights: List[WorkforceInsightOut]
    recent_leaves: List[LeaveRequestOut]
    notifications: List[NotificationOut]

# Consolidated Employee Dashboard Schema
class EmployeeDashboardResponse(BaseModel):
    employee: EmployeeOut
    today_attendance: Optional[AttendanceOut]
    leave_balances: dict # {paid: 14, sick: 7, unpaid: 5}
    pending_requests: List[LeaveRequestOut]
    recent_attendance: List[AttendanceOut]
    latest_payroll: Optional[PayrollOut]
    notifications: List[NotificationOut]
