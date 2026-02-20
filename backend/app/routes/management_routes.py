from flask import Blueprint, request, jsonify
from app.extensions import db
from app.models.account_model import Account
from app.models.student_model import Student
from app.models.partner_model import Partner
from app.models.staff_models import Staff, Lecturer
from app.models.enums import Role, Gender, AcademicStatus
from app.decorators import staff_required
import re
import uuid
import bcrypt

bp_management = Blueprint('management', __name__, url_prefix='/api/management')

@bp_management.route("/accounts", methods=["POST"])
@staff_required(required_role_code=Role.QL_DAO_TAO)
def create_account():
    data = request.json
    username = data.get("username")
    email = data.get("email")
    password = data.get("password")
    role = data.get("role")
    full_name = data.get("full_name")
    
    if not all([username, email, password, role]):
        return jsonify({"msg": "Missing required fields"}), 400
        
    # Domain Validation
    domain_map = {
        Role.SINH_VIEN: "@st.neu.edu.vn",
        Role.GIANG_VIEN: "@lt.neu.edu.vn",
        Role.PARTNER: "@tp.neu.edu.vn",
        Role.QL_DAO_TAO: "@qldt.neu.edu.vn"
    }
    
    required_suffix = domain_map.get(role)
    if not required_suffix:
         return jsonify({"msg": "Invalid role"}), 400
         
    if not email.endswith(required_suffix):
        return jsonify({"msg": f"Email for role {role} must end with {required_suffix}"}), 400
        
    # Create Account
    hashed_pw = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    new_account = Account(
        username=username,
        email=email,
        password_hash=hashed_pw,
        role=role
    )
    db.session.add(new_account)
    db.session.flush() # Get ID
    
    # Create Role Profile
    if role == Role.SINH_VIEN:
        # Auto-generate student code or use provided? Assuming provided or auto logic.
        # For simplicity, using username as student_code if not provided
        student_code = data.get("code", username)
        student = Student(
            id=new_account.id,
            student_id=student_code
        )
        db.session.add(student)
        
    elif role == Role.GIANG_VIEN:
        lecturer = Lecturer(
            id=new_account.id,
            full_name=full_name or username
        )
        db.session.add(lecturer)
        
    elif role == Role.PARTNER:
        # Partner requires enterprise... 
        # This might be complex for a single API call. 
        # Assuming we just create Account here and Profile is filled later?
        # Or require enterprise_id in payload.
        enterprise_id = data.get("enterprise_id")
        if enterprise_id:
            partner = Partner(
                account_id=new_account.id,
                enterprise_id=uuid.UUID(enterprise_id),
                full_name=full_name
            )
            db.session.add(partner)
            
    elif role == Role.QL_DAO_TAO:
        staff = Staff(
            id=new_account.id,
            position=Role.QL_DAO_TAO,
            full_name=full_name
        )
        db.session.add(staff)

    try:
        db.session.commit()
        return jsonify({"msg": "Account created successfully", "id": str(new_account.id)}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"msg": str(e)}), 500
