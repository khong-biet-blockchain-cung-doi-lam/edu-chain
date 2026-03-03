from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from app.extensions import db
from app.models.course_models import Grade, CourseClass
from app.models.student_model import Student
from app.models.enums import Role
from app.decorators import role_required
from app.services.grade_service import GradeService
import uuid

bp_khao_thi = Blueprint("khao_thi", __name__, url_prefix="/api/khao-thi")

@bp_khao_thi.route("/students", methods=["GET"])
@jwt_required()
@role_required(Role.KHAO_THI, Role.ADMIN)
def list_students_with_grades():
    """Xem danh sách sinh viên kèm tổng quan điểm, có thể lọc theo lớp"""
    class_id = request.args.get('class_id')
    
    if class_id:
        try:
            class_uuid = uuid.UUID(class_id)
            grades = Grade.query.filter_by(course_class_id=class_uuid).all()
            student_ids = list(set([g.student_id for g in grades]))
            students = Student.query.filter(Student.id.in_(student_ids)).all()
        except:
            students = []
    else:
        students = Student.query.all()

    result = []
    for s in students:
        full_name = ""
        if s.personal_info:
            pi = s.personal_info
            full_name = f"{pi.first_name or ''} {pi.last_name or ''}".strip()
        
        grade_count = Grade.query.filter_by(student_id=s.id).count()
        result.append({
            "id": str(s.id),
            "student_code": s.student_id,
            "full_name": full_name,
            "total_subjects": grade_count,
        })
    return jsonify({"students": result, "total": len(result)}), 200

@bp_khao_thi.route("/grades/<student_id>", methods=["GET"])
@jwt_required()
@role_required(Role.KHAO_THI, Role.ADMIN)
def get_student_grades_view(student_id):
    """Xem điểm chi tiết của 1 sinh viên"""
    try:
        student_uuid = uuid.UUID(student_id)
    except:
        return jsonify({"msg": "ID không hợp lệ"}), 400

    student = Student.query.get(student_uuid)
    if not student:
        return jsonify({"msg": "Không tìm thấy sinh viên"}), 404

    full_name = ""
    if student.personal_info:
        pi = student.personal_info
        full_name = f"{pi.first_name or ''} {pi.last_name or ''}".strip()

    grades_list = GradeService.get_student_grades(student_uuid)

    return jsonify({
        "student_id": str(student.id),
        "student_code": student.student_id,
        "full_name": full_name,
        "grades": grades_list,
    }), 200

@bp_khao_thi.route("/classes", methods=["GET"])
@jwt_required()
@role_required(Role.KHAO_THI, Role.ADMIN)
def get_classes():
    """Lấy danh sách các lớp học kèm theo thống kê trạng thái điểm"""
    classes = CourseClass.query.all()
    classes_list = []
    
    for c in classes:
        total_students = len(c.grades)
        finalized_count = sum(1 for g in c.grades if g.is_finalized)
        pending_count = sum(1 for g in c.grades if g.is_pending_review)
        
        classes_list.append({
            "id": str(c.id),
            "name": c.name,
            "class_code": c.class_code,
            "subject": c.subject.name if c.subject else None,
            "lecturer": c.lecturer.full_name if c.lecturer else "Chưa phân công",
            "stats": {
                "total": total_students,
                "finalized": finalized_count,
                "pending": pending_count
            },
            "status": "Đã chốt" if total_students > 0 and finalized_count == total_students else ("Chờ xét duyệt" if pending_count > 0 else "Chưa chốt")
        })
        
    return jsonify(classes_list), 200

@bp_khao_thi.route("/grades/<grade_id>/notes", methods=["PATCH"])
@jwt_required()
@role_required(Role.KHAO_THI, Role.ADMIN)
def update_grade_notes(grade_id):
    try:
        grade_uuid = uuid.UUID(grade_id)
    except:
        return jsonify({"msg": "ID không hợp lệ"}), 400

    data = request.get_json()
    notes = data.get("notes")
    
    grade = db.session.get(Grade, grade_uuid)
    if not grade:
        return jsonify({"msg": "Không tìm thấy bản ghi điểm"}), 404

    grade.review_notes = notes
    db.session.commit()
    return jsonify({"msg": "Đã cập nhật chú thích thành công", "notes": notes}), 200

