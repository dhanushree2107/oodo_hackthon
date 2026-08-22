from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import WorkforceInsight, User
from app.schemas import WorkforceInsightOut
from app.auth import require_hr_admin

router = APIRouter(prefix="/api/insights", tags=["Workforce Intelligence Insights"])

@router.get("", response_model=List[WorkforceInsightOut])
def get_insights(
    current_user: User = Depends(require_hr_admin),
    db: Session = Depends(get_db)
):
    return db.query(WorkforceInsight).order_by(WorkforceInsight.created_at.desc()).all()

@router.put("/{insight_id}/review", response_model=WorkforceInsightOut)
def mark_insight_reviewed(
    insight_id: int,
    current_user: User = Depends(require_hr_admin),
    db: Session = Depends(get_db)
):
    insight = db.query(WorkforceInsight).filter(WorkforceInsight.id == insight_id).first()
    if not insight:
        raise HTTPException(status_code=404, detail="Insight record not found")

    insight.is_reviewed = True
    db.commit()
    db.refresh(insight)
    return insight
