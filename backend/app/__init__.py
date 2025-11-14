from flask import Flask
from app.extensions import db, migrate, jwt
from app.routes.auth_routes import bp_auth
from app.routes.student_routes import bp_student
from app.routes.home_routes import bp_home

def create_app(config_object=None):
    app = Flask(__name__)
    app.config.from_object(config_object or "config.Config")

    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)

    app.register_blueprint(bp_home)
    app.register_blueprint(bp_auth)
    app.register_blueprint(bp_student)

    return app
