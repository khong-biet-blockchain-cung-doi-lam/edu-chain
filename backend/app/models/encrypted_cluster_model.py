\
\
\
\
\
\
   
from app.extensions import db
from sqlalchemy.dialects.postgresql import UUID
import uuid
from datetime import datetime

class EncryptedCluster(db.Model):
    """
    Bảng lưu dữ liệu mã hóa hybrid (AES-256-GCM + RSA-2048).
    
    cluster_type:
        'student_profile' → quản lý bởi QL_DAO_TAO
        'student_grades'  → quản lý bởi KHAO_THI
    """
    __tablename__ = 'encrypted_clusters'

    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    
    cluster_type = db.Column(db.String(50), nullable=False, index=True)
                                             
    subject_id = db.Column(UUID(as_uuid=True), nullable=False, index=True)
                                                    
    subject_code = db.Column(db.String(50), nullable=True)
    
    ciphertext = db.Column(db.Text, nullable=False)
                                       
    iv = db.Column(db.String(50), nullable=False)
                                                        
    encrypted_aes_key = db.Column(db.Text, nullable=False)
    
    managed_by_role = db.Column(db.String(30), nullable=False)
                                  
    status = db.Column(db.String(20), nullable=False, default='ENCRYPTED')
                                       
    version = db.Column(db.Integer, nullable=False, default=1)

    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
                                          
    decrypted_by = db.Column(UUID(as_uuid=True), nullable=True)
    decrypted_at = db.Column(db.DateTime, nullable=True)

    def to_safe_dict(self):
        """Trả về thông tin cluster KHÔNG bao gồm ciphertext (dùng trong list API)"""
        return {
            "id": str(self.id),
            "cluster_type": self.cluster_type,
            "subject_id": str(self.subject_id),
            "subject_code": self.subject_code,
            "managed_by_role": self.managed_by_role,
            "status": self.status,
            "version": self.version,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
            "decrypted_by": str(self.decrypted_by) if self.decrypted_by else None,
            "decrypted_at": self.decrypted_at.isoformat() if self.decrypted_at else None,
        }

    def to_encrypted_dict(self):
        """Trả về đầy đủ kể cả ciphertext (dùng khi cần export)"""
        d = self.to_safe_dict()
        d.update({
            "ciphertext": self.ciphertext,
            "iv": self.iv,
            "encrypted_aes_key": self.encrypted_aes_key,
        })
        return d
