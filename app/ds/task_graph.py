from typing import Dict, List, Set, Optional
from collections import deque

class TaskDependencyGraph:
    def __init__(self):
        self.graph: Dict[int, Set[int]] = {}
        self.reverse_graph: Dict[int, Set[int]] = {} 
    
    def add_dependency(self, task_id: int, depends_on: int):
        self.graph.setdefault(depends_on, set()).add(task_id)
        self.reverse_graph.setdefault(task_id, set()).add(depends_on)
    
    def get_tasks_in_order(self) -> List[int]:
        in_degree = {task: len(self.reverse_graph.get(task, set())) 
                    for task in self.graph}
        
        queue = deque([task for task, degree in in_degree.items() if degree == 0])
        result = []
        
        while queue:
            task = queue.popleft()
            result.append(task)
            
            for dependent in self.graph.get(task, set()):
                in_degree[dependent] -= 1
                if in_degree[dependent] == 0:
                    queue.append(dependent)
        
        return result if len(result) == len(in_degree) else []
    
    def detect_cycle(self) -> bool:
        visited = set()
        rec_stack = set()
        
        def dfs(task):
            visited.add(task)
            rec_stack.add(task)
            
            for dependent in self.graph.get(task, set()):
                if dependent not in visited:
                    if dfs(dependent):
                        return True
                elif dependent in rec_stack:
                    return True
            
            rec_stack.remove(task)
            return False
        
        for task in self.graph:
            if task not in visited:
                if dfs(task):
                    return True
        return False
    
    def get_critical_path(self, task_durations: Dict[int, float]) -> List[int]:
        pass