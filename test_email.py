#!/usr/bin/env python3
"""
Test email configuration for UPI-Guard
"""

import smtplib
from email.mime.text import MIMEText
import os

def test_email_config():
    """Test Gmail SMTP configuration"""
    
    sender_email = "alonepenguin07@gmail.com"
    sender_password = "ubfh mfpf krdm xwkn"
    recipient_email = "madhavsamalla1802@gmail.com"
    
    print("🔧 Testing Email Configuration")
    print(f"📧 From: {sender_email}")
    print(f"📧 To: {recipient_email}")
    print(f"🔐 Password: {'*' * len(sender_password)}")
    print("=" * 50)
    
    try:
        # Connect to Gmail SMTP
        print("🌐 Connecting to Gmail SMTP...")
        server = smtplib.SMTP("smtp.gmail.com", 587)
        server.starttls()
        
        print("🔐 Logging in...")
        server.login(sender_email, sender_password)
        print("✅ Login successful!")
        
        # Send test email
        print("📧 Sending test email...")
        message = MIMEText("This is a test email from UPI-Guard deployment.")
        message["Subject"] = "UPI-Guard Email Test"
        message["From"] = sender_email
        message["To"] = recipient_email
        
        server.send_message(message)
        server.quit()
        
        print("✅ Email sent successfully!")
        print("📧 Check your inbox for the test email.")
        
    except smtplib.SMTPAuthenticationError as e:
        print(f"❌ Authentication failed: {e}")
        print("💡 Make sure you're using an App Password, not your regular password")
        print("💡 Enable 2-factor authentication and generate an App Password")
        
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    test_email_config()
