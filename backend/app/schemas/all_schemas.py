from datetime import datetime, date
from typing import Optional, List, Any
from pydantic import BaseModel, EmailStr, Field

# --- AUTH & USER SCHEMAS ---
class UserRegister(BaseModel):
    employee_code: Optional[str] = None
    full_name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    password: str
    confirm_password: str
    role: Optional[str] = "EMPLOYEE"

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    role: str
    user: dict

class TokenRefreshRequest(BaseModel):
    refresh_token: str

class UserResponse(BaseModel):
    id: str
    email: str
    full_name: str
    role: str
    is_active: bool
    is_verified: bool
    mfa_enabled: bool
    created_at: datetime
    employee_id: Optional[str] = None

    class Config:
        from_attributes = True

# --- EMPLOYEE SCHEMAS ---
class EmployeeCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    employee_code: str
    role: str = "EMPLOYEE"
    department_id: Optional[str] = None
    designation_id: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    emergency_contact: Optional[str] = None
    joining_date: Optional[date] = None
    employment_status: str = "FULL_TIME"
    base_salary: float = 0.0

class EmployeeUpdate(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    emergency_contact: Optional[str] = None
    department_id: Optional[str] = None
    designation_id: Optional[str] = None
    employment_status: Optional[str] = None
    base_salary: Optional[float] = None
    avatar_url: Optional[str] = None

class DepartmentResponse(BaseModel):
    id: str
    name: str
    code: str
    description: Optional[str] = None

    class Config:
        from_attributes = True

class DesignationResponse(BaseModel):
    id: str
    title: str
    grade: Optional[str] = None

    class Config:
        from_attributes = True

class EmployeeResponse(BaseModel):
    id: str
    user_id: str
    employee_code: str
    full_name: str
    email: str
    role: str
    phone: Optional[str] = None
    address: Optional[str] = None
    emergency_contact: Optional[str] = None
    joining_date: date
    employment_status: str
    base_salary: Optional[float] = None
    avatar_url: Optional[str] = None
    department: Optional[DepartmentResponse] = None
    designation: Optional[DesignationResponse] = None

    class Config:
        from_attributes = True

# --- ATTENDANCE SCHEMAS ---
class CheckInRequest(BaseModel):
    source: str = "WEB_APP"
    device_info: Optional[str] = "Chrome / Windows"

class AttendanceResponse(BaseModel):
    id: str
    employee_id: str
    employee_name: Optional[str] = None
    date: date
    check_in_time: Optional[datetime] = None
    check_out_time: Optional[datetime] = None
    total_working_minutes: int
    overtime_minutes: int
    status: str
    source: str

    class Config:
        from_attributes = True

# --- LEAVE SCHEMAS ---
class LeaveTypeResponse(BaseModel):
    id: str
    name: str
    code: str
    default_days: int
    requires_attachment: bool

    class Config:
        from_attributes = True

class LeaveBalanceResponse(BaseModel):
    id: str
    leave_type_id: str
    leave_type_name: str
    year: int
    total_allocated: float
    used_days: float
    pending_days: float
    available_days: float

    class Config:
        from_attributes = True

class LeaveApplyRequest(BaseModel):
    leave_type_id: str
    start_date: date
    end_date: date
    reason: str
    remarks: Optional[str] = None
    attachment_url: Optional[str] = None

class LeaveActionRequest(BaseModel):
    remarks: Optional[str] = None

class LeaveRequestResponse(BaseModel):
    id: str
    employee_id: str
    employee_name: Optional[str] = None
    department_name: Optional[str] = None
    leave_type_id: str
    leave_type_name: str
    start_date: date
    end_date: date
    total_days: float
    reason: str
    status: str
    remarks: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

# --- PAYROLL SCHEMAS ---
class PayrollItemCreate(BaseModel):
    item_type: str # ALLOWANCE, DEDUCTION
    category: str
    amount: float
    description: Optional[str] = None

class PayrollCreateRequest(BaseModel):
    employee_id: str
    month: int
    year: int
    base_salary: float
    items: List[PayrollItemCreate] = []

class PayrollResponse(BaseModel):
    id: str
    employee_id: str
    employee_name: Optional[str] = None
    employee_code: Optional[str] = None
    department_name: Optional[str] = None
    month: int
    year: int
    base_salary: float
    total_allowances: float
    total_deductions: float
    net_salary: float
    payment_status: str
    payment_date: Optional[date] = None
    created_at: datetime

    class Config:
        from_attributes = True

# --- DOCUMENT SCHEMAS ---
class DocumentResponse(BaseModel):
    id: str
    owner_id: str
    title: str
    category: str
    file_path: str
    file_size: int
    mime_type: str
    is_private: bool
    uploaded_at: datetime

    class Config:
        from_attributes = True

# --- NOTIFICATION SCHEMAS ---
class NotificationResponse(BaseModel):
    id: str
    user_id: str
    type: str
    title: str
    message: str
    read_status: bool
    created_at: datetime

    class Config:
        from_attributes = True

# --- AUDIT & SECURITY SCHEMAS ---
class AuditLogResponse(BaseModel):
    id: str
    user_id: Optional[str] = None
    user_name: Optional[str] = None
    action: str
    resource_type: str
    resource_id: Optional[str] = None
    metadata_json: Optional[str] = None
    ip_address: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

# --- AI COPILOT SCHEMAS ---
class AIChatRequest(BaseModel):
    message: str
    conversation_id: Optional[str] = None

class AIChatResponse(BaseModel):
    reply: str
    tools_executed: List[str] = []
    insights: Optional[dict] = None