@bp_khao_thi.route("/grades/<grade_id>", methods=["PUT"])
@jwt_required()
@role_required(Role.KHAO_THI, Role.ADMIN)
def update_grade(grade_id):
    data = request.get_json()
    scores = {}
    if "regular_score" in data: scores["regular"] = data["regular_score"]
    if "midterm_score" in data: scores["midterm"] = data["midterm_score"]
    if "final_score" in data: scores["final"] = data["final_score"]
    if "total_score" in data: scores["total"] = data["total_score"]
    if "status" in data: scores["status"] = data["status"]

    grade, error = GradeService.update_grade_score(grade_id, scores, caller_is_khao_thi=True)
    if error:
        return jsonify({"msg": error}), 400
    return jsonify({"msg": "Đã cập nhật điểm thành công"}), 200

@bp_khao_thi.route("/classes/<class_id>/finalize", methods=["PATCH"])
@jwt_required()
@role_required(Role.KHAO_THI, Role.ADMIN)
def finalize_class_grades(class_id):
    success, error = GradeService.finalize_grades(course_class_id=class_id)
    if error:
        return jsonify({"msg": error}), 400
    return jsonify({"msg": "Đã chốt điểm toàn bộ lớp học thành công"}), 200

@bp_khao_thi.route("/grades/<grade_id>/finalize", methods=["PATCH"])
@jwt_required()
@role_required(Role.KHAO_THI, Role.ADMIN)
def finalize_grade(grade_id):
    success, error = GradeService.finalize_grades(grade_id=grade_id)
    if error:
        return jsonify({"msg": error}), 400
    return jsonify({"msg": "Đã chốt điểm thành công"}), 200

@bp_khao_thi.route("/grades", methods=["POST"])
@jwt_required()
@role_required(Role.KHAO_THI, Role.ADMIN)
def add_grade():
    data = request.get_json()
    student_id = data.get("student_id")
    class_id   = data.get("class_id")

    if not student_id or not class_id:
        return jsonify({"msg": "Thiếu student_id hoặc class_id"}), 400

    scores = {
        "regular": data.get("regular_score"),
        "midterm": data.get("midterm_score"),
        "final": data.get("final_score"),
        "total": data.get("total_score"),
        "status": data.get("status")
    }
    
    try:
        s_uuid = uuid.UUID(student_id)
        c_uuid = uuid.UUID(class_id)
    except:
        return jsonify({"msg": "ID không hợp lệ"}), 400

    existing = Grade.query.filter_by(student_id=s_uuid, course_class_id=c_uuid).first()
    if existing:
        grade, error = GradeService.update_grade_score(existing.id, scores, caller_is_khao_thi=True)
        return jsonify({"msg": "Đã cập nhật điểm", "grade_id": str(grade.id)}), 200
    else:
        new_grade = Grade(
            student_id=s_uuid,
            course_class_id=c_uuid,
            regular_score=scores["regular"],
            midterm_score=scores["midterm"],
            final_score=scores["final"],
            total_score=scores["total"],
            status=scores["status"] or "Chưa chốt"
        )
        db.session.add(new_grade)
        db.session.commit()
        return jsonify({"msg": "Đã thêm điểm", "grade_id": str(new_grade.id)}), 201

@bp_khao_thi.route("/grades/<grade_id>", methods=["DELETE"])
@jwt_required()
@role_required(Role.KHAO_THI, Role.ADMIN)
def delete_grade(grade_id):
    try:
        grade_uuid = uuid.UUID(grade_id)
    except:
        return jsonify({"msg": "ID không hợp lệ"}), 400

    grade = db.session.get(Grade, grade_uuid)
    if not grade:
        return jsonify({"msg": "Không tìm thấy bản ghi điểm"}), 404

    db.session.delete(grade)
    db.session.commit()
    return jsonify({"msg": "Đã xóa bản ghi điểm"}), 200
