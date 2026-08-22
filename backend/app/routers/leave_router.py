import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import LeaveRequest, Employee, User, Notification, EmailNotification
from app.schemas import LeaveCreateRequest, LeaveReviewRequest, LeaveRequestOut
from app.auth import get_current_user, require_hr_admin
from app.services.email_service import send_leave_approved_email, send_leave_rejected_email

router = APIRouter(prefix="/api/leave", tags=["Leave Management"])

def execute_leave_review(
    leave_id: int,
    target_status: str,
    comment: Optional[str],
    current_user: User,
    db: Session
) -> dict:
    leave_req = db.query(LeaveRequest).filter(LeaveRequest.id == leave_id).first()
    if not leave_req:
        raise HTTPException(status_code=404, detail="Leave request not found.")

    leave_req.status = target_status
    leave_req.approver_comment = comment
    leave_req.reviewed_by = current_user.id
    leave_req.reviewed_at = datetime.datetime.utcnow()

    # Find employee profile and user email
    emp = db.query(Employee).filter(Employee.id == leave_req.employee_id).first()
    emp_user = None
    recipient_email = None

    if emp and emp.user_id:
        emp_user = db.query(User).filter(User.id == emp.user_id).first()
        if emp_user:
            recipient_email = emp_user.email

    # 1. Create In-App Notification for Employee
    if emp and emp.user_id:
        if target_status == "approved":
            notif_title = "Leave Request Approved"
            notif_msg = f"Your leave request from {leave_req.start_date} to {leave_req.end_date} has been approved."
            notif_type = "success"
        else:
            notif_title = "Update on Your Leave Request"
            notif_msg = f"Your leave request from {leave_req.start_date} to {leave_req.end_date} has been rejected."
            notif_type = "danger"

        if comment:
            notif_msg += f" HR Comment: {comment}"

        notif = Notification(
            user_id=emp.user_id,
            title=notif_title,
            message=notif_msg,
            type=notif_type
        )
        db.add(notif)

    # CRITICAL: Commit leave approval/rejection to database FIRST!
    # Email failure must NEVER roll back or corrupt the DB transaction.
    db.commit()
    db.refresh(leave_req)

    # 2. Attempt Real Email Notification Delivery
    email_sent = False
    email_error = None
    provider_msg_id = None

    if recipient_email:
        hr_name = current_user.email
        if current_user.employee_profile and current_user.employee_profile.full_name:
            hr_name = f"{current_user.employee_profile.full_name} ({current_user.email})"

        try:
            if target_status == "approved":
                email_sent, provider_msg_id, email_error = send_leave_approved_email(
                    employee_name=emp.full_name if emp else "Employee",
                    recipient_email=recipient_email,
                    leave_type=leave_req.leave_type,
                    start_date=str(leave_req.start_date),
                    end_date=str(leave_req.end_date),
                    reason=leave_req.reason,
                    approver_comment=comment,
                    approved_by_name=hr_name
                )
            else:
                email_sent, provider_msg_id, email_error = send_leave_rejected_email(
                    employee_name=emp.full_name if emp else "Employee",
                    recipient_email=recipient_email,
                    leave_type=leave_req.leave_type,
                    start_date=str(leave_req.start_date),
                    end_date=str(leave_req.end_date),
                    reason=leave_req.reason,
                    approver_comment=comment,
                    rejected_by_name=hr_name
                )
        except Exception as ex:
            email_sent = False
            email_error = str(ex)

        # 3. Log Email Notification Record into DB
        email_log = EmailNotification(
            employee_id=leave_req.employee_id,
            leave_request_id=leave_req.id,
            recipient_email=recipient_email,
            notification_type=f"leave_{target_status}",
            status="sent" if email_sent else "failed",
            provider_message_id=provider_msg_id,
            error_message=email_error,
            sent_at=datetime.datetime.utcnow()
        )
        db.add(email_log)
        db.commit()

    return {
        "id": leave_req.id,
        "employee_id": leave_req.employee_id,
        "employee_name": emp.full_name if emp else "Employee",
        "employee_email": recipient_email,
        "department": emp.department if emp else "Department",
        "leave_type": leave_req.leave_type,
        "start_date": leave_req.start_date,
        "end_date": leave_req.end_date,
        "reason": leave_req.reason,
        "status": leave_req.status,
        "approver_comment": leave_req.approver_comment,
        "reviewed_by": leave_req.reviewed_by,
        "reviewed_at": leave_req.reviewed_at,
        "created_at": leave_req.created_at,
        "email_sent": email_sent,
        "email_error": email_error,
        "success": True
    }


