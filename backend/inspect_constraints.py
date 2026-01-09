from app import create_app
from app.extensions import db
from sqlalchemy import text

app = create_app()

with app.app_context():
    print(">>> INSPECTING CONSTRAINTS <<<")
    
    def get_fks(table):
        try:
            sql = text(f"""
                SELECT
                    tc.constraint_name, 
                    kcu.column_name, 
                    ccu.table_name AS foreign_table_name,
                    ccu.column_name AS foreign_column_name 
                FROM 
                    information_schema.table_constraints AS tc 
                    JOIN information_schema.key_column_usage AS kcu
                      ON tc.constraint_name = kcu.constraint_name
                      AND tc.table_schema = kcu.table_schema
                    JOIN information_schema.constraint_column_usage AS ccu
                      ON ccu.constraint_name = tc.constraint_name
                      AND ccu.table_schema = tc.table_schema
                WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_name='{table}';
            """)
            result = db.session.execute(sql)
            print(f"--- Table: {table} ---")
            rows = result.fetchall()
            if not rows:
                print("  (No FKs found)")
            for row in rows:
                print(f"  Constraint: {row[0]}")
                print(f"  Column: {row[1]} -> Ref Table: {row[2]}, Ref Col: {row[3]}")
        except Exception as e:
            print(f"Error inspecting {table}: {e}")

    get_fks('students')
    get_fks('accounts') 
    get_fks('account')
    get_fks('grades')
    get_fks('course_classes')
