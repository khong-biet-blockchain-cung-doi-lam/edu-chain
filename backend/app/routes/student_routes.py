from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.services.student_service import StudentService
from app.services.grade_service import GradeService
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
    account_id = get_jwt_identity()
    data, error = StudentService.get_profile(account_id)
    if error:
        return jsonify({"msg": error}), 404
    return jsonify(data), 200

@bp_student_portal.route("/profile", methods=["PUT"])
@jwt_required()
def update_student_profile():
    account_id = get_jwt_identity()
    data = request.get_json()
    success, error = StudentService.update_profile(account_id, data)
    if error:
        code = 403 if "bị khóa" in error else 400
        return jsonify({"msg": error}), code
    return jsonify({"msg": "Hồ sơ đã được cập nhật và khóa thành công"}), 200

@bp_student_portal.route("/grades", methods=["GET"])
@jwt_required()
def get_student_grades():
    from app.models.account_model import Account
    from app.extensions import db
    import uuid
    
    account_id = get_jwt_identity()
    acc = db.session.get(Account, uuid.UUID(account_id))
    if not acc or not acc.student:
        return jsonify({"msg": "Student not found"}), 404
        
    results = GradeService.get_student_grades(acc.student.id)
    return jsonify(results), 200

@bp_student_portal.route("/grades/<grade_id>/review", methods=["POST"])
@jwt_required()
def request_grade_review(grade_id):
                                                                          
    from app.models.course_models import Grade
    from app.extensions import db
    import uuid
    
    account_id = get_jwt_identity()
    grade = Grade.query.filter_by(id=uuid.UUID(grade_id)).first()
    if not grade:
        return jsonify({"msg": "Grade not found"}), 404
        
    data = request.json
    reason = data.get("reason", "")
    grade.status = "REVIEW_REQUESTED"
    db.session.commit()
    
    return jsonify({"msg": "Review requested", "status": grade.status}), 200

@bp_student_portal.route("/available-classes", methods=["GET"])
@jwt_required()
def get_available_classes():
    from app.models.course_models import CourseClass, Grade
    from app.models.account_model import Account
    from app.extensions import db
    import uuid
    
    account_id = get_jwt_identity()
    acc = db.session.get(Account, uuid.UUID(account_id))
    if not acc or not acc.student:
        return jsonify({"msg": "Student not found"}), 404

    enrolled_class_ids = set(
        str(g.course_class_id) for g in Grade.query.filter_by(student_id=acc.student.id).all()
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
    account_id = get_jwt_identity()
    success, error = StudentService.enroll_class(account_id, class_id)
    if error:
        return jsonify({"msg": error}), 400
    return jsonify({"msg": "Đăng ký học phần thành công!"}), 201

@bp_student_portal.route("/enroll/<class_id>", methods=["DELETE"])
@jwt_required()
def drop_class(class_id):
    account_id = get_jwt_identity()
    success, error = StudentService.drop_class(account_id, class_id)
    if error:
        return jsonify({"msg": error}), 400
    return jsonify({"msg": "Hủy đăng ký thành công"}), 200
