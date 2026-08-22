from datetime import datetime, date
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload

from app.core.database import get_db
from app.models.all_models import (
    User, Employee, LeaveType, LeaveBalance, LeaveRequest, Notification, AuditLog
)
from app.schemas.all_schemas import (
    LeaveTypeResponse, LeaveBalanceResponse, LeaveApplyRequest,
    LeaveActionRequest, LeaveRequestResponse
)
from app.dependencies.auth import get_current_user, require_hr_or_admin, log_audit_event

router = APIRouter(prefix="/leaves", tags=["Leave Management"])

@router.get("/types", response_model=List[LeaveTypeResponse])
async def get_leave_types(db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(LeaveType))
    types = res.scalars().all()
    return [LeaveTypeResponse.model_validate(t) for t in types]


@router.get("/balances", response_model=List[LeaveBalanceResponse])
async def get_my_leave_balances(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    emp_res = await db.execute(select(Employee).where(Employee.user_id == current_user.id))
    emp = emp_res.scalars().first()
    if not emp:
        return []

    res = await db.execute(
        select(LeaveBalance)
        .options(selectinload(LeaveBalance.leave_type))
        .where(LeaveBalance.employee_id == emp.id, LeaveBalance.year == datetime.now().year)
    )
    balances = res.scalars().all()

    return [
        LeaveBalanceResponse(
            id=b.id,
            leave_type_id=b.leave_type_id,
            leave_type_name=b.leave_type.name if b.leave_type else "Leave",
            year=b.year,
            total_allocated=b.total_allocated,
            used_days=b.used_days,
            pending_days=b.pending_days,
            available_days=max(0.0, b.total_allocated - b.used_days - b.pending_days)
        )
        for b in balances
    ]


@router.post("/apply", response_model=LeaveRequestResponse)
async def apply_leave(
    req: LeaveApplyRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    emp_res = await db.execute(select(Employee).where(Employee.user_id == current_user.id))
    emp = emp_res.scalars().first()
    if not emp:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Employee profile not found.")

    if req.end_date < req.start_date:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="End date cannot be prior to start date."
        )

    # Calculate total working days requested
    num_days = (req.end_date - req.start_date).days + 1
    if num_days <= 0:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid date range.")

    # Check for overlapping leave requests
    overlap_res = await db.execute(
        select(LeaveRequest).where(
            LeaveRequest.employee_id == emp.id,
            LeaveRequest.status.in_(["PENDING", "APPROVED"]),
            LeaveRequest.start_date <= req.end_date,
            LeaveRequest.end_date >= req.start_date
        )
    )
    if overlap_res.scalars().first():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="The requested dates overlap with an existing pending or approved leave."
        )

    # Verify leave balance
    bal_res = await db.execute(
        select(LeaveBalance).where(
            LeaveBalance.employee_id == emp.id,
            LeaveBalance.leave_type_id == req.leave_type_id,
            LeaveBalance.year == datetime.now().year
        )
    )
    bal = bal_res.scalars().first()

    lt_res = await db.execute(select(LeaveType).where(LeaveType.id == req.leave_type_id))
    lt = lt_res.scalars().first()

    if bal:
        available = bal.total_allocated - bal.used_days - bal.pending_days
        if num_days > available and lt and lt.code != "UNPAID":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Insufficient leave balance. Requested: {num_days} days, Available: {available} days."
            )
        bal.pending_days += num_days

    # Create Leave Request
    leave_req = LeaveRequest(
        employee_id=emp.id,
        leave_type_id=req.leave_type_id,
        start_date=req.start_date,
        end_date=req.end_date,
        total_days=float(num_days),
        reason=req.reason,
        remarks=req.remarks,
        attachment_url=req.attachment_url,
        status="PENDING"
    )
    db.add(leave_req)
    await db.commit()
    await db.refresh(leave_req)

    await log_audit_event(
        db, action="SUBMIT_LEAVE", resource_type="LeaveRequest", resource_id=leave_req.id, user_id=current_user.id
    )

    return LeaveRequestResponse(
        id=leave_req.id,
        employee_id=emp.id,
        employee_name=current_user.full_name,
        leave_type_id=req.leave_type_id,
        leave_type_name=lt.name if lt else "Leave",
        start_date=leave_req.start_date,
        end_date=leave_req.end_date,
        total_days=leave_req.total_days,
        reason=leave_req.reason,
        status=leave_req.status,
        remarks=leave_req.remarks,
        created_at=leave_req.created_at
    )


