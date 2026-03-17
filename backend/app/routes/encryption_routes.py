\
\
\
\
\
\
\
\
\
\
\
\
\
\
\
   
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime
import uuid

from app.extensions import db
from app.models.account_model import Account
from app.models.student_model import Student
from app.models.student_personal_info_model import StudentPersonalInfo
from app.models.student_enrollment_model import StudentEnrollment
from app.models.student_contact_model import StudentContact
from app.models.course_models import Grade
from app.models.encrypted_cluster_model import EncryptedCluster
from app.models.enums import Role, ROLE_CLUSTER_MAP
from app.services.encryption_service import hybrid_encrypt, hybrid_decrypt
from app.services.key_management_service import get_public_key, get_private_key

bp_encrypt = Blueprint("encrypt", __name__, url_prefix="/api/encrypt")
bp_decrypt = Blueprint("decrypt", __name__, url_prefix="/api/decrypt")

def get_current_account_role():
    """Lấy account và role của người dùng hiện tại"""
    account_id = get_jwt_identity()
    account = Account.query.get(account_id)
    if not account:
        return None, None
    return account, account.role

def require_roles(*allowed_roles):
    """Kiểm tra người dùng có role phù hợp không"""
    def decorator(f):
        from functools import wraps
        @wraps(f)
        def wrapper(*args, **kwargs):
            account, role = get_current_account_role()
            if not account:
                return jsonify({"msg": "Không tìm thấy tài khoản"}), 401
            if role not in allowed_roles:
                return jsonify({"msg": f"Không có quyền. Yêu cầu: {allowed_roles}"}), 403
            return f(*args, **kwargs)
        return wrapper
    return decorator

@bp_encrypt.route("/clusters", methods=["GET"])
@jwt_required()
@require_roles(Role.QL_DAO_TAO, Role.KHAO_THI, Role.ADMIN)
def list_clusters():
    """Lấy danh sách clusters mà role hiện tại quản lý"""
    account, role = get_current_account_role()
    
    if role == Role.ADMIN:
        clusters = EncryptedCluster.query.order_by(EncryptedCluster.created_at.desc()).all()
    else:
        cluster_type = ROLE_CLUSTER_MAP.get(role)
        clusters = EncryptedCluster.query.filter_by(
            cluster_type=cluster_type
        ).order_by(EncryptedCluster.created_at.desc()).all()

    return jsonify([c.to_safe_dict() for c in clusters]), 200

@bp_encrypt.route("/clusters/stats", methods=["GET"])
@jwt_required()
@require_roles(Role.QL_DAO_TAO, Role.KHAO_THI, Role.ADMIN)
def cluster_stats():
    """Thống kê trạng thái clusters"""
    account, role = get_current_account_role()
    
    if role == Role.ADMIN:
        query = EncryptedCluster.query
    else:
        cluster_type = ROLE_CLUSTER_MAP.get(role)
        query = EncryptedCluster.query.filter_by(cluster_type=cluster_type)

    total = query.count()
    by_status = {}
    for c in query.all():
        by_status[c.status] = by_status.get(c.status, 0) + 1

    return jsonify({
        "total": total,
        "by_status": by_status,
        "role": role,
        "cluster_type": ROLE_CLUSTER_MAP.get(role, "all") if role != Role.ADMIN else "all"
    }), 200

@bp_encrypt.route("/student-profile/<student_id>", methods=["POST"])
@jwt_required()
@require_roles(Role.QL_DAO_TAO, Role.ADMIN)
def encrypt_student_profile(student_id):
    """
    Mã hóa toàn bộ thông tin hồ sơ 1 sinh viên → lưu vào EncryptedCluster.
    Nếu đã có cluster thì tạo phiên bản mới (version + 1).
    """
    try:
        student_uuid = uuid.UUID(student_id)
    except ValueError:
        return jsonify({"msg": "ID không hợp lệ"}), 400

    student = Student.query.get(student_uuid)
    if not student:
        return jsonify({"msg": "Không tìm thấy sinh viên"}), 404

    profile_data = _collect_student_profile(student)
    
    try:
        public_key = get_public_key(Role.QL_DAO_TAO)
    except EnvironmentError as e:
        return jsonify({"msg": str(e), "hint": "Chạy /api/encrypt/init-keys để tạo key"}), 500

    encrypted = hybrid_encrypt(profile_data, public_key)

    existing = EncryptedCluster.query.filter_by(
        cluster_type="student_profile",
        subject_id=student_uuid
    ).order_by(EncryptedCluster.version.desc()).first()

    version = (existing.version + 1) if existing else 1

    cluster = EncryptedCluster(
        cluster_type="student_profile",
        subject_id=student_uuid,
        subject_code=student.student_id,
        ciphertext=encrypted["ciphertext"],
        iv=encrypted["iv"],
        encrypted_aes_key=encrypted["encrypted_aes_key"],
        managed_by_role=Role.QL_DAO_TAO,
        status="ENCRYPTED",
        version=version
    )
    db.session.add(cluster)
    db.session.commit()

    return jsonify({
        "msg": "Đã mã hóa hồ sơ sinh viên thành công",
        "cluster_id": str(cluster.id),
        "subject_code": student.student_id,
        "version": version,
        "status": "ENCRYPTED"
    }), 201

