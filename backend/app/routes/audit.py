from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload

from app.core.database import get_db
from app.models.all_models import User, AuditLog
from app.schemas.all_schemas import AuditLogResponse
from app.dependencies.auth import require_hr_or_admin

router = APIRouter(prefix="/audit-logs", tags=["Audit Trails"])

@router.get("", response_model=List[AuditLogResponse])
async def list_audit_logs(
    action_filter: Optional[str] = Query(None),
    resource_type: Optional[str] = Query(None),
    current_user: User = Depends(require_hr_or_admin),
    db: AsyncSession = Depends(get_db)
):
    query = select(AuditLog).options(selectinload(AuditLog.user))

    if action_filter:
        query = query.where(AuditLog.action == action_filter)
    if resource_type:
        query = query.where(AuditLog.resource_type == resource_type)

    query = query.order_by(AuditLog.created_at.desc()).limit(200)

    res = await db.execute(query)
    logs = res.scalars().all()

    result = []
    for l in logs:
        user_name = l.user.full_name if l.user else "System"
        result.append(
            AuditLogResponse(
                id=l.id,
                user_id=l.user_id,
                user_name=user_name,
                action=l.action,
                resource_type=l.resource_type,
                resource_id=l.resource_id,
                metadata_json=l.metadata_json,
                ip_address=l.ip_address,
                created_at=l.created_at
            )
        )
    return result
