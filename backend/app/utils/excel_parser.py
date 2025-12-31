import pandas as pd
import io

def read_excel(file):
    """
    Read Excel file from uploaded file object
    Args:
        file: FileStorage object from Flask request.files
    Returns:
        pandas DataFrame
    """
    # Reset file pointer to the beginning
    file.seek(0)
    # Force read as string to preserve leading zeros
    df = pd.read_excel(file, dtype=str)
    return df

def validate_dataframe(df):
    """
    Validate the DataFrame has the required columns and data
    Args:
        df: pandas DataFrame
    Returns:
        tuple: (valid_rows, errors)
            valid_rows: list of dict with valid data
            errors: list of error messages
    """
    errors = []
    valid_rows = []
    
    # Check required columns
    required_columns = ['student_id', 'citizen_id']
    missing_columns = [col for col in required_columns if col not in df.columns]
    
    if missing_columns:
        errors.append({
            "row": None, 
            "msg": f"Thiếu các cột bắt buộc: {', '.join(missing_columns)}"
        })
        return valid_rows, errors
    
    # Validate each row
    for idx, row in df.iterrows():
        row_num = idx + 2  # Excel row number (1-indexed + header)
        
        # Get values
        student_id = str(row['student_id']).strip() if pd.notna(row['student_id']) else ""
        citizen_id = str(row['citizen_id']).strip() if pd.notna(row['citizen_id']) else ""
        
        # Validate student_id
        if not student_id or student_id == 'nan':
            errors.append({
                "row": row_num,
                "msg": f"Dòng {row_num}: Mã sinh viên không được để trống"
            })
            continue
        
        # Validate citizen_id
        if not citizen_id or citizen_id == 'nan':
            errors.append({
                "row": row_num,
                "msg": f"Dòng {row_num}: CCCD không được để trống"
            })
            continue
        
        # Add to valid rows
        valid_rows.append({
            "student_id": student_id,
            "citizen_id": citizen_id
        })
    
    return valid_rows, errors
