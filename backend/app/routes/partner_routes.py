from flask import Blueprint, request, jsonify
from app.extensions import db
from app.models.partner_model import Partner
from app.models.scholarship_model import Scholarship, ScholarshipApplication
from app.models.student_model import Student
from app.models.student_certificate_model import StudentCertificate
from app.models.enums import Role
from app.decorators import staff_required
from flask_jwt_extended import jwt_required, get_jwt_identity
import uuid

bp_partner = Blueprint('partner', __name__, url_prefix='/api/partners')

# Helper to check if user is a partner
def get_current_partner():
    user_id = get_jwt_identity()
    if isinstance(user_id, str):
        user_id = uuid.UUID(user_id)
    partner = Partner.query.filter_by(account_id=user_id).first()
    return partner

@bp_partner.route("/scholarships", methods=["POST"])
@jwt_required()
def create_scholarship():
    partner = get_current_partner()
    # In a real app, you'd check Role.PARTNER in JWT or DB
    # For now assuming the logged in user is a partner or checking DB
    
    if not partner:
        # Fallback: Check if user is ADMIN or STAFF acting as partner? 
        # But Requirement says Partner posts scholarship.
        # Let's assume the user IS the partner account.
        return jsonify({"msg": "Partner profile not found."}), 403

    data = request.json
    title = data.get("title")
    criteria = data.get("criteria", {})
    description = data.get("description", "")
    
    if not title:
        return jsonify({"msg": "Title is required"}), 400
        
    new_scholarship = Scholarship(
        partner_id=partner.id,
        title=title,
        description=description,
        criteria=criteria,
        status="OPEN"
    )
    
    db.session.add(new_scholarship)
    db.session.commit()
    
    # TRIGGER "ZKP" MATCHING (Simplified)
    # For now, we can just trigger it here or let it be a separate process.
    # Let's do a simple synchronous match for demo purposes.
    match_students_to_scholarship(new_scholarship)
    
    return jsonify({"msg": "Scholarship created successfully", "id": str(new_scholarship.id)}), 201

@bp_partner.route("/scholarships", methods=["GET"])
@jwt_required()
def list_scholarships():
    partner = get_current_partner()
    if not partner:
        return jsonify({"msg": "Partner profile not found."}), 403
        
    scholarships = Scholarship.query.filter_by(partner_id=partner.id).all()
    return jsonify([s.to_dict() for s in scholarships]), 200

@bp_partner.route("/scholarships/<scholarship_id>/candidates", methods=["GET"])
@jwt_required()
def get_candidates(scholarship_id):
    partner = get_current_partner()
    if not partner:
        return jsonify({"msg": "Partner profile not found."}), 403
        
    if isinstance(scholarship_id, str):
        scholarship_id = uuid.UUID(scholarship_id)
        
    scholarship = Scholarship.query.filter_by(id=scholarship_id, partner_id=partner.id).first()
    if not scholarship:
        return jsonify({"msg": "Scholarship not found or access denied"}), 404
        
    # Only return candidates who have APPLIED (Consented)
    # Sort by some criteria? For now just return list.
    
    applications = ScholarshipApplication.query.filter_by(
        scholarship_id=scholarship.id, 
        status="APPLIED"
    ).all()
    
    results = []
    for app in applications:
        stu = app.student
        # Reveal data
        # Calculate matching score if possible
        results.append({
            "application_id": str(app.id),
            "student_id": str(stu.id),
            "student_name": f"{stu.personal_info.first_name} {stu.personal_info.last_name}" if stu.personal_info else "N/A",
            "gpa": stu.gpa, # Assuming gpa is used
            # Include Certificates?
            "applied_at": app.applied_at.isoformat() if app.applied_at else None
        })
        
    return jsonify(results), 200


@bp_partner.route("/scholarships/<scholarship_id>", methods=["GET"])
@jwt_required()
def get_scholarship(scholarship_id):
    partner = get_current_partner()
    if not partner:
        return jsonify({"msg": "Partner profile not found."}), 403
    
    if isinstance(scholarship_id, str):
        scholarship_id = uuid.UUID(scholarship_id)
        
    s = Scholarship.query.filter_by(id=scholarship_id, partner_id=partner.id).first()
    if not s:
        return jsonify({"msg": "Not found"}), 404
    return jsonify(s.to_dict()), 200

