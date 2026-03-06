"""
Script: Tạo RSA key pair cho các phòng ban và lưu vào .env
Chạy 1 lần khi setup hệ thống.
Usage: python scripts/generate_keys.py
"""

import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from cryptography.hazmat.primitives.asymmetric import rsa
from cryptography.hazmat.primitives import serialization

DEPARTMENTS = {
    "QL_DAO_TAO": {
        "public_env":  "RSA_PUBLIC_KEY_QLDT",
        "private_env": "RSA_PRIVATE_KEY_QLDT",
    },
    "KHAO_THI": {
        "public_env":  "RSA_PUBLIC_KEY_KHAOTHI",
        "private_env": "RSA_PRIVATE_KEY_KHAOTHI",
    },
}


def generate_keypair():
    key = rsa.generate_private_key(public_exponent=65537, key_size=2048)
    private_pem = key.private_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PrivateFormat.TraditionalOpenSSL,
        encryption_algorithm=serialization.NoEncryption()
    ).decode("utf-8")
    public_pem = key.public_key().public_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PublicFormat.SubjectPublicKeyInfo
    ).decode("utf-8")
    return public_pem, private_pem


def main():
    env_path = os.path.join(os.path.dirname(__file__), '../.env')
    
    # Đọc .env hiện tại
    existing_lines = []
    if os.path.exists(env_path):
        with open(env_path, 'r', encoding='utf-8') as f:
            existing_lines = f.readlines()
    
    existing_content = "".join(existing_lines)
    append_lines = []
    
    print("Tao RSA key pair cho cac phong ban...\n")
    
    for dept, keys in DEPARTMENTS.items():
        pub_env = keys["public_env"]
        priv_env = keys["private_env"]
        
        if pub_env in existing_content and priv_env in existing_content:
            print(f"✅ {dept}: Key đã tồn tại, bỏ qua")
            continue
        
        print(f"Dang tao key cho {dept}...")
        pub, priv = generate_keypair()
        
        # Chuyển sang single-line (thay \n bằng \\n) cho .env
        pub_single  = pub.replace("\n", "\\n")
        priv_single = priv.replace("\n", "\\n")
        
        append_lines.append(f"\n# === RSA Keys: {dept} ===\n")
        append_lines.append(f'{pub_env}="{pub_single}"\n')
        append_lines.append(f'{priv_env}="{priv_single}"\n')
        print(f"  Tao thanh cong!")
    
    if append_lines:
        with open(env_path, 'a', encoding='utf-8') as f:
            f.writelines(append_lines)
        print(f"\nDa ghi key vao: {os.path.abspath(env_path)}")
        print("Hay restart backend server de load key moi!")
    else:
        print("\nTat ca key da ton tai. Khong can tao moi.")


if __name__ == "__main__":
    main()
