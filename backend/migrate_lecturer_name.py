from app import create_app, db
from sqlalchemy import text

app = create_app()

with app.app_context():
    try:
        with db.engine.connect() as conn:
            result = conn.execute(text("PRAGMA table_info(lecturer)"))
            columns = [row.name for row in result]
            if 'full_name' not in columns:
                print("Adding full_name column to lecturer table...")
                conn.execute(text("ALTER TABLE lecturer ADD COLUMN full_name VARCHAR(255)"))
                conn.commit()
                print("Column added.")
            else:
                print("full_name column already exists.")
                
    except Exception as e:
        print(f"Error: {e}")
