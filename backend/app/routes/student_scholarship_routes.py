from flask import Blueprint, request, jsonify
from app.extensions import db
from app.models.student_certificate_model import StudentCertificate
from app.models.scholarship_model import Scholarship, ScholarshipApplication
from app.models.student_model import Student
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime
import uuid

bp_student_scholarship = Blueprint('student_scholarship', __name__, url_prefix='/api/student')

@bp_student_scholarship.route("/certificates", methods=["POST"])
@jwt_required()
def add_certificate():
    student_id = get_jwt_identity()
    if isinstance(student_id, str):
        student_id = uuid.UUID(student_id)
    data = request.json
    
    name = data.get("name")
    if not name:
        return jsonify({"msg": "Certificate name is required"}), 400
        
    new_cert = StudentCertificate(
        student_id=student_id,
        name=name,
        code=data.get("code"),
        score=data.get("score"),
        image_url=data.get("image_url"),
        status="PENDING" # Needs verification
    )
    
    if data.get("issued_date"):
        try:
            new_cert.issued_date = datetime.strptime(data["issued_date"], "%Y-%m-%d").date()
        except ValueError:
            pass
            
    db.session.add(new_cert)
    db.session.commit()
    
    return jsonify({"msg": "Certificate added successfully", "id": str(new_cert.id)}), 201

@bp_student_scholarship.route("/certificates", methods=["GET"])
@jwt_required()
def get_certificates():
    student_id = get_jwt_identity()
    if isinstance(student_id, str):
        student_id = uuid.UUID(student_id)
    certs = StudentCertificate.query.filter_by(student_id=student_id).all()
    return jsonify([c.to_dict() for c in certs]), 200

@bp_student_scholarship.route("/scholarships", methods=["GET"])
@jwt_required()
def get_eligible_scholarships():
    student_id = get_jwt_identity()
    if isinstance(student_id, str):
        student_id = uuid.UUID(student_id)
    
    # Logic: Show scholarships where
    # 1. Application exists (ELIGIBLE or APPLIED)
    # OR 
    # 2. Check open scholarships and match manually if not pre-calculated?
    # For now, rely on pre-calculated applications (ZKP Matching Service Logic)
    
    applications = ScholarshipApplication.query.filter(
        ScholarshipApplication.student_id == student_id,
        ScholarshipApplication.status.in_(['ELIGIBLE_PENDING_CONSENT', 'APPLIED', 'AWARDED', 'REJECTED'])
    ).all()
    
    results = []
    for app in applications:
        scholarship = app.scholarship
        if scholarship.status == 'CLOSED' and app.status == 'ELIGIBLE_PENDING_CONSENT':
            continue
            
        results.append({
            "application_id": str(app.id),
            "scholarship": scholarship.to_dict(),
            "status": app.status,
            "applied_at": app.applied_at.isoformat() if app.applied_at else None
        })
        
    return jsonify(results), 200

@bp_student_scholarship.route("/scholarships/<scholarship_id>/apply", methods=["POST"])
@jwt_required()
def apply_scholarship(scholarship_id):
    student_id = get_jwt_identity()
    if isinstance(student_id, str):
        student_id = uuid.UUID(student_id)
        
    if isinstance(scholarship_id, str):
        scholarship_id = uuid.UUID(scholarship_id)
    
    # Check if application exists (invite)
    application = ScholarshipApplication.query.filter_by(
        scholarship_id=scholarship_id,
        student_id=student_id
    ).first()
    
    if not application:
        return jsonify({"msg": "You are not eligible or have not been invited to this scholarship."}), 403
        
    if application.status != 'ELIGIBLE_PENDING_CONSENT':
        return jsonify({"msg": f"Application status is already {application.status}"}), 400
        
    # Consent Logic
    # Update status to APPLIED
    application.status = 'APPLIED'
    application.applied_at = datetime.utcnow()
    
    db.session.commit()
    
    return jsonify({"msg": "Applied successfully. Your information has been shared with the partner."}), 200
