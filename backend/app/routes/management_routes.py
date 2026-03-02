"""
management_routes.py
RBAC-based account management.

Phân quyền tạo tài khoản:
  ADMIN      → tạo: QL_DAO_TAO, KHAO_THI, KHOA, PARTNER
  QL_DAO_TAO → tạo: SINH_VIEN
  KHOA       → tạo: GIANG_VIEN
  (KHAO_THI không tạo tài khoản)

Phân quyền xem danh sách:
  ADMIN      → xem tất cả
  QL_DAO_TAO → xem SINH_VIEN + thông tin cá nhân (không tên điểm)
  KHAO_THI   → xem SINH_VIEN chỉ tên + mã + điểm
  KHOA       → xem GIANG_VIEN
"""

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.extensions import db
from app.models.account_model import Account
from app.models.student_model import Student
from app.models.partner_model import Partner
from app.models.staff_models import Staff, Lecturer
from app.models.enums import Role, ROLE_EMAIL_DOMAIN, ROLE_CAN_CREATE
from app.models.student_personal_info_model import StudentPersonalInfo
from app.decorators import role_required, get_account_from_jwt
import uuid
import bcrypt

bp_management = Blueprint('management', __name__, url_prefix='/api/management')

ADMIN_ROLES = [Role.ADMIN, Role.QL_DAO_TAO, Role.KHAO_THI, Role.KHOA]


# ================================================================
# POST /api/management/accounts — Tạo tài khoản
# ================================================================

@bp_management.route("/accounts", methods=["POST"])
@jwt_required()
@role_required(Role.ADMIN, Role.QL_DAO_TAO, Role.KHOA)
def create_account():
    caller_account, caller_role = get_account_from_jwt()

    data = request.get_json()
    username  = data.get("username")
    email     = data.get("email")
    password  = data.get("password")
    role      = data.get("role")
    full_name = data.get("full_name", "")

    if not all([username, email, password, role]):
        return jsonify({"msg": "Thiếu trường bắt buộc: username, email, password, role"}), 400

    # Kiểm tra quyền tạo role đó
    allowed_targets = ROLE_CAN_CREATE.get(caller_role, [])
    if role not in allowed_targets:
        return jsonify({
            "msg": f"Tài khoản '{caller_role}' không được phép tạo tài khoản loại '{role}'",
            "allowed": allowed_targets
        }), 403

    # Kiểm tra email domain
    required_domain = ROLE_EMAIL_DOMAIN.get(role)
    if required_domain and not email.endswith(required_domain):
        return jsonify({"msg": f"Email cho role '{role}' phải kết thúc bằng '{required_domain}'"}), 400

    # Kiểm tra trùng lặp
    if Account.query.filter((Account.username == username) | (Account.email == email)).first():
        return jsonify({"msg": "Username hoặc email đã tồn tại"}), 409

    # Tạo Account
    hashed_pw = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    new_account = Account(
        username=username,
        email=email,
        password_hash=hashed_pw,
        role=role
    )
    db.session.add(new_account)
    db.session.flush()

    # Tạo profile tương ứng
    if role == Role.SINH_VIEN:
        student_code = data.get("code", username)
        db.session.add(Student(id=new_account.id, student_id=student_code))

    elif role == Role.GIANG_VIEN:
        db.session.add(Lecturer(id=new_account.id, full_name=full_name or username))

    elif role in [Role.QL_DAO_TAO, Role.KHAO_THI, Role.KHOA]:
        db.session.add(Staff(
            id=new_account.id,
            full_name=full_name or username,
            position=role
        ))

    elif role == Role.PARTNER:
        enterprise_id = data.get("enterprise_id")
        if enterprise_id:
            db.session.add(Partner(
                account_id=new_account.id,
                enterprise_id=uuid.UUID(enterprise_id),
                full_name=full_name
            ))

    elif role == Role.ADMIN:
        db.session.add(Staff(
            id=new_account.id,
            full_name=full_name or username,
            position=Role.ADMIN
        ))

    try:
        db.session.commit()
        return jsonify({"msg": "Tạo tài khoản thành công", "id": str(new_account.id)}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"msg": str(e)}), 500


