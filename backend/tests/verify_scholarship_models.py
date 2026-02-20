from app import create_app, db
from app.models.scholarship_model import Scholarship, ScholarshipApplication
from app.models.student_certificate_model import StudentCertificate
from app.models.partner_model import Partner
from app.models.enums import Role

app = create_app()

with app.app_context():
    try:
        print("Verifying model imports...")
        print(f"Role.PARTNER: {Role.PARTNER}")
        print(f"Scholarship table: {Scholarship.__tablename__}")
        print(f"ScholarshipApplication table: {ScholarshipApplication.__tablename__}")
        print(f"StudentCertificate table: {StudentCertificate.__tablename__}")
        print(f"Partner table: {Partner.__tablename__}")
        
        print("Creating tables if not exist...")
        db.create_all()
        print("Tables created/verified.")
        
    except Exception as e:
        print(f"Error: {e}")
