from flask import Flask
from app.extensions import db, migrate, jwt, cors
from app.routes.auth_routes import bp_auth
from app.routes.student_routes import bp_student, bp_student_portal
# from app.routes.upload_routes import bp_upload 
# from app.routes.home_routes import bp_home

def create_app(config_object=None):
    app = Flask(__name__)
    app.config.from_object(config_object or "config.Config")

    cors.init_app(app)
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)

    # Import models AFTER db is initialized
    from app.models import account_model, student_model
    
    # app.register_blueprint(bp_home)
    app.register_blueprint(bp_auth)
    app.register_blueprint(bp_student)
    app.register_blueprint(bp_student_portal)
    # app.register_blueprint(bp_upload)
    return app