@bp_partner.route("/scholarships/<scholarship_id>", methods=["PUT"])
@jwt_required()
def update_scholarship(scholarship_id):
    partner = get_current_partner()
    if not partner:
        return jsonify({"msg": "Partner profile not found."}), 403
        
    if isinstance(scholarship_id, str):
        scholarship_id = uuid.UUID(scholarship_id)
        
    s = Scholarship.query.filter_by(id=scholarship_id, partner_id=partner.id).first()
    if not s:
        return jsonify({"msg": "Not found"}), 404
        
    data = request.json
    if "title" in data: s.title = data["title"]
    if "description" in data: s.description = data["description"]
    if "criteria" in data: s.criteria = data["criteria"]
    if "status" in data: s.status = data["status"]
    
    db.session.commit()
    return jsonify({"msg": "Updated successfully", "scholarship": s.to_dict()}), 200

@bp_partner.route("/scholarships/<scholarship_id>", methods=["DELETE"])
@jwt_required()
def delete_scholarship(scholarship_id):
    partner = get_current_partner()
    if not partner:
        return jsonify({"msg": "Partner profile not found."}), 403
        
    if isinstance(scholarship_id, str):
        scholarship_id = uuid.UUID(scholarship_id)
        
    s = Scholarship.query.filter_by(id=scholarship_id, partner_id=partner.id).first()
    if not s:
        return jsonify({"msg": "Not found"}), 404
        
    db.session.delete(s)
    db.session.commit()
    return jsonify({"msg": "Deleted successfully"}), 200

@bp_partner.route("/scholarships/stats", methods=["GET"])
@jwt_required()
def get_scholarship_stats():
    partner = get_current_partner()
    if not partner:
        return jsonify({"msg": "Partner profile not found."}), 403
        
    total = Scholarship.query.filter_by(partner_id=partner.id).count()
    active = Scholarship.query.filter_by(partner_id=partner.id, status="OPEN").count()
    closed = Scholarship.query.filter_by(partner_id=partner.id, status="CLOSED").count()
    
    return jsonify({
        "total": total,
        "active": active,
        "closed": closed
    }), 200


def match_students_to_scholarship(scholarship):
    """
    Simulates ZKP matching locally.
    Finds students matching criteria and creates 'ELIGIBLE' applications.
    """
    criteria = scholarship.criteria or {}
    min_gpa = criteria.get("min_gpa")
    # expected_certs = criteria.get("required_certificates", []) # List of {name, min_score}
    
    # 1. Filter by GPA
    query = Student.query
    # if min_gpa:
       # In a real app, complex query. For demo, iterate or basic filter.
       # Assuming 'total_grade' is GPA.
       # query = query.filter(Student.total_grade >= min_gpa)
       
    students = query.all()
    
    matched_count = 0
    for stu in students:
        # Check GPA
        if min_gpa and (stu.gpa is None or stu.gpa < float(min_gpa)):
            continue
            
        # Check Certificates (if implemented)
        # matches_certs = check_certificates(stu, expected_certs)
        # if not matches_certs: continue
        
        # Create Application Invite
        existing = ScholarshipApplication.query.filter_by(
            scholarship_id=scholarship.id, 
            student_id=stu.id
        ).first()
        
        if not existing:
            app = ScholarshipApplication(
                scholarship_id=scholarship.id,
                student_id=stu.id,
                status="ELIGIBLE_PENDING_CONSENT"
            )
            db.session.add(app)
            matched_count += 1
            
    db.session.commit()
    print(f"Matched {matched_count} students for Scholarship {scholarship.title}")

# --- Application Endpoints ---

@bp_partner.route("/applications", methods=["GET"])
@jwt_required()
def list_applications():
    partner = get_current_partner()
    if not partner:
        return jsonify({"msg": "Partner profile not found."}), 403
        
    apps = ScholarshipApplication.query.join(Scholarship).filter(Scholarship.partner_id == partner.id).all()
    
    results = []
    for app in apps:
        if app.status == "ELIGIBLE_PENDING_CONSENT":
            continue # Don't show students who haven't consented
        results.append({
            "id": str(app.id),
            "scholarship_id": str(app.scholarship_id),
            "scholarship_title": app.scholarship.title,
            "student_id": str(app.student_id),
            "status": app.status,
            "applied_at": app.applied_at.isoformat() if app.applied_at else None
        })
    return jsonify(results), 200

