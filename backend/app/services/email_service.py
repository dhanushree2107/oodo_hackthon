import json
import logging
import smtplib
import urllib.request
import urllib.error
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Tuple, Optional
from app.config import settings

logger = logging.getLogger("dayflow.email_service")

# ---------------------------------------------------------------------------
# HTML Email Templates
# ---------------------------------------------------------------------------

def generate_approved_email_html(
    employee_name: str,
    leave_type: str,
    start_date: str,
    end_date: str,
    reason: str,
    approver_comment: str,
    approved_by: str
) -> str:
    comment_text = approver_comment if approver_comment else "Approved. Have a great break!"
    return f"""<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Leave Request Approved - Dayflow</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0f172a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f8fafc;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #0f172a; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 600px; background-color: #1e293b; border-radius: 16px; border: 1px solid #334155; overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);">
          <!-- Header Branding -->
          <tr>
            <td style="background: linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%); padding: 32px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 800; letter-spacing: -0.5px; font-family: sans-serif;">DAYFLOW</h1>
              <p style="margin: 6px 0 0 0; color: #e0e7ff; font-size: 12px; font-weight: 600; letter-spacing: 1px; opacity: 0.95;">EVERY WORKDAY, PERFECTLY ALIGNED.</p>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding: 36px 32px;">
              <p style="margin: 0 0 16px 0; font-size: 16px; color: #f8fafc; line-height: 1.5;">Hello <strong>{employee_name}</strong>,</p>
              <p style="margin: 0 0 24px 0; font-size: 14px; color: #94a3b8; line-height: 1.6;">Your leave request has been reviewed and <strong style="color: #34d399;">APPROVED</strong> by HR.</p>
              
              <!-- Status Badge -->
              <div style="margin-bottom: 28px;">
                <span style="display: inline-block; background-color: rgba(16, 185, 129, 0.15); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.3); padding: 8px 18px; border-radius: 9999px; font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.5px;">
                  ✓ APPROVED
                </span>
              </div>

              <!-- Leave Details Card -->
              <table role="presentation" width="100%" style="background-color: #0f172a; border: 1px solid #334155; border-radius: 12px; border-collapse: separate; border-spacing: 0; margin-bottom: 28px; overflow: hidden;">
                <tr>
                  <td style="padding: 14px 18px; border-bottom: 1px solid #1e293b; color: #94a3b8; font-size: 13px; font-weight: 600; width: 35%;">Leave Type</td>
                  <td style="padding: 14px 18px; border-bottom: 1px solid #1e293b; color: #818cf8; font-size: 13px; font-weight: 700; text-transform: capitalize;">{leave_type} Leave</td>
                </tr>
                <tr>
                  <td style="padding: 14px 18px; border-bottom: 1px solid #1e293b; color: #94a3b8; font-size: 13px; font-weight: 600;">Start Date</td>
                  <td style="padding: 14px 18px; border-bottom: 1px solid #1e293b; color: #f8fafc; font-size: 13px; font-weight: 600;">{start_date}</td>
                </tr>
                <tr>
                  <td style="padding: 14px 18px; border-bottom: 1px solid #1e293b; color: #94a3b8; font-size: 13px; font-weight: 600;">End Date</td>
                  <td style="padding: 14px 18px; border-bottom: 1px solid #1e293b; color: #f8fafc; font-size: 13px; font-weight: 600;">{end_date}</td>
                </tr>
                <tr>
                  <td style="padding: 14px 18px; border-bottom: 1px solid #1e293b; color: #94a3b8; font-size: 13px; font-weight: 600;">Reason</td>
                  <td style="padding: 14px 18px; border-bottom: 1px solid #1e293b; color: #cbd5e1; font-size: 13px; line-height: 1.4;">{reason}</td>
                </tr>
                <tr>
                  <td style="padding: 14px 18px; border-bottom: 1px solid #1e293b; color: #94a3b8; font-size: 13px; font-weight: 600;">Status</td>
                  <td style="padding: 14px 18px; border-bottom: 1px solid #1e293b; color: #34d399; font-size: 13px; font-weight: 800;">APPROVED</td>
                </tr>
                <tr>
                  <td style="padding: 14px 18px; border-bottom: 1px solid #1e293b; color: #94a3b8; font-size: 13px; font-weight: 600;">Approved by</td>
                  <td style="padding: 14px 18px; border-bottom: 1px solid #1e293b; color: #f8fafc; font-size: 13px; font-weight: 600;">{approved_by}</td>
                </tr>
                <tr>
                  <td style="padding: 14px 18px; color: #94a3b8; font-size: 13px; font-weight: 600;">HR Comment</td>
                  <td style="padding: 14px 18px; color: #34d399; font-size: 13px; font-style: italic; line-height: 1.4;">"{comment_text}"</td>
                </tr>
              </table>

              <!-- CTA Button -->
              <div style="text-align: center; margin-top: 32px; margin-bottom: 16px;">
                <a href="http://localhost:5173/employee/dashboard" style="display: inline-block; background-color: #4f46e5; color: #ffffff; font-size: 14px; font-weight: 700; text-decoration: none; padding: 14px 28px; border-radius: 10px; box-shadow: 0 4px 12px rgba(79, 70, 229, 0.4);">
                  View Leave Request
                </a>
              </div>

              <p style="margin: 24px 0 0 0; font-size: 13px; color: #94a3b8; line-height: 1.5;">
                You can view the updated request in your Dayflow account.
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background-color: #0f172a; padding: 24px 32px; border-top: 1px solid #334155; text-align: center;">
              <p style="margin: 0; color: #64748b; font-size: 12px; line-height: 1.5;">Regards,<br><strong style="color: #94a3b8;">Dayflow HR Team</strong></p>
              <p style="margin: 12px 0 0 0; color: #475569; font-size: 11px;">This is an automated operational notification from Dayflow HRMS.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>"""

