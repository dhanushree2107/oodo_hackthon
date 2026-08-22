import asyncio
from datetime import date, datetime, timedelta
from sqlalchemy.future import select
from app.core.database import AsyncSessionLocal, engine, Base
from app.core.security import get_password_hash
from app.models.all_models import (
    User, Department, Designation, Employee, LeaveType, LeaveBalance,
    Attendance, Payroll, PayrollItem, AuditLog
)

async def seed_data():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as db:
        # Check if already seeded
        res = await db.execute(select(User))
        if res.scalars().first():
            print("Database already contains data. Skipping seed execution.")
            return

        print("Seeding DAYFLOW database...")

        # 1. DEPARTMENTS
        depts_data = [
            ("Engineering", "ENG", "Software engineering & cloud architecture"),
            ("Human Resources", "HR", "People operations & talent management"),
            ("Sales & Marketing", "MKT", "Global sales, growth & marketing"),
            ("Finance", "FIN", "Financial planning & corporate payroll"),
            ("Product Design", "DES", "UX research & interface design")
        ]
        depts = {}
        for name, code, desc in depts_data:
            d = Department(name=name, code=code, description=desc)
            db.add(d)
            await db.flush()
            depts[code] = d

        # 2. DESIGNATIONS
        desigs_data = [
            ("Chief Technology Officer", "EXEC"),
            ("Senior HR Director", "EXEC"),
            ("Lead Software Engineer", "SR"),
            ("HR Specialist", "MID"),
            ("UI/UX Designer", "MID"),
            ("Accountant", "MID")
        ]
        desigs = {}
        for title, grade in desigs_data:
            des = Designation(title=title, grade=grade)
            db.add(des)
            await db.flush()
            desigs[title] = des

        # 3. LEAVE TYPES
        leave_types_data = [
            ("Paid Leave", "PAID", 15, False),
            ("Sick Leave", "SICK", 10, True),
            ("Casual Leave", "CASUAL", 7, False),
            ("Unpaid Leave", "UNPAID", 30, False),
            ("Emergency Leave", "EMG", 5, False)
        ]
        l_types = []
        for name, code, days, req_att in leave_types_data:
            lt = LeaveType(name=name, code=code, default_days=days, requires_attachment=req_att)
            db.add(lt)
            await db.flush()
            l_types.append(lt)

        # 4. USERS & EMPLOYEES
        users_seed = [
            {
                "email": "admin@dayflow.io",
                "full_name": "Alexander Pierce",
                "password": "Admin@1234",
                "role": "SUPER_ADMIN",
                "code": "EMP-001",
                "dept": depts["ENG"],
                "desig": desigs["Chief Technology Officer"],
                "salary": 140000.0
            },
            {
                "email": "hr@dayflow.io",
                "full_name": "Eleanor Vance",
                "password": "HrOfficer@1234",
                "role": "HR_OFFICER",
                "code": "EMP-002",
                "dept": depts["HR"],
                "desig": desigs["Senior HR Director"],
                "salary": 95000.0
            },
            {
                "email": "john.doe@dayflow.io",
                "full_name": "John Doe",
                "password": "Employee@1234",
                "role": "EMPLOYEE",
                "code": "EMP-003",
                "dept": depts["ENG"],
                "desig": desigs["Lead Software Engineer"],
                "salary": 85000.0
            },
            {
                "email": "sarah.connor@dayflow.io",
                "full_name": "Sarah Connor",
                "password": "Employee@1234",
                "role": "EMPLOYEE",
                "code": "EMP-004",
                "dept": depts["DES"],
                "desig": desigs["UI/UX Designer"],
                "salary": 78000.0
            }
        ]

        created_employees = []
        for u_info in users_seed:
            user = User(
                email=u_info["email"],
                password_hash=get_password_hash(u_info["password"]),
                full_name=u_info["full_name"],
                role=u_info["role"],
                is_active=True,
                is_verified=True
            )
            db.add(user)
            await db.flush()

            emp = Employee(
                user_id=user.id,
                employee_code=u_info["code"],
                department_id=u_info["dept"].id,
                designation_id=u_info["desig"].id,
                phone="+1 555-0192",
                address="100 Innovation Way, San Francisco, CA",
                joining_date=date(2024, 1, 15),
                employment_status="FULL_TIME",
                base_salary=u_info["salary"]
            )
            db.add(emp)
            await db.flush()
            created_employees.append(emp)

            # Assign leave balances
            for lt in l_types:
                bal = LeaveBalance(
                    employee_id=emp.id,
                    leave_type_id=lt.id,
                    year=datetime.now().year,
                    total_allocated=float(lt.default_days),
                    used_days=2.0 if lt.code == "PAID" else 0.0,
                    pending_days=0.0
                )
                db.add(bal)

        # 5. SAMPLE ATTENDANCE (past 5 days)
        today = date.today()
        for emp in created_employees:
            for i in range(5):
                att_date = today - timedelta(days=i)
                if att_date.weekday() < 5: # Weekdays
                    check_in = datetime.combine(att_date, datetime.min.time()).replace(hour=9, minute=15)
                    check_out = datetime.combine(att_date, datetime.min.time()).replace(hour=17, minute=45)
                    att = Attendance(
                        employee_id=emp.id,
                        date=att_date,
                        check_in_time=check_in,
                        check_out_time=check_out,
                        total_working_minutes=510,
                        overtime_minutes=30,
                        status="PRESENT" if i != 1 else "LATE",
                        source="WEB_APP"
                    )
                    db.add(att)

        # 6. SAMPLE PAYROLL
        for emp in created_employees:
            p = Payroll(
                employee_id=emp.id,
                month=today.month,
                year=today.year,
                base_salary=emp.base_salary,
                total_allowances=1200.0,
                total_deductions=450.0,
                net_salary=emp.base_salary + 1200.0 - 450.0,
                payment_status="PAID",
                payment_date=today
            )
            db.add(p)

        # 7. INITIAL AUDIT LOG
        audit = AuditLog(
            user_id=created_employees[0].user_id,
            action="SYSTEM_SEED_INITIALIZED",
            resource_type="System",
            resource_id="0",
            metadata_json='{"status": "Database successfully populated with default organization parameters."}',
            ip_address="127.0.0.1"
        )
        db.add(audit)

        await db.commit()
        print("DAYFLOW database seeding completed successfully!")

if __name__ == "__main__":
    asyncio.run(seed_data())
