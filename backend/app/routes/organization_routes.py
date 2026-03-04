from flask import Blueprint, request, jsonify
from app.extensions import db
from app.models.partner_model import Partner
from app.models.account_model import Account
from app.models.scholarship_model import Scholarship
from flask_jwt_extended import jwt_required, get_jwt_identity
import uuid
import bcrypt

bp_organization = Blueprint('organization', __name__, url_prefix='/api/organization')

def get_current_partner():
    user_id = get_jwt_identity()
    if isinstance(user_id, str):
        try:
            user_id = uuid.UUID(user_id)
        except:
            pass
    return Partner.query.filter_by(account_id=user_id).first()

@bp_organization.route("/profile", methods=["GET"])
@jwt_required()
def get_profile():
    partner = get_current_partner()
    if not partner:
        return jsonify({"msg": "Partner profile not found."}), 404
        
    return jsonify({
        "id": str(partner.id),
        "full_name": partner.full_name,
        "enterprise_id": str(partner.enterprise_id) if partner.enterprise_id else None,
                                                
        "industry": "Education / Technology",
        "description": "Mocked Organization Description",
        "website": "https://example.com"
    }), 200

@bp_organization.route("/profile", methods=["PUT"])
@jwt_required()
def update_profile():
    partner = get_current_partner()
    if not partner:
        return jsonify({"msg": "Partner profile not found."}), 404
        
    data = request.json
    if "full_name" in data:
        partner.full_name = data["full_name"]
    db.session.commit()
    return jsonify({"msg": "Profile updated successfully", "profile": {"full_name": partner.full_name}}), 200

@bp_organization.route("/logo", methods=["POST"])
@jwt_required()
def upload_logo():
    partner = get_current_partner()
    if not partner:
        return jsonify({"msg": "Partner profile not found."}), 404
        
    if 'logo' not in request.files:
        return jsonify({"msg": "No logo file provided"}), 400
        
    return jsonify({"msg": "Logo uploaded successfully (mocked)", "url": "/mocked-logo-url.png"}), 200

@bp_organization.route("/statistics", methods=["GET"])
@jwt_required()
def get_statistics():
    partner = get_current_partner()
    if not partner:
        return jsonify({"msg": "Partner profile not found."}), 404
        
    scholarships = Scholarship.query.filter_by(partner_id=partner.id).count()
    return jsonify({
        "total_scholarships": scholarships,
        "total_applications": 0,         
        "total_approved": 0         
    }), 200

@bp_organization.route("/settings", methods=["PUT"])
@jwt_required()
def update_settings():
    return jsonify({"msg": "Settings updated (mocked)"}), 200

@bp_organization.route("/change-password", methods=["POST"])
@jwt_required()
def change_password():
    user_id = get_jwt_identity()
    if isinstance(user_id, str):
        try: user_id = uuid.UUID(user_id)
        except: pass
        
    account = Account.query.get(user_id)
    if not account: return jsonify({"msg": "Account not found"}), 404
    
    data = request.json
    current_pw = data.get("currentPassword")
    new_pw = data.get("newPassword")
    
    if not current_pw or not new_pw:
        return jsonify({"msg": "Missing password fields"}), 400
        
    stored_hash = account.password_hash.encode('utf-8')
    if not bcrypt.checkpw(current_pw.encode('utf-8'), stored_hash):
        return jsonify({"msg": "Incorrect current password"}), 401
        
    account.password_hash = bcrypt.hashpw(new_pw.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    db.session.commit()
    
    return jsonify({"msg": "Password changed successfully"}), 200