def generate_rejected_email_html(
    employee_name: str,
    leave_type: str,
    start_date: str,
    end_date: str,
    reason: str,
    approver_comment: str,
    rejected_by: str
) -> str:
    comment_text = approver_comment if approver_comment else "Please review application or consult HR."
    return f"""<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Update on Your Leave Request - Dayflow</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0f172a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f8fafc;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #0f172a; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 600px; background-color: #1e293b; border-radius: 16px; border: 1px solid #334155; overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);">
          <!-- Header Branding -->
          <tr>
            <td style="background: linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%); padding: 32px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 800; letter-spacing: -0.5px; font-family: sans-serif;">DAYFLOW</h1>
              <p style="margin: 6px 0 0 0; color: #e0e7ff; font-size: 12px; font-weight: 600; letter-spacing: 1px; opacity: 0.95;">EVERY WORKDAY, PERFECTLY ALIGNED.</p>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding: 36px 32px;">
              <p style="margin: 0 0 16px 0; font-size: 16px; color: #f8fafc; line-height: 1.5;">Hello <strong>{employee_name}</strong>,</p>
              <p style="margin: 0 0 24px 0; font-size: 14px; color: #94a3b8; line-height: 1.6;">Your leave request has been reviewed by HR.</p>
              
              <!-- Status Badge -->
              <div style="margin-bottom: 28px;">
                <span style="display: inline-block; background-color: rgba(244, 63, 94, 0.15); color: #fb7185; border: 1px solid rgba(244, 63, 94, 0.3); padding: 8px 18px; border-radius: 9999px; font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.5px;">
                  ✕ REJECTED
                </span>
              </div>

              <!-- Leave Details Card -->
              <table role="presentation" width="100%" style="background-color: #0f172a; border: 1px solid #334155; border-radius: 12px; border-collapse: separate; border-spacing: 0; margin-bottom: 28px; overflow: hidden;">
                <tr>
                  <td style="padding: 14px 18px; border-bottom: 1px solid #1e293b; color: #94a3b8; font-size: 13px; font-weight: 600; width: 35%;">Leave Type</td>
                  <td style="padding: 14px 18px; border-bottom: 1px solid #1e293b; color: #818cf8; font-size: 13px; font-weight: 700; text-transform: capitalize;">{leave_type} Leave</td>
                </tr>
                <tr>
                  <td style="padding: 14px 18px; border-bottom: 1px solid #1e293b; color: #94a3b8; font-size: 13px; font-weight: 600;">Start Date</td>
                  <td style="padding: 14px 18px; border-bottom: 1px solid #1e293b; color: #f8fafc; font-size: 13px; font-weight: 600;">{start_date}</td>
                </tr>
                <tr>
                  <td style="padding: 14px 18px; border-bottom: 1px solid #1e293b; color: #94a3b8; font-size: 13px; font-weight: 600;">End Date</td>
                  <td style="padding: 14px 18px; border-bottom: 1px solid #1e293b; color: #f8fafc; font-size: 13px; font-weight: 600;">{end_date}</td>
                </tr>
                <tr>
                  <td style="padding: 14px 18px; border-bottom: 1px solid #1e293b; color: #94a3b8; font-size: 13px; font-weight: 600;">Status</td>
                  <td style="padding: 14px 18px; border-bottom: 1px solid #1e293b; color: #fb7185; font-size: 13px; font-weight: 800;">REJECTED</td>
                </tr>
                <tr>
                  <td style="padding: 14px 18px; border-bottom: 1px solid #1e293b; color: #94a3b8; font-size: 13px; font-weight: 600;">Reviewed by</td>
                  <td style="padding: 14px 18px; border-bottom: 1px solid #1e293b; color: #f8fafc; font-size: 13px; font-weight: 600;">{rejected_by}</td>
                </tr>
                <tr>
                  <td style="padding: 14px 18px; color: #94a3b8; font-size: 13px; font-weight: 600;">HR Comment</td>
                  <td style="padding: 14px 18px; color: #fb7185; font-size: 13px; font-style: italic; line-height: 1.4;">"{comment_text}"</td>
                </tr>
              </table>

              <!-- CTA Button -->
              <div style="text-align: center; margin-top: 32px; margin-bottom: 16px;">
                <a href="http://localhost:5173/employee/dashboard" style="display: inline-block; background-color: #4f46e5; color: #ffffff; font-size: 14px; font-weight: 700; text-decoration: none; padding: 14px 28px; border-radius: 10px; box-shadow: 0 4px 12px rgba(79, 70, 229, 0.4);">
                  View Leave Request
                </a>
              </div>

              <p style="margin: 24px 0 0 0; font-size: 13px; color: #94a3b8; line-height: 1.5;">
                Please log in to Dayflow to view the complete request details.
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background-color: #0f172a; padding: 24px 32px; border-top: 1px solid #334155; text-align: center;">
              <p style="margin: 0; color: #64748b; font-size: 12px; line-height: 1.5;">Regards,<br><strong style="color: #94a3b8;">Dayflow HR Team</strong></p>
              <p style="margin: 12px 0 0 0; color: #475569; font-size: 11px;">This is an automated operational notification from Dayflow HRMS.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>"""

