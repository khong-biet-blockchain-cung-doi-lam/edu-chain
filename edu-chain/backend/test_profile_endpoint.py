import requests
import json

BASE_URL = "http://localhost:5000/api"
LOGIN_URL = f"{BASE_URL}/auth/login"
PROFILE_URL = f"{BASE_URL}/student/profile"

USERNAME = "SV001"
PASSWORD = "001099123456"

def test_profile():
    print(f"Testing Profile for {USERNAME}...")
    
    # Login
    try:
        resp = requests.post(LOGIN_URL, json={"username": USERNAME, "password": PASSWORD})
        if resp.status_code != 200:
            print(f"[FAIL] Login: {resp.status_code}")
            print(resp.text)
            return
        token = resp.json()["access_token"]
        print("[OK] Login success")
    except Exception as e:
        print(f"[ERROR] Logic exception: {e}")
        return

    # Profile
    try:
        resp = requests.get(PROFILE_URL, headers={"Authorization": f"Bearer {token}"})
        print(f"Status: {resp.status_code}")
        print(json.dumps(resp.json(), indent=2))
    except Exception as e:
         print(f"[ERROR] Profile exception: {e}")

if __name__ == "__main__":
    test_profile()
