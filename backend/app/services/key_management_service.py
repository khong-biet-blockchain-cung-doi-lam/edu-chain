\
\
\
\
\
\
\
\
\
\
\
   
import os
from cryptography.hazmat.primitives.asymmetric import rsa
from cryptography.hazmat.primitives import serialization

ROLE_KEY_MAP = {
    "QL_DAO_TAO": {
        "public_env":  "RSA_PUBLIC_KEY_QLDT",
        "private_env": "RSA_PRIVATE_KEY_QLDT",
    },
    "KHAO_THI": {
        "public_env":  "RSA_PUBLIC_KEY_KHAOTHI",
        "private_env": "RSA_PRIVATE_KEY_KHAOTHI",
    },
}

def generate_rsa_keypair(key_size: int = 2048) -> tuple[str, str]:
    """
    Tạo RSA key pair mới.
    
    Returns:
        (public_key_pem: str, private_key_pem: str)
    """
    private_key = rsa.generate_private_key(
        public_exponent=65537,
        key_size=key_size
    )
    public_key = private_key.public_key()

    private_pem = private_key.private_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PrivateFormat.TraditionalOpenSSL,
        encryption_algorithm=serialization.NoEncryption()
    ).decode("utf-8")

    public_pem = public_key.public_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PublicFormat.SubjectPublicKeyInfo
    ).decode("utf-8")

    return public_pem, private_pem

def get_public_key(role: str) -> str:
    """Lấy RSA public key của phòng ban từ env"""
    if role not in ROLE_KEY_MAP:
        raise ValueError(f"Role '{role}' không được hỗ trợ. Chọn: {list(ROLE_KEY_MAP.keys())}")
    
    env_var = ROLE_KEY_MAP[role]["public_env"]
    key = os.environ.get(env_var)
    if not key:
        raise EnvironmentError(f"Chưa cấu hình {env_var} trong .env")
    
    return _restore_pem_newlines(key)

def get_private_key(role: str) -> str:
    """Lấy RSA private key của phòng ban từ env"""
    if role not in ROLE_KEY_MAP:
        raise ValueError(f"Role '{role}' không được hỗ trợ")
    
    env_var = ROLE_KEY_MAP[role]["private_env"]
    key = os.environ.get(env_var)
    if not key:
        raise EnvironmentError(f"Chưa cấu hình {env_var} trong .env")
    
    return _restore_pem_newlines(key)

def _restore_pem_newlines(pem_one_line: str) -> str:
    """
    Khôi phục newline trong PEM vì .env không giữ newline.
    Trong .env lưu dạng: \\n thay cho newline thật.
    """
    return pem_one_line.replace("\\n", "\n")

def initialize_keys_if_missing():
    """
    Kiểm tra và tạo RSA key pair cho tất cả phòng ban nếu chưa có.
    Gọi 1 lần khi setup hệ thống.
    Ghi key vào file 'generated_keys.txt' để admin copy vào .env.
    """
    output_lines = []
    needs_generation = False

    for role, env_keys in ROLE_KEY_MAP.items():
        pub_env = env_keys["public_env"]
        priv_env = env_keys["private_env"]
        
        if not os.environ.get(pub_env) or not os.environ.get(priv_env):
            needs_generation = True
            pub, priv = generate_rsa_keypair()
            
            pub_single = pub.replace("\n", "\\n")
            priv_single = priv.replace("\n", "\\n")
            
            output_lines.append(f"\n# === {role} RSA Keys ===")
            output_lines.append(f'{pub_env}="{pub_single}"')
            output_lines.append(f'{priv_env}="{priv_single}"')
            print(f"✅ Đã tạo RSA key pair cho {role}")
        else:
            print(f"✅ {role}: Key đã tồn tại")

    if needs_generation:
        output_path = os.path.join(os.path.dirname(__file__), "../../../generated_keys.env")
        with open(output_path, "w") as f:
            f.write("\n".join(output_lines))
        print(f"\n📁 Key mới đã lưu tại: {os.path.abspath(output_path)}")
        print("👉 Hãy copy nội dung file này vào .env rồi xóa file đó!")
    
    return not needs_generation
