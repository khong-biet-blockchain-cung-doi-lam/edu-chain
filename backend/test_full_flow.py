import requests
import os
import json

BASE_URL = "http://localhost:5000/api"
UPLOAD_URL = f"{BASE_URL}/staff/upload-students"
LOGIN_URL = f"{BASE_URL}/auth/login"
FILE_PATH = "sample_students.xlsx"

session = requests.Session()

def test_full_flow():
    # 1. Upload
    print("=== 1. Testing Upload ===")
    if not os.path.exists(FILE_PATH):
        print(f"File {FILE_PATH} not found.")
        return

    with open(FILE_PATH, "rb") as f:
        files = {"file": f}
        try:
            resp = session.post(UPLOAD_URL, files=files)
            print(f"Upload Status: {resp.status_code}")
            print(resp.json())
            
            if resp.status_code != 200:
                print("❌ Upload failed. Stopping.")
                return
        except Exception as e:
            print(f"❌ Connection error: {e}")
            return

    # 2. Login
    print("\n=== 2. Testing Login ===")
    # Creds from generate_sample_excel.py
    # SV001 / 001099123456
    payload = {
        "username": "SV001",
        "password": "001099123456" 
    }
    
    try:
        resp = session.post(LOGIN_URL, json=payload)
        print(f"Login Status: {resp.status_code}")
        print(resp.json())

        if resp.status_code == 200:
            print("✅ Login SUCCESS! Access Token received.")
        else:
            print("❌ Login FAILED.")
            
    except Exception as e:
        print(f"❌ Connection error: {e}")

if __name__ == "__main__":
    test_full_flow()
