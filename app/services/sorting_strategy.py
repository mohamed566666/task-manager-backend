from abc import ABC, abstractmethod
from typing import List, Dict, Any
from datetime import datetime


class TaskSortingStrategy(ABC):
    @abstractmethod
    def sort(self, tasks: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        pass


class SortByPriorityStrategy(TaskSortingStrategy):
    priority_order = {"High": 1, "Medium": 2, "Low": 3}

    def sort(self, tasks: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        return sorted(
            tasks, key=lambda t: self.priority_order.get(t.get("priority", "Low"), 4)
        )


class SortByDeadlineStrategy(TaskSortingStrategy):
    def sort(self, tasks: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        return sorted(tasks, key=lambda t: t.get("deadline", datetime.max))


class SortByCreatedDateStrategy(TaskSortingStrategy):
    def sort(self, tasks: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        return sorted(
            tasks, key=lambda t: t.get("created_at", datetime.min), reverse=True
        )


class TaskSorter:
    def __init__(self, strategy: TaskSortingStrategy = None):
        self._strategy = strategy or SortByCreatedDateStrategy()

    def set_strategy(self, strategy: TaskSortingStrategy):
        self._strategy = strategy

    def sort_tasks(self, tasks: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        if not tasks:
            return tasks
        return self._strategy.sort(tasks)
