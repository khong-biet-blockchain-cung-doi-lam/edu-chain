"""
khao_thi_routes.py
API dành riêng cho Phòng Khảo thí.

Quyền hạn:
  - Xem danh sách sinh viên (chỉ tên + mã) và điểm
  - Thêm/sửa/xóa điểm (sau phúc khảo)
  - Chốt điểm (finalize = True)
  - Giảng viên vẫn nhập điểm nháp (is_finalized=False)
  - KHAO_THI mới có quyền chốt hoặc sửa chính thức
"""

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from app.extensions import db
from app.models.course_models import Grade, CourseClass, Subject
from app.models.student_model import Student
from app.models.account_model import Account
from app.models.enums import Role
from app.decorators import role_required, get_account_from_jwt
import uuid
from datetime import datetime

bp_khao_thi = Blueprint("khao_thi", __name__, url_prefix="/api/khao-thi")


# ================================================================
# GET /api/khao-thi/students — Danh sách SV (tên + mã + điểm)
# ================================================================

@bp_khao_thi.route("/students", methods=["GET"])
@jwt_required()
@role_required(Role.KHAO_THI, Role.ADMIN)
def list_students_with_grades():
    """Xem danh sách sinh viên kèm tổng quan điểm, có thể lọc theo lớp"""
    class_id = request.args.get('class_id')
    
    if class_id:
        try:
            class_uuid = uuid.UUID(class_id)
            # Lấy sinh viên có điểm trong lớp này
            grades = Grade.query.filter_by(course_class_id=class_uuid).all()
            student_ids = list(set([g.student_id for g in grades]))
            students = Student.query.filter(Student.id.in_(student_ids)).all()
        except Exception:
            students = []
    else:
        students = Student.query.all()

    result = []
    for s in students:
        full_name = ""
        if s.personal_info:
            pi = s.personal_info
            full_name = f"{pi.first_name or ''} {pi.last_name or ''}".strip()
        
        # Nếu đang lọc theo lớp, chỉ đếm điểm của lớp đó hoặc tổng? 
        # Để đơn giản, cứ đếm tổng số học phần SV đó có
        grade_count = Grade.query.filter_by(student_id=s.id).count()
        result.append({
            "id": str(s.id),
            "student_code": s.student_id,
            "full_name": full_name,
            "total_subjects": grade_count,
        })
    return jsonify({"students": result, "total": len(result)}), 200


# ================================================================
# GET /api/khao-thi/grades/<student_id> — Điểm 1 sinh viên
# ================================================================

@bp_khao_thi.route("/grades/<student_id>", methods=["GET"])
@jwt_required()
@role_required(Role.KHAO_THI, Role.ADMIN)
def get_student_grades(student_id):
    """Xem điểm chi tiết của 1 sinh viên"""
    try:
        student_uuid = uuid.UUID(student_id)
    except ValueError:
        return jsonify({"msg": "ID không hợp lệ"}), 400

    student = Student.query.get(student_uuid)
    if not student:
        return jsonify({"msg": "Không tìm thấy sinh viên"}), 404

    full_name = ""
    if student.personal_info:
        pi = student.personal_info
        full_name = f"{pi.first_name or ''} {pi.last_name or ''}".strip()

    grades = Grade.query.filter_by(student_id=student_uuid).all()
    grades_list = []
    for g in grades:
        class_info = {}
        if g.course_class:
            class_info = {
                "class_id": str(g.course_class_id),
                "class_code": g.course_class.class_code,
                "subject_name": g.course_class.subject.name if g.course_class.subject else None,
                "credits": g.course_class.subject.credits if g.course_class.subject else None,
                "semester": g.course_class.semester.code if g.course_class.semester else None,
            }
        grades_list.append({
            "grade_id": str(g.id),
            "regular_score": g.regular_score,
            "midterm_score": g.midterm_score,
            "final_score": g.final_score,
            "total_score": g.total_score,
            "status": g.status,
            "is_finalized": g.is_finalized,
            "is_pending_review": g.is_pending_review,
            "review_notes": g.review_notes,
            "class_id": str(g.course_class_id) if g.course_class_id else None,
            "class_name": g.course_class.name if g.course_class else None,
            "subject_name": g.course_class.subject.name if g.course_class and g.course_class.subject else None
        })

    return jsonify({
        "student_id": str(student.id),
        "student_code": student.student_id,
        "full_name": full_name,
        "grades": grades_list,
    }), 200


# ================================================================
# GET /api/khao-thi/classes — Lấy danh sách lớp học để quản lý
# ================================================================

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

# ================================================================
# PATCH /api/khao-thi/grades/<grade_id>/notes — Cập nhật chú thích
# ================================================================

@bp_khao_thi.route("/grades/<grade_id>/notes", methods=["PATCH"])
@jwt_required()
@role_required(Role.KHAO_THI, Role.ADMIN)
def update_grade_notes(grade_id):
    """Cập nhật chú thích/nhận xét của phòng Khảo thí cho giảng viên"""
    try:
        grade_uuid = uuid.UUID(grade_id)
    except ValueError:
        return jsonify({"msg": "ID không hợp lệ"}), 400

    data = request.get_json()
    notes = data.get("notes")
    
    grade = db.session.get(Grade, grade_uuid)
    if not grade:
        return jsonify({"msg": "Không tìm thấy bản ghi điểm"}), 404

    grade.review_notes = notes
    db.session.commit()
    
    return jsonify({"msg": "Đã cập nhật chú thích thành công", "notes": notes}), 200


# ================================================================
# PUT /api/khao-thi/grades/<grade_id> — Sửa điểm (sau phúc khảo)
# ================================================================

