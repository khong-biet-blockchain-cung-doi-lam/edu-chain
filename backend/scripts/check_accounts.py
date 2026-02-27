import os
from dotenv import load_dotenv
load_dotenv()
import psycopg2

conn = psycopg2.connect(os.environ['DATABASE_URL'], connect_timeout=8)
cur = conn.cursor()
cur.execute("SELECT username, email, role, LEFT(password_hash, 20) FROM account ORDER BY role")
rows = cur.fetchall()
for r in rows:
    print(f"user={r[0]} role={r[2]} hash_start={r[3]}")
cur.close()
conn.close()
