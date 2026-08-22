from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.core.database import get_db
from app.models.all_models import User, Notification
from app.schemas.all_schemas import NotificationResponse
from app.dependencies.auth import get_current_user

router = APIRouter(prefix="/notifications", tags=["Notifications"])

@router.get("", response_model=List[NotificationResponse])
async def get_my_notifications(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    res = await db.execute(
        select(Notification)
        .where(Notification.user_id == current_user.id)
        .order_by(Notification.created_at.desc())
        .limit(50)
    )
    notifs = res.scalars().all()
    return [NotificationResponse.model_validate(n) for n in notifs]


@router.post("/{id}/read")
async def mark_notification_as_read(
    id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    res = await db.execute(
        select(Notification).where(Notification.id == id, Notification.user_id == current_user.id)
    )
    notif = res.scalars().first()
    if not notif:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Notification not found.")

    notif.read_status = True
    await db.commit()
    return {"success": True, "message": "Notification marked as read."}


@router.post("/read-all")
async def mark_all_notifications_as_read(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    res = await db.execute(
        select(Notification).where(Notification.user_id == current_user.id, Notification.read_status == False)
    )
    unread = res.scalars().all()
    for n in unread:
        n.read_status = True
    await db.commit()
    return {"success": True, "message": f"{len(unread)} notifications marked as read."}
