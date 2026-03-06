import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os
import logging

logger = logging.getLogger(__name__)

def send_credentials_email(to_email, username, default_password):
    """
    Sends an email to the user with their login credentials.
    Relies on SMTP_SERVER, SMTP_PORT, SMTP_USER, and SMTP_PASS environment variables.
    """
    smtp_server = os.getenv("SMTP_SERVER", "smtp.gmail.com")
    smtp_port = int(os.getenv("SMTP_PORT", 587))
    smtp_user = os.getenv("SMTP_USER")
    smtp_pass = os.getenv("SMTP_PASS")
    
    if not smtp_user or not smtp_pass:
        logger.warning(f"SMTP credentials not configured. Skipping email to {to_email}. Username: {username}, Pass: {default_password}")
        return False
        
    msg = MIMEMultipart()
    msg['From'] = smtp_user
    msg['To'] = to_email
    msg['Subject'] = "Thông tin tài khoản hệ thống Cổng thông tin Sinh viên"
    
    body = f"""Chào bạn,

Tài khoản của bạn trên hệ thống đã được cấp thành công. Dưới đây là thông tin đăng nhập của bạn:

- Mã đăng nhập (Mã sinh viên): {username}
- Mật khẩu mặc định (CCCD): {default_password}

Vui lòng đăng nhập và đổi mật khẩu ngay để bảo mật tài khoản.

Trân trọng,
Ban Quản Trị Hệ Thống.
"""
    msg.attach(MIMEText(body, 'plain', 'utf-8'))

    try:
        server = smtplib.SMTP(smtp_server, smtp_port)
        server.starttls()
        server.login(smtp_user, smtp_pass)
        server.send_message(msg)
        server.quit()
        logger.info(f"Successfully sent credentials to {to_email}")
        return True
    except Exception as e:
        logger.error(f"Failed to send email to {to_email}: {e}")
        return False

def send_grades_email(to_email, username, grades_data):
    """
    Sends an email to the user with their uploaded grades.
    """
    smtp_server = os.getenv("SMTP_SERVER", "smtp.gmail.com")
    smtp_port = int(os.getenv("SMTP_PORT", 587))
    smtp_user = os.getenv("SMTP_USER")
    smtp_pass = os.getenv("SMTP_PASS")
    
    if not smtp_user or not smtp_pass:
        logger.warning(f"SMTP credentials not configured. Skipping grade email to {to_email}.")
        return False
        
    msg = MIMEMultipart()
    msg['From'] = smtp_user
    msg['To'] = to_email
    msg['Subject'] = "Thông báo: Điểm thi đã được đưa lên Blockchain"
    
    grades_text = "\n".join([
        f"- {g.get('subject', 'N/A')} ({g.get('credits', 0)} tín chỉ): "
        f"CC: {g.get('regular_score')}, GK: {g.get('midterm_score')}, "
        f"CK: {g.get('final_score')} => Tổng kết: {g.get('total_score')}"
        for g in grades_data.get('grades', [])
    ])

    body = f"""Chào bạn {username},

Điểm thi của bạn vừa được Phòng Khảo thí xác nhận và đưa lên hệ thống Blockchain vĩnh viễn nhằm đảm bảo tính minh bạch.

Danh sách điểm chi tiết:
{grades_text}

Bạn có thể đăng nhập vào Cổng thông tin Sinh viên để xem chi tiết và yêu cầu phúc khảo nếu cần thiết.

Trân trọng,
Hệ Thống Phân Tán EduChain.
"""
    msg.attach(MIMEText(body, 'plain', 'utf-8'))

    try:
        server = smtplib.SMTP(smtp_server, smtp_port)
        server.starttls()
        server.login(smtp_user, smtp_pass)
        server.send_message(msg)
        server.quit()
        logger.info(f"Successfully sent grades to {to_email}")
        return True
    except Exception as e:
        logger.error(f"Failed to send grades email to {to_email}: {e}")
        return False
