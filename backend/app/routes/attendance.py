from datetime import datetime, date, time
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload

from app.core.database import get_db
from app.models.all_models import User, Employee, Attendance, AttendanceCorrection, Department
from app.schemas.all_schemas import CheckInRequest, AttendanceResponse
from app.dependencies.auth import get_current_user, require_hr_or_admin, log_audit_event

router = APIRouter(prefix="/attendance", tags=["Attendance System"])

@router.post("/check-in", response_model=AttendanceResponse)
async def check_in(
    req: CheckInRequest,
    request: Request,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Fetch employee profile
    emp_res = await db.execute(select(Employee).where(Employee.user_id == current_user.id))
    emp = emp_res.scalars().first()
    if not emp:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Employee record not found.")

    today = date.today()
    now = datetime.now()

    # Check for existing record today
    att_res = await db.execute(
        select(Attendance).where(Attendance.employee_id == emp.id, Attendance.date == today)
    )
    existing_att = att_res.scalars().first()

    if existing_att:
        if existing_att.check_in_time:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"You have already checked in today at {existing_att.check_in_time.strftime('%H:%M:%S')}."
            )
        att = existing_att
        att.check_in_time = now
    else:
        # Determine status (LATE if checking in after 09:30 AM)
        is_late = now.time() > time(9, 30, 0)
        att_status = "LATE" if is_late else "PRESENT"

        client_ip = request.client.host if request.client else "127.0.0.1"
        att = Attendance(
            employee_id=emp.id,
            date=today,
            check_in_time=now,
            status=att_status,
            source=req.source,
            device_info=req.device_info,
            ip_address=client_ip
        )
        db.add(att)

    await db.commit()
    await db.refresh(att)

    await log_audit_event(
        db, action="CHECK_IN", resource_type="Attendance", resource_id=att.id, user_id=current_user.id
    )

    return AttendanceResponse(
        id=att.id,
        employee_id=emp.id,
        employee_name=current_user.full_name,
        date=att.date,
        check_in_time=att.check_in_time,
        check_out_time=att.check_out_time,
        total_working_minutes=att.total_working_minutes,
        overtime_minutes=att.overtime_minutes,
        status=att.status,
        source=att.source
    )


@router.post("/check-out", response_model=AttendanceResponse)
async def check_out(
    request: Request,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    emp_res = await db.execute(select(Employee).where(Employee.user_id == current_user.id))
    emp = emp_res.scalars().first()
    if not emp:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Employee record not found.")

    today = date.today()
    now = datetime.now()

    att_res = await db.execute(
        select(Attendance).where(Attendance.employee_id == emp.id, Attendance.date == today)
    )
    att = att_res.scalars().first()

    if not att or not att.check_in_time:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot check out without checking in first today."
        )

    if att.check_out_time:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"You have already checked out today at {att.check_out_time.strftime('%H:%M:%S')}."
        )

    att.check_out_time = now
    
    # Calculate working minutes
    delta = now - att.check_in_time
    working_minutes = int(delta.total_seconds() / 60)
    att.total_working_minutes = max(0, working_minutes)

    # Standard work shift is 8 hours (480 minutes)
    if working_minutes > 480:
        att.overtime_minutes = working_minutes - 480
    else:
        att.overtime_minutes = 0

    await db.commit()
    await db.refresh(att)

    await log_audit_event(
        db, action="CHECK_OUT", resource_type="Attendance", resource_id=att.id, user_id=current_user.id
    )

    return AttendanceResponse(
        id=att.id,
        employee_id=emp.id,
        employee_name=current_user.full_name,
        date=att.date,
        check_in_time=att.check_in_time,
        check_out_time=att.check_out_time,
        total_working_minutes=att.total_working_minutes,
        overtime_minutes=att.overtime_minutes,
        status=att.status,
        source=att.source
    )


