import csv
import io
from datetime import date, datetime
from fastapi import APIRouter, Depends, Query, Response
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func
from sqlalchemy.orm import selectinload

from app.core.database import get_db
from app.models.all_models import User, Employee, Department, Attendance, LeaveRequest, Payroll
from app.dependencies.auth import require_hr_or_admin

router = APIRouter(prefix="/analytics", tags=["Analytics & Reports"])

@router.get("/summary")
async def get_dashboard_summary(
    current_user: User = Depends(require_hr_or_admin),
    db: AsyncSession = Depends(get_db)
):
    today = date.today()

    # Total employees count
    tot_emp_res = await db.execute(select(func.count(Employee.id)))
    total_employees = tot_emp_res.scalar() or 0

    # Active employees count
    act_emp_res = await db.execute(select(func.count(User.id)).where(User.is_active == True))
    active_employees = act_emp_res.scalar() or 0

    # Present today
    pres_res = await db.execute(
        select(func.count(Attendance.id)).where(
            Attendance.date == today,
            Attendance.status.in_(["PRESENT", "LATE", "WORK_FROM_HOME"])
        )
    )
    present_today = pres_res.scalar() or 0

    # On leave today
    leave_today_res = await db.execute(
        select(func.count(LeaveRequest.id)).where(
            LeaveRequest.status == "APPROVED",
            LeaveRequest.start_date <= today,
            LeaveRequest.end_date >= today
        )
    )
    on_leave_today = leave_today_res.scalar() or 0

    # Pending leave requests
    pending_leave_res = await db.execute(
        select(func.count(LeaveRequest.id)).where(LeaveRequest.status == "PENDING")
    )
    pending_leave_requests = pending_leave_res.scalar() or 0

    # Absent today
    absent_today = max(0, total_employees - present_today - on_leave_today)

    # Attendance rate
    attendance_rate = round((present_today / total_employees * 100), 1) if total_employees > 0 else 100.0

    # Total payroll net salary for current month
    current_month = today.month
    current_year = today.year
    payroll_sum_res = await db.execute(
        select(func.sum(Payroll.net_salary)).where(
            Payroll.month == current_month,
            Payroll.year == current_year
        )
    )
    payroll_monthly_total = payroll_sum_res.scalar() or 0.0

    # Department distribution
    dept_res = await db.execute(
        select(Department.name, func.count(Employee.id))
        .join(Employee, Employee.department_id == Department.id, isouter=True)
        .group_by(Department.name)
    )
    dept_distribution = [{"department": name or "Unassigned", "count": count} for name, count in dept_res.all()]

    return {
        "total_employees": total_employees,
        "active_employees": active_employees,
        "present_today": present_today,
        "absent_today": absent_today,
        "on_leave_today": on_leave_today,
        "pending_leave_requests": pending_leave_requests,
        "attendance_rate": attendance_rate,
        "monthly_payroll_expense": payroll_monthly_total,
        "department_distribution": dept_distribution
    }


@router.get("/reports/export-csv")
async def export_report_csv(
    report_type: str = Query(..., description="employees | attendance | leaves | payroll"),
    current_user: User = Depends(require_hr_or_admin),
    db: AsyncSession = Depends(get_db)
):
    output = io.StringIO()
    writer = csv.writer(output)

    if report_type == "employees":
        writer.writerow(["Employee Code", "Full Name", "Email", "Department", "Designation", "Status", "Joining Date", "Base Salary"])
        res = await db.execute(
            select(Employee).options(
                selectinload(Employee.user),
                selectinload(Employee.department),
                selectinload(Employee.designation)
            )
        )
        for emp in res.scalars().all():
            writer.writerow([
                emp.employee_code,
                emp.user.full_name if emp.user else "",
                emp.user.email if emp.user else "",
                emp.department.name if emp.department else "Unassigned",
                emp.designation.title if emp.designation else "Unassigned",
                emp.employment_status,
                emp.joining_date.strftime("%Y-%m-%d"),
                emp.base_salary
            ])

    elif report_type == "attendance":
        writer.writerow(["Date", "Employee Code", "Full Name", "Check In", "Check Out", "Status", "Working Minutes"])
        res = await db.execute(
            select(Attendance).options(
                selectinload(Attendance.employee).selectinload(Employee.user)
            ).order_by(Attendance.date.desc())
        )
        for a in res.scalars().all():
            writer.writerow([
                a.date.strftime("%Y-%m-%d"),
                a.employee.employee_code if a.employee else "",
                a.employee.user.full_name if a.employee and a.employee.user else "",
                a.check_in_time.strftime("%H:%M:%S") if a.check_in_time else "",
                a.check_out_time.strftime("%H:%M:%S") if a.check_out_time else "",
                a.status,
                a.total_working_minutes
            ])

    elif report_type == "leaves":
        writer.writerow(["Employee", "Start Date", "End Date", "Total Days", "Reason", "Status", "Applied On"])
        res = await db.execute(
            select(LeaveRequest).options(
                selectinload(LeaveRequest.employee).selectinload(Employee.user)
            ).order_by(LeaveRequest.created_at.desc())
        )
        for l in res.scalars().all():
            writer.writerow([
                l.employee.user.full_name if l.employee and l.employee.user else "",
                l.start_date.strftime("%Y-%m-%d"),
                l.end_date.strftime("%Y-%m-%d"),
                l.total_days,
                l.reason,
                l.status,
                l.created_at.strftime("%Y-%m-%d %H:%M:%S")
            ])

    output.seek(0)
    return StreamingResponse(
        io.BytesIO(output.getvalue().encode('utf-8')),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=dayflow_{report_type}_report.csv"}
    )
