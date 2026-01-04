from app import create_app
from sqlalchemy import inspect
from dotenv import load_dotenv

load_dotenv()
app = create_app()

with app.app_context():
    db = app.extensions['sqlalchemy']
    inspector = inspect(db.engine)
    tables = inspector.get_table_names()
    print("Tables found:", tables)
    
    if 'accounts' in tables:
        print("Columns in 'accounts':")
        for col in inspector.get_columns('accounts'):
            print(f" - {col['name']} ({col['type']})")

    if 'account' in tables:
        print("Columns in 'account':")
        for col in inspector.get_columns('account'):
            print(f" - {col['name']} ({col['type']})")
