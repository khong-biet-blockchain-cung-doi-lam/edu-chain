
from app import create_app
from app.extensions import db
from app.models.account_model import Account
from app.models.staff_models import Staff
from app.models.enums import Role
import bcrypt

def create_sysadmin():
    app = create_app()
    with app.app_context():
        username = 'sysadmin'
        email = 'sysadmin@neu.edu.vn'
        password = 'Admin123!'
        
        existing = Account.query.filter_by(username=username).first()
        if existing:
            print(f"Account {username} already exists.")
            return

        hashed_pw = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        new_acc = Account(
            username=username,
            email=email,
            password_hash=hashed_pw,
            role=Role.ADMIN
        )
        db.session.add(new_acc)
        db.session.flush()
        
        db.session.add(Staff(id=new_acc.id, full_name='System Administrator', position=Role.ADMIN))
        
        db.session.commit()
        print(f"Successfully created sysadmin account: {username}")

if __name__ == '__main__':
    create_sysadmin()
