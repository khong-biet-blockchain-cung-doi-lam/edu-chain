import sqlite3
import os

def migrate():
    db_paths = ['app.db', 'instance/app.db']
    for db_path in db_paths:
        if os.path.exists(db_path):
            print(f"Migrating {db_path}...")
            conn = sqlite3.connect(db_path)
            cursor = conn.cursor()
            try:
                cursor.execute("ALTER TABLE student_personal_info ADD COLUMN is_locked BOOLEAN DEFAULT 0")
                conn.commit()
                print(f"Added is_locked to student_personal_info in {db_path}")
            except sqlite3.OperationalError as e:
                if "duplicate column name" in str(e).lower():
                    print(f"Column is_locked already exists in {db_path}")
                else:
                    print(f"Error in {db_path}: {e}")
            finally:
                conn.close()
        else:
            print(f"Database {db_path} not found.")

if __name__ == "__main__":
    migrate()
