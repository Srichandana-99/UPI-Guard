import smtplib
import random
import string
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Optional
import os
from app.core.config import settings

class EmailService:
    def __init__(self):
        # Using Gmail SMTP (free)
        self.smtp_server = "smtp.gmail.com"
        self.smtp_port = 587
        self.sender_email = settings.SENDER_EMAIL or os.getenv("SENDER_EMAIL", "")
        self.sender_password = settings.SENDER_PASSWORD or os.getenv("SENDER_PASSWORD", "")
        
    def generate_otp(self, length: int = 6) -> str:
        """Generate random OTP"""
        return ''.join(random.choices(string.digits, k=length))
    
    def send_otp_email(self, recipient_email: str, otp: str, purpose: str = "login") -> bool:
        """Send OTP email using Gmail SMTP"""
        try:
            # Create message
            message = MIMEMultipart()
            message["From"] = self.sender_email
            message["To"] = recipient_email
            
            if purpose == "login":
                subject = "UPI-Guard Login OTP"
                body = f"""
Hello,

Your OTP for UPI-Guard login is: {otp}

This OTP will expire in 5 minutes.

For security reasons:
- Never share this OTP with anyone
- UPI-Guard will never ask for your password
- This OTP can only be used once

If you didn't request this OTP, please ignore this email.

Best regards,
UPI-Guard Security Team
                """
            else:  # registration
                subject = "UPI-Guard Email Verification"
                body = f"""
Welcome to UPI-Guard!

Your email verification OTP is: {otp}

Please enter this OTP to complete your registration and start using UPI-Guard.

This OTP will expire in 10 minutes.

Best regards,
UPI-Guard Team
                """
            
            message["Subject"] = subject
            message.attach(MIMEText(body, "plain"))
            
            # Send email
            server = smtplib.SMTP(self.smtp_server, self.smtp_port)
            server.starttls()
            server.login(self.sender_email, self.sender_password)
            server.sendmail(self.sender_email, recipient_email, message.as_string())
            server.quit()
            
            return True
            
        except Exception as e:
            print(f"Failed to send email: {e}")
            return False

# Simple in-memory OTP store (for production use)
# In production, use Redis or database
otp_store = {}

class OTPService:
    @staticmethod
    def generate_and_store_otp(email: str, purpose: str = "login") -> str:
        """Generate and store OTP"""
        otp = ''.join(random.choices(string.digits, k=6))
        
        # Store OTP with timestamp (5 minutes expiry)
        import time
        otp_store[email] = {
            "otp": otp,
            "purpose": purpose,
            "timestamp": time.time(),
            "attempts": 0
        }
        
        return otp
    
    @staticmethod
    def verify_otp(email: str, provided_otp: str) -> bool:
        """Verify OTP"""
        if email not in otp_store:
            return False
        
        stored_data = otp_store[email]
        
        # Check expiry (5 minutes)
        import time
        if time.time() - stored_data["timestamp"] > 300:
            del otp_store[email]
            return False
        
        # Check attempts (max 3)
        if stored_data["attempts"] >= 3:
            del otp_store[email]
            return False
        
        # Verify OTP
        if stored_data["otp"] == provided_otp:
            del otp_store[email]
            return True
        else:
            stored_data["attempts"] += 1
            return False
    
    @staticmethod
    def cleanup_expired_otps():
        """Clean up expired OTPs"""
        import time
        current_time = time.time()
        expired_emails = [
            email for email, data in otp_store.items()
            if current_time - data["timestamp"] > 300
        ]
        for email in expired_emails:
            del otp_store[email]
