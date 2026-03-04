import json
from cryptography.fernet import Fernet
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import padding
from web3 import Web3
from eth_account.messages import encode_defunct

def generate_rsa_key_pair():
    from cryptography.hazmat.primitives.asymmetric import rsa
    private_key = rsa.generate_private_key(public_exponent=65537, key_size=2048)
    
    pem_private = private_key.private_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PrivateFormat.PKCS8,
        encryption_algorithm=serialization.NoEncryption()
    )
    
    pem_public = private_key.public_key().public_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PublicFormat.SubjectPublicKeyInfo
    )
    return pem_private.decode('utf-8'), pem_public.decode('utf-8')

def hybrid_encrypt_data(data_dict, list_of_public_keys_pem):
    aes_key = Fernet.generate_key()
    cipher_suite = Fernet(aes_key)
    
    raw_data_bytes = json.dumps(data_dict).encode('utf-8')
    encrypted_data = cipher_suite.encrypt(raw_data_bytes)
    
    encrypted_aes_keys = []
    for pem_key in list_of_public_keys_pem:
        public_key = serialization.load_pem_public_key(pem_key.encode('utf-8'))
        enc_key = public_key.encrypt(
            aes_key,
            padding.OAEP(
                mgf=padding.MGF1(algorithm=hashes.SHA256()),
                algorithm=hashes.SHA256(),
                label=None
            )
        )
        encrypted_aes_keys.append(enc_key.hex())
        
    return encrypted_data, encrypted_aes_keys

def hybrid_decrypt_data(encrypted_data_bytes, encrypted_aes_key_hex, user_rsa_private_key_pem):
    private_key = serialization.load_pem_private_key(
        user_rsa_private_key_pem.encode('utf-8'),
        password=None
    )
    
    encrypted_aes_key_bytes = bytes.fromhex(encrypted_aes_key_hex)
    aes_key = private_key.decrypt(
        encrypted_aes_key_bytes,
        padding.OAEP(
            mgf=padding.MGF1(algorithm=hashes.SHA256()),
            algorithm=hashes.SHA256(),
            label=None
        )
    )
    
    cipher_suite = Fernet(aes_key)
    decrypted_data_bytes = cipher_suite.decrypt(encrypted_data_bytes)
    return json.loads(decrypted_data_bytes.decode('utf-8'))

def hash_data_keccak(data_bytes):
    return Web3.keccak(data_bytes)

def sign_data_hash(data_hash_bytes, signer_private_key_hex):
    message = encode_defunct(primitive=data_hash_bytes)
    signed_message = Web3().eth.account.sign_message(message, private_key=signer_private_key_hex)
    return signed_message.signature