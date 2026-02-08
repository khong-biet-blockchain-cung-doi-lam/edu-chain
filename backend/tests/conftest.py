"""
pytest configuration file
Thiết lập fixtures và cấu hình cho test suite
"""

import sys
import os

# Add backend directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import pytest
from app import create_app
from app.extensions import db

@pytest.fixture(scope="function")
def app():
    """
    Create application for testing with in-memory SQLite database
    """
    # Tạo Flask app trực tiếp
    from flask import Flask
    
    app = Flask(__name__)
    app.config['TESTING'] = True
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['JWT_SECRET_KEY'] = 'test-secret-key-do-not-use-in-production'
    app.config['JSON_SORT_KEYS'] = False
    
    # Init extensions
    from app.extensions import db as _db, jwt, cors, migrate
    _db.init_app(app)
    jwt.init_app(app)
    cors.init_app(app)
    migrate.init_app(app, _db)
    
    # Import models AFTER db is initialized
    from app.models import account_model, student_model
    
    # Register blueprints
    from app.routes.auth_routes import bp_auth
    from app.routes.student_routes import bp_student, bp_student_portal
    from app.routes.academic_routes import bp_academic
    from app.routes.lecturer_routes import bp_lecturer
    from app.routes.home_routes import bp_home
    
    app.register_blueprint(bp_home)
    app.register_blueprint(bp_auth)
    app.register_blueprint(bp_student)
    app.register_blueprint(bp_student_portal)
    app.register_blueprint(bp_academic)
    app.register_blueprint(bp_lecturer)
    
    # Create tables
    with app.app_context():
        _db.create_all()
        yield app
        _db.session.remove()
        _db.drop_all()

@pytest.fixture
def client(app):
    """Test client for making requests"""
    return app.test_client()

@pytest.fixture
def runner(app):
    """Test CLI runner"""
    return app.test_cli_runner()