# ================================================================
# GET /api/management/accounts — Danh sách tài khoản (lọc theo role caller)
# ================================================================

@bp_management.route("/accounts", methods=["GET"])
@jwt_required()
@role_required(Role.ADMIN, Role.QL_DAO_TAO, Role.KHAO_THI, Role.KHOA)
def list_accounts():
    caller_account, caller_role = get_account_from_jwt()

    # Lọc theo role caller
    role_filter = request.args.get("role")

    if caller_role == Role.ADMIN:
        # Admin xem tất cả (trừ sinh viên / giảng viên — chỉ xem phòng ban)
        q = Account.query
        if role_filter:
            q = q.filter_by(role=role_filter)
        accounts = q.all()

    elif caller_role == Role.QL_DAO_TAO:
        # Chỉ xem SINH_VIEN
        accounts = Account.query.filter_by(role=Role.SINH_VIEN).all()

    elif caller_role == Role.KHAO_THI:
        # Chỉ xem SINH_VIEN (sẽ trả về limited info)
        accounts = Account.query.filter_by(role=Role.SINH_VIEN).all()

    elif caller_role == Role.KHOA:
        # Chỉ xem GIANG_VIEN
        accounts = Account.query.filter_by(role=Role.GIANG_VIEN).all()

    else:
        return jsonify({"msg": "Không có quyền"}), 403

    results = []
    try:
        for acc in accounts:
            entry = {
                "id": str(acc.id),
                "username": acc.username,
                "email": acc.email,
                "role": acc.role,
                "is_active": acc.is_active,
            }

            # QL_DAO_TAO & ADMIN: xem thêm thông tin hồ sơ sinh viên (không điểm)
            if caller_role in [Role.ADMIN, Role.QL_DAO_TAO] and acc.role == Role.SINH_VIEN:
                entry.update(_get_student_profile_summary(acc))

            # KHAO_THI: chỉ tên + mã SV (điểm lấy riêng qua /api/khao-thi/grades)
            elif caller_role == Role.KHAO_THI and acc.role == Role.SINH_VIEN:
                entry.update(_get_student_minimal(acc))

            # KHOA: xem thêm thông tin GV
            elif caller_role == Role.KHOA and acc.role == Role.GIANG_VIEN:
                entry.update(_get_lecturer_summary(acc))

            results.append(entry)
    except Exception as e:
        import traceback
        return jsonify({"msg": "Lỗi Backend: " + str(e), "trace": traceback.format_exc()}), 500

    return jsonify({"accounts": results, "total": len(results)}), 200


# ================================================================
# GET /api/management/accounts/<id>
# ================================================================

@bp_management.route("/accounts/<account_id>", methods=["GET"])
@jwt_required()
@role_required(*ADMIN_ROLES)
def get_account(account_id):
    caller_account, caller_role = get_account_from_jwt()
    try:
        account_id = uuid.UUID(account_id)
    except ValueError:
        return jsonify({"msg": "ID không hợp lệ"}), 400

    acc = Account.query.get(account_id)
    if not acc:
        return jsonify({"msg": "Không tìm thấy tài khoản"}), 404

    # KHAO_THI không được xem chi tiết profile (chỉ xem qua list)
    if caller_role == Role.KHAO_THI:
        return jsonify({"msg": "Không có quyền xem chi tiết"}), 403

    # KHOA chỉ xem GIANG_VIEN
    if caller_role == Role.KHOA and acc.role != Role.GIANG_VIEN:
        return jsonify({"msg": "Không có quyền xem tài khoản này"}), 403

    # QL_DAO_TAO chỉ xem SINH_VIEN
    if caller_role == Role.QL_DAO_TAO and acc.role != Role.SINH_VIEN:
        return jsonify({"msg": "Không có quyền xem tài khoản này"}), 403

    result = {
        "id": str(acc.id),
        "username": acc.username,
        "email": acc.email,
        "role": acc.role,
        "is_active": acc.is_active,
    }
    if acc.role == Role.SINH_VIEN and caller_role in [Role.ADMIN, Role.QL_DAO_TAO]:
        result.update(_get_student_profile_summary(acc))
    elif acc.role == Role.GIANG_VIEN:
        result.update(_get_lecturer_summary(acc))

    return jsonify(result), 200


