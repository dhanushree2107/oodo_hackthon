import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, Employee
from app.schemas import LoginRequest, RegisterRequest, Token, UserOut
from app.auth import verify_password, get_password_hash, create_access_token, get_current_user

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

@router.post("/login", response_model=Token)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    email_clean = payload.email.strip().lower()
    user = db.query(User).filter(func.lower(User.email) == email_clean).first()
    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password credentials."
        )

    employee = db.query(Employee).filter(Employee.user_id == user.id).first()
    access_token = create_access_token(data={"sub": user.email, "role": user.role, "id": user.id})

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "role": user.role,
        "user_id": user.id,
        "email": user.email,
        "full_name": employee.full_name if employee else "System User",
        "employee_id": employee.id if employee else None,
        "employee_code": employee.employee_code if employee else None,
        "department": employee.department if employee else None,
        "job_title": employee.job_title if employee else None
    }

@router.post("/register", response_model=Token)
def register(payload: RegisterRequest, db: Session = Depends(get_db)):
    email_clean = payload.email.strip().lower()
    emp_code_clean = payload.employee_code.strip()

    existing = db.query(User).filter(func.lower(User.email) == email_clean).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists."
        )

    # Check employee code uniqueness
    existing_code = db.query(Employee).filter(func.lower(Employee.employee_code) == emp_code_clean.lower()).first()
    if existing_code:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This Employee ID code is already registered."
        )

    assigned_role = payload.role if payload.role in ["employee", "hr_admin"] else "employee"

    new_user = User(
        email=email_clean,
        hashed_password=get_password_hash(payload.password),
        role=assigned_role,
        is_active=True
    )
    db.add(new_user)
    db.flush()

    new_employee = Employee(
        user_id=new_user.id,
        employee_code=emp_code_clean,
        full_name=payload.full_name.strip(),
        department=payload.department,
        job_title="Software Specialist" if payload.department == "Engineering" else "HR Operations Specialist",
        joining_date=datetime.date.today(),
        base_salary=85000.0,
        status="Active"
    )
    db.add(new_employee)
    db.commit()
    db.refresh(new_employee)

    access_token = create_access_token(data={"sub": new_user.email, "role": new_user.role, "id": new_user.id})

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "role": new_user.role,
        "user_id": new_user.id,
        "email": new_user.email,
        "full_name": new_employee.full_name,
        "employee_id": new_employee.id,
        "employee_code": new_employee.employee_code,
        "department": new_employee.department,
        "job_title": new_employee.job_title
    }

@router.get("/me")
def get_me(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    employee = db.query(Employee).filter(Employee.user_id == current_user.id).first()
    return {
        "id": current_user.id,
        "email": current_user.email,
        "role": current_user.role,
        "employee": employee
    }
