import uuid
from typing import List, Optional
from datetime import datetime, date
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload

from app.core.database import get_db
from app.core.security import get_password_hash
from app.models.all_models import User, Employee, Department, Designation, LeaveBalance, LeaveType
from app.schemas.all_schemas import (
    EmployeeResponse, EmployeeCreate, EmployeeUpdate, DepartmentResponse, DesignationResponse
)
from app.dependencies.auth import get_current_user, require_hr_or_admin, require_super_admin, log_audit_event

router = APIRouter(prefix="/employees", tags=["Employee Management"])

@router.get("", response_model=List[EmployeeResponse])
async def list_employees(
    search: Optional[str] = Query(None),
    department_id: Optional[str] = Query(None),
    status_filter: Optional[str] = Query(None),
    current_user: User = Depends(require_hr_or_admin),
    db: AsyncSession = Depends(get_db)
):
    query = select(Employee).options(
        selectinload(Employee.user),
        selectinload(Employee.department),
        selectinload(Employee.designation)
    )

    if department_id:
        query = query.where(Employee.department_id == department_id)
    if status_filter:
        query = query.where(Employee.employment_status == status_filter)

    res = await db.execute(query)
    employees = res.scalars().all()

    # In-memory search filter if provided
    result = []
    for emp in employees:
        if not emp.user:
            continue
        if search:
            s = search.lower()
            match = (
                s in emp.user.full_name.lower() or
                s in emp.user.email.lower() or
                s in emp.employee_code.lower()
            )
            if not match:
                continue

        result.append(
            EmployeeResponse(
                id=emp.id,
                user_id=emp.user_id,
                employee_code=emp.employee_code,
                full_name=emp.user.full_name,
                email=emp.user.email,
                role=emp.user.role,
                phone=emp.phone,
                address=emp.address,
                emergency_contact=emp.emergency_contact,
                joining_date=emp.joining_date,
                employment_status=emp.employment_status,
                base_salary=emp.base_salary,
                avatar_url=emp.avatar_url,
                department=DepartmentResponse.model_validate(emp.department) if emp.department else None,
                designation=DesignationResponse.model_validate(emp.designation) if emp.designation else None
            )
        )
    return result


