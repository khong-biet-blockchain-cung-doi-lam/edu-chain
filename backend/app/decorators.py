from functools import wraps
from flask_jwt_extended import verify_jwt_in_request, get_jwt_identity
from app.extensions import db
from app.models.account_model import Account
from app.models.staff_models import Staff

def staff_required(required_role_code=None):
    def wrapper(fn):
        @wraps(fn)
        def decorator(*args, **kwargs):
            verify_jwt_in_request()
            
            user_id = get_jwt_identity()
            user = db.session.get(Account, user_id)
            
            if not user or user.role_type != 'staff':
                return {"msg": "Access denied. Staff role required."}, 403

            if required_role_code:
                staff_profile = Staff.query.filter_by(account_id=user.id).first()
                if not staff_profile:
                    return {"msg": "Staff profile not found."}, 403
                
                # if staff_profile.role.code != required_role_code:
                #     return {"msg": "Insufficient permissions."}, 403

            return fn(*args, **kwargs)
        return decorator
    return wrapper
