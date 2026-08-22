import uuid
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.core.database import get_db
from app.core.security import (
    verify_password, get_password_hash, create_access_token,
    create_refresh_token, decode_token, validate_password_strength
)
from app.core.config import settings
from app.models.all_models import User, Employee, RefreshToken, Session, AuditLog, SecurityEvent, Department
from app.schemas.all_schemas import (
    UserRegister, UserLogin, Token, TokenRefreshRequest, UserResponse
)
from app.dependencies.auth import get_current_user, log_audit_event

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(req: UserRegister, db: AsyncSession = Depends(get_db)):
    if req.password != req.confirm_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Passwords do not match."
        )
    
    is_valid_pw, msg = validate_password_strength(req.password)
    if not is_valid_pw:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=msg)

    # Check if user email already exists
    res = await db.execute(select(User).where(User.email == req.email))
    if res.scalars().first():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email is already registered.")

    # Restrict privileged roles during self-registration
    requested_role = (req.role or "EMPLOYEE").upper()
    if requested_role in ["SUPER_ADMIN", "HR_OFFICER"]:
        # Only allow EMPLOYEE role via public self-register unless system is empty
        users_count_res = await db.execute(select(User))
        all_users = users_count_res.scalars().all()
        if len(all_users) > 0:
            requested_role = "EMPLOYEE"

    user = User(
        email=req.email,
        password_hash=get_password_hash(req.password),
        full_name=req.full_name,
        role=requested_role,
        is_active=True,
        is_verified=True
    )
    db.add(user)
    await db.flush()

    # Create associated Employee profile record
    employee_code = req.employee_code or f"EMP-{str(uuid.uuid4())[:6].upper()}"
    employee = Employee(
        user_id=user.id,
        employee_code=employee_code,
        joining_date=datetime.now(timezone.utc).date(),
        employment_status="FULL_TIME",
        base_salary=65000.0
    )
    db.add(employee)
    await db.commit()
    await db.refresh(user)

    await log_audit_event(
        db, action="USER_REGISTERED", resource_type="User", resource_id=user.id, user_id=user.id
    )

    return UserResponse(
        id=user.id,
        email=user.email,
        full_name=user.full_name,
        role=user.role,
        is_active=user.is_active,
        is_verified=user.is_verified,
        mfa_enabled=user.mfa_enabled,
        created_at=user.created_at,
        employee_id=employee.id
    )


@router.post("/login", response_model=Token)
async def login(req: UserLogin, request: Request, db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(User).where(User.email == req.email))
    user = res.scalars().first()

    ip_address = request.client.host if request.client else "127.0.0.1"
    user_agent = request.headers.get("User-Agent", "Unknown Device")

    if not user or not verify_password(req.password, user.password_hash):
        if user:
            user.failed_login_attempts += 1
            if user.failed_login_attempts >= 5:
                sec_event = SecurityEvent(
                    user_id=user.id,
                    event_type="ACCOUNT_LOCKOUT_ATTEMPT",
                    severity="HIGH",
                    description=f"5 consecutive failed login attempts for {user.email}",
                    ip_address=ip_address,
                    device_info=user_agent
                )
                db.add(sec_event)
            await db.commit()
            
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password."
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is deactivated. Please contact HR Administrator."
        )

    # Reset failed attempts
    user.failed_login_attempts = 0
    
    # Create tokens
    access_token = create_access_token(subject=user.id, role=user.role)
    refresh_token = create_refresh_token(subject=user.id, role=user.role)

    # Save session
    session = Session(
        user_id=user.id,
        device_info=user_agent[:250],
        ip_address=ip_address,
        is_active=True
    )
    db.add(session)
    
    await log_audit_event(
        db, action="USER_LOGIN", resource_type="User", resource_id=user.id, user_id=user.id, ip_address=ip_address
    )
    await db.commit()

    # Get employee ID if exists
    emp_res = await db.execute(select(Employee).where(Employee.user_id == user.id))
    emp = emp_res.scalars().first()

    return Token(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
        role=user.role,
        user={
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "role": user.role,
            "employee_id": emp.id if emp else None,
            "employee_code": emp.employee_code if emp else None,
            "avatar_url": emp.avatar_url if emp else None
        }
    )


@router.post("/refresh", response_model=dict)
async def refresh_token_endpoint(req: TokenRefreshRequest, db: AsyncSession = Depends(get_db)):
    payload = decode_token(req.refresh_token, settings.REFRESH_SECRET_KEY)
    if not payload or payload.get("type") != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token."
        )

    user_id = payload.get("sub")
    res = await db.execute(select(User).where(User.id == user_id))
    user = res.scalars().first()

    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User account inactive or missing."
        )

    new_access_token = create_access_token(subject=user.id, role=user.role)
    new_refresh_token = create_refresh_token(subject=user.id, role=user.role)

    return {
        "access_token": new_access_token,
        "refresh_token": new_refresh_token,
        "token_type": "bearer"
    }


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    emp_res = await db.execute(select(Employee).where(Employee.user_id == current_user.id))
    emp = emp_res.scalars().first()

    return UserResponse(
        id=current_user.id,
        email=current_user.email,
        full_name=current_user.full_name,
        role=current_user.role,
        is_active=current_user.is_active,
        is_verified=current_user.is_verified,
        mfa_enabled=current_user.mfa_enabled,
        created_at=current_user.created_at,
        employee_id=emp.id if emp else None
    )


@router.post("/logout")
async def logout(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    await log_audit_event(
        db, action="USER_LOGOUT", resource_type="User", resource_id=current_user.id, user_id=current_user.id
    )
    return {"success": True, "message": "Successfully logged out."}
