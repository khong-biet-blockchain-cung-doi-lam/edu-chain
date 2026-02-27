"""
encrypted_cluster_model.py
Model lưu trữ dữ liệu mã hóa theo cụm trên Supabase.

Mỗi cluster = 1 bộ dữ liệu thuộc về 1 đối tượng (student)
được mã hóa và quản lý bởi 1 phòng ban.
"""

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
    
    # Loại cụm dữ liệu
    cluster_type = db.Column(db.String(50), nullable=False, index=True)
    # VD: 'student_profile', 'student_grades'
    
    # ID đối tượng gốc (student.id)
    subject_id = db.Column(UUID(as_uuid=True), nullable=False, index=True)
    # subject_code để dễ tìm kiếm (VD: mã sinh viên)
    subject_code = db.Column(db.String(50), nullable=True)
    
    # === DỮ LIỆU MÃ HÓA ===
    # AES-256-GCM encrypted JSON data (base64)
    ciphertext = db.Column(db.Text, nullable=False)
    # AES IV / nonce (base64, 12 bytes)
    iv = db.Column(db.String(50), nullable=False)
    # AES key đã được mã hóa bởi RSA Public Key (base64)
    encrypted_aes_key = db.Column(db.Text, nullable=False)
    
    # === QUẢN LÝ CLUSTER ===
    # Phòng ban có thẩm quyền
    managed_by_role = db.Column(db.String(30), nullable=False)
    # VD: 'QL_DAO_TAO', 'KHAO_THI'
    
    # Trạng thái cluster
    status = db.Column(db.String(20), nullable=False, default='ENCRYPTED')
    # ENCRYPTED   → đã mã hóa, đang chờ
    # COMPLETE    → đủ dữ liệu, sẵn sàng giải mã
    # DECRYPTED   → đã giải mã, sẵn sàng blockchain
    # SENT        → đã gửi cho blockchain team
    
    # Phiên bản dữ liệu (phục vụ rollback)
    version = db.Column(db.Integer, nullable=False, default=1)

    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    # Người thực hiện giải mã (account_id)
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
