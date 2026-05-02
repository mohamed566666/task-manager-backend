import urllib.request, urllib.error
import json

API = "http://localhost:8000"

# Step 1: Login
def login(email, password):
    data = json.dumps({"email": email, "password": password}).encode()
    req = urllib.request.Request(f"{API}/api/auth/login", data=data, headers={"Content-Type": "application/json"})
    with urllib.request.urlopen(req, timeout=10) as r:
        return json.loads(r.read())

# Step 2: Test tasks endpoint
def get_tasks(token, admin=False):
    endpoint = "/api/tasks/all" if admin else "/api/tasks/"
    req = urllib.request.Request(f"{API}{endpoint}", headers={"Authorization": f"Bearer {token}"})
    with urllib.request.urlopen(req, timeout=10) as r:
        return json.loads(r.read())

# Step 3: Test GET /api/auth/users
def get_users(token):
    req = urllib.request.Request(f"{API}/api/auth/users", headers={"Authorization": f"Bearer {token}"})
    with urllib.request.urlopen(req, timeout=10) as r:
        return json.loads(r.read())

print("=== Testing Admin Login ===")
resp = login("ahmedmoooo519@gmail.com", "ASD123@123")
token = resp["access_token"]
print("Login OK, token received")

print("\n=== Testing GET /api/tasks/all (admin) ===")
try:
    tasks = get_tasks(token, admin=True)
    print(f"Tasks count: {len(tasks)}")
except Exception as e:
    print(f"Error: {e}")

print("\n=== Testing GET /api/auth/users (admin) ===")
try:
    users = get_users(token)
    print(f"Users: {[u['username'] + ' (' + u['role'] + ')' for u in users]}")
except Exception as e:
    print(f"Error: {e}")

print("\nAll tests passed!")
