# app/extensions.py
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
from passlib.hash import bcrypt

db = SQLAlchemy()
migrate = Migrate()
jwt = JWTManager()

# Lưu ý: passlib bcrypt dùng trực tiếp để hash/verify
# Ví dụ hash: bcrypt.hash("plain")
# verify: bcrypt.verify("plain", hash)
