import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Date, Time, Float, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(String, default="employee")  # 'hr_admin' or 'employee'
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    employee_profile = relationship("Employee", back_populates="user", uselist=False)
    notifications = relationship("Notification", back_populates="user")

class Employee(Base):
    __tablename__ = "employees"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True, unique=True)
    employee_code = Column(String, unique=True, index=True, nullable=False) # e.g. EMP-1042
    full_name = Column(String, nullable=False)
    department = Column(String, nullable=False, index=True)
    job_title = Column(String, nullable=False)
    joining_date = Column(Date, nullable=False)
    phone = Column(String, nullable=True)
    address = Column(String, nullable=True)
    avatar_url = Column(String, nullable=True)
    base_salary = Column(Float, default=75000.0)
    status = Column(String, default="Active") # Active, On Leave, Terminated

    user = relationship("User", back_populates="employee_profile")
    attendance_records = relationship("Attendance", back_populates="employee")
    leave_requests = relationship("LeaveRequest", back_populates="employee")
    payroll_records = relationship("Payroll", back_populates="employee")

class Attendance(Base):
    __tablename__ = "attendance"

    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey("employees.id"), nullable=False, index=True)
    date = Column(Date, nullable=False, index=True)
    check_in = Column(String, nullable=True)   # e.g. "09:05 AM"
    check_out = Column(String, nullable=True)  # e.g. "05:30 PM"
    status = Column(String, default="present") # present, late, absent, half_day, leave
    hours_worked = Column(Float, default=8.0)

    employee = relationship("Employee", back_populates="attendance_records")

class LeaveRequest(Base):
    __tablename__ = "leave_requests"

    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey("employees.id"), nullable=False, index=True)
    leave_type = Column(String, nullable=False) # paid, sick, unpaid
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    reason = Column(Text, nullable=False)
    status = Column(String, default="pending") # pending, approved, rejected
    approver_comment = Column(Text, nullable=True)
    reviewed_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    reviewed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    employee = relationship("Employee", back_populates="leave_requests")

class Payroll(Base):
    __tablename__ = "payroll"

    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey("employees.id"), nullable=False, index=True)
    pay_period = Column(String, nullable=False) # e.g., "August 2026"
    basic_salary = Column(Float, nullable=False)
    allowances = Column(Float, default=0.0)
    deductions = Column(Float, default=0.0)
    net_salary = Column(Float, nullable=False)
    status = Column(String, default="Paid") # Paid, Pending, Processing

    employee = relationship("Employee", back_populates="payroll_records")

class WorkforceInsight(Base):
    __tablename__ = "workforce_insights"

    id = Column(Integer, primary_key=True, index=True)
    signal = Column(String, nullable=False) # e.g. "Repeated late check-ins detected."
    severity = Column(String, default="medium") # low, medium, high
    department = Column(String, nullable=False) # e.g. "Engineering"
    evidence = Column(Text, nullable=False) # e.g. "Late check-ins increased 28%..."
    explanation = Column(Text, nullable=False) # e.g. "The pattern indicates a potential schedule..."
    recommended_action = Column(Text, nullable=False) # e.g. "Review shift timing..."
    affected_count = Column(Integer, default=1)
    is_reviewed = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    title = Column(String, nullable=False)
    message = Column(Text, nullable=False)
    type = Column(String, default="info") # info, success, warning, danger
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="notifications")

class EmailNotification(Base):
    __tablename__ = "email_notifications"

    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey("employees.id"), nullable=False, index=True)
    leave_request_id = Column(Integer, ForeignKey("leave_requests.id"), nullable=True, index=True)
    recipient_email = Column(String, nullable=False, index=True)
    notification_type = Column(String, nullable=False) # leave_approved, leave_rejected
    status = Column(String, default="sent") # sent, failed
    provider_message_id = Column(String, nullable=True)
    sent_at = Column(DateTime, default=datetime.datetime.utcnow)
    error_message = Column(Text, nullable=True)

