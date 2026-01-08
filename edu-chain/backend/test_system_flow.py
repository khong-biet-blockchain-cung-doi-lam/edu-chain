import requests
import json
import os
import time

BASE_URL = "http://localhost:5000/api"

def test_full_system():
    print("=== STARTING FULL SYSTEM REGRESSION TEST ===")
    
    # 0. Clean DB (Optional, but good for test)
    # Note: We rely on the endpoint failing or succeeding. 
    # Ideally should use clean_data.py separately.
    
    # 1. Upload Excel
    print("\n[1] Testing Upload (Staff)...")
    upload_url = f"{BASE_URL}/staff/upload-students"
    file_path = "students_sample.xlsx"
    
    if not os.path.exists(file_path):
        print(f"[FAIL] {file_path} not found. Run generate_sample_excel.py first.")
        return

    try:
        with open(file_path, "rb") as f:
            files = {"file": f}
            resp = requests.post(upload_url, files=files)
            
        print(f"Upload Status: {resp.status_code}")
        print(resp.text)
        
        if resp.status_code == 200:
            print("✅ Upload Success")
        elif resp.status_code == 400 and "đã tồn tại" in resp.text:
            print("⚠️ Upload: Data already exists (Acceptable)")
        else:
            print("❌ Upload Failed")
            return
            
    except Exception as e:
        print(f"❌ Upload Exception: {e}")
        return

    # 2. Login (Student)
    print("\n[2] Testing Login (SV001)...")
    login_url = f"{BASE_URL}/auth/login"
    # Password is citizen_id
    payload = {"username": "SV001", "password": "001099123456"}
    
    token = None
    try:
        resp = requests.post(login_url, json=payload)
        print(f"Login Status: {resp.status_code}")
        
        if resp.status_code == 200:
            data = resp.json()
            token = data.get("access_token")
            role = data.get("user", {}).get("role")
            print(f"✅ Login Success. Role: {role}")
        else:
            print(f"❌ Login Failed: {resp.text}")
            return
            
    except Exception as e:
        print(f"❌ Login Exception: {e}")
        return

    # 3. Get Profile
    print("\n[3] Testing Get Profile...")
    profile_url = f"{BASE_URL}/student/profile"
    headers = {"Authorization": f"Bearer {token}"}
    
    try:
        resp = requests.get(profile_url, headers=headers)
        print(f"Profile Status: {resp.status_code}")
        
        if resp.status_code == 200:
            print("✅ Profile Fetch Success")
            print(json.dumps(resp.json(), indent=2, ensure_ascii=False))
        else:
            print(f"❌ Profile Failed: {resp.text}")
            
    except Exception as e:
        print(f"❌ Profile Exception: {e}")

if __name__ == "__main__":
    test_full_system()
