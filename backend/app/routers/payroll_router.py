from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Payroll, Employee, User
from app.schemas import PayrollOut
from app.auth import get_current_user

router = APIRouter(prefix="/api/payroll", tags=["Payroll"])

@router.get("", response_model=List[PayrollOut])
def get_payroll_records(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role == "hr_admin":
        records = db.query(Payroll).all()
    else:
        emp = db.query(Employee).filter(Employee.user_id == current_user.id).first()
        if not emp:
            return []
        records = db.query(Payroll).filter(Payroll.employee_id == emp.id).all()

    res = []
    for p in records:
        emp = db.query(Employee).filter(Employee.id == p.employee_id).first()
        res.append({
            "id": p.id,
            "employee_id": p.employee_id,
            "employee_name": emp.full_name if emp else "Employee",
            "pay_period": p.pay_period,
            "basic_salary": p.basic_salary,
            "allowances": p.allowances,
            "deductions": p.deductions,
            "net_salary": p.net_salary,
            "status": p.status
        })
    return res
