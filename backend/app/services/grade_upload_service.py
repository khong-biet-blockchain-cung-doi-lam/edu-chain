import pandas as pd
from app.extensions import db
from app.models.student_model import Student
from app.models.course_models import Grade
import uuid
import traceback

def process_grade_excel(file, class_id):
    """
    Parses Excel for grades and updates/creates Grade records.
    Expected columns: student_id, regular_score, midterm_score, final_score
    """
    results = {"updated": 0, "created": 0, "errors": [], "total": 0}
    
    try:
        file.seek(0)
        df = pd.read_excel(file, dtype=str)
        # Normalize column names
        df.columns = [c.strip().lower() for c in df.columns]
    except Exception as e:
        return {"errors": [{"row": None, "msg": f"Lỗi đọc file Excel: {str(e)}"}]}

    required_cols = ["student_id", "regular_score", "midterm_score", "final_score"]
    for col in required_cols:
        if col not in df.columns:
             return {"errors": [{"row": None, "msg": f"Thiếu cột {col}"}]}

    results["total"] = len(df)

    for idx, row in df.iterrows():
        student_code = str(row.get("student_id", "")).strip()
        if not student_code:
            continue
            
        try:
            # Find student by student_id (the code e.g. B20DCCN001)
            student = Student.query.filter_by(student_id=student_code).first()
            if not student:
                results["errors"].append({"row": student_code, "msg": "Không tìm thấy sinh viên"})
                continue

            # Parse scores
            try:
                reg = float(row.get("regular_score", 0))
                mid = float(row.get("midterm_score", 0))
                fin = float(row.get("final_score", 0))
            except ValueError:
                results["errors"].append({"row": student_code, "msg": "Điểm số không hợp lệ (phải là số)"})
                continue

            # Find existing grade record for this class
            grade = Grade.query.filter_by(student_id=student.id, course_class_id=class_id).first()
            
            is_new = False
            if not grade:
                grade = Grade(student_id=student.id, course_class_id=class_id)
                db.session.add(grade)
                is_new = True

            grade.regular_score = reg
            grade.midterm_score = mid
            grade.final_score = fin
            
            # Calculate total
            grade.total_score = (reg * 0.1) + (mid * 0.4) + (fin * 0.5)
            grade.status = "PASSED" if grade.total_score >= 4.0 else "FAILED"
            
            if is_new:
                results["created"] += 1
            else:
                results["updated"] += 1

        except Exception as e:
            results["errors"].append({"row": student_code, "msg": str(e)})

    try:
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return {"errors": [{"row": None, "msg": f"Database error: {str(e)}"}]}

    return results
