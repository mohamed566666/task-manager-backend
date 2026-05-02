from sqlalchemy.orm import Session
from app.repositories.category_repo import CategoryRepository
from app.schemas.category import CategoryCreate, CategoryResponse


class CategoryService:
    def __init__(self, db: Session):
        self.category_repo = CategoryRepository(db)

    def create_category(
        self, user_id: int, category_data: CategoryCreate
    ) -> CategoryResponse:
        existing = self.category_repo.get_by_name(user_id, category_data.name)
        if existing:
            raise ValueError("Category with this name already exists")

        category = self.category_repo.create(
            name=category_data.name,
            description=category_data.description,
            user_id=user_id,
        )

        return CategoryResponse(
            id=category.id,
            name=category.name,
            description=category.description,
            user_id=category.user_id,
        )

    def get_user_categories(self, user_id: int) -> list[CategoryResponse]:
        categories = self.category_repo.get_by_user(user_id)
        return [
            CategoryResponse(
                id=c.id, name=c.name, description=c.description, user_id=c.user_id
            )
            for c in categories
        ]
