# app/routes/student_routes.py
from flask import Blueprint, request, jsonify, current_app
from app.services.excel_upload_service import process_excel_and_upload

bp_student = Blueprint("student", __name__, url_prefix="/api/staff")

# helper để check staff role - đơn giản, bạn sẽ thay bằng auth decorator thực sự
def is_staff_user(user_id):
    # TODO: implement proper role check
    return True

@bp_student.route("/upload-students", methods=["POST"])
def upload_students():
    """
    multipart/form-data: field 'file' chứa file excel
    """
    if 'file' not in request.files:
        return jsonify({"msg": "Không tìm thấy file trong request"}), 400
    file = request.files['file']
    if file.filename == "":
        return jsonify({"msg": "Tên file rỗng"}), 400

    try:
        # Gọi service xử lý trọn gói
        results = process_excel_and_upload(file)
        
        # Nếu service trả về dict có key 'errors' và không có 'created' (trường hợp lỗi validation ngay từ đầu)
        if "errors" in results and "created" not in results:
             return jsonify(results), 400
             
        return jsonify(results), 200
        
    except Exception as e:
        current_app.logger.exception("Lỗi upload students")
        return jsonify({"msg": "Lỗi hệ thống", "error": str(e)}), 500
