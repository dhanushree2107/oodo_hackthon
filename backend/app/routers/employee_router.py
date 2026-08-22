from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Employee, User
from app.schemas import EmployeeOut, EmployeeUpdate
from app.auth import get_current_user, require_hr_admin

router = APIRouter(prefix="/api/employees", tags=["Employees"])

@router.get("", response_model=List[EmployeeOut])
def get_employees(
    search: Optional[str] = None,
    department: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(Employee)
    if department and department != "All":
        query = query.filter(Employee.department == department)
    if search:
        search_pattern = f"%{search}%"
        query = query.filter(
            (Employee.full_name.ilike(search_pattern)) |
            (Employee.employee_code.ilike(search_pattern)) |
            (Employee.job_title.ilike(search_pattern))
        )
    return query.all()

@router.get("/{employee_id}", response_model=EmployeeOut)
def get_employee_by_id(employee_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    emp = db.query(Employee).filter(Employee.id == employee_id).first()
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")
    return emp

@router.put("/{employee_id}", response_model=EmployeeOut)
def update_employee(
    employee_id: int,
    payload: EmployeeUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    emp = db.query(Employee).filter(Employee.id == employee_id).first()
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")

    # Allow if current_user is HR or editing own profile
    if current_user.role != "hr_admin" and emp.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to edit this employee profile.")

    if payload.phone is not None:
        emp.phone = payload.phone
    if payload.address is not None:
        emp.address = payload.address
    if payload.avatar_url is not None:
        emp.avatar_url = payload.avatar_url

    db.commit()
    db.refresh(emp)
    return emp
