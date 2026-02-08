from app import create_app
from app.extensions import db
from app.models.account_model import Account
from app.models.student_model import Student
from dotenv import load_dotenv

load_dotenv()
app = create_app()

with app.app_context():
    print("Cleaning SV001 data...")
    
    from sqlalchemy import text
    
    # 0. Drop ghost table 'account' if I created it by mistake
    try:
        print("Dropping ghost table 'account'...")
        db.session.execute(text("DROP TABLE IF EXISTS account CASCADE"))
        db.session.commit()
    except Exception as e:
        print(f"Error dropping table: {e}")
        db.session.rollback()

    # 1. Delete associated Student record if exists (by student_id)
    stu = Student.query.filter_by(student_id="SV001").first()
    if stu:
        print(f"Deleting Orphaned Student: {stu.id}")
        db.session.delete(stu)
    
    # 2. Delete Account record (by username)
    acc = Account.query.filter_by(username="SV001").first()
    if acc:
        print(f"Deleting Account: {acc.id}")
        db.session.delete(acc)
        
    db.session.commit()
    print("Cleaned.")
