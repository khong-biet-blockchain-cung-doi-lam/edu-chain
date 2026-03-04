from flask import Blueprint, request, jsonify
from app.models.account_model import Account
from flask_jwt_extended import create_access_token
from datetime import timedelta
import bcrypt

bp_auth = Blueprint("auth", __name__, url_prefix="/api/auth")

@bp_auth.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    username = data.get("username", "") if data else ""
    password = data.get("password", "")
    print(f"DEBUG LOGIN: Received username: '{username}'")
    username = username.strip()

    if not username or not data.get("password"):
        print("DEBUG LOGIN: Missing fields")
        return jsonify({"msg": "Thiếu username/email hoặc password"}), 400

    print(f"DEBUG LOGIN: Querying for '{username}'")
    account = Account.query.filter((Account.username == username) | (Account.email == username)).first()

    if not account:
        print(f"DEBUG LOGIN: Account '{username}' NOT FOUND in DB.")
        return jsonify({"msg": "Tài khoản không tồn tại"}), 401
    
    print(f"DEBUG LOGIN: Found account {account.username} (Role: {account.role})")

    try:
        stored_hash = account.password_hash.encode('utf-8')
        input_pass = password.encode('utf-8')
        
        if not bcrypt.checkpw(input_pass, stored_hash):
            return jsonify({"msg": "Sai mật khẩu"}), 401
    except Exception as e:
        print(f"Login error: {e}")
        return jsonify({"msg": f"Lỗi xác thực mật khẩu: {str(e)}"}), 500

    token = create_access_token(
        identity=str(account.id),
        expires_delta=timedelta(hours=8)
    )

    return jsonify({
        "access_token": token,
        "user": {
            "id": account.id,
            "username": account.username,
            "role": account.role
        }
    }), 200

@bp_auth.route("/login-staff", methods=["POST"])
def login_staff():
    data = request.get_json()
    username = data.get("username", "").strip()
    password = data.get("password", "")

    if not username or not password:
        return jsonify({"msg": "Vui lòng nhập Username và Password"}), 400

    account = Account.query.filter_by(username=username).first()

    if not account:
        return jsonify({"msg": "Tài khoản không tồn tại"}), 401

    if account.role != 'staff':
        return jsonify({
            "msg": "Truy cập bị từ chối! Cổng này chỉ dành cho Nhân viên (Staff)."
        }), 403

    try:
        stored_hash = account.password_hash.encode('utf-8')
        input_pass = password.encode('utf-8')
        
        if not bcrypt.checkpw(input_pass, stored_hash):
            return jsonify({"msg": "Sai mật khẩu"}), 401
    except Exception as e:
        print(f"Login error: {e}")
        return jsonify({"msg": "Lỗi hệ thống khi xác thực"}), 500

    token = create_access_token(
        identity=str(account.id),
        expires_delta=timedelta(hours=8)
    )

    return jsonify({
        "msg": "Đăng nhập Staff thành công",
        "access_token": token,
        "user": {
            "id": account.id,
            "username": account.username,
            "role": account.role
        }
    }), 200
