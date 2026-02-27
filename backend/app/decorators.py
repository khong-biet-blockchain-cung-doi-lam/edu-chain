"""
decorators.py — RBAC decorators cho hệ thống phân quyền theo role.

Cách dùng:
    @role_required(Role.KHAO_THI, Role.ADMIN)
    def my_route(): ...
"""

from functools import wraps
from flask_jwt_extended import verify_jwt_in_request, get_jwt_identity
from app.extensions import db
import uuid


def get_account_from_jwt():
    """Lấy Account từ JWT identity, trả về (account, role_str)"""
    from app.models.account_model import Account
    user_id = get_jwt_identity()
    if isinstance(user_id, str):
        try:
            user_id = uuid.UUID(user_id)
        except ValueError:
            return None, None
    account = db.session.get(Account, user_id)
    if not account:
        return None, None
    return account, account.role


def role_required(*allowed_roles):
    """
    Decorator: Kiểm tra role của người dùng.
    Dùng account.role (string trong DB).
    
    Ví dụ:
        @role_required(Role.KHAO_THI, Role.ADMIN)
        def route(): ...
    """
    def wrapper(fn):
        @wraps(fn)
        def decorator(*args, **kwargs):
            verify_jwt_in_request()
            account, role = get_account_from_jwt()
            if not account:
                return {"msg": "Tài khoản không tồn tại"}, 401
            if role not in allowed_roles:
                return {"msg": f"Không có quyền truy cập. Yêu cầu: {list(allowed_roles)}"}, 403
            return fn(*args, **kwargs)
        return decorator
    return wrapper


# --- Legacy decorator (giữ lại để không break code cũ) ---
def staff_required(required_role_code=None):
    """Legacy decorator — dùng role_required thay thế nếu có thể"""
    def wrapper(fn):
        @wraps(fn)
        def decorator(*args, **kwargs):
            verify_jwt_in_request()
            from app.models.staff_models import Staff
            account, role = get_account_from_jwt()
            if not account:
                return {"msg": "Access denied."}, 403

            admin_roles = ["ADMIN", "QL_DAO_TAO", "KHAO_THI", "KHOA", "staff"]
            if role not in admin_roles:
                return {"msg": "Access denied. Staff role required."}, 403

            if required_role_code:
                if role != required_role_code:
                    # Cũng check staff.position cho legacy
                    staff_profile = db.session.get(Staff, account.id)
                    if not staff_profile or staff_profile.position != required_role_code:
                        return {"msg": f"Access denied. Required role: {required_role_code}"}, 403

            return fn(*args, **kwargs)
        return decorator
    return wrapper
