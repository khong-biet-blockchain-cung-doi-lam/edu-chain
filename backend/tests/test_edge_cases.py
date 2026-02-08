"""
Advanced Test Cases: Test robustness của hệ thống với edge cases
Kiểm tra xem hệ thống có xử lý đúng các tình huống lỗi/edge cases
"""

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import pytest
import pandas as pd
from io import BytesIO
import bcrypt
from app.extensions import db
from app.models.account_model import Account
from app.models.student_model import Student


def read_excel_file(file_path):
    """Helper function to read test Excel files"""
    df = pd.read_excel(file_path, dtype=str)
    df = df.fillna("")
    output = BytesIO()
    df.to_excel(output, index=False, engine='openpyxl')
    output.seek(0)
    return output


class TestEdgeCases:
    """Test suite cho edge cases - kiểm tra robustness"""
    
    def test_upload_with_empty_student_ids(self, client, app):
        """Test: Upload Excel với student_id trống"""
        with app.app_context():
            excel_file = read_excel_file('test_students_edge_cases.xlsx')
            response = client.post(
                '/api/staff/upload-students',
                data={'file': (excel_file, 'test_students_edge_cases.xlsx')},
                content_type='multipart/form-data'
            )
            
            result = response.get_json()
            # Hệ thống nên skip các row có student_id trống
            assert response.status_code == 200
            # Chỉ các valid rows được tạo
            assert result["created"] > 0 or result["skipped"] > 0
    
    def test_upload_with_letters_in_student_id(self, client, app):
        """Test: Upload Excel với chữ trong student_id"""
        with app.app_context():
            df = pd.DataFrame({
                "student_id": ["11244075ABC", "11244076XYZ"],
                "citizen_id": ["123456789010", "123456789011"]
            })
            
            output = BytesIO()
            df.to_excel(output, index=False, engine='openpyxl')
            output.seek(0)
            
            response = client.post(
                '/api/staff/upload-students',
                data={'file': (output, 'test.xlsx')},
                content_type='multipart/form-data'
            )
            
            # Hệ thống nên accept (hoặc skip) - không crash
            assert response.status_code in [200, 400]
    
    def test_upload_with_special_chars_in_student_id(self, client, app):
        """Test: Upload Excel với special characters trong student_id"""
        with app.app_context():
            df = pd.DataFrame({
                "student_id": ["11244075@", "11244076#", "11244077!"],
                "citizen_id": ["123456789010", "123456789011", "123456789012"]
            })
            
            output = BytesIO()
            df.to_excel(output, index=False, engine='openpyxl')
            output.seek(0)
            
            response = client.post(
                '/api/staff/upload-students',
                data={'file': (output, 'test.xlsx')},
                content_type='multipart/form-data'
            )
            
            # Hệ thống không nên crash
            assert response.status_code in [200, 400]
    
    def test_upload_with_short_student_id(self, client, app):
        """Test: Upload Excel với student_id quá ngắn"""
        with app.app_context():
            df = pd.DataFrame({
                "student_id": ["1124", "112440", "11244"],
                "citizen_id": ["123456789010", "123456789011", "123456789012"]
            })
            
            output = BytesIO()
            df.to_excel(output, index=False, engine='openpyxl')
            output.seek(0)
            
            response = client.post(
                '/api/staff/upload-students',
                data={'file': (output, 'test.xlsx')},
                content_type='multipart/form-data'
            )
            
            # Hệ thống nên xử lý (skip hoặc accept)
            assert response.status_code in [200, 400]
    
    def test_upload_with_empty_citizen_ids(self, client, app):
        """Test: Upload Excel với citizen_id trống"""
        with app.app_context():
            df = pd.DataFrame({
                "student_id": ["11244075", "11244076", "11244077"],
                "citizen_id": ["", "123456789011", ""]
            })
            
            output = BytesIO()
            df.to_excel(output, index=False, engine='openpyxl')
            output.seek(0)
            
            response = client.post(
                '/api/staff/upload-students',
                data={'file': (output, 'test.xlsx')},
                content_type='multipart/form-data'
            )
            
            result = response.get_json()
            # Hệ thống nên skip các row với citizen_id trống
            assert response.status_code == 200
    
    def test_upload_with_letters_in_citizen_id(self, client, app):
        """Test: Upload Excel với chữ trong citizen_id"""
        with app.app_context():
            df = pd.DataFrame({
                "student_id": ["11244075", "11244076"],
                "citizen_id": ["123456789A10", "123456789B11"]
            })
            
            output = BytesIO()
            df.to_excel(output, index=False, engine='openpyxl')
            output.seek(0)
            
            response = client.post(
                '/api/staff/upload-students',
                data={'file': (output, 'test.xlsx')},
                content_type='multipart/form-data'
            )
            
            # Hệ thống không nên crash
            assert response.status_code in [200, 400]
    
    def test_upload_with_short_citizen_id(self, client, app):
        """Test: Upload Excel với citizen_id quá ngắn"""
        with app.app_context():
            df = pd.DataFrame({
                "student_id": ["11244075", "11244076"],
                "citizen_id": ["123456789", "12345678"]
            })
            
            output = BytesIO()
            df.to_excel(output, index=False, engine='openpyxl')
            output.seek(0)
            
            response = client.post(
                '/api/staff/upload-students',
                data={'file': (output, 'test.xlsx')},
                content_type='multipart/form-data'
            )
            
            # Hệ thống nên xử lý
            assert response.status_code in [200, 400]
    
    def test_upload_all_empty_rows(self, client, app):
        """Test: Upload Excel với tất cả rows trống"""
        with app.app_context():
            df = pd.DataFrame({
                "student_id": ["", "", ""],
                "citizen_id": ["", "", ""]
            })
            
            output = BytesIO()
            df.to_excel(output, index=False, engine='openpyxl')
            output.seek(0)
            
            response = client.post(
                '/api/staff/upload-students',
                data={'file': (output, 'test.xlsx')},
                content_type='multipart/form-data'
            )
            
            result = response.get_json()
            # Tất cả rows trống nên skip, created = 0
            assert response.status_code == 200
            assert result["created"] == 0
    
    def test_upload_with_whitespace_padding(self, client, app):
        """Test: Upload Excel với khoảng trắng ở đầu/cuối"""
        with app.app_context():
            df = pd.DataFrame({
                "student_id": [" 11244075 ", "  11244076", "11244077  "],
                "citizen_id": [" 123456789010 ", "  123456789011", "123456789012  "]
            })
            
            output = BytesIO()
            df.to_excel(output, index=False, engine='openpyxl')
            output.seek(0)
            
            response = client.post(
                '/api/staff/upload-students',
                data={'file': (output, 'test.xlsx')},
                content_type='multipart/form-data'
            )
            
            # Hệ thống should strip whitespace
            result = response.get_json()
            assert response.status_code == 200


