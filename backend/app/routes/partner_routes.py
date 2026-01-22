from flask import Blueprint, request, jsonify
from app.extensions import db
from app.models.enterprise_model import Enterprise

bp_partner = Blueprint('partner', __name__, url_prefix='/api/partners')

@bp_partner.route('/register', methods=['POST'])
def register_enterprise():
    data = request.get_json()
    
    required_fields = ['name', 'tax_id', 'contact_email', 'address']
    if not all(k in data for k in required_fields):
        return jsonify({"msg": "Missing required fields"}), 400

    existing = Enterprise.query.filter(
        (Enterprise.tax_id == data['tax_id']) | 
        (Enterprise.contact_email == data['contact_email'])
    ).first()

    if existing:
        return jsonify({"msg": "Enterprise with this Tax ID or Email already exists"}), 400

    new_ent = Enterprise(
        name=data['name'],
        tax_id=data['tax_id'],
        contact_email=data['contact_email'],
        website=data.get('website', ''),
        address=data['address'],
        status='PENDING'
    )

    try:
        db.session.add(new_ent)
        db.session.commit()
        return jsonify({
            "msg": "Registration successful. Please wait for admin approval.",
            "enterprise_id": str(new_ent.id)
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"msg": str(e)}), 500
