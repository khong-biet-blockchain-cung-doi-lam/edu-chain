from flask import Blueprint, request, jsonify
from app.extensions import db
from app.models.course_models import CourseClass, Grade, Subject
from app.models.student_model import Student
from app.models.staff_models import Lecturer
from app.models.account_model import Account
from flask_jwt_extended import jwt_required, get_jwt_identity

bp_lecturer = Blueprint("lecturer", __name__, url_prefix="/api/lecturer")

# Helper to get current lecturer
def get_current_lecturer():
    current_user_id = get_jwt_identity()
    # Assuming the identity is Account ID
    account = Account.query.get(current_user_id)
    if not account:
        return None
    # Assuming relation is setup or we query manually
    # In staff_models.py: Lecturer.account backref is 'lecturer_profile'
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

    course_class = CourseClass.query.get(class_id)
    if not course_class:
        return jsonify({"msg": "Class not found"}), 404
        
    # Security check: Ensure this lecturer owns this class
    if course_class.lecturer_id != lecturer.id:
        return jsonify({"msg": "Access denied"}), 403

    # Get students via Grade records
    # Assuming Grade exists for every student in the class
    grade_records = Grade.query.filter_by(course_class_id=class_id).all()
    
    students_list = []
    for g in grade_records:
        s = g.student
        if s:
            # Safely access personal info if exists
            full_name = "Unknown"
            if s.personal_info:
                 full_name = f"{s.personal_info.last_name} {s.personal_info.first_name}"
            
            students_list.append({
                "student_id": s.student_id,
                "full_name": full_name, # Need to join with personal_info properly in prod
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
            "id": course_class.id,
            "name": course_class.name,
            "code": course_class.class_code,
            "subject": course_class.subject.name
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
    scores = data.get("scores", {}) # { "regular": 10, ... }
    
    grade = Grade.query.get(grade_id)
    if not grade:
        return jsonify({"msg": "Grade record not found"}), 404
        
    # Check ownership
    if grade.course_class.lecturer_id != lecturer.id:
        return jsonify({"msg": "Access denied"}), 403

    # Update scores
    if "regular" in scores:
        grade.regular_score = scores["regular"]
    if "midterm" in scores:
        grade.midterm_score = scores["midterm"]
    if "final" in scores:
        grade.final_score = scores["final"]
        
    # Calc total (Sample formula: 20% reg + 30% mid + 50% final)
    # Or just let user pass total. For now, let's auto-calc if all present
    # This logic should be in a Service preferably
    if grade.regular_score is not None and grade.midterm_score is not None and grade.final_score is not None:
         grade.total_score = (grade.regular_score * 0.1) + (grade.midterm_score * 0.4) + (grade.final_score * 0.5)
         grade.status = "PASSED" if grade.total_score >= 4.0 else "FAILED"
    
    db.session.commit()
    
    return jsonify({"msg": "Grade updated", "status": grade.status, "total": grade.total_score}), 200
