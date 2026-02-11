"""SendGrid email sending (verification, invite)."""
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail

from app.config import get_settings

settings = get_settings()


def send_email(to_email: str, subject: str, html_content: str) -> bool:
    if not settings.sendgrid_api_key:
        return False
    message = Mail(
        from_email=(settings.sendgrid_from_email, settings.sendgrid_from_name),
        to_emails=to_email,
        subject=subject,
        html_content=html_content,
    )
    try:
        SendGridAPIClient(settings.sendgrid_api_key).send(message)
        return True
    except Exception:
        return False


def send_verification_email(to_email: str, token: str) -> bool:
    link = f"{settings.frontend_url}/verify-email?token={token}"
    html = f"""
    <p>Please verify your email by clicking the link below:</p>
    <p><a href="{link}">{link}</a></p>
    <p>This link expires in 60 minutes.</p>
    """
    return send_email(to_email, "Verify your email - FreshApp", html)


def send_invite_email(to_email: str, token: str, inviter_name: str = "Admin") -> bool:
    link = f"{settings.frontend_url}/accept-invite?token={token}"
    html = f"""
    <p>You have been invited by {inviter_name} to join FreshApp.</p>
    <p><a href="{link}">Accept invitation</a></p>
    <p>This link expires in 24 hours.</p>
    """
    return send_email(to_email, "You're invited to FreshApp", html)
