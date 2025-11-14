# app/routes/auth_routes.py
from flask import Blueprint, request, jsonify
from app.extensions import db
from app.models.user_model import User
from app.models.account_model import Account
from passlib.hash import bcrypt
from flask_jwt_extended import create_access_token
from datetime import timedelta

bp_auth = Blueprint("auth", __name__, url_prefix="/api/auth")

@bp_auth.route("/login", methods=["POST"])
def login():
    """
    Body JSON: { "username": "...", "password": "..." }
    Trả về: { access_token, user }
    """
    data = request.get_json(force=True)
    username = data.get("username", "").strip()
    password = data.get("password", "")

    if not username or not password:
        return jsonify({"msg": "username và password là bắt buộc"}), 400

    user = User.query.filter_by(username=username).first()
    if not user or not user.is_active:
        return jsonify({"msg": "Tài khoản không tồn tại hoặc đã bị khoá"}), 401

    # verify password
    try:
        if not bcrypt.verify(password, user.password_hash):
            return jsonify({"msg": "Sai thông tin đăng nhập"}), 401
    except Exception:
        return jsonify({"msg": "Lỗi xác thực"}), 500

    access_token = create_access_token(identity=str(user.id), expires_delta=timedelta(hours=8))
    return jsonify({"access_token": access_token, "user": user.to_dict()}), 200
@bp_auth.route("/register", methods=["POST"])
def register():
    """
    Body JSON: { "username": "...", "password": "...", "role": "student"|"staff" }
    Trả về: { user }
    """
    data = request.get_json(force=True)
    username = data.get("username", "").strip()
    password = data.get("password", "")
    role = data.get("role", "student").strip()

    if not username or not password:
        return jsonify({"msg": "username và password là bắt buộc"}), 400
    if role not in ["student", "staff"]:
        return jsonify({"msg": "role không hợp lệ"}), 400

    existing_user = User.query.filter_by(username=username).first()
    if existing_user:
        return jsonify({"msg": "Tài khoản đã tồn tại"}), 409

    password_hash = bcrypt.hash(password)
    new_user = User(username=username, password_hash=password_hash, role=role)
    db.session.add(new_user)
    db.session.commit()

    return jsonify({"user": new_user.to_dict()}), 201