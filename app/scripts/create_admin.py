import os
import sys

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.core.database import SessionLocal
from app.models.user import User
from app.core.security import get_password_hash

def create_admin():
    db = SessionLocal()
    try:
        email = "ahmedmoooo519@gmail.com"
        password = "ASD123@123"
        
        # Check if user exists
        existing_user = db.query(User).filter(User.email == email).first()
        hashed_password = get_password_hash(password)
        if existing_user:
            existing_user.role = "admin"
            existing_user.hashed_password = hashed_password
            db.commit()
            print(f"User {email} updated to admin with new bcrypt hash.")
            return

        new_user = User(
            username="ahmed_admin",
            email=email,
            full_name="Ahmed Admin",
            hashed_password=hashed_password,
            role="admin"
        )
        db.add(new_user)
        db.commit()
        print(f"Admin user {email} created successfully.")
    except Exception as e:
        print(f"Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    create_admin()
