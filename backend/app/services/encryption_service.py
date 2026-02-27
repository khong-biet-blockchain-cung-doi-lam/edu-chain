"""
encryption_service.py
Hybrid Encryption: AES-256-GCM (data) + RSA-2048 (key wrapping)

Luồng mã hóa:
    1. Tạo AES key ngẫu nhiên 32 bytes
    2. Mã hóa dữ liệu bằng AES-256-GCM → (ciphertext, iv, tag)
    3. Mã hóa AES key bằng RSA Public Key → encrypted_aes_key
    4. Lưu tất cả vào Supabase

Luồng giải mã:
    1. Dùng RSA Private Key → giải mã encrypted_aes_key → AES key
    2. Dùng AES key → giải mã ciphertext → dữ liệu gốc
"""

import os
import json
import base64
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from cryptography.hazmat.primitives.asymmetric import padding
from cryptography.hazmat.primitives import hashes, serialization


# ========== AES-256-GCM ==========

def generate_aes_key() -> bytes:
    """Tạo AES key ngẫu nhiên 32 bytes (256-bit)"""
    return os.urandom(32)


def aes_encrypt(data: dict | str, aes_key: bytes) -> dict:
    """
    Mã hóa dữ liệu bằng AES-256-GCM.
    
    Args:
        data: dict hoặc string cần mã hóa
        aes_key: 32 bytes AES key
    
    Returns:
        {
            "ciphertext": "<base64>",
            "iv": "<base64>",
            "tag_included": True  # GCM tự gắn tag vào ciphertext
        }
    """
    if isinstance(data, dict):
        plaintext = json.dumps(data, ensure_ascii=False).encode("utf-8")
    elif isinstance(data, str):
        plaintext = data.encode("utf-8")
    else:
        raise ValueError("data phải là dict hoặc string")

    iv = os.urandom(12)  # GCM nonce 96-bit
    aesgcm = AESGCM(aes_key)
    # AES-GCM trả về ciphertext + 16-byte tag ghép cuối
    ciphertext_with_tag = aesgcm.encrypt(iv, plaintext, None)

    return {
        "ciphertext": base64.b64encode(ciphertext_with_tag).decode("utf-8"),
        "iv": base64.b64encode(iv).decode("utf-8"),
    }


def aes_decrypt(ciphertext_b64: str, iv_b64: str, aes_key: bytes) -> dict | str:
    """
    Giải mã dữ liệu AES-256-GCM.
    
    Returns:
        dict nếu dữ liệu gốc là JSON, string nếu không
    """
    ciphertext_with_tag = base64.b64decode(ciphertext_b64)
    iv = base64.b64decode(iv_b64)

    aesgcm = AESGCM(aes_key)
    plaintext = aesgcm.decrypt(iv, ciphertext_with_tag, None)
    text = plaintext.decode("utf-8")

    try:
        return json.loads(text)
    except json.JSONDecodeError:
        return text


# ========== RSA-2048 ==========

def rsa_encrypt_key(aes_key: bytes, public_key_pem: str) -> str:
    """
    Mã hóa AES key bằng RSA public key (OAEP + SHA-256).
    
    Returns:
        base64 string của encrypted AES key
    """
    from cryptography.hazmat.primitives.asymmetric.rsa import RSAPublicKey
    public_key = serialization.load_pem_public_key(public_key_pem.encode("utf-8"))
    
    encrypted = public_key.encrypt(
        aes_key,
        padding.OAEP(
            mgf=padding.MGF1(algorithm=hashes.SHA256()),
            algorithm=hashes.SHA256(),
            label=None
        )
    )
    return base64.b64encode(encrypted).decode("utf-8")


def rsa_decrypt_key(encrypted_key_b64: str, private_key_pem: str, passphrase: bytes = None) -> bytes:
    """
    Giải mã AES key bằng RSA private key.
    
    Returns:
        AES key bytes (32 bytes)
    """
    private_key = serialization.load_pem_private_key(
        private_key_pem.encode("utf-8"),
        password=passphrase
    )
    
    encrypted_key = base64.b64decode(encrypted_key_b64)
    aes_key = private_key.decrypt(
        encrypted_key,
        padding.OAEP(
            mgf=padding.MGF1(algorithm=hashes.SHA256()),
            algorithm=hashes.SHA256(),
            label=None
        )
    )
    return aes_key


# ========== HYBRID ENCRYPT / DECRYPT ==========

def hybrid_encrypt(data: dict | str, public_key_pem: str) -> dict:
    """
    Mã hóa hybrid: AES-256-GCM data + RSA-2048 key wrapping.
    
    Returns:
        {
            "ciphertext": "<base64>",
            "iv": "<base64>",
            "encrypted_aes_key": "<base64>"
        }
    """
    aes_key = generate_aes_key()
    encrypted_data = aes_encrypt(data, aes_key)
    encrypted_key = rsa_encrypt_key(aes_key, public_key_pem)

    return {
        "ciphertext": encrypted_data["ciphertext"],
        "iv": encrypted_data["iv"],
        "encrypted_aes_key": encrypted_key
    }


def hybrid_decrypt(ciphertext_b64: str, iv_b64: str, encrypted_aes_key_b64: str, 
                   private_key_pem: str, passphrase: bytes = None) -> dict | str:
    """
    Giải mã hybrid: RSA giải mã AES key → AES giải mã data.
    
    Returns:
        Dữ liệu gốc (dict hoặc string)
    """
    aes_key = rsa_decrypt_key(encrypted_aes_key_b64, private_key_pem, passphrase)
    return aes_decrypt(ciphertext_b64, iv_b64, aes_key)
