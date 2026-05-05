import urllib.request, json, sys

API = 'http://localhost:8000'

def req(method, path, token=None, data=None):
    headers = {'Content-Type': 'application/json'}
    if token:
        headers['Authorization'] = f'Bearer {token}'
    body = json.dumps(data).encode() if data else None
    r = urllib.request.Request(f'{API}{path}', data=body, headers=headers, method=method)
    try:
        with urllib.request.urlopen(r, timeout=10) as resp:
            return resp.status, json.loads(resp.read()) if resp.length != 0 else {}
    except urllib.error.HTTPError as e:
        try:
            return e.code, json.loads(e.read())
        except:
            return e.code, {}

# Login
code, resp = req('POST', '/api/auth/login', data={'email':'ahmedmoooo519@gmail.com','password':'ASD123@123'})
assert code == 200, f"Login failed {code}: {resp}"
token = resp['access_token']
print(f"[OK] Login as {resp.get('username')} ({resp.get('role')})")

# Create task
code, task = req('POST', '/api/tasks/', token=token, data={
    'title': 'Edit Test Task',
    'description': 'Original description',
    'deadline': '2026-07-01T23:59:00',
    'priority': 'Medium',
    'status': 'todo',
    'category_label': 'Work'
})
assert code == 201, f"Create failed {code}: {task}"
tid = task['id']
print(f"[OK] Created task id={tid}")

# PUT update (same user = owner)
code, updated = req('PUT', f'/api/tasks/{tid}', token=token, data={
    'title': 'EDITED Title',
    'description': 'Updated description',
    'deadline': '2026-08-15T23:59:00',
    'priority': 'High',
    'status': 'in-progress',
    'is_completed': False,
    'category_label': 'Study'
})
if code == 200:
    print(f"[OK] PUT update: title='{updated['title']}' status='{updated['status']}' cat='{updated['category_label']}'")
else:
    print(f"[FAIL] PUT update {code}: {updated}")
    sys.exit(1)

# Delete
req_del = urllib.request.Request(
    f'{API}/api/tasks/{tid}',
    headers={'Authorization': f'Bearer {token}'},
    method='DELETE'
)
with urllib.request.urlopen(req_del, timeout=10) as r:
    print(f"[OK] Deleted task id={tid}, status={r.status}")

print("\nAll tests PASSED!")
