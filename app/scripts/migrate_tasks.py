import sqlite3
import os

db_path = os.path.join(os.path.dirname(__file__), "task_manager.db")

print("Connecting to database...")
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

try:
    cursor.execute("ALTER TABLE tasks ADD COLUMN status VARCHAR(20) DEFAULT 'todo'")
    print("Added 'status' column to 'tasks' table.")
except Exception as e:
    print(f"'status' column: {e}")

try:
    cursor.execute("ALTER TABLE tasks ADD COLUMN category_label VARCHAR(50) DEFAULT 'Work'")
    print("Added 'category_label' column to 'tasks' table.")
except Exception as e:
    print(f"'category_label' column: {e}")

conn.commit()
conn.close()
print("Done.")
