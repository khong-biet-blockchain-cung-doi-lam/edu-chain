import pandas as pd
from app.extensions import db
from app.models.account_model import Account
from app.models.student_model import Student
from sqlalchemy.exc import IntegrityError
import bcrypt
import traceback

def process_excel_and_upload(file):
    results = {"created": 0, "skipped": 0, "errors": [], "total": 0}
    
    try:
        file.seek(0)
        df = pd.read_excel(file, dtype=str)
    except Exception as e:
        return {"errors": [{"row": None, "msg": f"Lỗi đọc file Excel: {str(e)}"}]}

    # Validate structure
    required_cols = ["student_id", "citizen_id"]
    for col in required_cols:
        if col not in df.columns:
             return {"errors": [{"row": None, "msg": f"Thiếu cột {col}"}]}

    valid_rows = []
    for idx, row in df.iterrows():
        sid = str(row.get("student_id", "")).strip()
        cid = str(row.get("citizen_id", "")).strip()
        if sid and cid:
            valid_rows.append({"student_id": sid, "citizen_id": cid})
        else:
             results["skipped"] += 1
             
    results["total"] = len(valid_rows) + results["skipped"]

    for row in valid_rows:
        student_id = row["student_id"]
        citizen_id = row["citizen_id"]
        
        # Truncate to 72 bytes for bcrypt
        c_bytes = citizen_id.encode('utf-8')
        if len(c_bytes) > 72:
            citizen_id = c_bytes[:72].decode('utf-8', errors='ignore')
            
        existing = Account.query.filter_by(username=student_id).first()
        if existing:
            results["skipped"] += 1
            continue
            
        # Hash
        hashed = bcrypt.hashpw(citizen_id.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        
        new_acc = Account(username=student_id, password_hash=hashed, role="student")
        db.session.add(new_acc)
        
        try:
            db.session.flush()
            new_student = Student(student_id=student_id, account_id=new_acc.id)
            db.session.add(new_student)
            db.session.flush()
            results["created"] += 1
        except Exception as e:
            db.session.rollback()
            results["errors"].append({"row": student_id, "msg": str(e)})
            continue

    try:
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return {"errors": [{"row": None, "msg": str(e)}]}

    return results
