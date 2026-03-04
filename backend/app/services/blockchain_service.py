import os
from web3 import Web3
from .web3_client import get_contract, send_transaction
from ..utils.crypto_utils import hash_data_keccak, sign_data_hash, hybrid_encrypt_data
from ..utils.ipfs_utils import upload_data_to_ipfs

class BlockchainService:

    def __init__(self):
                                                                      
        profile_addr  = os.environ.get("PROFILE_CONTRACT_ADDRESS", "").strip()
        academic_addr = os.environ.get("ACADEMIC_CONTRACT_ADDRESS", "").strip()
        access_addr   = os.environ.get("ACCESS_CONTROL_ADDRESS", "").strip()
        logs_addr     = os.environ.get("LOGS_MANAGER_ADDRESS", "").strip()

        self._system_pk = os.environ.get("SYSTEM_WALLET_PRIVATE_KEY", "").strip()

        self.profile_contract  = get_contract("ProfileContract",       profile_addr)
        self.academic_contract = get_contract("AcademicContract",      academic_addr)
        self.access_control    = get_contract("AccessControlContract", access_addr)
        self.logs_manager      = get_contract("LogsManagerContract",   logs_addr)

    def grant_role(self, account_address: str, role_name: str, admin_private_key: str = None):
        private_key = admin_private_key or self._system_pk
        fn = self.access_control.functions.grantRole(
            Web3.to_checksum_address(account_address),
            role_name,
        )
        receipt = send_transaction(fn, private_key)
        return receipt.transactionHash.hex()

    def has_role(self, account_address: str, role_name: str) -> bool:
        return self.access_control.functions.hasRole(
            Web3.to_checksum_address(account_address),
            role_name,
        ).call()

    def add_trusted_contract(self, contract_address: str, admin_private_key: str = None):
        """Register a contract so it can write logs to LogsManagerContract."""
        private_key = admin_private_key or self._system_pk
        fn = self.logs_manager.functions.addTrustedContract(
            Web3.to_checksum_address(contract_address)
        )
        receipt = send_transaction(fn, private_key)
        return receipt.transactionHash.hex()

    def create_student_profile(
        self,
        student_id: str,
        profile_data: dict,
        authorized_public_keys_pem: list,
        authorized_addresses: list,
        private_key: str,
        edit_period_days: int = 30,
    ) -> dict:
        """
        Full flow:
          1. Hybrid-encrypt profile_data with each authorized party's RSA public key.
          2. Upload ciphertext to IPFS (Pinata).
          3. Keccak-hash the ciphertext, sign it with caller's private key.
          4. Call ProfileContract.createProfile on-chain.
        Returns {"tx_hash": ..., "ipfs_hash": ...}
        """
        student_id_bytes32 = Web3.keccak(text=student_id)

        encrypted_data, encrypted_keys = hybrid_encrypt_data(
            profile_data, authorized_public_keys_pem
        )
        ipfs_hash = upload_data_to_ipfs(encrypted_data, filename=f"profile_{student_id}.enc")

        data_hash = hash_data_keccak(encrypted_data)
        signature  = sign_data_hash(data_hash, private_key)

        checksum_parties = [Web3.to_checksum_address(a) for a in authorized_addresses]

        fn = self.profile_contract.functions.createProfile(
            student_id_bytes32,
            ipfs_hash,
            data_hash,
            signature,
            encrypted_keys,
            checksum_parties,
            edit_period_days,
        )
        receipt = send_transaction(fn, private_key)
        return {"tx_hash": receipt.transactionHash.hex(), "ipfs_hash": ipfs_hash}

    def profile_exists(self, student_id: str) -> bool:
        student_id_bytes32 = Web3.keccak(text=student_id)
        return self.profile_contract.functions.profileExists(student_id_bytes32).call()

    def lock_profile(self, student_id: str, private_key: str) -> str:
        student_id_bytes32 = Web3.keccak(text=student_id)
        fn = self.profile_contract.functions.lockProfile(student_id_bytes32)
        receipt = send_transaction(fn, private_key)
        return receipt.transactionHash.hex()

    def grant_sinh_vien_role(self, wallet_address: str, admin_private_key: str = None) -> str:
        """Convenience wrapper: grant SINH_VIEN role to a student wallet."""
        return self.grant_role(wallet_address, "SINH_VIEN", admin_private_key)

    def submit_grade(
        self,
        student_id: str,
        semester_id: str,
        grade_data: dict,
        authorized_public_keys_pem: list,
        authorized_addresses: list,
        private_key: str,
        correction_days: int = 7,
    ) -> dict:
        """
        Submit encrypted grade data on-chain. Caller must hold the QLKT role.

        Full flow:
          1. Hybrid-encrypt grade_data with each authorized party's RSA public key.
          2. Upload ciphertext to IPFS (Pinata).
          3. Keccak-hash ciphertext, sign with QLKT private key.
          4. Call AcademicContract.submitGrade on-chain.
        Returns {"tx_hash": ..., "ipfs_hash": ...}
        """
        student_id_bytes32  = Web3.keccak(text=student_id)
        semester_id_bytes32 = Web3.keccak(text=semester_id)

        encrypted_data, encrypted_keys = hybrid_encrypt_data(
            grade_data, authorized_public_keys_pem
        )
        ipfs_hash = upload_data_to_ipfs(
            encrypted_data, filename=f"grade_{student_id}_{semester_id}.enc"
        )

        data_hash = hash_data_keccak(encrypted_data)
        signature  = sign_data_hash(data_hash, private_key)

        checksum_parties = [Web3.to_checksum_address(a) for a in authorized_addresses]

        fn = self.academic_contract.functions.submitGrade(
            student_id_bytes32,
            semester_id_bytes32,
            ipfs_hash,
            data_hash,
            signature,
            encrypted_keys,
            checksum_parties,
            correction_days,
        )
        receipt = send_transaction(fn, private_key)
        return {"tx_hash": receipt.transactionHash.hex(), "ipfs_hash": ipfs_hash}

    def verify_and_lock_grade(
        self, student_id: str, semester_id: str, private_key: str
    ) -> str:
        """Verify and permanently lock a grade. Caller must hold QLKT or KHOA role."""
        student_id_bytes32  = Web3.keccak(text=student_id)
        semester_id_bytes32 = Web3.keccak(text=semester_id)

        grade_record = self.academic_contract.functions.gradeRecords(
            student_id_bytes32, semester_id_bytes32
        ).call()
        data_hash = grade_record[3]                                   

        dept_signature = sign_data_hash(data_hash, private_key)

        fn = self.academic_contract.functions.verifyAndLockGrade(
            student_id_bytes32,
            semester_id_bytes32,
            dept_signature,
        )
        receipt = send_transaction(fn, private_key)
        return receipt.transactionHash.hex()

    def is_grade_verified(self, student_id: str, semester_id: str) -> bool:
        student_id_bytes32  = Web3.keccak(text=student_id)
        semester_id_bytes32 = Web3.keccak(text=semester_id)
        return self.academic_contract.functions.isGradeVerified(
            student_id_bytes32, semester_id_bytes32
        ).call()
