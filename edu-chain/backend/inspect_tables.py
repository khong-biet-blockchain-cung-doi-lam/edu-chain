from app import create_app
from sqlalchemy import inspect
from dotenv import load_dotenv

load_dotenv()
app = create_app()

target_tables = ['subjects', 'course_classes', 'grades', 'lecturer', 'lecturer_subjects', 'semesters', 'staffs']

with app.app_context():
    db = app.extensions['sqlalchemy']
    inspector = inspect(db.engine)
    existing_tables = inspector.get_table_names()
    
    for table in target_tables:
        if table in existing_tables:
            print(f"\nTABLE: {table}")
            columns = inspector.get_columns(table)
            for col in columns:
                print(f" - {col['name']} ({col['type']})")
        else:
            print(f"\nTABLE: {table} NOT FOUND")
