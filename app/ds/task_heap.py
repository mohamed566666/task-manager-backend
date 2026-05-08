import heapq
from datetime import datetime
from typing import List, Tuple
from app.models.task import Task


class TaskPriorityQueue:
    def __init__(self):
        self.heap: List[Tuple[float, int]] = []

    def push_task(self, task: Task):
        days_until_deadline = (task.deadline - datetime.utcnow()).days
        priority_score = -days_until_deadline

        priority_weight = {"High": 1, "Medium": 2, "Low": 3}[task.priority.value]

        final_score = (priority_weight * 100) + days_until_deadline
        heapq.heappush(self.heap, (-final_score, task.id))

    def get_most_urgent_task(self) -> int:
        if self.heap:
            return heapq.heappop(self.heap)[1]
        return None

    def peek_urgent(self) -> int:
        if self.heap:
            return self.heap[0][1]
        return None