@bp_khao_thi.route("/grades/<grade_id>", methods=["PUT"])
@jwt_required()
@role_required(Role.KHAO_THI, Role.ADMIN)
def update_grade(grade_id):
    """
    Phòng Khảo thí sửa điểm sau phúc khảo.
    Dữ liệu: { regular_score, midterm_score, final_score, total_score, status, note }
    """
    try:
        grade_uuid = uuid.UUID(grade_id)
    except ValueError:
        return jsonify({"msg": "ID không hợp lệ"}), 400

    grade = Grade.query.get(grade_uuid)
    if not grade:
        return jsonify({"msg": "Không tìm thấy bản ghi điểm"}), 404

    data = request.get_json()

    if "regular_score" in data and data["regular_score"] is not None:
        grade.regular_score = float(data["regular_score"])
    if "midterm_score" in data and data["midterm_score"] is not None:
        grade.midterm_score = float(data["midterm_score"])
    if "final_score" in data and data["final_score"] is not None:
        grade.final_score = float(data["final_score"])
    if "total_score" in data and data["total_score"] is not None:
        grade.total_score = float(data["total_score"])
    if "status" in data:
        grade.status = data["status"]

    db.session.commit()
    return jsonify({"msg": "Đã cập nhật điểm thành công"}), 200


# ================================================================
# PATCH /api/khao-thi/classes/<class_id>/finalize — Chốt điểm cả lớp
# ================================================================

@bp_khao_thi.route("/classes/<class_id>/finalize", methods=["PATCH"])
@jwt_required()
@role_required(Role.KHAO_THI, Role.ADMIN)
def finalize_class_grades(class_id):
    """Chốt điểm chính thức cho toàn bộ lớp học"""
    try:
        class_uuid = uuid.UUID(class_id)
    except ValueError:
        return jsonify({"msg": "ID không hợp lệ"}), 400

    course_class = db.session.get(CourseClass, class_uuid)
    if not course_class:
        return jsonify({"msg": "Không tìm thấy lớp học"}), 404

    for grade in course_class.grades:
        grade.is_finalized = True
        grade.is_pending_review = False
        grade.status = "Đã chốt"

    db.session.commit()
    return jsonify({"msg": "Đã chốt điểm toàn bộ lớp học thành công"}), 200


# ================================================================
# PATCH /api/khao-thi/grades/<grade_id>/finalize — Chốt điểm lẻ
# ================================================================

@bp_khao_thi.route("/grades/<grade_id>/finalize", methods=["PATCH"])
@jwt_required()
@role_required(Role.KHAO_THI, Role.ADMIN)
def finalize_grade(grade_id):
    """Chốt điểm chính thức — chỉ KHAO_THI mới có quyền"""
    try:
        grade_uuid = uuid.UUID(grade_id)
    except ValueError:
        return jsonify({"msg": "ID không hợp lệ"}), 400

    grade = db.session.get(Grade, grade_uuid)
    if not grade:
        return jsonify({"msg": "Không tìm thấy bản ghi điểm"}), 404

    grade.is_finalized = True
    grade.is_pending_review = False
    grade.status = "Đã chốt"

    db.session.commit()
    return jsonify({"msg": "Đã chốt điểm thành công"}), 200


# ================================================================
# POST /api/khao-thi/grades — Thêm điểm mới (override)
# ================================================================

@bp_khao_thi.route("/grades", methods=["POST"])
@jwt_required()
@role_required(Role.KHAO_THI, Role.ADMIN)
def add_grade():
    """Thêm hoặc cập nhật điểm một môn học của sinh viên"""
    data = request.get_json()
    student_id = data.get("student_id")
    class_id   = data.get("class_id")

    if not student_id or not class_id:
        return jsonify({"msg": "Thiếu student_id hoặc class_id"}), 400

    try:
        student_uuid = uuid.UUID(student_id)
        class_uuid   = uuid.UUID(class_id)
    except ValueError:
        return jsonify({"msg": "ID không hợp lệ"}), 400

    # Kiểm tra đã có chưa
    existing = Grade.query.filter_by(
        student_id=student_uuid,
        course_class_id=class_uuid
    ).first()

    if existing:
        # Override
        existing.regular_score = data.get("regular_score", existing.regular_score)
        existing.midterm_score  = data.get("midterm_score",  existing.midterm_score)
        existing.final_score    = data.get("final_score",    existing.final_score)
        existing.total_score    = data.get("total_score",    existing.total_score)
        existing.status = data.get("status", existing.status)
        db.session.commit()
        return jsonify({"msg": "Đã cập nhật điểm", "grade_id": str(existing.id)}), 200
    else:
        grade = Grade(
            student_id=student_uuid,
            course_class_id=class_uuid,
            regular_score=data.get("regular_score"),
            midterm_score=data.get("midterm_score"),
            final_score=data.get("final_score"),
            total_score=data.get("total_score"),
            status=data.get("status", "Chưa chốt"),
        )
        db.session.add(grade)
        db.session.commit()
        return jsonify({"msg": "Đã thêm điểm", "grade_id": str(grade.id)}), 201


# ================================================================
# DELETE /api/khao-thi/grades/<grade_id>
# ================================================================

@bp_khao_thi.route("/grades/<grade_id>", methods=["DELETE"])
@jwt_required()
@role_required(Role.KHAO_THI, Role.ADMIN)
def delete_grade(grade_id):
    try:
        grade_uuid = uuid.UUID(grade_id)
    except ValueError:
        return jsonify({"msg": "ID không hợp lệ"}), 400

    grade = Grade.query.get(grade_uuid)
    if not grade:
        return jsonify({"msg": "Không tìm thấy bản ghi điểm"}), 404

    db.session.delete(grade)
    db.session.commit()
    return jsonify({"msg": "Đã xóa bản ghi điểm"}), 200