@bp_encrypt.route("/student-grades/<student_id>", methods=["POST"])
@jwt_required()
@require_roles(Role.KHAO_THI, Role.ADMIN)
def encrypt_student_grades(student_id):
    """
    Mã hóa toàn bộ điểm số của 1 sinh viên → lưu vào EncryptedCluster.
    """
    try:
        student_uuid = uuid.UUID(student_id)
    except ValueError:
        return jsonify({"msg": "ID không hợp lệ"}), 400

    student = Student.query.get(student_uuid)
    if not student:
        return jsonify({"msg": "Không tìm thấy sinh viên"}), 404

    grades = Grade.query.filter_by(student_id=student_uuid).all()
    if not grades:
        return jsonify({"msg": "Sinh viên chưa có dữ liệu điểm"}), 404

    grades_data = _collect_student_grades(student, grades)

    try:
        public_key = get_public_key(Role.KHAO_THI)
    except EnvironmentError as e:
        return jsonify({"msg": str(e), "hint": "Chạy /api/encrypt/init-keys để tạo key"}), 500

    encrypted = hybrid_encrypt(grades_data, public_key)

    existing = EncryptedCluster.query.filter_by(
        cluster_type="student_grades",
        subject_id=student_uuid
    ).order_by(EncryptedCluster.version.desc()).first()

    version = (existing.version + 1) if existing else 1

    cluster = EncryptedCluster(
        cluster_type="student_grades",
        subject_id=student_uuid,
        subject_code=student.student_id,
        ciphertext=encrypted["ciphertext"],
        iv=encrypted["iv"],
        encrypted_aes_key=encrypted["encrypted_aes_key"],
        managed_by_role=Role.KHAO_THI,
        status="ENCRYPTED",
        version=version
    )
    db.session.add(cluster)
    db.session.commit()

    return jsonify({
        "msg": f"Đã mã hóa {len(grades)} môn học thành công",
        "cluster_id": str(cluster.id),
        "subject_code": student.student_id,
        "total_grades": len(grades),
        "version": version,
        "status": "ENCRYPTED"
    }), 201

@bp_encrypt.route("/class-grades/<class_id>", methods=["POST"])
@jwt_required()
@require_roles(Role.KHAO_THI, Role.ADMIN)
def encrypt_class_grades(class_id):
    """
    Mã hóa toàn bộ điểm số của một lớp học phần → lưu vào EncryptedCluster.
    """
    from app.models.course_models import CourseClass
    try:
        class_uuid = uuid.UUID(class_id)
    except ValueError:
        return jsonify({"msg": "ID không hợp lệ"}), 400

    course_class = CourseClass.query.get(class_uuid)
    if not course_class:
        return jsonify({"msg": "Lớp học phần không tồn tại"}), 404

    grades = course_class.grades
    if not grades:
        return jsonify({"msg": "Lớp chưa có dữ liệu điểm"}), 404

    # Build grades data for the whole class
    grades_list = []
    for g in grades:
        s = g.student
        full_name = ""
        if s and s.personal_info:
            pi = s.personal_info
            full_name = f"{pi.last_name} {pi.first_name}".strip()
        grades_list.append({
            "grade_id": str(g.id),
            "student_id": s.student_id if s else None,
            "full_name": full_name,
            "class_code": course_class.class_code,
            "class_name": course_class.name,
            "subject": course_class.subject.name if course_class.subject else None,
            "credits": course_class.subject.credits if course_class.subject else None,
            "semester": course_class.semester.code if course_class.semester else None,
            "regular_score": g.regular_score,
            "midterm_score": g.midterm_score,
            "final_score": g.final_score,
            "total_score": g.total_score,
            "status": g.status,
        })

    class_data = {
        "cluster_type": "student_grades",
        "class_id": str(course_class.id),
        "class_code": course_class.class_code,
        "class_name": course_class.name,
        "subject": course_class.subject.name if course_class.subject else None,
        "semester": course_class.semester.code if course_class.semester else None,
        "total_students": len(grades_list),
        "grades": grades_list,
    }

    try:
        public_key = get_public_key(Role.KHAO_THI)
    except EnvironmentError as e:
        return jsonify({"msg": str(e), "hint": "Chạy /api/encrypt/init-keys để tạo key"}), 500

    encrypted = hybrid_encrypt(class_data, public_key)

    existing = EncryptedCluster.query.filter_by(
        cluster_type="student_grades",
        subject_id=class_uuid
    ).order_by(EncryptedCluster.version.desc()).first()

    version = (existing.version + 1) if existing else 1

    cluster = EncryptedCluster(
        cluster_type="student_grades",
        subject_id=class_uuid,
        subject_code=course_class.class_code,
        ciphertext=encrypted["ciphertext"],
        iv=encrypted["iv"],
        encrypted_aes_key=encrypted["encrypted_aes_key"],
        managed_by_role=Role.KHAO_THI,
        status="ENCRYPTED",
        version=version
    )
    db.session.add(cluster)
    db.session.commit()

    return jsonify({
        "msg": f"Đã mã hóa {len(grades)} sinh viên trong lớp {course_class.class_code}",
        "cluster_id": str(cluster.id),
        "subject_code": course_class.class_code,
        "total_students": len(grades_list),
        "version": version,
        "status": "ENCRYPTED"
    }), 201

