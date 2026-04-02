from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.extensions import db
from app.models.audit_log_model import AuditLog
from app.models.account_model import Account

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

@bp_audit.route("/logs", methods=["GET"])
@jwt_required()
def get_logs():
    try:
        # Lấy tất cả logs, join với Account để lấy email, sắp xếp mới nhất lên đầu
        logs = db.session.query(
            AuditLog.id,
            AuditLog.user_id,
            Account.email,
            Account.role,
            AuditLog.action,
            AuditLog.details,
            AuditLog.created_at,
            AuditLog.ip_address
        ).outerjoin(Account, AuditLog.user_id == Account.id)\
         .order_by(AuditLog.created_at.desc())\
         .limit(100).all()

        result = []
        for log in logs:
            result.append({
                "id": str(log.id),
                "user_id": str(log.user_id),
                "email": log.email or "Unknown",
                "role": log.role.value if hasattr(log.role, "value") else str(log.role),
                "action": log.action,
                "details": log.details,
                "timestamp": log.created_at.isoformat() if log.created_at else None,
                "ip_address": log.ip_address
            })

        return jsonify({"logs": result}), 200
    except Exception as e:
        return jsonify({"msg": f"Failed to fetch logs: {str(e)}"}), 500
