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
    current_account_id = get_jwt_identity()
    
    account = Account.query.get(current_account_id)
    if not account or not account.student:
        return jsonify({"msg": "Không tìm thấy thông tin sinh viên"}), 404

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
    current_account_id = get_jwt_identity()
    account = Account.query.get(current_account_id)
    if not account or not account.student:
        return jsonify({"msg": "Unauthorized"}), 401

    student = account.student
    contact = student.contact
    
    if not contact:
        from app.models.student_contact_model import StudentContact
        contact = StudentContact(id=student.id, personal_email=account.username) 
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
            
    db.session.commit()
    return jsonify({"msg": "Profile updated successfully"}), 200

@bp_student_portal.route("/grades", methods=["GET"])
@jwt_required()
def get_student_grades():
    current_account_id = get_jwt_identity()
    account = Account.query.get(current_account_id)
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
    current_account_id = get_jwt_identity()
    account = Account.query.get(current_account_id)
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
