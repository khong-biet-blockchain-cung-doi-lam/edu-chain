from flask import Blueprint, request, jsonify
from app.extensions import db
from app.models.course_models import Subject, Semester, CourseClass
from app.models.staff_models import Lecturer
from app.models.account_model import Account
from app.models.student_model import Student
from app.models.student_personal_info_model import StudentPersonalInfo
from app.models.enums import Role
from app.decorators import staff_required
import bcrypt

bp_academic = Blueprint("academic", __name__, url_prefix="/api/academic")

@bp_academic.route("/subjects", methods=["POST"])
@staff_required(required_role_code=Role.QL_DAO_TAO)
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

@bp_academic.route("/semesters", methods=["POST"])
@staff_required(required_role_code=Role.QL_DAO_TAO)
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

@bp_academic.route("/classes", methods=["POST"])
@staff_required(required_role_code=Role.QL_DAO_TAO)
def add_course_class():
    data = request.get_json()
    class_code = data.get("class_code")
    name = data.get("name")
    subject_id = data.get("subject_id")
    semester_id = data.get("semester_id")
    
    if not class_code or not name or not subject_id or not semester_id:
        return jsonify({"msg": "Missing required fields"}), 400
        
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

@bp_academic.route("/classes/<class_id>/assign", methods=["POST"])
@staff_required(required_role_code=Role.QL_DAO_TAO)
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

@bp_academic.route('/students', methods=['POST'])
@staff_required(required_role_code=Role.QL_DAO_TAO)
def create_student():
    data = request.get_json()
    student_code = data.get('student_code')
    full_name = data.get('full_name')
    password = data.get('password', '123456')

    if Account.query.filter_by(login_id=student_code).first():
        return jsonify({"msg": "Student code already exists"}), 400

    try:
        hashed = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        
        new_acc = Account(login_id=student_code, password_hash=hashed, role_type='student')
        db.session.add(new_acc)
        db.session.flush()

        new_stu = Student(student_code=student_code, account_id=new_acc.id)
        db.session.add(new_stu)
        db.session.flush()
        
        if full_name:
            parts = full_name.strip().split()
            first_name = parts[-1] if parts else ""
            last_name = " ".join(parts[:-1]) if len(parts) > 1 else ""
            
            info = StudentPersonalInfo(
                id=new_stu.id,
                first_name=first_name,
                last_name=last_name,
                gender='OTHER',
                national_id_number=f"CCCD_{student_code}",
                academic_status='ENROLLED'
            )
            db.session.add(info)
        
        db.session.commit()
        return jsonify({"msg": "Student created successfully", "id": new_stu.id}), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({"msg": str(e)}), 500
