# app/utils/excel_parser.py
import pandas as pd

REQUIRED_COLUMNS = ["student_id", "citizen_id"]

def read_excel(file_path_or_fileobj):
    """
    Đọc file Excel trả về DataFrame.
    file_path_or_fileobj: đường dẫn hoặc file-like object (werkzeug FileStorage).
    """
    df = pd.read_excel(file_path_or_fileobj, dtype=str)  # đọc string để giữ số CCCD
    df = df.fillna("")  # tránh NaN
    # chuẩn hóa tên cột: chuyển về lowercase và loại khoảng trắng
    df.columns = [c.strip().lower() for c in df.columns]
    return df

def validate_dataframe(df):
    """
    Kiểm tra các dòng, trả về (valid_rows, errors)
    valid_rows: list of dict {student_id, citizen_id}
    errors: list of dict {row_index, msg}
    """
    errors = []
    valid = []
    # kiểm cột cần thiết
    cols = [c.strip().lower() for c in df.columns]
    for col in REQUIRED_COLUMNS:
        if col not in cols:
            return [], [{"row": None, "msg": f"Thiếu cột bắt buộc '{col}'"}]

    for idx, row in df.iterrows():
        sid = str(row.get("student_id", "")).strip()
        cid = str(row.get("citizen_id", "")).strip()
        if not sid:
            errors.append({"row": idx + 2, "msg": "student_id trống"})  # +2: tiêu đề + 0-index
            continue
        if not cid:
            errors.append({"row": idx + 2, "msg": "citizen_id trống"})
            continue
        # basic validation: chỉ số và độ dài (tùy chỉnh)
        if not cid.isdigit():
            errors.append({"row": idx + 2, "msg": "citizen_id không hợp lệ (phải là số)."})
            continue
        valid.append({"student_id": sid, "citizen_id": cid})
    return valid, errors
