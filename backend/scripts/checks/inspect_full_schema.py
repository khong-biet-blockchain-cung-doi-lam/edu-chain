from app import create_app
from app.extensions import db
from sqlalchemy import inspect

app = create_app()

with app.app_context():
    print(">>> FULL DATABASE SCHEMA INSPECTION <<<")
    try:
        inspector = inspect(db.engine)
        table_names = inspector.get_table_names()
        
        print(f"Found {len(table_names)} tables: {', '.join(table_names)}")
        print("-" * 50)
        
        for table in table_names:
            print(f"\n[TABLE] {table}")
            columns = inspector.get_columns(table)
            for c in columns:
                pk = " [PK]" if c.get('primary_key') else ""
                nullable = "NULL" if c.get('nullable') else "NOT NULL"
                print(f"  - {c['name']} ({c['type']}) {nullable}{pk}")
            
            fks = inspector.get_foreign_keys(table)
            if fks:
                print("  [Foreign Keys]:")
                for fk in fks:
                    # simplified FK print
                    constrained = ", ".join(fk['constrained_columns'])
                    referred = f"{fk['referred_table']}.{', '.join(fk['referred_columns'])}"
                    print(f"    - {constrained} -> {referred}")
        
        print("-" * 50)
        print("Inspection Completed.")
            
    except Exception as e:
        print(f"Error: {e}")