# ================================================================
# PUT /api/management/accounts/<id>
# ================================================================

@bp_management.route("/accounts/<account_id>", methods=["PUT"])
@jwt_required()
@role_required(Role.ADMIN, Role.QL_DAO_TAO, Role.KHOA)
def update_account(account_id):
    caller_account, caller_role = get_account_from_jwt()
    try:
        account_id = uuid.UUID(account_id)
    except ValueError:
        return jsonify({"msg": "ID không hợp lệ"}), 400

    acc = Account.query.get(account_id)
    if not acc:
        return jsonify({"msg": "Không tìm thấy tài khoản"}), 404

    # KHOA chỉ sửa GIANG_VIEN
    if caller_role == Role.KHOA and acc.role != Role.GIANG_VIEN:
        return jsonify({"msg": "Chỉ được sửa tài khoản giảng viên"}), 403

    # QL_DAO_TAO chỉ sửa SINH_VIEN (và không được sửa điểm)
    if caller_role == Role.QL_DAO_TAO and acc.role != Role.SINH_VIEN:
        return jsonify({"msg": "Chỉ được sửa tài khoản sinh viên"}), 403

    data = request.get_json()
    if "email" in data:
        acc.email = data["email"]
    if "is_active" in data:
        acc.is_active = data["is_active"]
    if "password" in data and data["password"]:
        acc.password_hash = bcrypt.hashpw(data["password"].encode(), bcrypt.gensalt()).decode()

    db.session.commit()
    return jsonify({"msg": "Cập nhật thành công"}), 200


# ================================================================
# DELETE /api/management/accounts/<id>
# ================================================================

@bp_management.route("/accounts/<account_id>", methods=["DELETE"])
@jwt_required()
@role_required(Role.ADMIN, Role.QL_DAO_TAO, Role.KHOA)
def delete_account(account_id):
    caller_account, caller_role = get_account_from_jwt()
    try:
        account_id = uuid.UUID(account_id)
    except ValueError:
        return jsonify({"msg": "ID không hợp lệ"}), 400

    acc = Account.query.get(account_id)
    if not acc:
        return jsonify({"msg": "Không tìm thấy tài khoản"}), 404

    # Giới hạn scope
    if caller_role == Role.KHOA and acc.role != Role.GIANG_VIEN:
        return jsonify({"msg": "Chỉ được xóa tài khoản giảng viên"}), 403
    if caller_role == Role.QL_DAO_TAO and acc.role != Role.SINH_VIEN:
        return jsonify({"msg": "Chỉ được xóa tài khoản sinh viên"}), 403

    db.session.delete(acc)
    db.session.commit()
    return jsonify({"msg": "Đã xóa tài khoản"}), 200


# ================================================================
# GET /api/management/accounts/statistics
# ================================================================

@bp_management.route("/accounts/statistics", methods=["GET"])
@jwt_required()
@role_required(*ADMIN_ROLES)
def get_account_statistics():
    caller_account, caller_role = get_account_from_jwt()
    if caller_role == Role.ADMIN:
        return jsonify({
            "total": Account.query.count(),
            "students": Account.query.filter_by(role=Role.SINH_VIEN).count(),
            "lecturers": Account.query.filter_by(role=Role.GIANG_VIEN).count(),
            "partners": Account.query.filter_by(role=Role.PARTNER).count(),
            "ql_dao_tao": Account.query.filter_by(role=Role.QL_DAO_TAO).count(),
            "khao_thi": Account.query.filter_by(role=Role.KHAO_THI).count(),
            "khoa": Account.query.filter_by(role=Role.KHOA).count(),
        }), 200
    elif caller_role == Role.QL_DAO_TAO:
        return jsonify({"students": Account.query.filter_by(role=Role.SINH_VIEN).count()}), 200
    elif caller_role == Role.KHOA:
        return jsonify({"lecturers": Account.query.filter_by(role=Role.GIANG_VIEN).count()}), 200
    elif caller_role == Role.KHAO_THI:
        return jsonify({"students": Account.query.filter_by(role=Role.SINH_VIEN).count()}), 200
    return jsonify({}), 200


