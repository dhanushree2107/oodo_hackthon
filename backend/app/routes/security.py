from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload

from app.core.database import get_db
from app.models.all_models import User, SecurityEvent, Session
from app.dependencies.auth import require_super_admin, require_hr_or_admin

router = APIRouter(prefix="/security", tags=["Admin Security Center"])

@router.get("/events")
async def list_security_events(
    current_user: User = Depends(require_hr_or_admin),
    db: AsyncSession = Depends(get_db)
):
    res = await db.execute(
        select(SecurityEvent).order_by(SecurityEvent.created_at.desc()).limit(100)
    )
    events = res.scalars().all()
    return events


@router.get("/active-sessions")
async def list_active_sessions(
    current_user: User = Depends(require_hr_or_admin),
    db: AsyncSession = Depends(get_db)
):
    res = await db.execute(
        select(Session).where(Session.is_active == True).order_by(Session.last_active.desc()).limit(50)
    )
    sessions = res.scalars().all()
    return sessions
