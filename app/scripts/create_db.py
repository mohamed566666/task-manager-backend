import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT

try:
    conn = psycopg2.connect(
        host="localhost",
        port=5432,
        user="postgres",
        password="admin123",
        database="postgres",
    )
    conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
    cursor = conn.cursor()

    cursor.execute("CREATE DATABASE task_manager_db")
    print("✅ Database 'task_manager_db' created successfully!")

    cursor.close()
    conn.close()

except psycopg2.Error as e:
    if "already exists" in str(e):
        print("⚠️ Database 'task_manager_db' already exists!")
    else:
        print(f"❌ Error: {e}")
