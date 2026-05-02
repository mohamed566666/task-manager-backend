from typing import List, Optional
from sqlalchemy.orm import Session
from app.repositories.base_repo import BaseRepository
from app.models.category import Category


class CategoryRepository(BaseRepository[Category]):
    def __init__(self, db: Session):
        super().__init__(db, Category)

    def get_by_user(self, user_id: int) -> List[Category]:
        return self.db.query(Category).filter(Category.user_id == user_id).all()

    def get_by_name(self, user_id: int, name: str) -> Optional[Category]:
        return (
            self.db.query(Category)
            .filter(Category.user_id == user_id, Category.name == name)
            .first()
        )
