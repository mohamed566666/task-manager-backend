from collections import OrderedDict
from typing import Dict, Optional
from datetime import datetime


class LRUTaskCache:
    def __init__(self, capacity: int = 100):
        self.cache = OrderedDict()
        self.capacity = capacity

    def get(self, task_id: int) -> Optional[Dict]:
        if task_id not in self.cache:
            return None
        self.cache.move_to_end(task_id)
        return self.cache[task_id]

    def put(self, task_id: int, task_data: Dict):
        if task_id in self.cache:
            self.cache.move_to_end(task_id)

        self.cache[task_id] = task_data
        self.cache[task_id]["cached_at"] = datetime.utcnow()

        if len(self.cache) > self.capacity:
            self.cache.popitem(last=False)
