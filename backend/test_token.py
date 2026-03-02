import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from app import create_app
from flask_jwt_extended import create_access_token, decode_token
from app.models.account_model import Account

app = create_app()

with app.app_context():
    acc = Account.query.filter_by(username='sv').first()
    if not acc:
        print("Student account 'sv' not found!")
        sys.exit(1)
        
    token = create_access_token(identity=str(acc.id))
    print(f"Generated Token for 'sv': {token[:20]}...")
    
    decoded = decode_token(token)
    print(f"Decoded Identity: {decoded['sub']}")
    print(f"Match: {decoded['sub'] == str(acc.id)}")
    
    acc_from_db = Account.query.get(decoded['sub'])
    print(f"Account found by sub string: {acc_from_db is not None}")
    
    import uuid
    acc_from_db_uuid = Account.query.get(uuid.UUID(decoded['sub']))
    print(f"Account found by sub UUID: {acc_from_db_uuid is not None}")
