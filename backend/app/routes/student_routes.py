from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models.account_model import Account
from app.models.student_model import Student
# Import models for checks if needed, or just rely on relationships
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
    
    # Access relationships from new student_model.py
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
