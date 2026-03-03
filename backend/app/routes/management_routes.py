from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.extensions import db
from app.models.account_model import Account
from app.models.enums import Role, ROLE_CAN_CREATE, ROLE_EMAIL_DOMAIN
from app.services.account_service import AccountService
from app.services.student_service import StudentService
from app.decorators import role_required, get_account_from_jwt
import uuid
import bcrypt

bp_management = Blueprint('management', __name__, url_prefix='/api/management')
ADMIN_ROLES = [Role.ADMIN, Role.QL_DAO_TAO, Role.KHAO_THI, Role.KHOA]

@bp_management.route("/accounts", methods=["POST"])
@jwt_required()
@role_required(Role.ADMIN, Role.QL_DAO_TAO, Role.KHOA)
def create_account():
    _, caller_role = get_account_from_jwt()
    data = request.get_json()
    username = data.get("username")
    email = data.get("email")
    password = data.get("password")
    role = data.get("role")
    full_name = data.get("full_name", "")

    if not all([username, email, password, role]):
        return jsonify({"msg": "Thiếu thông tin bắt buộc"}), 400

    allowed_targets = ROLE_CAN_CREATE.get(caller_role, [])
    if role not in allowed_targets:
        return jsonify({"msg": "Không được phép tạo role này"}), 403

    acc, error = AccountService.create_account(
        username, email, password, role, 
        full_name=full_name, 
        code=data.get("code"), 
        enterprise_id=data.get("enterprise_id")
    )
    if error:
        return jsonify({"msg": error}), 400
    return jsonify({"msg": "Tạo tài khoản thành công", "id": str(acc.id)}), 201

@bp_management.route("/accounts", methods=["GET"])
@jwt_required()
@role_required(Role.ADMIN, Role.QL_DAO_TAO, Role.KHAO_THI, Role.KHOA)
def list_accounts():
    _, caller_role = get_account_from_jwt()
    role_filter = request.args.get("role")

    if caller_role == Role.ADMIN:
        q = Account.query
        if role_filter: q = q.filter_by(role=role_filter)
        accounts = q.all()
    elif caller_role == Role.QL_DAO_TAO:
        accounts = Account.query.filter_by(role=Role.SINH_VIEN).all()
    elif caller_role == Role.KHAO_THI:
        accounts = Account.query.filter_by(role=Role.SINH_VIEN).all()
    elif caller_role == Role.KHOA:
        accounts = Account.query.filter_by(role=Role.GIANG_VIEN).all()
    else:
        return jsonify({"msg": "Không có quyền"}), 403

    results = []
    for acc in accounts:
        entry = {
            "id": str(acc.id),
            "username": acc.username,
            "email": acc.email,
            "role": acc.role,
            "is_active": acc.is_active,
        }
        if caller_role in [Role.ADMIN, Role.QL_DAO_TAO] and acc.role == Role.SINH_VIEN:
            entry.update(_get_student_profile_summary(acc))
        elif caller_role == Role.KHAO_THI and acc.role == Role.SINH_VIEN:
            entry.update(_get_student_minimal(acc))
        elif caller_role == Role.KHOA and acc.role == Role.GIANG_VIEN:
            entry.update(_get_lecturer_summary(acc))
        results.append(entry)

    return jsonify({"accounts": results, "total": len(results)}), 200

@bp_management.route("/accounts/<account_id>", methods=["GET"])
@jwt_required()
@role_required(*ADMIN_ROLES)
def get_account(account_id):
    _, caller_role = get_account_from_jwt()
    acc = db.session.get(Account, uuid.UUID(account_id))
    if not acc: return jsonify({"msg": "Không tìm thấy tài khoản"}), 404

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

@bp_management.route("/accounts/<account_id>/toggle-status", methods=["PATCH"])
@jwt_required()
@role_required(Role.ADMIN, Role.QL_DAO_TAO, Role.KHOA)
def toggle_account_status(account_id):
    is_active, error = AccountService.toggle_status(account_id)
    if error: return jsonify({"msg": error}), 404
    return jsonify({"msg": "Đã đổi trạng thái", "is_active": is_active}), 200

@bp_management.route("/students/<student_id>/unlock", methods=["PATCH"])
@jwt_required()
@role_required(Role.ADMIN, Role.QL_DAO_TAO)
def unlock_student_profile(student_id):
    success, error = StudentService.unlock_profile(student_id)
    if error: return jsonify({"msg": error}), 404
    msg = "Đã mở khóa hồ sơ thành công" if success is True else success
    return jsonify({"msg": msg}), 200

def _get_student_profile_summary(acc):
    student = acc.student
    if not student: return {}
    info = {"student_code": student.student_id}
    if student.personal_info:
        pi = student.personal_info
        info.update({
            "full_name": f"{pi.first_name or ''} {pi.last_name or ''}".strip(),
            "date_of_birth": str(pi.date_of_birth) if pi.date_of_birth else None,
            "gender": pi.gender,
            "academic_status": pi.academic_status,
            "is_locked": pi.is_locked,
        })
    return info

def _get_student_minimal(acc):
    student = acc.student
    if not student: return {}
    full_name = ""
    if student.personal_info:
        pi = student.personal_info
        full_name = f"{pi.first_name or ''} {pi.last_name or ''}".strip()
    return {"student_code": student.student_id, "full_name": full_name}

def _get_lecturer_summary(acc):
    lecturer = acc.lecturer_profile
    if not lecturer: return {}
    return {"lecturer_code": lecturer.lecturer_code, "full_name": lecturer.full_name}
