import sqlite3
import os

db_path = os.path.join(os.path.dirname(__file__), "task_manager.db")

print("Connecting to database...")
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

try:
    cursor.execute("ALTER TABLE users ADD COLUMN role VARCHAR(20) DEFAULT 'user'")
    conn.commit()
    print("Successfully added 'role' column to 'users' table.")
except sqlite3.OperationalError as e:
    if "duplicate column name" in str(e).lower():
        print("Column 'role' already exists in 'users' table.")
    else:
        print(f"Error: {e}")
finally:
    conn.close()
