import sys, os
from dotenv import load_dotenv

load_dotenv() # Load environment variables from .env file

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from flask import Flask, jsonify
from app import create_app
from app.extensions import db
from app.models.account_model import Account
from flask import request

app = create_app()

@app.before_request
def create_tables():
    db.create_all()

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)