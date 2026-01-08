import hashlib
import json
from .web3_client import get_smart_contract

class BlockchainService:

    def __init__(self):
        self.contract = get_smart_contract() 

    def anchor_student_record(self, student_profile, msv):
        """
        flow chính: Hash dữ liệu và gửi lên Blockchain.
        """
        
        data_dict = student_profile.to_dict()
        data_string = json.dumps(data_dict, sort_keys=True)
        
        data_hash = self._hash_data(data_string)
        
        storage_location = f"postgres_db:student_profiles:id:{student_profile.id}"
        
        
        try:
            
            tx_hash = self.contract.functions.addRecord(
                msv,
                data_hash,
                storage_location
            ).transact({
                'from': 'YOUR_SYSTEM_WALLET_ADDRESS' 
            })
            
            print(f"Gửi lên Blockchain thành công, MSV: {msv}, Hash: {data_hash}")
            return tx_hash.hex()

        except Exception as e:
            print(f"Gửi lên Blockchain thất bại: {e}")
            # (Bạn cần xử lý lỗi này, ví dụ: thử lại sau)
            return None

    def _hash_data(self, data_string):
        """
        Tạo hash SHA-256 từ một chuỗi.
        """
        hash_object = hashlib.sha256(data_string.encode('utf-8'))
        return hash_object.hexdigest()

blockchain_service = BlockchainService()