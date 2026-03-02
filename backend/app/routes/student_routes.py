from flask import Blueprint, request, jsonify, current_app, render_template
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models.account_model import Account
from app.models.student_model import Student
from app.models.course_models import Grade
from app.extensions import db
from app.services.excel_upload_service import process_excel_and_upload

bp_student = Blueprint("student", __name__, url_prefix="/api/staff")
bp_student_portal = Blueprint("student_portal", __name__, url_prefix="/api/student")

@bp_student.route("/upload-students", methods=["POST"])
def upload_students():
    if 'file' not in request.files:
        return jsonify({"msg": "Không tìm thấy file trong request"}), 400
    file = request.files['file']
    if file.filename == "":
        return jsonify({"msg": "Tên file rỗng"}), 400

    try:
        results = process_excel_and_upload(file)
        if "errors" in results and "created" not in results:
             return jsonify(results), 400
        return jsonify(results), 200
    except Exception as e:
        current_app.logger.exception("Lỗi upload students")
        return jsonify({"msg": "Lỗi hệ thống", "error": str(e)}), 500

@bp_student_portal.route("/profile", methods=["GET"])
@jwt_required()
def get_student_profile():
    import uuid
    current_account_id = get_jwt_identity()
    
    try:
        user_uuid = uuid.UUID(current_account_id) if isinstance(current_account_id, str) else current_account_id
        account = db.session.get(Account, user_uuid)
    except Exception as e:
        print(f"DEBUG: Student Identity Error: {e}")
        return jsonify({"msg": "Invalid identity format", "error": str(e)}), 401

    if not account or not account.student:
        return jsonify({"msg": "Không tìm thấy hồ sơ sinh viên tương ứng với tài khoản"}), 404

    student = account.student
    
    p_info = student.personal_info
    contact = student.contact
    enrollment = student.enrollment
    
    response_data = {
        "student_id": student.student_id,
        "email": account.username, 
        
        "personal_info": {
            "first_name": p_info.first_name if p_info else "",
            "last_name": p_info.last_name if p_info else "",
            "date_of_birth": p_info.date_of_birth.strftime('%Y-%m-%d') if p_info and p_info.date_of_birth else None,
            "gender": p_info.gender if p_info else "",
            "national_id": p_info.national_id_number if p_info else "",
            "class_name": p_info.class_name if p_info else "",
            "academic_status": p_info.academic_status if p_info else "",
            "is_locked": p_info.is_locked if p_info else False,
        },
        
        "contact_info": {
            "phone": contact.phone if contact else "",
            "email_personal": contact.personal_email if contact else "",
            "email_edu": contact.edu_email if contact else "",
            "address": contact.contact_address if contact else ""
        },
        
        "enrollment_info": {
            "major": enrollment.major.name if (enrollment and enrollment.major) else "",
            "major_code": enrollment.major.code if (enrollment and enrollment.major) else "",
            "cohort": enrollment.cohort.name if (enrollment and enrollment.cohort) else "",
            "curriculum": enrollment.curriculum.name if (enrollment and enrollment.curriculum) else ""
        }
    }

    return jsonify(response_data), 200