class TestDuplicateHandling:
    """Test suite cho duplicate handling"""
    
    def test_upload_with_duplicates_in_same_batch(self, client, app):
        """Test: Upload Excel với duplicates trong cùng batch"""
        with app.app_context():
            df = pd.DataFrame({
                "student_id": ["11244075", "11244076", "11244075", "11244077", "11244076"],
                "citizen_id": ["123456789010", "123456789011", "123456789010", "123456789012", "123456789011"]
            })
            
            output = BytesIO()
            df.to_excel(output, index=False, engine='openpyxl')
            output.seek(0)
            
            response = client.post(
                '/api/staff/upload-students',
                data={'file': (output, 'test.xlsx')},
                content_type='multipart/form-data'
            )
            
            result = response.get_json()
            # Chỉ 3 unique records được tạo (11244075, 11244076, 11244077)
            assert response.status_code == 200
            assert result["created"] == 3
    
    def test_upload_large_batch_with_many_duplicates(self, client, app):
        """Test: Upload Excel lớn với nhiều duplicates"""
        with app.app_context():
            # Tạo 100 records với chỉ 10 unique
            student_ids = [str(11244075 + (i % 10)) for i in range(100)]
            citizen_ids = [str(123456789010 + (i % 10)) for i in range(100)]
            
            df = pd.DataFrame({
                "student_id": student_ids,
                "citizen_id": citizen_ids
            })
            
            output = BytesIO()
            df.to_excel(output, index=False, engine='openpyxl')
            output.seek(0)
            
            response = client.post(
                '/api/staff/upload-students',
                data={'file': (output, 'test.xlsx')},
                content_type='multipart/form-data'
            )
            
            result = response.get_json()
            # Chỉ 10 unique records được tạo
            assert response.status_code == 200
            assert result["created"] == 10


