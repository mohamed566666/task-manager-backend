import urllib.request, json
import sqlite3

API = 'http://localhost:8000'

def req(method, path, data=None):
    headers = {'Content-Type': 'application/json'}
    body = json.dumps(data).encode() if data else None
    r = urllib.request.Request(f'{API}{path}', data=body, headers=headers, method=method)
    try:
        with urllib.request.urlopen(r, timeout=10) as resp:
            return resp.status, json.loads(resp.read()) if resp.length != 0 else {}
    except urllib.error.HTTPError as e:
        return e.code, json.loads(e.read())

print("Testing Forgot Password...")
code, resp = req('POST', '/api/auth/forgot-password', data={'email':'ahmedmoooo519@gmail.com'})
print(f"Forgot Password response: {code} - {resp}")

if code == 200:
    # Read OTP directly from DB for test
    conn = sqlite3.connect('task_manager.db')
    c = conn.cursor()
    c.execute("SELECT reset_otp FROM users WHERE email='ahmedmoooo519@gmail.com'")
    row = c.fetchone()
    conn.close()

    if row and row[0]:
        otp = row[0]
        print(f"Read OTP from DB: {otp}")
        
        print("Testing Reset Password...")
        code2, resp2 = req('POST', '/api/auth/reset-password', data={
            'email': 'ahmedmoooo519@gmail.com',
            'otp': otp,
            'new_password': 'NewPassword123!'
        })
        print(f"Reset Password response: {code2} - {resp2}")
        
        # Test Login with new password
        code3, resp3 = req('POST', '/api/auth/login', data={
            'email': 'ahmedmoooo519@gmail.com',
            'password': 'NewPassword123!'
        })
        print(f"Login with new password response: {code3} - Access Token: {'Yes' if 'access_token' in resp3 else 'No'}")
    else:
        print("Could not find OTP in DB!")
