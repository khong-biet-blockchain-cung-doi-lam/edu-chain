import sqlite3
import os

def check_schema():
    db_paths = ['app.db', 'instance/app.db']
    for db_path in db_paths:
        if os.path.exists(db_path):
            print(f"Checking {db_path}...")
            conn = sqlite3.connect(db_path)
            cursor = conn.cursor()
            try:
                cursor.execute("PRAGMA table_info(student_personal_info)")
                cols = cursor.fetchall()
                print(f"Columns in student_personal_info in {db_path}:")
                for col in cols:
                    print(col)
            except Exception as e:
                print(f"Error in {db_path}: {e}")
            finally:
                conn.close()
        else:
            print(f"Database {db_path} not found.")

if __name__ == "__main__":
    check_schema()
