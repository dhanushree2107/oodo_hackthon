import io
import os
from datetime import datetime, date
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Response
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload

from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle

from app.core.database import get_db
from app.models.all_models import (
    User, Employee, Payroll, PayrollItem, SalarySlip, Notification, AuditLog
)
from app.schemas.all_schemas import (
    PayrollCreateRequest, PayrollResponse, PayrollItemCreate
)
from app.dependencies.auth import get_current_user, require_hr_or_admin, log_audit_event

router = APIRouter(prefix="/payroll", tags=["Payroll System"])

@router.get("/me", response_model=List[PayrollResponse])
async def get_my_payroll_history(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    emp_res = await db.execute(select(Employee).where(Employee.user_id == current_user.id))
    emp = emp_res.scalars().first()
    if not emp:
        return []

    res = await db.execute(
        select(Payroll)
        .where(Payroll.employee_id == emp.id)
        .order_by(Payroll.year.desc(), Payroll.month.desc())
    )
    payrolls = res.scalars().all()

    return [
        PayrollResponse(
            id=p.id,
            employee_id=p.employee_id,
            employee_name=current_user.full_name,
            employee_code=emp.employee_code,
            month=p.month,
            year=p.year,
            base_salary=p.base_salary,
            total_allowances=p.total_allowances,
            total_deductions=p.total_deductions,
            net_salary=p.net_salary,
            payment_status=p.payment_status,
            payment_date=p.payment_date,
            created_at=p.created_at
        )
        for p in payrolls
    ]


@router.get("/admin", response_model=List[PayrollResponse])
async def list_admin_payrolls(
    month: Optional[int] = None,
    year: Optional[int] = None,
    current_user: User = Depends(require_hr_or_admin),
    db: AsyncSession = Depends(get_db)
):
    query = select(Payroll).options(
        selectinload(Payroll.employee).selectinload(Employee.user),
        selectinload(Payroll.employee).selectinload(Employee.department)
    )

    if month:
        query = query.where(Payroll.month == month)
    if year:
        query = query.where(Payroll.year == year)

    query = query.order_by(Payroll.year.desc(), Payroll.month.desc())
    res = await db.execute(query)
    payrolls = res.scalars().all()

    result = []
    for p in payrolls:
        emp_name = p.employee.user.full_name if p.employee and p.employee.user else "Employee"
        emp_code = p.employee.employee_code if p.employee else ""
        dept_name = p.employee.department.name if p.employee and p.employee.department else "General"
        result.append(
            PayrollResponse(
                id=p.id,
                employee_id=p.employee_id,
                employee_name=emp_name,
                employee_code=emp_code,
                department_name=dept_name,
                month=p.month,
                year=p.year,
                base_salary=p.base_salary,
                total_allowances=p.total_allowances,
                total_deductions=p.total_deductions,
                net_salary=p.net_salary,
                payment_status=p.payment_status,
                payment_date=p.payment_date,
                created_at=p.created_at
            )
        )
    return result


@router.post("/create", response_model=PayrollResponse)
async def create_payroll_record(
    req: PayrollCreateRequest,
    current_user: User = Depends(require_hr_or_admin),
    db: AsyncSession = Depends(get_db)
):
    emp_res = await db.execute(
        select(Employee).options(selectinload(Employee.user)).where(Employee.id == req.employee_id)
    )
    emp = emp_res.scalars().first()
    if not emp:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Employee not found.")

    # Calculate allowances & deductions
    total_allowances = sum(item.amount for item in req.items if item.item_type == "ALLOWANCE")
    total_deductions = sum(item.amount for item in req.items if item.item_type == "DEDUCTION")
    net_salary = req.base_salary + total_allowances - total_deductions

    payroll = Payroll(
        employee_id=emp.id,
        month=req.month,
        year=req.year,
        base_salary=req.base_salary,
        total_allowances=total_allowances,
        total_deductions=total_deductions,
        net_salary=net_salary,
        payment_status="PROCESSED",
        payment_date=date.today()
    )
    db.add(payroll)
    await db.flush()

    for item in req.items:
        p_item = PayrollItem(
            payroll_id=payroll.id,
            item_type=item.item_type,
            category=item.category,
            amount=item.amount,
            description=item.description
        )
        db.add(p_item)

    # Send Notification to Employee
    if emp.user:
        notif = Notification(
            user_id=emp.user.id,
            type="PAYROLL_READY",
            title=f"Salary Slip Ready - {req.month}/{req.year}",
            message=f"Your net salary of ${net_salary:,.2f} for {req.month}/{req.year} has been processed."
        )
        db.add(notif)

    await log_audit_event(
        db, action="CREATE_PAYROLL", resource_type="Payroll", resource_id=payroll.id, user_id=current_user.id
    )

    await db.commit()
    await db.refresh(payroll)

    return PayrollResponse(
        id=payroll.id,
        employee_id=emp.id,
        employee_name=emp.user.full_name if emp.user else "Employee",
        employee_code=emp.employee_code,
        month=payroll.month,
        year=payroll.year,
        base_salary=payroll.base_salary,
        total_allowances=payroll.total_allowances,
        total_deductions=payroll.total_deductions,
        net_salary=payroll.net_salary,
        payment_status=payroll.payment_status,
        payment_date=payroll.payment_date,
        created_at=payroll.created_at
    )


@router.get("/{id}/salary-slip/pdf")
async def generate_salary_slip_pdf(
    id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Generates a professional PDF salary slip document for download.
    """
    res = await db.execute(
        select(Payroll)
        .options(
            selectinload(Payroll.employee).selectinload(Employee.user),
            selectinload(Payroll.employee).selectinload(Employee.department),
            selectinload(Payroll.items)
        )
        .where(Payroll.id == id)
    )
    p = res.scalars().first()
    if not p:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Payroll record not found.")

    # Authorization
    if current_user.role == "EMPLOYEE" and p.employee.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Cannot access another employee's salary slip.")

    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter, rightMargin=36, leftMargin=36, topMargin=36, bottomMargin=36)
    story = []
    styles = getSampleStyleSheet()

    # Header
    title_style = ParagraphStyle("TitleStyle", parent=styles['Heading1'], fontSize=20, leading=24, textColor=colors.HexColor("#0F172A"))
    sub_style = ParagraphStyle("SubStyle", parent=styles['Normal'], fontSize=10, leading=14, textColor=colors.HexColor("#64748B"))
    
    story.append(Paragraph("<b>DAYFLOW HRMS — OFFICIAL PAYSLIP</b>", title_style))
    story.append(Paragraph("Dayflow Technologies Inc. • Enterprise Workforce Operating System", sub_style))
    story.append(Spacer(1, 15))

    emp_name = p.employee.user.full_name if p.employee and p.employee.user else "Employee"
    emp_code = p.employee.employee_code if p.employee else "N/A"
    dept_name = p.employee.department.name if p.employee and p.employee.department else "General"

    meta_data = [
        [Paragraph(f"<b>Employee Name:</b> {emp_name}", styles['Normal']), Paragraph(f"<b>Pay Period:</b> {p.month}/{p.year}", styles['Normal'])],
        [Paragraph(f"<b>Employee ID:</b> {emp_code}", styles['Normal']), Paragraph(f"<b>Payment Date:</b> {p.payment_date or 'N/A'}", styles['Normal'])],
        [Paragraph(f"<b>Department:</b> {dept_name}", styles['Normal']), Paragraph(f"<b>Status:</b> {p.payment_status}", styles['Normal'])],
    ]
    t_meta = Table(meta_data, colWidths=[270, 270])
    t_meta.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#F8FAFC")),
        ('PADDING', (0,0), (-1,-1), 8),
        ('BOX', (0,0), (-1,-1), 0.5, colors.HexColor("#E2E8F0")),
    ]))
    story.append(t_meta)
    story.append(Spacer(1, 20))

    # Earnings & Deductions Breakdown Table
    breakdown_data = [
        [Paragraph("<b>EARNINGS / DEDUCTIONS</b>", styles['Normal']), Paragraph("<b>CATEGORY</b>", styles['Normal']), Paragraph("<b>AMOUNT ($)</b>", styles['Normal'])],
        [Paragraph("Basic Salary", styles['Normal']), Paragraph("Base Pay", styles['Normal']), f"${p.base_salary:,.2f}"],
        [Paragraph("Total Allowances", styles['Normal']), Paragraph("Housing / Medical / Transport", styles['Normal']), f"+${p.total_allowances:,.2f}"],
        [Paragraph("Total Deductions", styles['Normal']), Paragraph("Tax / Provident Fund", styles['Normal']), f"-${p.total_deductions:,.2f}"],
        [Paragraph("<b>NET TAKE-HOME SALARY</b>", styles['Normal']), Paragraph("<b>Final Disbursed</b>", styles['Normal']), f"<b>${p.net_salary:,.2f}</b>"]
    ]

    t_breakdown = Table(breakdown_data, colWidths=[200, 200, 140])
    t_breakdown.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#0F172A")),
        ('TEXTCOLOR', (0,0), (-1,0), colors.white),
        ('PADDING', (0,0), (-1,-1), 8),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#CBD5E1")),
        ('BACKGROUND', (0,-1), (-1,-1), colors.HexColor("#ECFDF5")),
    ]))
    story.append(t_breakdown)
    story.append(Spacer(1, 30))

    footer_text = Paragraph("<i>This is a computer-generated document authorized by Dayflow HR Payroll Engine. No signature is required.</i>", sub_style)
    story.append(footer_text)

    doc.build(story)
    buffer.seek(0)

    filename = f"Dayflow_Payslip_{emp_code}_{p.month}_{p.year}.pdf"
    return StreamingResponse(
        buffer,
        media_type="application/pdf",
        headers={"Content-Disposition": f"inline; filename={filename}"}
    )
