import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from app import create_app
from app.extensions import db
from app.models.account_model import Account
from app.models.enums import Role
import bcrypt
import uuid

app = create_app()

with app.app_context():
    roles = [
        (Role.ADMIN, "admin@admin.neu.edu.vn"),
        (Role.QL_DAO_TAO, "qldt@qldt.neu.edu.vn"),
        (Role.KHAO_THI, "khaothi@kt.neu.edu.vn"),
        (Role.KHOA, "khoa@khoa.neu.edu.vn"),
        (Role.GIANG_VIEN, "gv@lt.neu.edu.vn"),
        (Role.SINH_VIEN, "sv@st.neu.edu.vn"),
        (Role.PARTNER, "partner@tp.neu.edu.vn")
    ]
    
    pw = "Test@123456"
    hashed = bcrypt.hashpw(pw.encode(), bcrypt.gensalt()).decode()
    
    for role, email in roles:
        username = email.split('@')[0]
        acc = Account.query.filter_by(email=email).first()
        if not acc:
            acc = Account.query.filter_by(username=username).first()
        
        if not acc:
            acc = Account(
                id=uuid.uuid4(),
                username=username,
                email=email,
                password_hash=hashed,
                role=role,
                is_active=True
            )
            db.session.add(acc)
            print(f"Added {role}: {email} / {pw}")
        else:
            acc.password_hash = hashed
            print(f"Updated {role}: {email} / {pw}")
            
    db.session.commit()
    print("Done")
