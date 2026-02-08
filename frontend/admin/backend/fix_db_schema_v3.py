from app import create_app
from app.extensions import db
from sqlalchemy import text

app = create_app()

with app.app_context():
    print(">>> FIXING DB SCHEMA AND CLEANING UP <<<")
    try:
        # 1. Drop bad constraint on grades
        print("Dropping constraint 'grades_student_id_fkey' explicitly...")
        db.session.execute(text("ALTER TABLE grades DROP CONSTRAINT IF EXISTS grades_student_id_fkey"))
        db.session.commit()
        
        # 2. Add correct constraint to student table
        print("Adding constraint 'grades_student_id_fkey' referencing 'student(id)'...")
        db.session.execute(text("ALTER TABLE grades ADD CONSTRAINT grades_student_id_fkey FOREIGN KEY (student_id) REFERENCES student(id)"))
        db.session.commit()
        
        # 3. Drop redundant tables
        print("Dropping table 'students'...")
        db.session.execute(text("DROP TABLE IF EXISTS students CASCADE"))
        
        print("Dropping table 'accounts'...")
        db.session.execute(text("DROP TABLE IF EXISTS accounts CASCADE"))
        
        db.session.commit()
        
        print("Schema fixed and cleanup successful!")
    except Exception as e:
        print(f"Error fixing schema: {e}")
        db.session.rollback()
