from run import app
from app.extensions import db
from app.models.account_model import Account

with app.app_context():
    acc = Account.query.filter_by(username='qldt').first()
    if acc:
        print(f"FOUND qldt: ID: {acc.id}, Role: {acc.role}")
    else:
        print("qldt NOT FOUND")
        all_acc = Account.query.all()
        for a in all_acc:
            print(f"User: {a.username}, Role: {a.role}")
