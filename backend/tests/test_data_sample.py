"""
Script tạo file Excel test với dữ liệu mẫu
Bao gồm: valid cases + edge cases + invalid cases để test robustness
"""
import pandas as pd
import os

def create_test_excel_file(output_path="test_students.xlsx"):
    """Tạo file Excel với các valid test cases"""
    test_data = {
        "student_id": [
            "11244075",
            "11244076", 
            "11244077",
            "11244078",
            "11244079",
            "11244080",
            "11244081",
            "11244082",
            "11244083",
            "11244084"
        ],
        "citizen_id": [
            "123456789010",
            "123456789011",
            "123456789012",
            "123456789013",
            "123456789014",
            "123456789015",
            "123456789016",
            "123456789017",
            "123456789018",
            "123456789019"
        ]
    }
    
    df = pd.DataFrame(test_data)
    df.to_excel(output_path, index=False, engine='openpyxl')
    print(f"✓ File test Excel tạo thành công: {output_path}")
    return df


def create_test_excel_with_edge_cases(output_path="test_students_edge_cases.xlsx"):
    """
    Tạo file Excel với edge cases để test robustness của hệ thống
    Bao gồm: dữ liệu trống, chữ không hợp lệ, độ dài không đủ, v.v.
    """
    test_data = {
        "student_id": [
            # Valid cases
            "11244075",
            "11244076",
            
            # Empty fields
            "",
            "11244077",
            None,
            
            # Invalid format - chứa chữ
            "11244078ABC",
            "XYZ11244079",
            "1124407X",
            
            # Student ID không đủ độ dài (< 8 chữ số)
            "1124407",
            "112440",
            "11244",
            
            # Student ID quá dài
            "112440750000",
            "112440755555555555",
            
            # Khoảng trắng đầu/cuối
            " 11244080 ",
            "  11244081",
            "11244082  ",
            
            # Special characters
            "11244083@",
            "11244084#",
            "1124408-5",
            "11244086/7",
            
            # Valid cho comparison
            "11244090",
            "11244091",
        ],
        "citizen_id": [
            # Valid cases
            "123456789010",
            "123456789011",
            
            # Empty fields
            "123456789012",
            "",
            "123456789013",
            
            # Invalid format - chứa chữ
            "12345678901A",
            "ABC123456789",
            "1234567890X0",
            
            # Citizen ID không đủ độ dài (< 9 chữ số)
            "123456789",
            "12345678",
            "1234567",
            
            # Citizen ID quá dài
            "1234567890100",
            "12345678901000000",
            
            # Khoảng trắng đầu/cuối
            " 123456789014 ",
            "  123456789015",
            "123456789016  ",
            
            # Special characters
            "123456789017@",
            "123456789018#",
            "12345678901-9",
            "123456789020/1",
            
            # Valid cho comparison
            "123456789021",
            "123456789022",
        ]
    }
    
    df = pd.DataFrame(test_data)
    df.to_excel(output_path, index=False, engine='openpyxl')
    print(f"✓ File test Excel với edge cases tạo thành công: {output_path}")
    return df


def create_test_excel_with_all_empty():
    """Tạo file Excel với tất cả fields trống"""
    output_path = "test_students_all_empty.xlsx"
    test_data = {
        "student_id": ["", "", "", ""],
        "citizen_id": ["", "", "", ""]
    }
    df = pd.DataFrame(test_data)
    df.to_excel(output_path, index=False, engine='openpyxl')
    print(f"✓ File test Excel (all empty) tạo thành công: {output_path}")
    return df


