import urllib.request
import json

try:
    data = json.dumps({"email": "ahmedmoooo519@gmail.com", "password": "ASD123@123"}).encode("utf-8")
    req = urllib.request.Request("http://localhost:8000/api/auth/login", data=data, headers={"Content-Type": "application/json"})
    with urllib.request.urlopen(req, timeout=10) as response:
        print("Status Code:", response.getcode())
        print("Response:", response.read().decode())
except Exception as e:
    print("Error:", e)