# ---------------------------------------------------------------------------
# Email Dispatchers (Resend API & SMTP)
# ---------------------------------------------------------------------------

def send_via_resend(
    recipient_email: str,
    subject: str,
    html_content: str,
    text_content: str
) -> Tuple[bool, Optional[str], Optional[str]]:
    api_key = settings.RESEND_API_KEY
    if not api_key:
        err_msg = "RESEND_API_KEY is not configured in backend environment (.env)."
        logger.warning(err_msg)
        return False, None, err_msg

    from_email = settings.EMAIL_FROM or "Dayflow HR <onboarding@resend.dev>"
    url = "https://api.resend.com/emails"
    headers = {
        "Authorization": f"Bearer {api_key.strip()}",
        "Content-Type": "application/json",
        "User-Agent": "DayflowHRMS/1.0"
    }

    payload = {
        "from": from_email,
        "to": [recipient_email],
        "subject": subject,
        "html": html_content,
        "text": text_content
    }

    try:
        data = json.dumps(payload).encode("utf-8")
        req = urllib.request.Request(url, data=data, headers=headers, method="POST")
        with urllib.request.urlopen(req, timeout=12) as response:
            body = response.read().decode("utf-8")
            resp_json = json.loads(body)
            msg_id = resp_json.get("id")
            logger.info(f"Resend email dispatched successfully. Recipient: {recipient_email}, ID: {msg_id}")
            return True, msg_id, None
    except urllib.error.HTTPError as e:
        err_body = e.read().decode("utf-8")
        err_msg = f"Resend API HTTP {e.code}: {err_body}"
        logger.error(err_msg)
        return False, None, err_msg
    except Exception as e:
        err_msg = f"Resend email failure: {str(e)}"
        logger.error(err_msg)
        return False, None, err_msg


