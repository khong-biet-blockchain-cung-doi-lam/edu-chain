from flask import Blueprint, request, jsonify
from app.extensions import db
from app.models.organization_model import Organization

bp_partner = Blueprint('partner', __name__, url_prefix='/api/partners')

@bp_partner.route('/register', methods=['POST'])
def register_partner_organization():
    data = request.get_json()
    
    required_fields = ['name', 'tax_id', 'contact_email', 'address']
    if not all(k in data for k in required_fields):
        return jsonify({"msg": "Missing required fields"}), 400

    existing_org = Organization.query.filter(
        (Organization.tax_id == data['tax_id']) | 
        (Organization.contact_email == data['contact_email'])
    ).first()

    if existing_org:
        return jsonify({"msg": "Organization with this Tax ID or Email already exists"}), 400

    new_org = Organization(
        name=data['name'],
        type='ENTERPRISE',
        tax_id=data['tax_id'],
        contact_email=data['contact_email'],
        website=data.get('website', ''),
        address=data['address'],
        status='PENDING'
    )

    try:
        db.session.add(new_org)
        db.session.commit()
        return jsonify({
            "msg": "Registration successful. Please wait for admin approval.",
            "organization_id": str(new_org.id)
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"msg": str(e)}), 500
