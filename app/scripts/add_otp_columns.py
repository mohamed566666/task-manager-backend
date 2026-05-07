import sqlite3
import os

db_path = os.path.join(os.path.dirname(__file__), "..", "..", "task_manager.db")

def upgrade_db():
    print(f"Connecting to database at: {db_path}")
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    try:
        cursor.execute("PRAGMA table_info(users)")
        columns = [info[1] for info in cursor.fetchall()]

        if "reset_otp" not in columns:
            cursor.execute("ALTER TABLE users ADD COLUMN reset_otp VARCHAR(10)")
            print("Added 'reset_otp' column.")
        else:
            print("'reset_otp' already exists.")

        if "reset_otp_expires_at" not in columns:
            cursor.execute("ALTER TABLE users ADD COLUMN reset_otp_expires_at DATETIME")
            print("Added 'reset_otp_expires_at' column.")
        else:
            print("'reset_otp_expires_at' already exists.")

        conn.commit()
        print("Database upgrade completed successfully.")
    except Exception as e:
        print(f"Error upgrading database: {e}")
    finally:
        conn.close()

if __name__ == "__main__":
    upgrade_db()
