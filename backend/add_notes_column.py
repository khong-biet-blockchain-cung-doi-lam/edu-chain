import sqlite3
import os

db_path = os.path.join('instance', 'app.db')
if not os.path.exists(db_path):
    db_path = 'app.db'

print(f"Connecting to {db_path}...")
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

try:
    print("Adding review_notes column to 'grades' table...")
    cursor.execute("ALTER TABLE grades ADD COLUMN review_notes TEXT")
    conn.commit()
    print("Column added successfully.")
except sqlite3.OperationalError as e:
    print(f"Error: {e}")
finally:
    conn.close()
