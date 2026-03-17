import logging
import pandas as pd
import bcrypt
from sqlalchemy.exc import IntegrityError

from app.extensions import db
from app.models.account_model import Account
from app.models.student_model import Student
from app.models.student_personal_info_model import StudentPersonalInfo
from app.models.student_contact_model import StudentContact
from app.services.wallet_service import create_custodial_wallet
from app.services.blockchain_service import BlockchainService
from app.utils.email_utils import send_credentials_email

logger = logging.getLogger(__name__)


def process_excel_and_upload(file):
    results = {"created": 0, "skipped": 0, "errors": [], "total": 0}

    try:
        file.seek(0)
        df = pd.read_excel(file, dtype=str)
    except Exception as e:
        return {"errors": [{"row": None, "msg": f"Lỗi đọc file Excel: {str(e)}"}]}

    required_cols = ["student_id", "citizen_id", "personal_email"]
    for col in required_cols:
        if col not in df.columns:
            return {"errors": [{"row": None, "msg": f"Thiếu cột {col}"}]}

    valid_rows = []
    for idx, row in df.iterrows():
        sid = str(row.get("student_id", "")).strip()
        cid = str(row.get("citizen_id", "")).strip()
        email = str(row.get("personal_email", "")).strip()
        if sid and cid and email:
            valid_rows.append({"student_id": sid, "citizen_id": cid, "personal_email": email})
        else:
            results["skipped"] += 1

    results["total"] = len(valid_rows) + results["skipped"]

    new_wallet_data = []                             

    for row in valid_rows:
        student_id = row["student_id"]
        citizen_id = row["citizen_id"]

        c_bytes = citizen_id.encode("utf-8")
        if len(c_bytes) > 72:
            citizen_id = c_bytes[:72].decode("utf-8", errors="ignore")

        existing = Account.query.filter_by(username=student_id).first()
        if existing:
            results["skipped"] += 1
            continue

        hashed = bcrypt.hashpw(citizen_id.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

        try:
            wallet_address, encrypted_pk = create_custodial_wallet()
        except Exception as e:
            logger.error("Wallet creation failed for %s: %s", student_id, e)
            results["errors"].append({"row": student_id, "msg": f"Wallet error: {e}"})
            continue

        new_acc = Account(
            username=student_id,
            email=row["personal_email"],
            password_hash=hashed,
            role="SINH_VIEN",
            wallet_address=wallet_address,
            encrypted_private_key=encrypted_pk,
        )
        db.session.add(new_acc)

        try:
            db.session.flush()
            new_student = Student(student_id=student_id, id=new_acc.id)
            db.session.add(new_student)
            db.session.flush()

            new_info = StudentPersonalInfo(
                id=new_student.id,
                national_id_number=row["citizen_id"],
            )
            db.session.add(new_info)
            db.session.flush()

            new_contact = StudentContact(
                id=new_student.id,
                personal_email=row["personal_email"],
            )
            db.session.add(new_contact)
            db.session.flush()

            # Async or synchronous email send
            send_credentials_email(row["personal_email"], student_id, row["citizen_id"])

            new_wallet_data.append(wallet_address)
            results["created"] += 1
        except Exception as e:
            db.session.rollback()
            results["errors"].append({"row": student_id, "msg": str(e)})
            continue

    try:
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return {"errors": [{"row": None, "msg": str(e)}]}

    if new_wallet_data:
        _grant_sinh_vien_roles(new_wallet_data, results)

    return results

def _grant_sinh_vien_roles(wallet_addresses: list, results: dict):
    """Grant SINH_VIEN role on-chain for each wallet. Failures are logged but do not roll back DB."""
    try:
        blockchain = BlockchainService()
        for address in wallet_addresses:
            try:
                blockchain.grant_role(address, "SINH_VIEN")
            except Exception as e:
                logger.warning("Blockchain grant_role failed for %s: %s", address, e)
                results.setdefault("blockchain_warnings", []).append(
                    {"wallet": address, "msg": str(e)}
                )
    except Exception as e:
        logger.warning("BlockchainService init failed: %s", e)
        results.setdefault("blockchain_warnings", []).append(
            {"wallet": "all", "msg": f"BlockchainService unavailable: {e}"}
        )
