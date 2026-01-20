from flask import Flask
from app.extensions import db, migrate, jwt, cors
from app.routes.auth_routes import bp_auth
from app.routes.student_routes import bp_student, bp_student_portal
from app.routes.academic_routes import bp_academic
from app.routes.lecturer_routes import bp_lecturer

def create_app(config_object=None):
    app = Flask(__name__)
    app.config.from_object(config_object or "config.Config")

    cors.init_app(app)
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)

    from app.models import account_model, student_model, staff_models, course_models, organization_model, partner_model
    
    from app.routes.home_routes import bp_home 
    
    # Đang ky blueprint cho API partner
    from app.routes.partner_routes import bp_partner

    app.register_blueprint(bp_home)
    app.register_blueprint(bp_auth)
    app.register_blueprint(bp_student)
    app.register_blueprint(bp_student_portal)
    app.register_blueprint(bp_academic)
    app.register_blueprint(bp_lecturer)
    app.register_blueprint(bp_partner)
    
    return app