@bp_decrypt.route("/cluster/<cluster_id>", methods=["POST"])
@jwt_required()
@require_roles(Role.QL_DAO_TAO, Role.KHAO_THI, Role.ADMIN)
def decrypt_cluster(cluster_id):
    """
    Giải mã 1 cluster.
    Body JSON: { "private_key_pem": "..." }  (optional, ưu tiên env var)
    
    Chỉ phòng ban quản lý cluster đó mới có quyền giải mã.
    """
    account, role = get_current_account_role()
    
    try:
        cluster_uuid = uuid.UUID(cluster_id)
    except ValueError:
        return jsonify({"msg": "Cluster ID không hợp lệ"}), 400

    cluster = EncryptedCluster.query.get(cluster_uuid)
    if not cluster:
        return jsonify({"msg": "Cluster không tồn tại"}), 404

    if role != Role.ADMIN and cluster.managed_by_role != role:
        return jsonify({
            "msg": f"Cluster này thuộc phòng '{cluster.managed_by_role}', không phải '{role}'"
        }), 403

    data = request.get_json(silent=True) or {}
    provided_key = data.get("private_key_pem")
    
    try:
        private_key = provided_key if provided_key else get_private_key(cluster.managed_by_role)
    except EnvironmentError as e:
        return jsonify({
            "msg": "Không tìm thấy private key",
            "detail": str(e),
            "hint": "Cung cấp private_key_pem trong body hoặc cấu hình .env"
        }), 400

    try:
        decrypted_data = hybrid_decrypt(
            ciphertext_b64=cluster.ciphertext,
            iv_b64=cluster.iv,
            encrypted_aes_key_b64=cluster.encrypted_aes_key,
            private_key_pem=private_key
        )
    except Exception as e:
        return jsonify({"msg": "Giải mã thất bại", "detail": str(e)}), 400

    cluster.status = "DECRYPTED"
    cluster.decrypted_by = account.id
    cluster.decrypted_at = datetime.utcnow()
    db.session.commit()

    return jsonify({
        "msg": "Giải mã thành công. Dữ liệu đã sẵn sàng cho blockchain.",
        "cluster_id": str(cluster.id),
        "cluster_type": cluster.cluster_type,
        "subject_code": cluster.subject_code,
        "status": "DECRYPTED",
        "decrypted_at": cluster.decrypted_at.isoformat(),
        "data": decrypted_data
    }), 200

