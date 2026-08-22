import datetime
from sqlalchemy.orm import Session
from app.database import engine, Base, SessionLocal
from app.models import User, Employee, Attendance, LeaveRequest, Payroll, WorkforceInsight, Notification
from app.auth import get_password_hash
from app.ai_engine import run_workforce_intelligence_scan

def seed_database():
    Base.metadata.create_all(bind=engine)
    db: Session = SessionLocal()

    # Check if already seeded
    if db.query(User).filter(User.email == "admin@dayflow.com").first():
        print("Database already seeded.")
        db.close()
        return

    print("Seeding Dayflow Enterprise Demo Database...")

    # 1. Create HR Admin User & Profile
    admin_user = User(
        email="admin@dayflow.com",
        hashed_password=get_password_hash("admin123"),
        role="hr_admin",
        is_active=True
    )
    db.add(admin_user)
    db.flush()

    admin_employee = Employee(
        user_id=admin_user.id,
        employee_code="EMP-0001",
        full_name="Alexandra Vance",
        department="Human Resources",
        job_title="VP of People Operations",
        joining_date=datetime.date(2022, 3, 15),
        phone="+1 (555) 234-5678",
        address="100 Enterprise Way, Suite 400, San Francisco, CA",
        avatar_url="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
        base_salary=145000.0,
        status="Active"
    )
    db.add(admin_employee)

    # 2. Create Primary Demo Employee Profile (John Doe)
    emp_user_john = User(
        email="john.doe@dayflow.com",
        hashed_password=get_password_hash("employee123"),
        role="employee",
        is_active=True
    )
    db.add(emp_user_john)
    db.flush()

    john_profile = Employee(
        user_id=emp_user_john.id,
        employee_code="EMP-1042",
        full_name="John Doe",
        department="Engineering",
        job_title="Senior Frontend Engineer",
        joining_date=datetime.date(2023, 6, 1),
        phone="+1 (555) 987-6543",
        address="742 Evergreen Terrace, San Jose, CA",
        avatar_url="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
        base_salary=115000.0,
        status="Active"
    )
    db.add(john_profile)
    db.flush()

    # 3. Create Additional Enterprise Workforce Profiles
    employees_data = [
        ("EMP-1043", "Sarah Jenkins", "sarah.j@dayflow.com", "Engineering", "Lead Backend Architect", 135000.0, "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150"),
        ("EMP-1044", "Michael Chen", "m.chen@dayflow.com", "Engineering", "DevOps Specialist", 108000.0, "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150"),
        ("EMP-1045", "Emily Davis", "e.davis@dayflow.com", "Product", "Senior Product Manager", 125000.0, "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150"),
        ("EMP-1046", "Robert Taylor", "r.taylor@dayflow.com", "Sales", "Enterprise Account Exec", 98000.0, "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150"),
        ("EMP-1047", "Sophia Martinez", "s.martinez@dayflow.com", "Marketing", "Growth Strategist", 92000.0, "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150"),
        ("EMP-1048", "David Kim", "d.kim@dayflow.com", "Engineering", "QA Automation Lead", 96000.0, "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150"),
        ("EMP-1049", "Jessica Reed", "j.reed@dayflow.com", "Human Resources", "Talent Acquisition Lead", 88000.0, "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=150"),
        ("EMP-1050", "Marcus Brody", "m.brody@dayflow.com", "Product", "UI/UX Designer", 102000.0, "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150")
    ]

    created_employees = [admin_employee, john_profile]
    for code, name, email, dept, title, salary, avatar in employees_data:
        u = User(
            email=email,
            hashed_password=get_password_hash("password123"),
            role="employee",
            is_active=True
        )
        db.add(u)
        db.flush()

        emp = Employee(
            user_id=u.id,
            employee_code=code,
            full_name=name,
            department=dept,
            job_title=title,
            joining_date=datetime.date(2023, 1, 15),
            phone="+1 (555) 432-1098",
            address="123 Innovation Way, San Francisco, CA",
            avatar_url=avatar,
            base_salary=salary,
            status="Active"
        )
        db.add(emp)
        db.flush()
        created_employees.append(emp)

    # 4. Generate Past Attendance Records (Past 14 Days)
    today = datetime.date.today()
    for day_offset in range(14):
        past_date = today - datetime.timedelta(days=day_offset)
        if past_date.weekday() >= 5: # Weekend
            continue

        for idx, emp in enumerate(created_employees):
            # Create controlled late check-in pattern for Engineering employees
            if emp.department == "Engineering" and day_offset in [1, 2, 4, 5, 8]:
                status_val = "late"
                c_in = "09:38 AM"
                c_out = "06:10 PM"
                hours = 8.5
            elif idx == 3 and day_offset in [3, 4]: # Michael Chen absent
                status_val = "absent"
                c_in = None
                c_out = None
                hours = 0.0
            else:
                status_val = "present"
                c_in = "08:55 AM"
                c_out = "05:30 PM"
                hours = 8.0

            att = Attendance(
                employee_id=emp.id,
                date=past_date,
                check_in=c_in,
                check_out=c_out,
                status=status_val,
                hours_worked=hours
            )
            db.add(att)

    # Today's attendance for John Doe
    john_today = Attendance(
        employee_id=john_profile.id,
        date=today,
        check_in="09:02 AM",
        check_out=None,
        status="present",
        hours_worked=4.5
    )
    db.add(john_today)

    # 5. Generate Leave Requests
    leave1 = LeaveRequest(
        employee_id=john_profile.id,
        leave_type="paid",
        start_date=today + datetime.timedelta(days=5),
        end_date=today + datetime.timedelta(days=7),
        reason="Family event and personal travel.",
        status="pending",
        created_at=datetime.datetime.utcnow() - datetime.timedelta(hours=4)
    )
    leave2 = LeaveRequest(
        employee_id=created_employees[2].id, # Sarah Jenkins
        leave_type="sick",
        start_date=today + datetime.timedelta(days=1),
        end_date=today + datetime.timedelta(days=2),
        reason="Medical checkup & doctor recommended rest.",
        status="approved",
        approver_comment="Approved. Get well soon!",
        created_at=datetime.datetime.utcnow() - datetime.timedelta(days=2)
    )
    leave3 = LeaveRequest(
        employee_id=created_employees[3].id, # Michael Chen
        leave_type="paid",
        start_date=today + datetime.timedelta(days=6),
        end_date=today + datetime.timedelta(days=8),
        reason="Attending annual DevOps tech conference.",
        status="pending",
        created_at=datetime.datetime.utcnow() - datetime.timedelta(hours=12)
    )
    db.add_all([leave1, leave2, leave3])

    # 6. Generate Payroll Entries
    for emp in created_employees:
        basic = round(emp.base_salary / 12, 2)
        allow = round(basic * 0.15, 2)
        deduct = round(basic * 0.12, 2)
        net = round(basic + allow - deduct, 2)
        pay = Payroll(
            employee_id=emp.id,
            pay_period="August 2026",
            basic_salary=basic,
            allowances=allow,
            deductions=deduct,
            net_salary=net,
            status="Paid"
        )
        db.add(pay)

    # 7. Generate Initial Workforce Intelligence Signals
    insight1 = WorkforceInsight(
        signal="Repeated late check-in pattern detected in Engineering.",
        severity="high",
        department="Engineering",
        evidence="5 engineering staff members recorded late arrivals on 4 consecutive days. Late check-ins increased 28% compared to the previous period.",
        explanation="Concentrated late arrivals indicate potential commute disruptions, schedule alignment mismatch, or burnout after sprint releases.",
        recommended_action="Review shift timing alignment, offer flexible core hours (10 AM - 4 PM), and schedule a brief department check-in.",
        affected_count=5,
        is_reviewed=False,
        created_at=datetime.datetime.utcnow() - datetime.timedelta(hours=2)
    )
    insight2 = WorkforceInsight(
        signal="Concurrent leave request cluster in Engineering & Product.",
        severity="medium",
        department="Engineering",
        evidence="3 key senior engineers and product managers have requested time off across identical dates next week.",
        explanation="Overlapping absences during Q3 release sprint may cause critical bottleneck delays in code review and deployment approvals.",
        recommended_action="Stagger leave approval schedules with department leads to ensure minimum engineering coverage.",
        affected_count=3,
        is_reviewed=False,
        created_at=datetime.datetime.utcnow() - datetime.timedelta(hours=5)
    )
    insight3 = WorkforceInsight(
        signal="Unverified checkout logs detected in Sales.",
        severity="low",
        department="Sales",
        evidence="12 check-in records in Sales remained unclosed without check-out timestamps over the past week.",
        explanation="Field sales reps checking out offsite forget to log check-outs, affecting automated hourly reporting precision.",
        recommended_action="Trigger automated mobile check-out reminders at 5:30 PM for field representatives.",
        affected_count=12,
        is_reviewed=False,
        created_at=datetime.datetime.utcnow() - datetime.timedelta(days=1)
    )
    db.add_all([insight1, insight2, insight3])

    # 8. Add Initial Notifications
    notif1 = Notification(
        user_id=admin_user.id,
        title="New Workforce Insight Detected",
        message="AI Engine flagged a repeated late check-in pattern in Engineering.",
        type="warning",
        is_read=False
    )
    notif2 = Notification(
        user_id=emp_user_john.id,
        title="Leave Request Received",
        message="Your leave request for August 27-29 is currently pending HR review.",
        type="info",
        is_read=False
    )
    db.add_all([notif1, notif2])

    db.commit()
    print("Database seeding completed successfully!")
    db.close()

if __name__ == "__main__":
    seed_database()
