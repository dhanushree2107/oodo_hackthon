import os
import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from fastapi.responses import FileResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload

from app.core.database import get_db
from app.models.all_models import User, Employee, Document
from app.schemas.all_schemas import DocumentResponse
from app.dependencies.auth import get_current_user, require_hr_or_admin, log_audit_event

router = APIRouter(prefix="/documents", tags=["Document Management"])

UPLOAD_DIR = os.path.join(os.getcwd(), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.get("", response_model=List[DocumentResponse])
async def list_documents(
    category: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    query = select(Document)
    if current_user.role == "EMPLOYEE":
        query = query.where(Document.owner_id == current_user.id)

    if category:
        query = query.where(Document.category == category)

    query = query.order_by(Document.uploaded_at.desc())
    res = await db.execute(query)
    docs = res.scalars().all()
    return [DocumentResponse.model_validate(d) for d in docs]


@router.post("/upload", response_model=DocumentResponse, status_code=status.HTTP_201_CREATED)
async def upload_document(
    title: str = Form(...),
    category: str = Form(...),
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Validate file size & type
    allowed_categories = ["ID Proof", "Employment Contract", "Offer Letter", "Salary Slip", "Certificates", "Tax Documents", "Other"]
    if category not in allowed_categories:
        category = "Other"

    ext = os.path.splitext(file.filename)[1]
    unique_filename = f"{uuid.uuid4()}{ext}"
    file_path = os.path.join(UPLOAD_DIR, unique_filename)

    content = await file.read()
    file_size = len(content)

    with open(file_path, "wb") as f:
        f.write(content)

    doc = Document(
        owner_id=current_user.id,
        title=title,
        category=category,
        file_path=file_path,
        file_size=file_size,
        mime_type=file.content_type or "application/octet-stream",
        is_private=True
    )
    db.add(doc)
    await db.commit()
    await db.refresh(doc)

    await log_audit_event(
        db, action="DOCUMENT_UPLOADED", resource_type="Document", resource_id=doc.id, user_id=current_user.id
    )

    return DocumentResponse.model_validate(doc)


@router.get("/{id}/download")
async def download_document(
    id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    res = await db.execute(select(Document).where(Document.id == id))
    doc = res.scalars().first()
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found.")

    if current_user.role == "EMPLOYEE" and doc.owner_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied to private document.")

    if not os.path.exists(doc.file_path):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Physical file missing on server storage.")

    return FileResponse(
        path=doc.file_path,
        media_type=doc.mime_type,
        filename=f"{doc.title}{os.path.splitext(doc.file_path)[1]}"
    )


@router.delete("/{id}")
async def delete_document(
    id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    res = await db.execute(select(Document).where(Document.id == id))
    doc = res.scalars().first()
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found.")

    if current_user.role == "EMPLOYEE" and doc.owner_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Cannot delete document owned by another user.")

    if os.path.exists(doc.file_path):
        try:
            os.remove(doc.file_path)
        except Exception:
            pass

    await db.delete(doc)
    await db.commit()

    await log_audit_event(
        db, action="DOCUMENT_DELETED", resource_type="Document", resource_id=id, user_id=current_user.id
    )
    return {"success": True, "message": "Document deleted."}
