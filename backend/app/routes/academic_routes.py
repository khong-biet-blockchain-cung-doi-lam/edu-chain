from flask import Blueprint, request, jsonify, current_app
from app.extensions import db
from app.models.course_models import Subject, Semester, CourseClass
from app.models.staff_models import Lecturer
from flask_jwt_extended import jwt_required

bp_academic = Blueprint("academic", __name__, url_prefix="/api/academic")

# 1. Add Subject
@bp_academic.route("/subjects", methods=["POST"])
# @jwt_required() # Uncomment when auth is fully set up
def add_subject():
    data = request.get_json()
    code = data.get("subject_code")
    name = data.get("name")
    credits = data.get("credits")
    
    if not code or not name or credits is None:
        return jsonify({"msg": "Missing required fields (subject_code, name, credits)"}), 400

    existing = Subject.query.filter_by(subject_code=code).first()
    if existing:
        return jsonify({"msg": "Subject code already exists"}), 400

    new_subject = Subject(subject_code=code, name=name, credits=credits)
    db.session.add(new_subject)
    db.session.commit()
    
    return jsonify({"msg": "Subject created", "id": new_subject.id}), 201

# 2. Add Semester
@bp_academic.route("/semesters", methods=["POST"])
def add_semester():
    data = request.get_json()
    code = data.get("code")
    name = data.get("name")
    
    if not code or not name:
        return jsonify({"msg": "Missing code or name"}), 400

    new_sem = Semester(code=code, name=name)
    db.session.add(new_sem)
    db.session.commit()
    
    return jsonify({"msg": "Semester created", "id": new_sem.id}), 201

# 3. Add Course Class + Schedule (Basic)
@bp_academic.route("/classes", methods=["POST"])
def add_course_class():
    data = request.get_json()
    class_code = data.get("class_code")
    name = data.get("name")
    subject_id = data.get("subject_id")
    semester_id = data.get("semester_id")
    
    if not class_code or not name or not subject_id or not semester_id:
        return jsonify({"msg": "Missing required fields"}), 400
        
    # Check FKs
    if not Subject.query.get(subject_id):
        return jsonify({"msg": "Subject not found"}), 404
    if not Semester.query.get(semester_id):
        return jsonify({"msg": "Semester not found"}), 404

    new_class = CourseClass(
        class_code=class_code,
        name=name,
        subject_id=subject_id,
        semester_id=semester_id
    )
    db.session.add(new_class)
    db.session.commit()
    
    return jsonify({"msg": "Class created", "id": new_class.id}), 201

# 4. Assign Lecturer to Class
@bp_academic.route("/classes/<class_id>/assign", methods=["POST"])
def assign_lecturer(class_id):
    data = request.get_json()
    lecturer_id = data.get("lecturer_id")
    
    course_class = CourseClass.query.get(class_id)
    if not course_class:
        return jsonify({"msg": "Class not found"}), 404
        
    lecturer = Lecturer.query.get(lecturer_id)
    if not lecturer:
        return jsonify({"msg": "Lecturer not found"}), 404
        
    course_class.lecturer_id = lecturer_id
    db.session.commit()
    
    return jsonify({"msg": "Lecturer assigned successfully"}), 200
