import requests
import os
import json

BASE_URL = "http://localhost:5000/api"
LOGIN_URL = f"{BASE_URL}/auth/login"
PROFILE_URL = f"{BASE_URL}/student/profile"

# Dùng tài khoản mẫu đã tạo từ trước
USERNAME = "SV001"
PASSWORD = "001099123456"

def test_profile():
    print(f"=== Testing Profile API for {USERNAME} ===")
    
    # 1. Login
    payload = {"username": USERNAME, "password": PASSWORD}
    try:
        resp = requests.post(LOGIN_URL, json=payload)
        if resp.status_code != 200:
            print(f"[FAIL] Login failed: {resp.status_code}")
            print(resp.text)
            return
        
        token = resp.json().get("access_token")
        print("[OK] Login success")
    except Exception as e:
        print(f"[ERROR] Connection error during login: {e}")
        return

    # 2. Get Profile
    headers = {"Authorization": f"Bearer {token}"}
    try:
        resp = requests.get(PROFILE_URL, headers=headers)
        print(f"Profile Status: {resp.status_code}")
        print("Response Body:")
        print(json.dumps(resp.json(), indent=2, ensure_ascii=False))
        
        if resp.status_code == 200:
            print("\n[OK] Test API Profile thanh cong!")
        else:
            print("\n[FAIL] Test that bai.")
            
    except Exception as e:
        print(f"[ERROR] Connection error during profile fetch: {e}")

if __name__ == "__main__":
    test_profile()
