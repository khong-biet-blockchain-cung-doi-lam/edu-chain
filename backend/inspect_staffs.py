from app import create_app
from app.extensions import db
from sqlalchemy import text, inspect

app = create_app()

with app.app_context():
    print(">>> INSPECTING STAFFS TABLE <<<")
    try:
        inspector = inspect(db.engine)
        columns = inspector.get_columns('staffs')
        for c in columns:
            print(f"Column: {c['name']} - Type: {c['type']}")
        
        print("\n>>> INSPECTING LECTURER TABLE <<<")
        columns = inspector.get_columns('lecturer')
        for c in columns:
            print(f"Column: {c['name']} - Type: {c['type']}")
            
        print("\nFKs Lecturer:")
        fks = inspector.get_foreign_keys('lecturer')
        for fk in fks:
            print(fk)

        print("\n>>> INSPECTING STUDENT TABLE <<<")
        columns = inspector.get_columns('student')
        for c in columns:
            print(f"Column: {c['name']} - Type: {c['type']}")
            
        print("\nFKs Student:")
        fks = inspector.get_foreign_keys('student')
        for fk in fks:
            print(fk)
            
    except Exception as e:
        print(f"Error: {e}")