@bp_student_portal.route("/profile", methods=["PUT"])
@jwt_required()
def update_student_profile():
    import uuid
    current_account_id = get_jwt_identity()
    try:
        user_uuid = uuid.UUID(current_account_id) if isinstance(current_account_id, str) else current_account_id
        account = db.session.get(Account, user_uuid)
    except:
        return jsonify({"msg": "Invalid identity"}), 401

    if not account or not account.student:
        return jsonify({"msg": "Unauthorized"}), 401

    student = account.student
    contact = student.contact
    
    if not contact:
        from app.models.student_contact_model import StudentContact
        contact = StudentContact(id=student.id) 
        db.session.add(contact)
    
    data = request.get_json()
    
    if "phone" in data:
        contact.phone = data["phone"]
    if "email_personal" in data:
        contact.personal_email = data["email_personal"]
    if "address" in data:
        contact.contact_address = data["address"]
    if "permanent_address" in data:
        contact.permanent_address = data["permanent_address"]
        
    from app.models.student_personal_info_model import StudentPersonalInfo
    p_info = None
    
    for obj in db.session:
        if hasattr(obj, 'id') and str(obj.id) == str(student.id): 
             if obj.__class__.__name__ == 'StudentPersonalInfo':
                 p_info = obj
                 break
            
    if not p_info:
        p_info = db.session.get(StudentPersonalInfo, student.id)
        
    if not p_info:
        from app.models.enums import AcademicStatus
        p_info = StudentPersonalInfo(
            id=student.id,
            academic_status=AcademicStatus.STUDYING
        )
        db.session.add(p_info)

    if p_info.is_locked:
        return jsonify({"msg": "Hồ sơ đã bị khóa, vui lòng liên hệ phòng QLĐT để mở khóa"}), 403

    if "first_name" in data:
        p_info.first_name = data["first_name"]
    if "last_name" in data:
        p_info.last_name = data["last_name"]
    if "gender" in data:
        p_info.gender = data["gender"]
    if "national_id" in data:
        p_info.national_id_number = data["national_id"]
    if "ethnicity" in data:
        p_info.ethnicity = data["ethnicity"]
    if "religion" in data:
        p_info.religion = data["religion"]
        
    if "date_of_birth" in data and data["date_of_birth"]:
        try:
            from datetime import datetime
            p_info.date_of_birth = datetime.strptime(data["date_of_birth"], "%Y-%m-%d").date()
        except ValueError:
            return jsonify({"msg": "Invalid date format. Use YYYY-MM-DD"}), 400
            
    p_info.is_locked = True
    db.session.commit()
    return jsonify({"msg": "Hồ sơ đã được cập nhật và khóa thành công"}), 200

@bp_student_portal.route("/grades", methods=["GET"])
@jwt_required()
def get_student_grades():
    import uuid
    current_account_id = get_jwt_identity()
    try:
        user_uuid = uuid.UUID(current_account_id) if isinstance(current_account_id, str) else current_account_id
        account = db.session.get(Account, user_uuid)
    except:
        return jsonify({"msg": "Invalid identity"}), 401

    if not account or not account.student:
        return jsonify({"msg": "Student not found"}), 404

    student = account.student
    grades = Grade.query.filter_by(student_id=student.id).all()
    
    results = []
    for g in grades:
        results.append({
            "grade_id": str(g.id),
            "class_id": str(g.course_class_id),
            "class_name": g.course_class.name if g.course_class else "Unknown",
            "subject_name": g.course_class.subject.name if (g.course_class and g.course_class.subject) else "Unknown",
            "credits": g.course_class.subject.credits if (g.course_class and g.course_class.subject) else 0,
            "scores": {
                "regular": g.regular_score,
                "midterm": g.midterm_score,
                "final": g.final_score,
                "total": g.total_score
            },
            "status": g.status,
            "onchain_hash": g.onchain_hash
        })
        
    return jsonify(results), 200

@bp_student_portal.route("/grades/<grade_id>/review", methods=["POST"])
@jwt_required()
def request_grade_review(grade_id):
    import uuid
    current_account_id = get_jwt_identity()
    try:
        user_uuid = uuid.UUID(current_account_id) if isinstance(current_account_id, str) else current_account_id
        account = db.session.get(Account, user_uuid)
    except:
        return jsonify({"msg": "Invalid identity"}), 401

    if not account or not account.student:
        return jsonify({"msg": "Student not found"}), 404

    import uuid
    if not isinstance(grade_id, uuid.UUID):
        try: grade_id = uuid.UUID(grade_id)
        except: return jsonify({"msg": "Invalid ID"}), 400

    grade = Grade.query.filter_by(id=grade_id, student_id=account.student.id).first()
    if not grade:
        return jsonify({"msg": "Grade not found or unauthorized"}), 404

    data = request.json
    reason = data.get("reason", "")
    
    # In a real app we'd save this reason to a Review table
    grade.status = "REVIEW_REQUESTED"
    db.session.commit()
    
    return jsonify({
        "msg": "Review requested",
        "status": grade.status,
        "reason": reason
    }), 200

