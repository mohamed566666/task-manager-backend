import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.core.config import settings

class EmailService:
    @staticmethod
    def send_otp_email(to_email: str, otp: str):
        if not settings.SMTP_SERVER or not settings.SMTP_USERNAME or not settings.SMTP_PASSWORD:
            print(f"\n{'='*50}")
            print(f"EMAIL MOCK (SMTP not fully configured)")
            print(f"TO: {to_email}")
            print(f"OTP: {otp}")
            print(f"{'='*50}\n")
            return

        try:
            msg = MIMEMultipart()
            msg['From'] = settings.SMTP_FROM_EMAIL or settings.SMTP_USERNAME
            msg['To'] = to_email
            msg['Subject'] = "Task Manager - Password Reset OTP"

            body = f"""
            Hello,

            You have requested to reset your password for the Task Manager app.
            Your 6-digit OTP code is: {otp}

            This code will expire in 5 minutes.
            If you did not request this, please ignore this email.

            Best,
            Task Manager Team
            """
            
            msg.attach(MIMEText(body, 'plain'))

            server = smtplib.SMTP(settings.SMTP_SERVER, settings.SMTP_PORT)
            server.starttls()
            server.login(settings.SMTP_USERNAME, settings.SMTP_PASSWORD)
            server.send_message(msg)
            server.quit()
            
            print(f"OTP email sent successfully to {to_email}")
            
        except Exception as e:
            print(f"Failed to send OTP email to {to_email}: {e}")
