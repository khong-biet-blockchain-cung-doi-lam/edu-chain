import os
from sqlalchemy import create_engine, inspect
from dotenv import load_dotenv

# Load .env
load_dotenv()

database_url = os.getenv("DATABASE_URL")

if not database_url:
    print("❌ Error: DATABASE_URL not found in .env")
    exit(1)

print(f"Connecting to: {database_url.split('@')[-1]}") # Hide password

try:
    engine = create_engine(database_url)
    inspector = inspect(engine)
    
    table_names = inspector.get_table_names()
    print(f"\n[OK] Connection Successful! Found {len(table_names)} tables.")
    
    for table in table_names:
        print(f"\nExample Table: {table}")
        columns = inspector.get_columns(table)
        for col in columns:
            print(f"  - {col['name']} ({col['type']})")
            
except Exception as e:
    print(f"\n[ERROR] Connection Failed: {e}")
