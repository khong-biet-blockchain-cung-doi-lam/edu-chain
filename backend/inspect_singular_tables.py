from app import create_app
from app.extensions import db
from sqlalchemy import text

app = create_app()

with app.app_context():
    print(">>> INSPECTING SINGULAR TABLES <<<")
    
    def inspect_table(table_name):
        print(f"\n--- Table: {table_name} ---")
        try:
            # Get columns
            sql_cols = text(f"SELECT column_name, data_type FROM information_schema.columns WHERE table_name = '{table_name}';")
            res_cols = db.session.execute(sql_cols).fetchall()
            if not res_cols:
                print("  (Table not found or empty columns)")
            for col in res_cols:
                print(f"  Col: {col[0]} ({col[1]})")
                
            # Get constraints
            sql_cons = text(f"""
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
                WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_name='{table_name}';
            """)
            res_cons = db.session.execute(sql_cons).fetchall()
            for con in res_cons:
                print(f"  FK: {con[0]} ({con[1]} -> {con[2]}.{con[3]})")
                
        except Exception as e:
            print(f"Error: {e}")

    inspect_table('account')
    inspect_table('student')
