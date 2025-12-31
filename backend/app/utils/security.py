
import os
import base64
import hashlib
from cryptography.fernet import Fernet
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import rsa, padding
from dotenv import load_dotenv

load_dotenv()

# ===== 1. HASH (CCCD) =====
def hash_value(value: str) -> str:
    salt = os.getenv("PASSWORD_SALT", "default_salt")
    return hashlib.sha256(f"{value}{salt}".encode()).hexdigest()

# ===== 2. SYMMETRIC (AES) =====
FERNET_KEY = os.getenv("FERNET_SECRET_KEY")
if not FERNET_KEY:
    raise ValueError("Thiếu FERNET_SECRET_KEY")

fernet = Fernet(FERNET_KEY)

def encrypt_symmetric(data: str) -> str:
    return fernet.encrypt(data.encode()).decode()

def decrypt_symmetric(token: str) -> str:
    return fernet.decrypt(token.encode()).decode()

# ===== 3. RSA =====
PRIVATE_KEY_PATH = "keys/private_key.pem"
PUBLIC_KEY_PATH = "keys/public_key.pem"

def encrypt_asymmetric(data: str) -> str:
    with open(PUBLIC_KEY_PATH, "rb") as f:
        public_key = serialization.load_pem_public_key(f.read())

    encrypted = public_key.encrypt(
        data.encode(),
        padding.OAEP(
            mgf=padding.MGF1(algorithm=hashes.SHA256()),
            algorithm=hashes.SHA256(),
            label=None
        )
    )
    return base64.b64encode(encrypted).decode()
