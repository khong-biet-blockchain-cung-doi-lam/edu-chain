from app import create_app, db
from sqlalchemy import text, inspect

app = create_app()

with app.app_context():
    try:
        inspector = inspect(db.engine)
        if 'student' in inspector.get_table_names():
            cols = [c['name'] for c in inspector.get_columns('student')]
            if 'gpa' not in cols:
                print("Adding gpa to student...")
                with db.engine.connect() as conn:
                    conn.execute(text("ALTER TABLE student ADD COLUMN gpa FLOAT DEFAULT 0.0"))
                    conn.commit()
                print("Added gpa to student.")
            else:
                print("Student gpa already exists.")
                
    except Exception as e:
        print(f"Migration Error: {e}")