@router.post("/apply", response_model=LeaveRequestOut)
def apply_leave(
    payload: LeaveCreateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    emp = db.query(Employee).filter(Employee.user_id == current_user.id).first()
    if not emp:
        raise HTTPException(status_code=400, detail="Employee profile not found.")

    leave_req = LeaveRequest(
        employee_id=emp.id,
        leave_type=payload.leave_type,
        start_date=payload.start_date,
        end_date=payload.end_date,
        reason=payload.reason,
        status="pending"
    )
    db.add(leave_req)
    
    # Notify HR Admins
    admin_users = db.query(User).filter(User.role == "hr_admin").all()
    for admin in admin_users:
        notif = Notification(
            user_id=admin.id,
            title="New Leave Request",
            message=f"{emp.full_name} ({emp.department}) requested {payload.leave_type} leave from {payload.start_date} to {payload.end_date}.",
            type="info"
        )
        db.add(notif)

    db.commit()
    db.refresh(leave_req)

    return {
        "id": leave_req.id,
        "employee_id": leave_req.employee_id,
        "employee_name": emp.full_name,
        "employee_email": current_user.email,
        "department": emp.department,
        "leave_type": leave_req.leave_type,
        "start_date": leave_req.start_date,
        "end_date": leave_req.end_date,
        "reason": leave_req.reason,
        "status": leave_req.status,
        "approver_comment": leave_req.approver_comment,
        "reviewed_by": leave_req.reviewed_by,
        "reviewed_at": leave_req.reviewed_at,
        "created_at": leave_req.created_at,
        "email_sent": False,
        "email_error": None,
        "success": True
    }


@router.put("/{leave_id}/review", response_model=LeaveRequestOut)
def review_leave(
    leave_id: int,
    payload: LeaveReviewRequest,
    current_user: User = Depends(require_hr_admin),
    db: Session = Depends(get_db)
):
    status_to_set = payload.status or "approved"
    comment_to_set = payload.approver_comment or payload.comment
    return execute_leave_review(leave_id, status_to_set, comment_to_set, current_user, db)


@router.patch("/{leave_id}/approve", response_model=LeaveRequestOut)
def approve_leave(
    leave_id: int,
    payload: LeaveReviewRequest,
    current_user: User = Depends(require_hr_admin),
    db: Session = Depends(get_db)
):
    comment_to_set = payload.approver_comment or payload.comment
    return execute_leave_review(leave_id, "approved", comment_to_set, current_user, db)


@router.patch("/{leave_id}/reject", response_model=LeaveRequestOut)
def reject_leave(
    leave_id: int,
    payload: LeaveReviewRequest,
    current_user: User = Depends(require_hr_admin),
    db: Session = Depends(get_db)
):
    comment_to_set = payload.approver_comment or payload.comment
    return execute_leave_review(leave_id, "rejected", comment_to_set, current_user, db)


@router.get("", response_model=List[LeaveRequestOut])
@router.get("/", response_model=List[LeaveRequestOut])
def get_all_leave_requests(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role == "hr_admin":
        requests = db.query(LeaveRequest).order_by(LeaveRequest.created_at.desc()).all()
    else:
        emp = db.query(Employee).filter(Employee.user_id == current_user.id).first()
        if not emp:
            return []
        requests = db.query(LeaveRequest).filter(LeaveRequest.employee_id == emp.id).order_by(LeaveRequest.created_at.desc()).all()

    res = []
    for l in requests:
        emp = db.query(Employee).filter(Employee.id == l.employee_id).first()
        emp_email = None
        if emp and emp.user_id:
            u = db.query(User).filter(User.id == emp.user_id).first()
            if u:
                emp_email = u.email

        res.append({
            "id": l.id,
            "employee_id": l.employee_id,
            "employee_name": emp.full_name if emp else "Employee",
            "employee_email": emp_email,
            "department": emp.department if emp else "Department",
            "leave_type": l.leave_type,
            "start_date": l.start_date,
            "end_date": l.end_date,
            "reason": l.reason,
            "status": l.status,
            "approver_comment": l.approver_comment,
            "reviewed_by": l.reviewed_by,
            "reviewed_at": l.reviewed_at,
            "created_at": l.created_at,
            "email_sent": None,
            "email_error": None,
            "success": True
        })
    return res
