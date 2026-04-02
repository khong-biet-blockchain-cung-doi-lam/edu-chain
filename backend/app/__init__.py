from flask import Flask
from app.extensions import db, migrate, jwt, cors
from app.routes.auth_routes import bp_auth
from app.routes.student_routes import bp_student, bp_student_portal
from app.routes.academic_routes import bp_academic
from app.routes.lecturer_routes import bp_lecturer
from app.routes.encryption_routes import bp_encrypt, bp_decrypt
from app.routes.khao_thi_routes import bp_khao_thi
from app.routes.audit_routes import bp_audit
from app.models import (
    organization_model,
    partner_model,
    enterprise_model,
    scholarship_model,
    student_certificate_model,
    encrypted_cluster_model
)

def create_app(config_object=None):
    app = Flask(__name__)
    app.config.from_object(config_object or "config.Config")

    cors.init_app(app, resources={r"/api/*": {"origins": "*"}})
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)

    from app.models import (
        account_model,
        student_model,
        organization_model,
        partner_model,
        enterprise_model
    )

    from app.routes.home_routes import bp_home
    from app.routes.partner_routes import bp_partner
    from app.routes.student_scholarship_routes import bp_student_scholarship
    from app.routes.management_routes import bp_management
    from app.routes.organization_routes import bp_organization

    app.register_blueprint(bp_home)
    app.register_blueprint(bp_auth)
    app.register_blueprint(bp_student)
    app.register_blueprint(bp_student_portal)
    app.register_blueprint(bp_academic)
    app.register_blueprint(bp_lecturer)
    app.register_blueprint(bp_partner)
    app.register_blueprint(bp_student_scholarship)
    app.register_blueprint(bp_management)
    app.register_blueprint(bp_organization)
    app.register_blueprint(bp_encrypt)
    app.register_blueprint(bp_decrypt)
    app.register_blueprint(bp_khao_thi)
    app.register_blueprint(bp_audit)

    return app
