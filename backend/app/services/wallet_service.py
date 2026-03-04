import os
from web3 import Web3
from cryptography.fernet import Fernet

_raw_key = os.environ.get('SERVER_MASTER_KEY')
if not _raw_key:
                                                                                  
    import warnings
    _generated = Fernet.generate_key().decode()
    warnings.warn(
        "SERVER_MASTER_KEY is not set. A temporary key was generated — "
        "wallets encrypted this session CANNOT be decrypted after restart. "
        "Set SERVER_MASTER_KEY in your .env file.",
        RuntimeWarning,
        stacklevel=2,
    )
    SERVER_MASTER_KEY = _generated
else:
    SERVER_MASTER_KEY = _raw_key

cipher_suite = Fernet(SERVER_MASTER_KEY.encode() if isinstance(SERVER_MASTER_KEY, str) else SERVER_MASTER_KEY)

def create_custodial_wallet():
    w3 = Web3()
    account = w3.eth.account.create()
    
    wallet_address = account.address
    private_key_hex = account.key.hex()
    
    encrypted_private_key = cipher_suite.encrypt(private_key_hex.encode('utf-8'))
    
    return wallet_address, encrypted_private_key.decode('utf-8')

def get_decrypted_private_key(encrypted_pk_string):
    try:
        decrypted_bytes = cipher_suite.decrypt(encrypted_pk_string.encode('utf-8'))
        return decrypted_bytes.decode('utf-8')
    except Exception as e:
        raise ValueError(f"Không thể giải mã Private Key. Vui lòng kiểm tra lại Master Key: {str(e)}")