# ================================================================
# PATCH /api/management/accounts/<id>/toggle-status
# ================================================================

@bp_management.route("/accounts/<account_id>/toggle-status", methods=["PATCH"])
@jwt_required()
@role_required(Role.ADMIN, Role.QL_DAO_TAO, Role.KHOA)
def toggle_account_status(account_id):
    try:
        account_id = uuid.UUID(account_id)
    except ValueError:
        return jsonify({"msg": "ID không hợp lệ"}), 400

    acc = Account.query.get(account_id)
    if not acc:
        return jsonify({"msg": "Không tìm thấy tài khoản"}), 404

    acc.is_active = not acc.is_active
    db.session.commit()
    return jsonify({"msg": "Đã đổi trạng thái", "is_active": acc.is_active}), 200


# ================================================================
# PATCH /api/management/students/<id>/unlock — Mở khóa hồ sơ
# ================================================================

@bp_management.route("/students/<student_id>/unlock", methods=["PATCH"])
@jwt_required()
@role_required(Role.ADMIN, Role.QL_DAO_TAO)
def unlock_student_profile(student_id):
    try:
        student_id = uuid.UUID(student_id)
    except ValueError:
        return jsonify({"msg": "ID không hợp lệ"}), 400

    from app.models.student_personal_info_model import StudentPersonalInfo
    p_info = StudentPersonalInfo.query.get(student_id)
    
    if not p_info:
        # Check if student exists but has no personal info row yet
        student = Student.query.get(student_id)
        if not student:
            return jsonify({"msg": "Không tìm thấy sinh viên"}), 404
        return jsonify({"msg": "Hồ sơ chưa được tạo, không cần mở khóa"}), 200

    p_info.is_locked = False
    db.session.commit()
    return jsonify({"msg": "Đã mở khóa hồ sơ thành công"}), 200


# ================================================================
# HELPERS
# ================================================================

def _get_student_profile_summary(acc: Account) -> dict:
    """Thông tin hồ sơ SV cho QL_DAO_TAO (không có điểm)"""
    student = acc.student
    if not student:
        return {}
    info = {}
    if student.personal_info:
        pi = student.personal_info
        info.update({
            "student_code": student.student_id,
            "full_name": f"{pi.first_name or ''} {pi.last_name or ''}".strip(),
            "date_of_birth": str(pi.date_of_birth) if pi.date_of_birth else None,
            "gender": pi.gender,
            "national_id": pi.national_id_number,
            "academic_status": pi.academic_status,
            "is_locked": pi.is_locked,
        })
    if hasattr(student, 'contact') and student.contact:
        c = student.contact
        info.update({
            "personal_email": c.personal_email,
            "edu_email": c.edu_email,
            "phone": c.phone,
        })
    if hasattr(student, 'enrollment') and student.enrollment:
        e = student.enrollment
        info.update({
            "major": e.major,
            "cohort": e.cohort,
            "faculty": e.faculty,
        })
    return info


def _get_student_minimal(acc: Account) -> dict:
    """Chỉ tên + mã SV cho KHAO_THI"""
    student = acc.student
    if not student:
        return {}
    full_name = ""
    if student.personal_info:
        pi = student.personal_info
        full_name = f"{pi.first_name or ''} {pi.last_name or ''}".strip()
    return {
        "student_code": student.student_id,
        "full_name": full_name,
    }


def _get_lecturer_summary(acc: Account) -> dict:
    """Thông tin GV cho KHOA"""
    lecturer = acc.lecturer_profile
    if not lecturer:
        return {}
    return {
        "lecturer_code": lecturer.lecturer_code,
        "full_name": lecturer.full_name,
    }