def create_test_excel_with_mixed_valid_invalid():
    """Tạo file Excel với mix valid và invalid records"""
    output_path = "test_students_mixed.xlsx"
    test_data = {
        "student_id": [
            "11244075",      # Valid
            "",              # Empty
            "11244076ABC",   # Chứa chữ
            "11244077",      # Valid
            "1124",          # Quá ngắn
            "11244078",      # Valid
            " 11244079 ",    # Khoảng trắng
            "11244080@",     # Special char
            "11244081",      # Valid
            "123456789012",  # Valid number but next should be for citizen_id
        ],
        "citizen_id": [
            "123456789010",  # Valid
            "123456789011",  # Valid (even though student_id empty)
            "123456789012",  # Valid (even though student_id has letters)
            "",              # Empty
            "123456789013",  # Valid (even though student_id is short)
            "12345X789014",  # Chứa chữ
            "123456789015",  # Valid (even though student_id has spaces)
            "123456789016",  # Valid (even though student_id has special char)
            "1234567890",    # Quá ngắn
            "123456789017",  # Valid
        ]
    }
    df = pd.DataFrame(test_data)
    df.to_excel(output_path, index=False, engine='openpyxl')
    print(f"✓ File test Excel (mixed) tạo thành công: {output_path}")
    return df


def create_test_excel_with_duplicates():
    """Tạo file Excel với records bị duplicate"""
    output_path = "test_students_duplicates.xlsx"
    test_data = {
        "student_id": [
            "11244075",
            "11244076",
            "11244075",  # Duplicate
            "11244077",
            "11244076",  # Duplicate
            "11244078",
            "11244075",  # Triple
            "11244079",
            "11244080",
        ],
        "citizen_id": [
            "123456789010",
            "123456789011",
            "123456789010",  # Duplicate (match student_id)
            "123456789012",
            "123456789011",  # Duplicate (match student_id)
            "123456789013",
            "123456789010",  # Triple
            "123456789014",
            "123456789015",
        ]
    }
    df = pd.DataFrame(test_data)
    df.to_excel(output_path, index=False, engine='openpyxl')
    print(f"✓ File test Excel (duplicates) tạo thành công: {output_path}")
    return df


def create_test_excel_sql_injection_attempt():
    """Tạo file Excel với SQL injection attempts để test sanitization"""
    output_path = "test_students_sql_injection.xlsx"
    test_data = {
        "student_id": [
            "11244075",
            "11244076'; DROP TABLE account;--",
            "11244077' OR '1'='1",
            "11244078\" UNION SELECT * FROM account--",
            "11244079",
        ],
        "citizen_id": [
            "123456789010",
            "123456789011'; DELETE FROM account;--",
            "123456789012' OR '1'='1",
            "123456789013\" UNION SELECT * FROM account--",
            "123456789014",
        ]
    }
    df = pd.DataFrame(test_data)
    df.to_excel(output_path, index=False, engine='openpyxl')
    print(f"✓ File test Excel (SQL injection) tạo thành công: {output_path}")
    return df


def create_test_excel_unicode_special_chars():
    """Tạo file Excel với Unicode và special characters"""
    output_path = "test_students_unicode.xlsx"
    test_data = {
        "student_id": [
            "11244075",
            "1124407Ñ",  # Unicode
            "11244077😀",  # Emoji
            "11244078Ü",  # Unicode umlaut
            "11244079",
            "1124408०",  # Devanagari digit
            "11244081",
        ],
        "citizen_id": [
            "123456789010",
            "12345678901Ñ",  # Unicode
            "123456789012😀",  # Emoji
            "123456789013Ü",  # Unicode umlaut
            "123456789014",
            "123456789015०",  # Devanagari digit
            "123456789016",
        ]
    }
    df = pd.DataFrame(test_data)
    df.to_excel(output_path, index=False, engine='openpyxl')
    print(f"✓ File test Excel (Unicode) tạo thành công: {output_path}")
    return df


def create_all_test_data_files():
    """Tạo tất cả các file test dữ liệu"""
    print("\n📊 Tạo tất cả các file test data...\n")
    create_test_excel_file()
    create_test_excel_with_edge_cases()
    create_test_excel_with_all_empty()
    create_test_excel_with_mixed_valid_invalid()
    create_test_excel_with_duplicates()
    create_test_excel_sql_injection_attempt()
    create_test_excel_unicode_special_chars()
    print("\n✅ Tất cả file test data đã được tạo!")


if __name__ == "__main__":
    create_all_test_data_files()
