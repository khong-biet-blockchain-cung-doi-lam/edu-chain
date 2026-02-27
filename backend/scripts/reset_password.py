import os
from dotenv import load_dotenv
load_dotenv()

import psycopg2
import bcrypt

conn = psycopg2.connect(os.environ['DATABASE_URL'], connect_timeout=8)
cur = conn.cursor()
new_hash = bcrypt.hashpw(b"Test@123456", bcrypt.gensalt()).decode()
cur.execute("UPDATE account SET password_hash=%s WHERE username='admin01'", (new_hash,))
conn.commit()
print("admin01 password updated to Test@123456")
cur.close()
conn.close()