class TestSQLInjectionPrevention:
    """Test suite để verify hệ thống ngăn chặn SQL injection"""
    
    def test_sql_injection_in_student_id(self, client, app):
        """Test: SQL injection attempt trong student_id"""
        with app.app_context():
            df = pd.DataFrame({
                "student_id": ["11244075'; DROP TABLE account;--"],
                "citizen_id": ["123456789010"]
            })
            
            output = BytesIO()
            df.to_excel(output, index=False, engine='openpyxl')
            output.seek(0)
            
            response = client.post(
                '/api/staff/upload-students',
                data={'file': (output, 'test.xlsx')},
                content_type='multipart/form-data'
            )
            
            # Hệ thống không nên crash, và tables vẫn tồn tại
            assert response.status_code in [200, 400]
            
            # Verify account table vẫn tồn tại
            accounts = Account.query.all()
            assert accounts is not None
    
    def test_sql_injection_in_citizen_id(self, client, app):
        """Test: SQL injection attempt trong citizen_id"""
        with app.app_context():
            df = pd.DataFrame({
                "student_id": ["11244075"],
                "citizen_id": ["123456789010'; DELETE FROM account;--"]
            })
            
            output = BytesIO()
            df.to_excel(output, index=False, engine='openpyxl')
            output.seek(0)
            
            response = client.post(
                '/api/staff/upload-students',
                data={'file': (output, 'test.xlsx')},
                content_type='multipart/form-data'
            )
            
            # Hệ thống không nên crash
            assert response.status_code in [200, 400]


class TestUnicodeHandling:
    """Test suite cho Unicode handling"""
    
    def test_upload_with_unicode_characters(self, client, app):
        """Test: Upload Excel với Unicode characters"""
        with app.app_context():
            df = pd.DataFrame({
                "student_id": ["11244075Ñ", "11244076Ü"],
                "citizen_id": ["123456789010", "123456789011"]
            })
            
            output = BytesIO()
            df.to_excel(output, index=False, engine='openpyxl')
            output.seek(0)
            
            response = client.post(
                '/api/staff/upload-students',
                data={'file': (output, 'test.xlsx')},
                content_type='multipart/form-data'
            )
            
            # Hệ thống không nên crash
            assert response.status_code in [200, 400]
    
    def test_upload_with_emoji(self, client, app):
        """Test: Upload Excel với emoji"""
        with app.app_context():
            df = pd.DataFrame({
                "student_id": ["11244075😀", "11244076🎉"],
                "citizen_id": ["123456789010", "123456789011"]
            })
            
            output = BytesIO()
            df.to_excel(output, index=False, engine='openpyxl')
            output.seek(0)
            
            response = client.post(
                '/api/staff/upload-students',
                data={'file': (output, 'test.xlsx')},
                content_type='multipart/form-data'
            )
            
            # Hệ thống không nên crash
            assert response.status_code in [200, 400]


class TestLargeDatasets:
    """Test suite cho large datasets"""
    
    def test_upload_large_batch(self, client, app):
        """Test: Upload Excel lớn (1000 records)"""
        with app.app_context():
            student_ids = [f"{11244075 + i}" for i in range(1000)]
            citizen_ids = [f"{123456789010 + i}" for i in range(1000)]
            
            df = pd.DataFrame({
                "student_id": student_ids,
                "citizen_id": citizen_ids
            })
            
            output = BytesIO()
            df.to_excel(output, index=False, engine='openpyxl')
            output.seek(0)
            
            response = client.post(
                '/api/staff/upload-students',
                data={'file': (output, 'test.xlsx')},
                content_type='multipart/form-data'
            )
            
            result = response.get_json()
            # Tất cả 1000 records được tạo
            assert response.status_code == 200
            assert result["created"] == 1000


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
