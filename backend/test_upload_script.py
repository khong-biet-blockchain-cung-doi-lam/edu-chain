import requests
import os

# URL của API
url = "http://localhost:5000/api/staff/upload-students"

# Đường dẫn đến file mẫu (đã tạo trước đó)
file_path = "sample_students.xlsx"

if not os.path.exists(file_path):
    print(f"Lỗi: Không tìm thấy file {file_path}")
    exit(1)

# Gửi request multipart/form-data
with open(file_path, "rb") as f:
    files = {"file": f}
    try:
        response = requests.post(url, files=files)
        
        print(f"Status Code: {response.status_code}")
        print("Response Body:")
        print(response.json())
        
        if response.status_code == 200:
            print("\n✅ Upload thành công!")
        else:
            print("\n❌ Upload thất bại.")
    except Exception as e:
        print(f"\nLỗi kết nối: {e}")
