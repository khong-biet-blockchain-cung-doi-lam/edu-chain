from run import app
from app.extensions import db
from app.models.account_model import Account

with app.app_context():
    accounts = Account.query.all()
    print("Accounts:")
    for acc in accounts:
        print(f"ID: {acc.id}, Username: {acc.username}, Role: {acc.role}, IsActive: {acc.is_active}")
