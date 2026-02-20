from app import create_app, db
from sqlalchemy import text, inspect

app = create_app()

with app.app_context():
    try:
        inspector = inspect(db.engine)
        
        # 1. Migrate Account (Add email)
        if 'account' in inspector.get_table_names():
            cols = [c['name'] for c in inspector.get_columns('account')]
            if 'email' not in cols:
                print("Adding email to account...")
                with db.engine.connect() as conn:
                    conn.execute(text("ALTER TABLE account ADD COLUMN email VARCHAR(120)"))
                    conn.execute(text("CREATE UNIQUE INDEX ix_account_email ON account (email)"))
                    conn.commit()
                print("Added email to account.")
            else:
                print("Account email already exists.")
        
        # 2. Migrate Lecturer (Add full_name)
        if 'lecturer' in inspector.get_table_names():
            cols = [c['name'] for c in inspector.get_columns('lecturer')]
            if 'full_name' not in cols:
                print("Adding full_name to lecturer...")
                with db.engine.connect() as conn:
                    conn.execute(text("ALTER TABLE lecturer ADD COLUMN full_name VARCHAR(255)"))
                    conn.commit()
                print("Added full_name to lecturer.")
            else:
                print("Lecturer full_name already exists.")
                
    except Exception as e:
        print(f"Migration Error: {e}")
