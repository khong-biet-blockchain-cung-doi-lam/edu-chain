from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.extensions import db
from app.models.audit_log_model import AuditLog

bp_audit = Blueprint("audit_routes", __name__, url_prefix="/api/audit")

@bp_audit.route("/log", methods=["POST"])
@jwt_required()
def log_action():
    try:
        user_id = get_jwt_identity()
        data = request.json
        action = data.get("action")
        target_id = data.get("target_id")
        details = data.get("details", "")

        if not action:
            return jsonify({"msg": "Missing action"}), 400

        new_log = AuditLog(
            user_id=user_id,
            action=action,
            target_id=str(target_id) if target_id else None,
            details=str(details),
            ip_address=request.remote_addr
        )
        db.session.add(new_log)
        db.session.commit()

        return jsonify({"msg": "Log recorded successfully"}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"msg": f"Failed to record log: {str(e)}"}), 500