@bp_encrypt.route("/send-to-blockchain/<cluster_id>", methods=["POST"])
@jwt_required()
@require_roles(Role.QL_DAO_TAO, Role.KHAO_THI, Role.ADMIN)
def send_to_blockchain(cluster_id):
    account, role = get_current_account_role()
    
    try:
        cluster_uuid = uuid.UUID(cluster_id)
    except ValueError:
        return jsonify({"msg": "Cluster ID không hợp lệ"}), 400

    cluster = EncryptedCluster.query.get(cluster_uuid)
    if not cluster:
        return jsonify({"msg": "Cluster không tồn tại"}), 404

    if role != Role.ADMIN and cluster.managed_by_role != role:
        return jsonify({"msg": "Không có quyền gửi cluster này"}), 403

    if cluster.status != "DECRYPTED":
        return jsonify({"msg": "Chỉ có thể gửi cluster đã được giải mã cẩn thận"}), 400

    data = request.get_json() or {}
    decrypted_data = data.get("data")
    if not decrypted_data:
        return jsonify({"msg": "Vui lòng cung cấp dữ liệu đã giải mã để gửi"}), 400

    from app.services.blockchain_service import BlockchainService
    bc_service = BlockchainService()

    # In a real system, you would fetch the proper keys and addresses for authorized parties.
    # We use empty lists or admin key for demonstration to let the contract logic handle defaults.
    system_pk = bc_service._system_pk
    
    try:
        tx_info = {}
        if cluster.cluster_type == "student_profile":
            tx_info = bc_service.create_student_profile(
                student_id=cluster.subject_code,
                profile_data=decrypted_data,
                authorized_public_keys_pem=[],
                authorized_addresses=[],
                private_key=system_pk
            )
        elif cluster.cluster_type == "student_grades":
            tx_info = bc_service.submit_grade(
                student_id=cluster.subject_code,
                semester_id="HK1_2526", # Using default mock semester for now
                grade_data=decrypted_data,
                authorized_public_keys_pem=[],
                authorized_addresses=[],
                private_key=system_pk
            )
            
            # Send email
            from app.utils.email_utils import send_grades_email
            student = Student.query.filter_by(student_id=cluster.subject_code).first()
            if student and hasattr(student, 'contact') and student.contact and student.contact.personal_email:
                send_grades_email(student.contact.personal_email, student.student_id, decrypted_data)
        
        cluster.status = "SENT"
        # We would ideally have 'tx_hash' and 'ipfs_hash' columns in EncryptedCluster, 
        # but since they might not be added in the DB schema, we return them in the response.
        db.session.commit()
        
        return jsonify({
            "msg": "Đã gửi dữ liệu lên Blockchain thành công",
            "tx_hash": tx_info.get("tx_hash"),
            "ipfs_hash": tx_info.get("ipfs_hash"),
            "status": "SENT"
        }), 200

    except Exception as e:
        return jsonify({"msg": "Blockchain Error", "detail": str(e)}), 400

@bp_encrypt.route("/init-keys", methods=["POST"])
@jwt_required()
@require_roles(Role.ADMIN)
def init_keys():
    """
    Tạo RSA key pair cho tất cả phòng ban nếu chưa có.
    Chỉ ADMIN mới được gọi endpoint này.
    Ghi key ra file generated_keys.env.
    """
    from app.services.key_management_service import initialize_keys_if_missing
    all_exist = initialize_keys_if_missing()
    
    if all_exist:
        return jsonify({"msg": "Tất cả key đã tồn tại, không cần tạo mới"}), 200
    else:
        return jsonify({
            "msg": "Đã tạo RSA key pair mới",
            "action": "Vui lòng copy nội dung file 'generated_keys.env' vào .env rồi restart server",
            "warning": "Xóa file generated_keys.env sau khi đã copy để bảo mật"
        }), 201

def _collect_student_profile(student: Student) -> dict:
    """Thu thập tất cả thông tin hồ sơ sinh viên thành 1 dict"""
    data = {
        "student_id": student.student_id,
        "cluster_type": "student_profile",
    }
    
    if student.personal_info:
        pi = student.personal_info
        data["personal_info"] = {
            "first_name": pi.first_name,
            "last_name": pi.last_name,
            "date_of_birth": str(pi.date_of_birth) if pi.date_of_birth else None,
            "gender": pi.gender,
            "national_id_number": pi.national_id_number,
            "academic_status": pi.academic_status,
            "place_of_birth": pi.place_of_birth,
            "ethnicity": pi.ethnicity,
            "nationality": pi.nationality,
        }
    
    if hasattr(student, 'contact') and student.contact:
        c = student.contact
        data["contact"] = {
            "email": c.email,
            "phone": c.phone,
            "permanent_address": c.permanent_address,
            "current_address": c.current_address,
        }
    
    if hasattr(student, 'enrollment') and student.enrollment:
        e = student.enrollment
        data["enrollment"] = {
            "major": e.major,
            "cohort": e.cohort,
            "faculty": e.faculty,
            "enrollment_date": str(e.enrollment_date) if e.enrollment_date else None,
            "expected_graduation": str(e.expected_graduation) if e.expected_graduation else None,
        }
    
    return data

def _collect_student_grades(student: Student, grades: list) -> dict:
    """Thu thập tất cả điểm số sinh viên thành 1 dict"""
    grades_list = []
    for g in grades:
        grades_list.append({
            "grade_id": str(g.id),
            "class_code": g.course_class.class_code if g.course_class else None,
            "class_name": g.course_class.name if g.course_class else None,
            "subject": g.course_class.subject.name if (g.course_class and g.course_class.subject) else None,
            "credits": g.course_class.subject.credits if (g.course_class and g.course_class.subject) else None,
            "semester": g.course_class.semester.code if (g.course_class and g.course_class.semester) else None,
            "regular_score": g.regular_score,
            "midterm_score": g.midterm_score,
            "final_score": g.final_score,
            "total_score": g.total_score,
            "status": g.status,
        })
    
    return {
        "student_id": student.student_id,
        "cluster_type": "student_grades",
        "total_subjects": len(grades),
        "grades": grades_list,
    }
