import logging
from flask import Blueprint, request, jsonify
from app.extensions import db
from app.models.course_models import Subject, Semester, CourseClass
from app.models.staff_models import Lecturer
from app.models.account_model import Account
from app.models.student_model import Student
from app.models.student_personal_info_model import StudentPersonalInfo
from app.models.enums import Role
from app.decorators import staff_required
from app.services.wallet_service import create_custodial_wallet
from app.services.blockchain_service import BlockchainService
import bcrypt

logger = logging.getLogger(__name__)

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

@bp_academic.route("/classes", methods=["GET"])
@staff_required(required_role_code=Role.QL_DAO_TAO)
def list_classes():
    classes = CourseClass.query.all()
    results = []
    for c in classes:
        results.append({
            "id": str(c.id),
            "class_code": c.class_code,
            "name": c.name,
            "subject": {"id": str(c.subject.id), "name": c.subject.name} if c.subject else None,
            "semester": {"id": str(c.semester.id), "code": c.semester.code} if c.semester else None,
            "lecturer": {"id": str(c.lecturer.id), "name": c.lecturer.account.username} if c.lecturer else None
        })
    return jsonify(results), 200

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

        wallet_address, encrypted_pk = create_custodial_wallet()

        new_acc = Account(
            login_id=student_code,
            password_hash=hashed,
            role_type='student',
            wallet_address=wallet_address,
            encrypted_private_key=encrypted_pk,
        )
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

        try:
            BlockchainService().grant_role(wallet_address, "SINH_VIEN")
        except Exception as bc_err:
            logger.warning("Blockchain grant_role failed for %s: %s", wallet_address, bc_err)

        return jsonify({
            "msg": "Student created successfully",
            "id": new_stu.id,
            "wallet_address": wallet_address,
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({"msg": str(e)}), 500

@bp_academic.route("/subjects", methods=["GET"])
@staff_required(required_role_code=Role.QL_DAO_TAO)
def list_subjects():
    subjects = Subject.query.all()
    results = [{"id": str(s.id), "subject_code": s.subject_code, "name": s.name, "credits": s.credits} for s in subjects]
    return jsonify(results), 200

@bp_academic.route("/subjects/<subject_id>", methods=["GET"])
@staff_required(required_role_code=Role.QL_DAO_TAO)
def get_subject(subject_id):
    if not isinstance(subject_id, uuid.UUID):
        try: subject_id = uuid.UUID(subject_id)
        except: return jsonify({"msg": "Invalid ID"}), 400
    s = Subject.query.get(subject_id)
    if not s: return jsonify({"msg": "Not found"}), 404
    return jsonify({"id": str(s.id), "subject_code": s.subject_code, "name": s.name, "credits": s.credits}), 200

@bp_academic.route("/subjects/<subject_id>", methods=["PUT"])
@staff_required(required_role_code=Role.QL_DAO_TAO)
def update_subject(subject_id):
    if not isinstance(subject_id, uuid.UUID):
        try: subject_id = uuid.UUID(subject_id)
        except: return jsonify({"msg": "Invalid ID"}), 400
    s = Subject.query.get(subject_id)
    if not s: return jsonify({"msg": "Not found"}), 404
    
    data = request.json
    if "subject_code" in data: s.subject_code = data["subject_code"]
    if "name" in data: s.name = data["name"]
    if "credits" in data: s.credits = data["credits"]
    
    db.session.commit()
    return jsonify({"msg": "Updated"}), 200

@bp_academic.route("/subjects/<subject_id>", methods=["DELETE"])
@staff_required(required_role_code=Role.QL_DAO_TAO)
def delete_subject(subject_id):
    if not isinstance(subject_id, uuid.UUID):
        try: subject_id = uuid.UUID(subject_id)
        except: return jsonify({"msg": "Invalid ID"}), 400
    s = Subject.query.get(subject_id)
    if not s: return jsonify({"msg": "Not found"}), 404
    db.session.delete(s)
    db.session.commit()
    return jsonify({"msg": "Deleted"}), 200

@bp_academic.route("/subjects/statistics", methods=["GET"])
@staff_required(required_role_code=Role.QL_DAO_TAO)
def get_subject_statistics():
    total = Subject.query.count()
    return jsonify({"total": total}), 200

@bp_academic.route("/subjects/department/<dept>", methods=["GET"])
@staff_required(required_role_code=Role.QL_DAO_TAO)
def get_subjects_by_department(dept):
                                                             
    subjects = Subject.query.all()
    results = [{"id": str(s.id), "subject_code": s.subject_code, "name": s.name, "credits": s.credits} for s in subjects]
    return jsonify(results), 200

from app.models.academic_models import Major

@bp_academic.route("/programs", methods=["GET"])
@staff_required(required_role_code=Role.QL_DAO_TAO)
def list_programs():
    majors = Major.query.all()
    results = [{"id": str(m.id), "code": m.code, "name": m.name} for m in majors]
    return jsonify(results), 200

@bp_academic.route("/programs/<program_id>", methods=["GET"])
@staff_required(required_role_code=Role.QL_DAO_TAO)
def get_program(program_id):
    if not isinstance(program_id, uuid.UUID):
        try: program_id = uuid.UUID(program_id)
        except: return jsonify({"msg": "Invalid ID"}), 400
    m = Major.query.get(program_id)
    if not m: return jsonify({"msg": "Not found"}), 404
    return jsonify({"id": str(m.id), "code": m.code, "name": m.name}), 200

@bp_academic.route("/programs", methods=["POST"])
@staff_required(required_role_code=Role.QL_DAO_TAO)
def create_program():
    data = request.json
    code = data.get("code")
    name = data.get("name")
    if not code or not name:
        return jsonify({"msg": "Missing code or name"}), 400
        
    m = Major(code=code, name=name)
    db.session.add(m)
    db.session.commit()
    return jsonify({"msg": "Created", "id": m.id}), 201

@bp_academic.route("/programs/<program_id>", methods=["PUT"])
@staff_required(required_role_code=Role.QL_DAO_TAO)
def update_program(program_id):
    if not isinstance(program_id, uuid.UUID):
        try: program_id = uuid.UUID(program_id)
        except: return jsonify({"msg": "Invalid ID"}), 400
    m = Major.query.get(program_id)
    if not m: return jsonify({"msg": "Not found"}), 404
    
    data = request.json
    if "code" in data: m.code = data["code"]
    if "name" in data: m.name = data["name"]
    db.session.commit()
    return jsonify({"msg": "Updated"}), 200

@bp_academic.route("/programs/<program_id>", methods=["DELETE"])
@staff_required(required_role_code=Role.QL_DAO_TAO)
def delete_program(program_id):
    if not isinstance(program_id, uuid.UUID):
        try: program_id = uuid.UUID(program_id)
        except: return jsonify({"msg": "Invalid ID"}), 400
    m = Major.query.get(program_id)
    if not m: return jsonify({"msg": "Not found"}), 404
    db.session.delete(m)
    db.session.commit()
    return jsonify({"msg": "Deleted"}), 200

@bp_academic.route("/programs/statistics", methods=["GET"])
@staff_required(required_role_code=Role.QL_DAO_TAO)
def get_program_statistics():
    total = Major.query.count()
    active = total              
    return jsonify({"total": total, "active": active}), 200
