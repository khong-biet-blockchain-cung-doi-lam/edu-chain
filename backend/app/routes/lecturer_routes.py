from flask import Blueprint, request, jsonify, render_template
from app.extensions import db
from app.models.course_models import CourseClass, Grade, Subject
from app.models.student_model import Student
from app.models.staff_models import Lecturer
from app.models.account_model import Account
from flask_jwt_extended import jwt_required, get_jwt_identity

bp_lecturer = Blueprint("lecturer", __name__, url_prefix="/api/lecturer")

def get_current_lecturer():
    import uuid
    current_user_id = get_jwt_identity()
    if not current_user_id:
        return None
    try:
        user_uuid = uuid.UUID(current_user_id) if isinstance(current_user_id, str) else current_user_id
        account = db.session.get(Account, user_uuid)
    except:
        return None
        
    if not account:
        return None
    return account.lecturer_profile 

@bp_lecturer.route("/classes", methods=["GET"])
@jwt_required()
def get_assigned_classes():
    lecturer = get_current_lecturer()
    if not lecturer:
        return jsonify({"msg": "Lecturer profile not found"}), 404

    classes = CourseClass.query.filter_by(lecturer_id=lecturer.id).all()
    
    result = []
    for c in classes:
        result.append({
            "id": c.id,
            "code": c.class_code,
            "name": c.name,
            "subject": c.subject.name if c.subject else "Unknown",
            "semester": c.semester.code if c.semester else "Unknown"
        })
    
    return jsonify(result), 200

@bp_lecturer.route("/classes/<class_id>", methods=["GET"])
@jwt_required()
def get_class_details(class_id):
    lecturer = get_current_lecturer()
    if not lecturer:
         return jsonify({"msg": "Unauthorized"}), 401

    import uuid
    try:
        class_uuid = uuid.UUID(class_id) if isinstance(class_id, str) else class_id
        course_class = db.session.get(CourseClass, class_uuid)
    except:
        return jsonify({"msg": "Invalid class ID"}), 400

    if not course_class:
        return jsonify({"msg": "Class not found"}), 404
        
    if course_class.lecturer_id != lecturer.id:
        return jsonify({"msg": "Access denied"}), 403

    # Check if whole class is finalized or pending
    is_class_pending = any(g.is_pending_review for g in course_class.grades)
    is_class_finalized = all(g.is_finalized for g in course_class.grades) if course_class.grades else False

    grade_records = Grade.query.filter_by(course_class_id=class_uuid).all()
    
    students_list = []
    for g in grade_records:
        s = g.student
        if s:
            full_name = "Unknown"
            if s.personal_info:
                 full_name = f"{s.personal_info.last_name} {s.personal_info.first_name}"
            
            students_list.append({
                "student_id": s.student_id,
                "full_name": full_name,
                "grade_id": g.id,
                "scores": {
                    "regular": g.regular_score,
                    "midterm": g.midterm_score,
                    "final": g.final_score,
                    "total": g.total_score
                },
                "status": g.status
            })
            
    return jsonify({
        "class_info": {
            "id": str(course_class.id),
            "name": course_class.name,
            "code": course_class.class_code,
            "subject": course_class.subject.name,
            "is_pending_review": is_class_pending,
            "is_finalized": is_class_finalized
        },
        "students": students_list
    }), 200

@bp_lecturer.route("/grades", methods=["POST"])
@jwt_required()
def update_grade():
    lecturer = get_current_lecturer()
    if not lecturer:
         return jsonify({"msg": "Unauthorized"}), 401
         
    data = request.get_json()
    grade_id = data.get("grade_id")
    scores = data.get("scores", {})
    
    import uuid
    try:
        grade_uuid = uuid.UUID(grade_id) if isinstance(grade_id, str) else grade_id
        grade = db.session.get(Grade, grade_uuid)
    except:
        return jsonify({"msg": "Invalid grade ID"}), 400

    if not grade:
        return jsonify({"msg": "Grade record not found"}), 404
        
    if grade.course_class.lecturer_id != lecturer.id:
        return jsonify({"msg": "Access denied"}), 403

    if grade.is_finalized or grade.is_pending_review:
        return jsonify({"msg": "Grade is locked (pending review or finalized)"}), 403

    if "regular" in scores:
        grade.regular_score = scores["regular"]
    if "midterm" in scores:
        grade.midterm_score = scores["midterm"]
    if "final" in scores:
        grade.final_score = scores["final"]
        
    if grade.regular_score is not None and grade.midterm_score is not None and grade.final_score is not None:
         grade.total_score = (grade.regular_score * 0.1) + (grade.midterm_score * 0.4) + (grade.final_score * 0.5)
         grade.status = "PASSED" if grade.total_score >= 4.0 else "FAILED"
    
    db.session.commit()
    
    return jsonify({
        "msg": "Grade updated", 
        "status": grade.status, 
        "total": grade.total_score,
        "review_notes": grade.review_notes
    }), 200

