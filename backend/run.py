import sys, os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from flask import Flask
from app import create_app
from app.extensions import db
from app.models.user_model import User
from app.models.account_model import Account

app = create_app()

@app.before_request
def create_tables():
    db.create_all()

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)