@router.get("/me", response_model=EmployeeResponse)
async def get_my_employee_profile(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    res = await db.execute(
        select(Employee)
        .options(
            selectinload(Employee.user),
            selectinload(Employee.department),
            selectinload(Employee.designation)
        )
        .where(Employee.user_id == current_user.id)
    )
    emp = res.scalars().first()
    if not emp:
        raise HTTPException(status_code=status.HTTP_44_NOT_FOUND, detail="Employee profile not found.")

    return EmployeeResponse(
        id=emp.id,
        user_id=emp.user_id,
        employee_code=emp.employee_code,
        full_name=emp.user.full_name,
        email=emp.user.email,
        role=emp.user.role,
        phone=emp.phone,
        address=emp.address,
        emergency_contact=emp.emergency_contact,
        joining_date=emp.joining_date,
        employment_status=emp.employment_status,
        base_salary=emp.base_salary,
        avatar_url=emp.avatar_url,
        department=DepartmentResponse.model_validate(emp.department) if emp.department else None,
        designation=DesignationResponse.model_validate(emp.designation) if emp.designation else None
    )


@router.get("/{id}", response_model=EmployeeResponse)
async def get_employee_by_id(
    id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Authorization check: Non-admin can only view self
    if current_user.role == "EMPLOYEE":
        emp_self = await db.execute(select(Employee).where(Employee.user_id == current_user.id))
        self_record = emp_self.scalars().first()
        if not self_record or self_record.id != id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Permission denied to view another employee's private profile.")

    res = await db.execute(
        select(Employee)
        .options(
            selectinload(Employee.user),
            selectinload(Employee.department),
            selectinload(Employee.designation)
        )
        .where(Employee.id == id)
    )
    emp = res.scalars().first()
    if not emp:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Employee not found.")

    return EmployeeResponse(
        id=emp.id,
        user_id=emp.user_id,
        employee_code=emp.employee_code,
        full_name=emp.user.full_name,
        email=emp.user.email,
        role=emp.user.role,
        phone=emp.phone,
        address=emp.address,
        emergency_contact=emp.emergency_contact,
        joining_date=emp.joining_date,
        employment_status=emp.employment_status,
        base_salary=emp.base_salary if current_user.role in ["SUPER_ADMIN", "HR_OFFICER"] or emp.user_id == current_user.id else 0.0,
        avatar_url=emp.avatar_url,
        department=DepartmentResponse.model_validate(emp.department) if emp.department else None,
        designation=DesignationResponse.model_validate(emp.designation) if emp.designation else None
    )


@router.post("", response_model=EmployeeResponse, status_code=status.HTTP_201_CREATED)
async def create_employee(
    req: EmployeeCreate,
    current_user: User = Depends(require_hr_or_admin),
    db: AsyncSession = Depends(get_db)
):
    # Verify email uniqueness
    existing = await db.execute(select(User).where(User.email == req.email))
    if existing.scalars().first():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="User email already exists.")

    # Create User account
    user = User(
        email=req.email,
        password_hash=get_password_hash(req.password),
        full_name=req.full_name,
        role=req.role.upper(),
        is_active=True,
        is_verified=True
    )
    db.add(user)
    await db.flush()

    # Create Employee Record
    employee = Employee(
        user_id=user.id,
        employee_code=req.employee_code,
        department_id=req.department_id,
        designation_id=req.designation_id,
        phone=req.phone,
        address=req.address,
        emergency_contact=req.emergency_contact,
        joining_date=req.joining_date or date.today(),
        employment_status=req.employment_status,
        base_salary=req.base_salary
    )
    db.add(employee)
    await db.flush()

    # Initialize Default Leave Balances for new employee
    leave_types_res = await db.execute(select(LeaveType))
    leave_types = leave_types_res.scalars().all()
    for lt in leave_types:
        bal = LeaveBalance(
            employee_id=employee.id,
            leave_type_id=lt.id,
            year=datetime.now().year,
            total_allocated=float(lt.default_days),
            used_days=0.0,
            pending_days=0.0
        )
        db.add(bal)

    await db.commit()

    await log_audit_event(
        db, action="CREATE_EMPLOYEE", resource_type="Employee", resource_id=employee.id, user_id=current_user.id
    )

    return await get_employee_by_id(employee.id, current_user, db)


@router.put("/{id}", response_model=EmployeeResponse)
async def update_employee(
    id: str,
    req: EmployeeUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    res = await db.execute(
        select(Employee).options(selectinload(Employee.user)).where(Employee.id == id)
    )
    emp = res.scalars().first()
    if not emp:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Employee record not found.")

    # Authorization logic
    if current_user.role == "EMPLOYEE" and emp.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Cannot edit another employee's record.")

    if req.full_name and emp.user:
        emp.user.full_name = req.full_name
    if req.phone:
        emp.phone = req.phone
    if req.address:
        emp.address = req.address
    if req.emergency_contact:
        emp.emergency_contact = req.emergency_contact
    if req.avatar_url:
        emp.avatar_url = req.avatar_url

    # Admin/HR only field edits
    if current_user.role in ["SUPER_ADMIN", "HR_OFFICER"]:
        if req.department_id:
            emp.department_id = req.department_id
        if req.designation_id:
            emp.designation_id = req.designation_id
        if req.employment_status:
            emp.employment_status = req.employment_status
        if req.base_salary is not None:
            emp.base_salary = req.base_salary

    await db.commit()
    await log_audit_event(
        db, action="UPDATE_EMPLOYEE", resource_type="Employee", resource_id=emp.id, user_id=current_user.id
    )
    return await get_employee_by_id(emp.id, current_user, db)


@router.post("/{id}/deactivate")
async def deactivate_employee(
    id: str,
    current_user: User = Depends(require_hr_or_admin),
    db: AsyncSession = Depends(get_db)
):
    res = await db.execute(select(Employee).options(selectinload(Employee.user)).where(Employee.id == id))
    emp = res.scalars().first()
    if not emp:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Employee not found.")

    if emp.user:
        emp.user.is_active = False
    await db.commit()

    await log_audit_event(
        db, action="DEACTIVATE_EMPLOYEE", resource_type="Employee", resource_id=id, user_id=current_user.id
    )
    return {"success": True, "message": f"Employee {emp.user.full_name if emp.user else id} has been deactivated."}


@router.post("/{id}/reactivate")
async def reactivate_employee(
    id: str,
    current_user: User = Depends(require_hr_or_admin),
    db: AsyncSession = Depends(get_db)
):
    res = await db.execute(select(Employee).options(selectinload(Employee.user)).where(Employee.id == id))
    emp = res.scalars().first()
    if not emp:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Employee not found.")

    if emp.user:
        emp.user.is_active = True
    await db.commit()

    await log_audit_event(
        db, action="REACTIVATE_EMPLOYEE", resource_type="Employee", resource_id=id, user_id=current_user.id
    )
    return {"success": True, "message": f"Employee {emp.user.full_name if emp.user else id} has been reactivated."}
