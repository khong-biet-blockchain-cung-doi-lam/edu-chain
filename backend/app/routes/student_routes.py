# app/routes/student_routes.py
import io
from flask import Blueprint, request, jsonify, current_app
from app.extensions import db
from app.models.account_model import Account
from app.models.user_model import User
from passlib.hash import bcrypt
from app.utils.excel_parser import read_excel, validate_dataframe
from sqlalchemy.exc import IntegrityError

bp_student = Blueprint("student", __name__, url_prefix="/api/staff")
# helper để check staff role - đơn giản, bạn sẽ thay bằng auth decorator thực sự
def is_staff_user(user_id):
    # TODO: implement proper role check
    return True

@bp_student.route("/upload-students", methods=["POST"])
def upload_students():
    """
    multipart/form-data: field 'file' chứa file excel
    Yêu cầu: staff auth (ở đây tạm thời không bắt)
    """
    # TODO: kiểm tra auth staff -> hiện tạm bỏ
    if 'file' not in request.files:
        return jsonify({"msg": "Không tìm thấy file trong request"}), 400
    file = request.files['file']
    if file.filename == "":
        return jsonify({"msg": "Tên file rỗng"}), 400

    try:
        df = read_excel(file)
        valid_rows, errors = validate_dataframe(df)
    except Exception as e:
        current_app.logger.exception("Lỗi đọc excel")
        return jsonify({"msg": "Lỗi khi đọc file excel", "error": str(e)}), 500

    results = {"total": len(df), "created": 0, "skipped": 0, "errors": errors.copy()}
    # xử lý bản ghi hợp lệ
    for rec in valid_rows:
        username = rec["student_id"]
        citizen = rec["citizen_id"]
        # chính sách: nếu username đã tồn tại -> skip và báo
        existing = User.query.filter_by(username=username).first()
        if existing:
            results["skipped"] += 1
            results["errors"].append({"row": None, "msg": f"{username} đã tồn tại, đã skip"})
            continue
        # tạo user mới, password_hash từ citizen (bcrypt)
        pwd_hash = bcrypt.hash(citizen)
        new_user = User(username=username, password_hash=pwd_hash, role="student")
        db.session.add(new_user)
        try:
            db.session.flush()  # để phát hiện lỗi unique sớm
            results["created"] += 1
        except IntegrityError:
            db.session.rollback()
            results["skipped"] += 1
            results["errors"].append({"row": None, "msg": f"Lỗi tạo {username}, duplicate?"})
    # commit cuối cùng
    try:
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        current_app.logger.exception("Lỗi commit DB")
        return jsonify({"msg": "Lỗi lưu vào DB", "error": str(e)}), 500

    return jsonify(results), 200
