import datetime
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Attendance, Employee, User
from app.schemas import AttendanceOut, CheckInRequest, CheckOutRequest
from app.auth import get_current_user

router = APIRouter(prefix="/api/attendance", tags=["Attendance"])

@router.post("/check-in", response_model=AttendanceOut)
def check_in(
    payload: CheckInRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    emp = db.query(Employee).filter(Employee.user_id == current_user.id).first()
    if not emp:
        raise HTTPException(status_code=400, detail="Employee profile not found.")

    today = datetime.date.today()
    existing = db.query(Attendance).filter(Attendance.employee_id == emp.id, Attendance.date == today).first()
    
    now_time = datetime.datetime.now().strftime("%I:%M %p")
    # Check if late (after 09:15 AM)
    is_late = datetime.datetime.now().time() > datetime.time(9, 15)
    status_val = "late" if is_late else "present"

    if existing:
        if existing.check_in:
            raise HTTPException(status_code=400, detail="Already checked in for today.")
        existing.check_in = now_time
        existing.status = status_val
        db.commit()
        db.refresh(existing)
        return {
            "id": existing.id,
            "employee_id": existing.employee_id,
            "employee_name": emp.full_name,
            "employee_code": emp.employee_code,
            "department": emp.department,
            "date": existing.date,
            "check_in": existing.check_in,
            "check_out": existing.check_out,
            "status": existing.status,
            "hours_worked": existing.hours_worked
        }

    new_att = Attendance(
        employee_id=emp.id,
        date=today,
        check_in=now_time,
        check_out=None,
        status=status_val,
        hours_worked=0.0
    )
    db.add(new_att)
    db.commit()
    db.refresh(new_att)
    return {
        "id": new_att.id,
        "employee_id": new_att.employee_id,
        "employee_name": emp.full_name,
        "employee_code": emp.employee_code,
        "department": emp.department,
        "date": new_att.date,
        "check_in": new_att.check_in,
        "check_out": new_att.check_out,
        "status": new_att.status,
        "hours_worked": new_att.hours_worked
    }

@router.post("/check-out", response_model=AttendanceOut)
def check_out(
    payload: CheckOutRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    emp = db.query(Employee).filter(Employee.user_id == current_user.id).first()
    if not emp:
        raise HTTPException(status_code=400, detail="Employee profile not found.")

    today = datetime.date.today()
    att = db.query(Attendance).filter(Attendance.employee_id == emp.id, Attendance.date == today).first()
    if not att or not att.check_in:
        raise HTTPException(status_code=400, detail="No check-in record found for today.")

    now_time = datetime.datetime.now().strftime("%I:%M %p")
    att.check_out = now_time
    att.hours_worked = 8.5
    db.commit()
    db.refresh(att)
    return {
        "id": att.id,
        "employee_id": att.employee_id,
        "employee_name": emp.full_name,
        "employee_code": emp.employee_code,
        "department": emp.department,
        "date": att.date,
        "check_in": att.check_in,
        "check_out": att.check_out,
        "status": att.status,
        "hours_worked": att.hours_worked
    }

@router.get("", response_model=List[AttendanceOut])
def get_attendance_logs(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role == "hr_admin":
        logs = db.query(Attendance).order_by(Attendance.date.desc()).limit(150).all()
    else:
        emp = db.query(Employee).filter(Employee.user_id == current_user.id).first()
        if not emp:
            return []
        logs = db.query(Attendance).filter(Attendance.employee_id == emp.id).order_by(Attendance.date.desc()).all()

    res = []
    for att in logs:
        emp = db.query(Employee).filter(Employee.id == att.employee_id).first()
        res.append({
            "id": att.id,
            "employee_id": att.employee_id,
            "employee_name": emp.full_name if emp else "Employee",
            "employee_code": emp.employee_code if emp else f"EMP-{att.employee_id}",
            "department": emp.department if emp else "Department",
            "date": att.date,
            "check_in": att.check_in,
            "check_out": att.check_out,
            "status": att.status,
            "hours_worked": att.hours_worked
        })
    return res