def send_via_smtp(
    recipient_email: str,
    subject: str,
    html_content: str,
    text_content: str
) -> Tuple[bool, Optional[str], Optional[str]]:
    if not settings.SMTP_HOST:
        err_msg = "SMTP_HOST is not configured in backend environment (.env)."
        logger.warning(err_msg)
        return False, None, err_msg

    from_email = settings.EMAIL_FROM or "Dayflow HR <noreply@dayflow.com>"
    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = from_email
    msg["To"] = recipient_email

    msg.attach(MIMEText(text_content, "plain"))
    msg.attach(MIMEText(html_content, "html"))

    try:
        if settings.SMTP_PORT == 465:
            server = smtplib.SMTP_SSL(settings.SMTP_HOST, settings.SMTP_PORT, timeout=12)
        else:
            server = smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT, timeout=12)
            server.starttls()

        if settings.SMTP_USER and settings.SMTP_PASSWORD:
            server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)

        server.sendmail(from_email, [recipient_email], msg.as_string())
        server.quit()
        logger.info(f"SMTP email dispatched successfully to {recipient_email}")
        return True, "smtp-msg-ok", None
    except Exception as e:
        err_msg = f"SMTP email failure: {str(e)}"
        logger.error(err_msg)
        return False, None, err_msg


def dispatch_email(
    recipient_email: str,
    subject: str,
    html_content: str,
    text_content: str
) -> Tuple[bool, Optional[str], Optional[str]]:
    provider = settings.EMAIL_PROVIDER.lower().strip()
    if provider == "smtp":
        return send_via_smtp(recipient_email, subject, html_content, text_content)
    else:
        return send_via_resend(recipient_email, subject, html_content, text_content)

# ---------------------------------------------------------------------------
# High Level Public Email Service APIs
# ---------------------------------------------------------------------------

def send_leave_approved_email(
    employee_name: str,
    recipient_email: str,
    leave_type: str,
    start_date: str,
    end_date: str,
    reason: str,
    approver_comment: Optional[str] = None,
    approved_by_name: str = "HR / Admin"
) -> Tuple[bool, Optional[str], Optional[str]]:
    """
    Sends an actual transactional email to the employee notifying them of leave approval.
    Returns (email_sent: bool, provider_message_id: str | None, error_message: str | None)
    """
    subject = "Dayflow — Your Leave Request Has Been Approved"
    comment_val = approver_comment or "Approved. Have a good break."

    html_content = generate_approved_email_html(
        employee_name=employee_name,
        leave_type=leave_type,
        start_date=start_date,
        end_date=end_date,
        reason=reason,
        approver_comment=comment_val,
        approved_by=approved_by_name
    )

    text_content = f"""Hello {employee_name},

Your leave request has been approved by HR.

Leave Details:
Leave Type: {leave_type.capitalize()} Leave
Start Date: {start_date}
End Date: {end_date}
Reason: {reason}
Status: APPROVED
Approved by: {approved_by_name}
HR Comment: {comment_val}

You can view the updated request in your Dayflow account.

Regards,
Dayflow HR Team
"""

    return dispatch_email(recipient_email, subject, html_content, text_content)


def send_leave_rejected_email(
    employee_name: str,
    recipient_email: str,
    leave_type: str,
    start_date: str,
    end_date: str,
    reason: str,
    approver_comment: Optional[str] = None,
    rejected_by_name: str = "HR / Admin"
) -> Tuple[bool, Optional[str], Optional[str]]:
    """
    Sends an actual transactional email to the employee notifying them of leave rejection.
    Returns (email_sent: bool, provider_message_id: str | None, error_message: str | None)
    """
    subject = "Dayflow — Update on Your Leave Request"
    comment_val = approver_comment or "Application could not be approved at this time."

    html_content = generate_rejected_email_html(
        employee_name=employee_name,
        leave_type=leave_type,
        start_date=start_date,
        end_date=end_date,
        reason=reason,
        approver_comment=comment_val,
        rejected_by=rejected_by_name
    )

    text_content = f"""Hello {employee_name},

Your leave request has been reviewed by HR.

Leave Details:
Leave Type: {leave_type.capitalize()} Leave
Start Date: {start_date}
End Date: {end_date}
Status: REJECTED
HR Comment: {comment_val}

Please log in to Dayflow to view the complete request details.

Regards,
Dayflow HR Team
"""

    return dispatch_email(recipient_email, subject, html_content, text_content)