@bp_lecturer.route("/classes/<class_id>/request-review", methods=["POST"])
@jwt_required()
def request_class_review(class_id):
    lecturer = get_current_lecturer()
    if not lecturer:
         return jsonify({"msg": "Unauthorized"}), 401

    import uuid
    try:
        class_uuid = uuid.UUID(class_id) if isinstance(class_id, str) else class_id
        course_class = db.session.get(CourseClass, class_uuid)
    except:
        return jsonify({"msg": "Invalid class ID"}), 400

    if not course_class:
        return jsonify({"msg": "Class not found"}), 404

    if course_class.lecturer_id != lecturer.id:
        return jsonify({"msg": "Access denied"}), 403

    # Mark all grades in this class as pending review
    for grade in course_class.grades:
        if not grade.is_finalized:
            grade.is_pending_review = True
            grade.status = "Chờ xét duyệt"

    db.session.commit()
    return jsonify({"msg": "Đã gửi yêu cầu xét duyệt cho toàn bộ lớp học"}), 200

@bp_lecturer.route("/profile", methods=["GET"])
@jwt_required()
def get_profile():
    lecturer = get_current_lecturer()
    if not lecturer:
         return jsonify({"msg": "Unauthorized"}), 401

    account = lecturer.account
    
    return jsonify({
        "lecturer_code": lecturer.lecturer_code,
        "full_name": lecturer.full_name,
        "email": account.email,
        "username": account.username
    }), 200

@bp_lecturer.route("/profile", methods=["PUT"])
@jwt_required()
def update_profile():
    lecturer = get_current_lecturer()
    if not lecturer:
         return jsonify({"msg": "Unauthorized"}), 401

    data = request.get_json()
    
    # Update Lecturer specifics
    if "full_name" in data:
        lecturer.full_name = data["full_name"]
        
    # Update Account email if provided
    if "email" in data:
        lecturer.account.email = data["email"]

    db.session.commit()
    
    return jsonify({"msg": "Profile updated successfully"}), 200

@bp_lecturer.route("/dashboard", methods=["GET"])
def dashboard():
    return render_template("lecturer/dashboard.html")

# ==================== CLASS ASSIGNMENT ====================

@bp_lecturer.route("/available-classes", methods=["GET"])
@jwt_required()
def get_available_classes():
    """Lấy danh sách các lớp học phần chưa có giảng viên"""
    lecturer = get_current_lecturer()
    if not lecturer:
        return jsonify({"msg": "Unauthorized"}), 401

    # Get all unassigned classes
    unassigned = CourseClass.query.filter(CourseClass.lecturer_id == None).all()
    # Also get classes assigned to THIS lecturer (so they can see their claimed ones)
    my_classes = CourseClass.query.filter_by(lecturer_id=lecturer.id).all()

    results = []
    for c in unassigned:
        results.append({
            "id": str(c.id),
            "code": c.class_code,
            "name": c.name,
            "subject": c.subject.name if c.subject else "Unknown",
            "credits": c.subject.credits if c.subject else 0,
            "semester": c.semester.code if c.semester else "Unknown",
            "student_count": len(c.grades),
            "claimed": False
        })
    for c in my_classes:
        results.append({
            "id": str(c.id),
            "code": c.class_code,
            "name": c.name,
            "subject": c.subject.name if c.subject else "Unknown",
            "credits": c.subject.credits if c.subject else 0,
            "semester": c.semester.code if c.semester else "Unknown",
            "student_count": len(c.grades),
            "claimed": True
        })

    return jsonify(results), 200

@bp_lecturer.route("/claim-class/<class_id>", methods=["POST"])
@jwt_required()
def claim_class(class_id):
    """Giảng viên nhận lớp học phần"""
    import uuid as _uuid
    lecturer = get_current_lecturer()
    if not lecturer:
        return jsonify({"msg": "Unauthorized"}), 401

    try:
        class_uuid = _uuid.UUID(class_id)
    except:
        return jsonify({"msg": "Invalid class ID"}), 400

    course_class = db.session.get(CourseClass, class_uuid)
    if not course_class:
        return jsonify({"msg": "Lớp học phần không tồn tại"}), 404

    if course_class.lecturer_id and course_class.lecturer_id != lecturer.id:
        return jsonify({"msg": "Lớp học phần này đã có giảng viên khác đảm nhận"}), 400

    course_class.lecturer_id = lecturer.id
    db.session.commit()
    return jsonify({"msg": "Nhận lớp học phần thành công!"}), 200

@bp_lecturer.route("/claim-class/<class_id>", methods=["DELETE"])
@jwt_required()
def release_class(class_id):
    """Giảng viên trả lại lớp học phần"""
    import uuid as _uuid
    lecturer = get_current_lecturer()
    if not lecturer:
        return jsonify({"msg": "Unauthorized"}), 401

    try:
        class_uuid = _uuid.UUID(class_id)
    except:
        return jsonify({"msg": "Invalid class ID"}), 400

    course_class = db.session.get(CourseClass, class_uuid)
    if not course_class or course_class.lecturer_id != lecturer.id:
        return jsonify({"msg": "Không có quyền với lớp này"}), 403

    course_class.lecturer_id = None
    db.session.commit()
    return jsonify({"msg": "Đã trả lại lớp học phần"}), 200
