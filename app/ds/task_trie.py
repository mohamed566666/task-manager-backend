from typing import Dict, List, Optional


class TaskTrieNode:
    def __init__(self):
        self.children: Dict[str, "TaskTrieNode"] = {}
        self.task_ids: List[int] = []
        self.is_end = False


class TaskSearchTrie:
    def __init__(self):
        self.root = TaskTrieNode()

    def insert(self, title: str, task_id: int):
        node = self.root
        for char in title.lower():
            if char not in node.children:
                node.children[char] = TaskTrieNode()
            node = node.children[char]
        node.is_end = True
        node.task_ids.append(task_id)

    def search(self, prefix: str) -> List[int]:
        node = self.root
        for char in prefix.lower():
            if char not in node.children:
                return []
            node = node.children[char]
        return self._collect_all_tasks(node)

    def _collect_all_tasks(self, node: TaskTrieNode) -> List[int]:
        tasks = node.task_ids.copy()
        for child in node.children.values():
            tasks.extend(self._collect_all_tasks(child))
        return tasks

    def autocomplete(self, prefix: str, limit: int = 5) -> List[int]:
        return self.search(prefix)[:limit]
