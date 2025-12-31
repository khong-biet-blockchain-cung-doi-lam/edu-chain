from flask import Blueprint, request, jsonify
from ..models.account_model import Account
import bcrypt
from flask_jwt_extended import create_access_token
from datetime import timedelta

bp_auth = Blueprint("auth", __name__, url_prefix="/api/auth")

@bp_auth.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    username = data.get("username", "").strip()
    password = data.get("password", "")

    if not username or not password:
        return jsonify({"msg": "Thiếu username hoặc password"}), 400

    account = Account.query.filter_by(username=username).first()

    if not account:
        return jsonify({"msg": "Tài khoản không tồn tại"}), 401

    # Check password
    if not bcrypt.checkpw(password.encode('utf-8'), account.password_hash.encode('utf-8')):
        return jsonify({"msg": "Sai mật khẩu"}), 401

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
