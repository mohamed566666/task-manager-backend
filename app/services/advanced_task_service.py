from typing import List, Optional

from sqlalchemy.orm import Session

from app.ds.task_heap import TaskPriorityQueue
from app.ds.task_graph import TaskDependencyGraph
from app.ds.task_trie import TaskSearchTrie
from app.ds.task_lru_cache import LRUTaskCache
from app.models.task import Task


class AdvancedTaskService:
    def __init__(self, db: Session):
        self.db = db
        self.urgent_tasks = TaskPriorityQueue()
        self.dependency_graph = TaskDependencyGraph()
        self.search_trie = TaskSearchTrie()
        self.lru_cache = LRUTaskCache(capacity=50)

        self._load_existing_tasks()

    def _load_existing_tasks(self):
        tasks = self.db.query(Task).all()
        for task in tasks:
            self.urgent_tasks.push_task(task)
            self.search_trie.insert(task.title, task.id)

    def get_next_task_suggestion(self) -> Optional[int]:
        return self.urgent_tasks.get_most_urgent_task()

    def search_tasks_fast(self, query: str) -> List[int]:
        return self.search_trie.autocomplete(query, limit=10)

    def add_dependency_between_tasks(self, task_id: int, depends_on: int):
        self.dependency_graph.add_dependency(task_id, depends_on)
        if self.dependency_graph.detect_cycle():
            raise ValueError("This would create a circular dependency!")
