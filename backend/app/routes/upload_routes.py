from flask import Blueprint, request, jsonify
from app.services.excel_upload_service import process_excel_and_upload

bp_upload = Blueprint("upload", __name__, url_prefix="/api/upload")

@bp_upload.route("/students", methods=["POST"])
def upload_students():
    if "file" not in request.files:
        return jsonify({"msg": "Thiếu file Excel"}), 400

    file = request.files["file"]
    result = process_excel_and_upload(file)

    return jsonify(result), 200