@bp_partner.route("/applications/<app_id>", methods=["GET"])
@jwt_required()
def get_application(app_id):
    partner = get_current_partner()
    if not isinstance(app_id, uuid.UUID):
        try: app_id = uuid.UUID(app_id)
        except: return jsonify({"msg": "Invalid ID"}), 400
        
    app = ScholarshipApplication.query.filter_by(id=app_id).join(Scholarship).filter(Scholarship.partner_id == partner.id).first()
    if not app or app.status == "ELIGIBLE_PENDING_CONSENT":
        return jsonify({"msg": "Not found"}), 404
        
    return jsonify({
        "id": str(app.id),
        "scholarship_id": str(app.scholarship_id),
        "student_id": str(app.student_id),
        "status": app.status,
        "applied_at": app.applied_at.isoformat() if app.applied_at else None
    }), 200

@bp_partner.route("/applications/<app_id>/status", methods=["PATCH"])
@jwt_required()
def update_application_status(app_id):
    partner = get_current_partner()
    if not isinstance(app_id, uuid.UUID):
        try: app_id = uuid.UUID(app_id)
        except: return jsonify({"msg": "Invalid ID"}), 400
        
    app = ScholarshipApplication.query.filter_by(id=app_id).join(Scholarship).filter(Scholarship.partner_id == partner.id).first()
    if not app:
        return jsonify({"msg": "Not found"}), 404
        
    data = request.json
    new_status = data.get("status")
    if new_status:
        app.status = new_status
        db.session.commit()
    return jsonify({"msg": "Updated"}), 200

@bp_partner.route("/applications/<app_id>/approve", methods=["POST"])
@jwt_required()
def approve_application(app_id):
    partner = get_current_partner()
    if not isinstance(app_id, uuid.UUID):
        try: app_id = uuid.UUID(app_id)
        except: return jsonify({"msg": "Invalid ID"}), 400
        
    app = ScholarshipApplication.query.filter_by(id=app_id).join(Scholarship).filter(Scholarship.partner_id == partner.id).first()
    if not app: return jsonify({"msg": "Not found"}), 404
    
    app.status = "APPROVED"
    db.session.commit()
    return jsonify({"msg": "Approved"}), 200

@bp_partner.route("/applications/<app_id>/reject", methods=["POST"])
@jwt_required()
def reject_application(app_id):
    partner = get_current_partner()
    if not isinstance(app_id, uuid.UUID):
        try: app_id = uuid.UUID(app_id)
        except: return jsonify({"msg": "Invalid ID"}), 400
        
    app = ScholarshipApplication.query.filter_by(id=app_id).join(Scholarship).filter(Scholarship.partner_id == partner.id).first()
    if not app: return jsonify({"msg": "Not found"}), 404
    
    app.status = "REJECTED"
    db.session.commit()
    return jsonify({"msg": "Rejected"}), 200

@bp_partner.route("/applications/stats", methods=["GET"])
@jwt_required()
def get_application_stats():
    partner = get_current_partner()
    apps = ScholarshipApplication.query.join(Scholarship).filter(Scholarship.partner_id == partner.id).all()
    
    stats = {"total": 0, "approved": 0, "rejected": 0, "pending": 0}
    for app in apps:
        if app.status == "ELIGIBLE_PENDING_CONSENT": continue
        stats["total"] += 1
        if app.status == "APPROVED": stats["approved"] += 1
        elif app.status == "REJECTED": stats["rejected"] += 1
        elif app.status == "APPLIED": stats["pending"] += 1
        
    return jsonify(stats), 200

@bp_partner.route("/applications/<app_id>/documents/<doc_type>", methods=["GET"])
@jwt_required()
def download_document(app_id, doc_type):
    # Mocking a document download feature
    return jsonify({"msg": "Document not found."}), 404
