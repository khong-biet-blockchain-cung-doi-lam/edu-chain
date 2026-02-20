from app import create_app, db
from sqlalchemy import text

app = create_app()

with app.app_context():
    try:
        # Check if email column exists
        with db.engine.connect() as conn:
            result = conn.execute(text("PRAGMA table_info(account)"))
            columns = [row.name for row in result]
            if 'email' not in columns:
                print("Adding email column to account table...")
                conn.execute(text("ALTER TABLE account ADD COLUMN email VARCHAR(120)"))
                # Add unique constraint? SQLite limitation on ALTER TABLE. 
                # We can rely on app level check or just index.
                # SQLite supports ADD COLUMN but UNIQUE constraint might need index creation.
                conn.execute(text("CREATE UNIQUE INDEX ix_account_email ON account (email)"))
                conn.commit()
                print("Column added.")
            else:
                print("Email column already exists.")
                
    except Exception as e:
        print(f"Error: {e}")