@router.get("/me", response_model=List[LeaveRequestResponse])
async def get_my_leaves(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    emp_res = await db.execute(select(Employee).where(Employee.user_id == current_user.id))
    emp = emp_res.scalars().first()
    if not emp:
        return []

    res = await db.execute(
        select(LeaveRequest)
        .options(
            selectinload(LeaveRequest.leave_type),
            selectinload(LeaveRequest.employee).selectinload(Employee.user)
        )
        .where(LeaveRequest.employee_id == emp.id)
        .order_by(LeaveRequest.created_at.desc())
    )
    requests = res.scalars().all()

    return [
        LeaveRequestResponse(
            id=r.id,
            employee_id=r.employee_id,
            employee_name=current_user.full_name,
            leave_type_id=r.leave_type_id,
            leave_type_name=r.leave_type.name if r.leave_type else "Leave",
            start_date=r.start_date,
            end_date=r.end_date,
            total_days=r.total_days,
            reason=r.reason,
            status=r.status,
            remarks=r.remarks,
            created_at=r.created_at
        )
        for r in requests
    ]


@router.get("/admin", response_model=List[LeaveRequestResponse])
async def list_admin_leave_requests(
    status_filter: Optional[str] = Query(None),
    current_user: User = Depends(require_hr_or_admin),
    db: AsyncSession = Depends(get_db)
):
    query = select(LeaveRequest).options(
        selectinload(LeaveRequest.leave_type),
        selectinload(LeaveRequest.employee).selectinload(Employee.user),
        selectinload(LeaveRequest.employee).selectinload(Employee.department)
    )

    if status_filter:
        query = query.where(LeaveRequest.status == status_filter)

    query = query.order_by(LeaveRequest.created_at.desc())

    res = await db.execute(query)
    requests = res.scalars().all()

    result = []
    for r in requests:
        emp_name = r.employee.user.full_name if r.employee and r.employee.user else "Employee"
        dept_name = r.employee.department.name if r.employee and r.employee.department else "General"
        result.append(
            LeaveRequestResponse(
                id=r.id,
                employee_id=r.employee_id,
                employee_name=emp_name,
                department_name=dept_name,
                leave_type_id=r.leave_type_id,
                leave_type_name=r.leave_type.name if r.leave_type else "Leave",
                start_date=r.start_date,
                end_date=r.end_date,
                total_days=r.total_days,
                reason=r.reason,
                status=r.status,
                remarks=r.remarks,
                created_at=r.created_at
            )
        )
    return result


@router.post("/{id}/approve")
async def approve_leave(
    id: str,
    req: LeaveActionRequest,
    current_user: User = Depends(require_hr_or_admin),
    db: AsyncSession = Depends(get_db)
):
    """
    Atomic transactional workflow for approving leave request.
    """
    res = await db.execute(
        select(LeaveRequest)
        .options(selectinload(LeaveRequest.employee).selectinload(Employee.user))
        .where(LeaveRequest.id == id)
    )
    leave_req = res.scalars().first()
    if not leave_req:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Leave request not found.")

    if leave_req.status != "PENDING":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Leave request is already {leave_req.status}.")

    # 1. Update Leave Request status
    leave_req.status = "APPROVED"
    leave_req.approved_by = current_user.id
    leave_req.approved_at = datetime.utcnow()
    if req.remarks:
        leave_req.remarks = req.remarks

    # 2. Update Leave Balance
    bal_res = await db.execute(
        select(LeaveBalance).where(
            LeaveBalance.employee_id == leave_req.employee_id,
            LeaveBalance.leave_type_id == leave_req.leave_type_id,
            LeaveBalance.year == datetime.now().year
        )
    )
    bal = bal_res.scalars().first()
    if bal:
        bal.pending_days = max(0.0, bal.pending_days - leave_req.total_days)
        bal.used_days += leave_req.total_days

    # 3. Create Notification for employee
    if leave_req.employee and leave_req.employee.user:
        notif = Notification(
            user_id=leave_req.employee.user.id,
            type="LEAVE_APPROVED",
            title="Leave Request Approved",
            message=f"Your leave request for {leave_req.total_days} day(s) starting {leave_req.start_date} has been approved by HR."
        )
        db.add(notif)

    # 4. Create Audit Log
    await log_audit_event(
        db, action="APPROVE_LEAVE", resource_type="LeaveRequest", resource_id=leave_req.id, user_id=current_user.id
    )

    await db.commit()
    return {"success": True, "message": "Leave request approved successfully."}


@router.post("/{id}/reject")
async def reject_leave(
    id: str,
    req: LeaveActionRequest,
    current_user: User = Depends(require_hr_or_admin),
    db: AsyncSession = Depends(get_db)
):
    res = await db.execute(
        select(LeaveRequest)
        .options(selectinload(LeaveRequest.employee).selectinload(Employee.user))
        .where(LeaveRequest.id == id)
    )
    leave_req = res.scalars().first()
    if not leave_req:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Leave request not found.")

    if leave_req.status != "PENDING":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Leave request is already {leave_req.status}.")

    leave_req.status = "REJECTED"
    leave_req.approved_by = current_user.id
    leave_req.approved_at = datetime.utcnow()
    leave_req.remarks = req.remarks or "Request rejected by HR manager."

    # Return pending days to balance
    bal_res = await db.execute(
        select(LeaveBalance).where(
            LeaveBalance.employee_id == leave_req.employee_id,
            LeaveBalance.leave_type_id == leave_req.leave_type_id,
            LeaveBalance.year == datetime.now().year
        )
    )
    bal = bal_res.scalars().first()
    if bal:
        bal.pending_days = max(0.0, bal.pending_days - leave_req.total_days)

    # Create Notification
    if leave_req.employee and leave_req.employee.user:
        notif = Notification(
            user_id=leave_req.employee.user.id,
            type="LEAVE_REJECTED",
            title="Leave Request Declined",
            message=f"Your leave request for {leave_req.start_date} was declined. Reason: {leave_req.remarks}"
        )
        db.add(notif)

    await log_audit_event(
        db, action="REJECT_LEAVE", resource_type="LeaveRequest", resource_id=leave_req.id, user_id=current_user.id
    )

    await db.commit()
    return {"success": True, "message": "Leave request rejected."}