# ==================== COURSE REGISTRATION ====================

@bp_student_portal.route("/available-classes", methods=["GET"])
@jwt_required()
def get_available_classes():
    """Lấy danh sách tất cả lớp học phần để đăng ký"""
    import uuid
    from app.models.course_models import CourseClass
    current_account_id = get_jwt_identity()
    try:
        user_uuid = uuid.UUID(current_account_id) if isinstance(current_account_id, str) else current_account_id
        account = db.session.get(Account, user_uuid)
    except:
        return jsonify({"msg": "Invalid identity"}), 401

    if not account or not account.student:
        return jsonify({"msg": "Student not found"}), 404

    student = account.student
    # IDs of classes student already enrolled in
    enrolled_class_ids = set(
        str(g.course_class_id) for g in Grade.query.filter_by(student_id=student.id).all()
    )

    classes = CourseClass.query.all()
    results = []
    for c in classes:
        results.append({
            "id": str(c.id),
            "code": c.class_code,
            "name": c.name,
            "subject": c.subject.name if c.subject else "Unknown",
            "credits": c.subject.credits if c.subject else 0,
            "semester": c.semester.code if c.semester else "Unknown",
            "lecturer": c.lecturer.full_name if c.lecturer else "Chưa phân công",
            "enrolled": str(c.id) in enrolled_class_ids,
            "student_count": len(c.grades)
        })
    return jsonify(results), 200

@bp_student_portal.route("/enroll/<class_id>", methods=["POST"])
@jwt_required()
def enroll_class(class_id):
    """Đăng ký học phần"""
    import uuid
    from app.models.course_models import CourseClass
    current_account_id = get_jwt_identity()
    try:
        user_uuid = uuid.UUID(current_account_id) if isinstance(current_account_id, str) else current_account_id
        account = db.session.get(Account, user_uuid)
    except:
        return jsonify({"msg": "Invalid identity"}), 401

    if not account or not account.student:
        return jsonify({"msg": "Student not found"}), 404

    student = account.student
    
    try:
        class_uuid = uuid.UUID(class_id)
    except:
        return jsonify({"msg": "Invalid class ID"}), 400

    course_class = CourseClass.query.get(class_uuid)
    if not course_class:
        return jsonify({"msg": "Lớp học phần không tồn tại"}), 404

    # Check if already enrolled
    existing = Grade.query.filter_by(
        student_id=student.id, 
        course_class_id=class_uuid
    ).first()
    if existing:
        return jsonify({"msg": "Đã đăng ký lớp học phần này rồi"}), 400

    new_grade = Grade(student_id=student.id, course_class_id=class_uuid, status="ENROLLED")
    db.session.add(new_grade)
    db.session.commit()
    return jsonify({"msg": "Đăng ký học phần thành công!"}), 201

@bp_student_portal.route("/enroll/<class_id>", methods=["DELETE"])
@jwt_required()
def drop_class(class_id):
    """Hủy đăng ký học phần"""
    import uuid
    current_account_id = get_jwt_identity()
    try:
        user_uuid = uuid.UUID(current_account_id) if isinstance(current_account_id, str) else current_account_id
        account = db.session.get(Account, user_uuid)
    except:
        return jsonify({"msg": "Invalid identity"}), 401

    if not account or not account.student:
        return jsonify({"msg": "Student not found"}), 404

    student = account.student
    try:
        class_uuid = uuid.UUID(class_id)
    except:
        return jsonify({"msg": "Invalid class ID"}), 400

    grade = Grade.query.filter_by(student_id=student.id, course_class_id=class_uuid).first()
    if not grade:
        return jsonify({"msg": "Chưa đăng ký lớp học phần này"}), 404

    db.session.delete(grade)
    db.session.commit()
    return jsonify({"msg": "Hủy đăng ký thành công"}), 200
