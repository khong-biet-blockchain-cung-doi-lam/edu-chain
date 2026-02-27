"""
Script tạo test account KHAO_THI để test RBAC
"""
import os, sys
sys.path.insert(0, '.')
from dotenv import load_dotenv
load_dotenv()
import psycopg2
import bcrypt
import uuid

conn = psycopg2.connect(os.environ['DATABASE_URL'], connect_timeout=8)
cur = conn.cursor()

pw = "Test@123456"
hashed = bcrypt.hashpw(pw.encode(), bcrypt.gensalt()).decode()
uid = str(uuid.uuid4())

try:
    cur.execute(
        "INSERT INTO account (id, username, email, password_hash, role, is_active) VALUES (%s, %s, %s, %s, %s, %s)",
        (uid, "khaothi_test", "khaothi@kt.neu.edu.vn", hashed, "KHAO_THI", True)
    )
    conn.commit()
    print(f"Created KHAO_THI test account: khaothi_test / Test@123456")
    print(f"Also creating ADMIN test account...")
    uid2 = str(uuid.uuid4())
    hashed2 = bcrypt.hashpw("Test@123456".encode(), bcrypt.gensalt()).decode()
    cur.execute(
        "INSERT INTO account (id, username, email, password_hash, role, is_active) VALUES (%s, %s, %s, %s, %s, %s)",
        (uid2, "admin_test", "admin@admin.neu.edu.vn", hashed2, "ADMIN", True)
    )
    conn.commit()
    print(f"Created ADMIN test account: admin_test / Test@123456")
except Exception as e:
    conn.rollback()
    print(f"Error (maybe already exists): {e}")
    
    # Update password for admin01 to known value
    hashed3 = bcrypt.hashpw("Test@123456".encode(), bcrypt.gensalt()).decode()
    cur.execute("UPDATE account SET password_hash=%s WHERE username='admin01'", (hashed3,))
    conn.commit()
    print("Updated admin01 password to Test@123456")

cur.close()
conn.close()
print("DONE")