@router.get("/me", response_model=List[AttendanceResponse])
async def get_my_attendance(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    emp_res = await db.execute(select(Employee).where(Employee.user_id == current_user.id))
    emp = emp_res.scalars().first()
    if not emp:
        return []

    res = await db.execute(
        select(Attendance)
        .where(Attendance.employee_id == emp.id)
        .order_by(Attendance.date.desc())
    )
    records = res.scalars().all()

    return [
        AttendanceResponse(
            id=r.id,
            employee_id=r.employee_id,
            employee_name=current_user.full_name,
            date=r.date,
            check_in_time=r.check_in_time,
            check_out_time=r.check_out_time,
            total_working_minutes=r.total_working_minutes,
            overtime_minutes=r.overtime_minutes,
            status=r.status,
            source=r.source
        )
        for r in records
    ]


@router.get("", response_model=List[AttendanceResponse])
async def list_attendance(
    date_filter: Optional[date] = Query(None),
    status_filter: Optional[str] = Query(None),
    current_user: User = Depends(require_hr_or_admin),
    db: AsyncSession = Depends(get_db)
):
    query = select(Attendance).options(
        selectinload(Attendance.employee).selectinload(Employee.user)
    )

    if date_filter:
        query = query.where(Attendance.date == date_filter)
    if status_filter:
        query = query.where(Attendance.status == status_filter)

    query = query.order_by(Attendance.date.desc(), Attendance.check_in_time.desc())

    res = await db.execute(query)
    records = res.scalars().all()

    result = []
    for r in records:
        emp_name = r.employee.user.full_name if r.employee and r.employee.user else "Employee"
        result.append(
            AttendanceResponse(
                id=r.id,
                employee_id=r.employee_id,
                employee_name=emp_name,
                date=r.date,
                check_in_time=r.check_in_time,
                check_out_time=r.check_out_time,
                total_working_minutes=r.total_working_minutes,
                overtime_minutes=r.overtime_minutes,
                status=r.status,
                source=r.source
            )
        )
    return result


@router.get("/anomalies")
async def get_attendance_anomalies(
    current_user: User = Depends(require_hr_or_admin),
    db: AsyncSession = Depends(get_db)
):
    """
    Statistical attendance intelligence detection engine.
    Analyzes late arrivals, excessive absenteeism, and short shifts.
    """
    res = await db.execute(
        select(Attendance).options(
            selectinload(Attendance.employee).selectinload(Employee.user)
        )
    )
    records = res.scalars().all()

    emp_stats = {}
    for r in records:
        emp_id = r.employee_id
        emp_name = r.employee.user.full_name if r.employee and r.employee.user else "Employee"
        if emp_id not in emp_stats:
            emp_stats[emp_id] = {
                "name": emp_name,
                "total_records": 0,
                "late_count": 0,
                "absent_count": 0,
                "short_shift_count": 0
            }
        
        emp_stats[emp_id]["total_records"] += 1
        if r.status == "LATE":
            emp_stats[emp_id]["late_count"] += 1
        elif r.status == "ABSENT":
            emp_stats[emp_id]["absent_count"] += 1
        if r.check_out_time and r.total_working_minutes < 240: # less than 4 hours
            emp_stats[emp_id]["short_shift_count"] += 1

    anomalies = []
    for emp_id, data in emp_stats.items():
        score = 0
        reasons = []

        if data["late_count"] >= 2:
            score += 35
            reasons.append(f"Frequent late arrivals detected ({data['late_count']} times).")
        if data["short_shift_count"] >= 1:
            score += 30
            reasons.append(f"Unusual short working shift (< 4 hours) recorded.")
        if data["absent_count"] >= 2:
            score += 35
            reasons.append(f"High absenteeism rate ({data['absent_count']} days).")

        if score > 0:
            anomalies.append({
                "employee_id": emp_id,
                "employee_name": data["name"],
                "risk_score": min(score, 100),
                "reasons": reasons,
                "recommended_action": "Review working schedule with employee and offer HR advisory support."
            })

    return anomalies
