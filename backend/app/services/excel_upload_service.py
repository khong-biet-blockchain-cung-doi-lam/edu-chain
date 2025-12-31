import uuid
import bcrypt
from sqlalchemy.exc import IntegrityError
from flask import current_app
from app.extensions import db
from app.models.account_model import Account
from app.models.student_models import Student
from app.utils.supabase_client import SupabaseClient
from app.utils.excel_parser import read_excel, validate_dataframe

def process_excel_and_upload(file):
    """
    1. Upload Excel lên Supabase (nếu cấu hình)
    2. Đọc + validate
    3. Tạo account sinh viên & thông tin sinh viên
    """
    errors = []
    
    # ===== 1. Upload Supabase (Optional / Try-catch) =====
    # Nếu không cấu hình Supabase thì có thể skip hoặc log warning
    try:
        supabase = SupabaseClient().get_client()
        file_name = f"{uuid.uuid4()}_{file.filename}"
        file.seek(0)
        file_bytes = file.read()
        
        supabase.storage.from_("excel-files").upload(
            file_name,
            file_bytes,
            {"content-type": file.content_type}
        )
        # Reset file pointer sau khi read
        file.seek(0)
    except Exception as e:
        current_app.logger.warning(f"Supabase upload failed or not configured: {str(e)}")
        # Reset file pointer để đảm bảo đọc được ở bước sau
        file.seek(0)

    # ===== 2. Đọc & validate Excel =====
    try:
        df = read_excel(file)
        valid_rows, validation_errors = validate_dataframe(df)
        if validation_errors:
             errors.extend(validation_errors)
    except Exception as e:
        return {"errors": [{"row": None, "msg": f"Lỗi đọc file: {str(e)}"}]}

    if errors:
        return {"errors": errors}

    # ===== 3. Tạo account & student =====
    results = {"total": len(valid_rows), "created": 0, "skipped": 0, "errors": errors}

    for row in valid_rows:
        student_id = str(row["student_id"]).strip()
        citizen_id = str(row["citizen_id"]).strip()
        
        # Ensure citizen_id is safe for bcrypt (max 72 bytes)
        citizen_bytes = citizen_id.encode('utf-8')
        if len(citizen_bytes) > 72:
            print(f"WARNING: Truncating citizen_id for {student_id} as it exceeds 72 bytes.")
            citizen_id = citizen_bytes[:72].decode('utf-8', errors='ignore')

        print(f"DEBUG: Processing {student_id}, citizen_id: '{citizen_id}'")

        # Check existing Account
        existing_acc = Account.query.filter_by(username=student_id).first()
        if existing_acc:
            results["skipped"] += 1
            results["errors"].append({"row": None, "msg": f"Mã SV {student_id} đã tồn tại, đã skip"})
            continue

        # Create Account
        # Use bcrypt directly
        hashed_pw = bcrypt.hashpw(citizen_id.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        
        new_account = Account(
            username=student_id,
            password_hash=hashed_pw,
            role="student",
            is_active=True
        )
        db.session.add(new_account)

        try:
            db.session.flush() # get ID
            
            # Create Student
            new_student = Student(
                student_id=student_id,
                account_id=new_account.id
            )
            db.session.add(new_student)
            
            db.session.flush()
            results["created"] += 1
        except IntegrityError as e:
            db.session.rollback()
            results["skipped"] += 1
            results["errors"].append({"row": None, "msg": f"Lỗi DB khi tạo {student_id}: {str(e)}"})
            continue
        except Exception as e:
            db.session.rollback()
            results["skipped"] += 1
            results["errors"].append({"row": None, "msg": f"Lỗi không xác định {student_id}: {str(e)}"})
            continue

    # Commit final
    try:
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return {"errors": [{"row": None, "msg": f"Lỗi commit transaction: {str(e)}"}]}

    return results
