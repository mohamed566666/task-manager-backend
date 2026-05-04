from typing import List, Optional
from sqlalchemy.orm import Session
from app.repositories.base_repo import BaseRepository
from app.models.category import Category


class CategoryRepository(BaseRepository[Category]):
    def __init__(self, db: Session):
        super().__init__(db, Category)

    def get_all_categories(self) -> List[Category]:
        return self.db.query(Category).all()

    def get_by_name(self, name: str) -> Optional[Category]:
        return (
            self.db.query(Category)
            .filter(Category.name == name)
            .first()
        )
