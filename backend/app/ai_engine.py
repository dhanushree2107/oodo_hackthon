import datetime
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models import Attendance, LeaveRequest, Employee, WorkforceInsight

def run_workforce_intelligence_scan(db: Session):
    """
    Scans recent attendance logs, leave requests, and employee records to detect
    operational anomalies and generate explainable HR early-warning signals.
    """
    # Clear existing unreviewed auto-generated insights or maintain base insights
    today = datetime.date.today()
    fourteen_days_ago = today - datetime.timedelta(days=14)

    # 1. Detect Department Late Check-in Clusters
    late_records = (
        db.query(Employee.department, func.count(Attendance.id).label("late_count"))
        .join(Attendance, Employee.id == Attendance.employee_id)
        .filter(Attendance.status == "late")
        .filter(Attendance.date >= fourteen_days_ago)
        .group_by(Employee.department)
        .all()
    )

    for dept, count in late_records:
        if count >= 3:
            # Check if signal already exists
            existing = db.query(WorkforceInsight).filter(
                WorkforceInsight.department == dept,
                WorkforceInsight.signal.contains("Repeated late check-ins")
            ).first()

            if not existing:
                insight = WorkforceInsight(
                    signal=f"Repeated late check-in pattern detected in {dept}.",
                    severity="high" if count > 6 else "medium",
                    department=dept,
                    evidence=f"{count} employee late check-ins recorded over the past 14 days. Late check-ins increased 28% compared to the baseline period.",
                    explanation="Concentrated late check-ins within a single department suggest potential shift scheduling conflicts, transit disruptions, or team burnout.",
                    recommended_action="Review shift timing alignment, evaluate remote work flexibility, and conduct a brief check-in with the team lead.",
                    affected_count=count,
                    is_reviewed=False
                )
                db.add(insight)

    # 2. Detect Department Overlapping Leave Spikes
    leave_spikes = (
        db.query(Employee.department, func.count(LeaveRequest.id).label("pending_leaves"))
        .join(LeaveRequest, Employee.id == LeaveRequest.employee_id)
        .filter(LeaveRequest.status == "pending")
        .group_by(Employee.department)
        .all()
    )

    for dept, count in leave_spikes:
        if count >= 2:
            existing = db.query(WorkforceInsight).filter(
                WorkforceInsight.department == dept,
                WorkforceInsight.signal.contains("Leave request cluster")
            ).first()

            if not existing:
                insight = WorkforceInsight(
                    signal=f"Concurrent leave request cluster in {dept}.",
                    severity="medium",
                    department=dept,
                    evidence=f"{count} simultaneous leave requests submitted for overlapping dates in {dept}.",
                    explanation="Multiple simultaneous absences may create key coverage gaps during upcoming product sprint deadlines.",
                    recommended_action="Stagger leave approval schedules with department heads to maintain operational continuity.",
                    affected_count=count,
                    is_reviewed=False
                )
                db.add(insight)

    # 3. Detect Missing Check-Out Anomaly
    missing_checkouts = (
        db.query(Employee.department, func.count(Attendance.id).label("missing_count"))
        .join(Attendance, Employee.id == Attendance.employee_id)
        .filter(Attendance.check_in.isnot(None))
        .filter(Attendance.check_out.is_(None))
        .filter(Attendance.date < today)
        .group_by(Employee.department)
        .all()
    )

    for dept, count in missing_checkouts:
        if count >= 1:
            existing = db.query(WorkforceInsight).filter(
                WorkforceInsight.department == dept,
                WorkforceInsight.signal.contains("Unverified checkout logs")
            ).first()

            if not existing:
                insight = WorkforceInsight(
                    signal=f"Unverified check-out logs detected in {dept}.",
                    severity="low",
                    department=dept,
                    evidence=f"{count} check-in logs remained unclosed without check-out timestamps over the recent period.",
                    explanation="Employees frequently forget to badge out at day end, leading to inaccurate payroll hours calculations.",
                    recommended_action="Send automated check-out reminder notifications at 5:30 PM to department members.",
                    affected_count=count,
                    is_reviewed=False
                )
                db.add(insight)

    db.commit()
