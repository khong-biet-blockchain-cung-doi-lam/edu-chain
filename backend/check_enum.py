from sqlalchemy import create_engine, text
from dotenv import load_dotenv
import os

load_dotenv()
db_url = os.getenv("DATABASE_URL")
engine = create_engine(db_url)

with engine.connect() as conn:
    print("Checking ENUM values for academic_status...")
    try:
        # Query pg_enum to find values for a type that might match the column
        # OR just try to select distinct values if any exist, but table might be empty.
        # Better: Query pg_type/pg_enum
        sql = """
            SELECT t.typname, e.enumlabel
            FROM pg_type t
            JOIN pg_enum e ON t.oid = e.enumtypid
            WHERE t.typname = 'academic_status' OR t.typname = 'student_academic_status';
        """
        result = conn.execute(text(sql))
        rows = result.fetchall()
        if rows:
            for row in rows:
                print(f"Type: {row[0]}, Value: {str(row[1]).encode('utf-8', 'ignore')}")
        else:
            print("No enum found in pg_enum. Checking constraints...")
            
    except Exception as e:
        print(e)
