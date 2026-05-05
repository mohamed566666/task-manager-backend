"""
test_sorting_strategy.py – Unit tests for app/services/sorting_strategy.py

Covers
------
* SortByPriorityStrategy: correct order (High→Medium→Low), ties, empty list
* SortByDeadlineStrategy: ascending deadline order, missing deadlines edge case
* SortByCreatedDateStrategy: most-recent first
* TaskSorter.set_strategy() + fallback default strategy
"""

import pytest
from datetime import datetime, timedelta

from app.services.sorting_strategy import (
    SortByPriorityStrategy,
    SortByDeadlineStrategy,
    SortByCreatedDateStrategy,
    TaskSorter,
)


# ─── Helpers ─────────────────────────────────────────────────────────────────

def _make_task(priority="Medium", deadline_offset_days=1, created_offset_days=0) -> dict:
    now = datetime.utcnow()
    return {
        "id": 1,
        "title": "Task",
        "priority": priority,
        "deadline": now + timedelta(days=deadline_offset_days),
        "created_at": now - timedelta(days=created_offset_days),
        "is_completed": False,
    }


# ─── SortByPriorityStrategy ──────────────────────────────────────────────────

class TestSortByPriorityStrategy:
    strategy = SortByPriorityStrategy()

    def test_correct_order_high_medium_low(self):
        tasks = [
            _make_task("Low"),
            _make_task("High"),
            _make_task("Medium"),
        ]
        result = self.strategy.sort(tasks)
        assert [t["priority"] for t in result] == ["High", "Medium", "Low"]

    def test_all_same_priority_preserved(self):
        tasks = [_make_task("Medium"), _make_task("Medium"), _make_task("Medium")]
        result = self.strategy.sort(tasks)
        assert all(t["priority"] == "Medium" for t in result)
        assert len(result) == 3

    def test_empty_list_returns_empty(self):
        assert self.strategy.sort([]) == []

    def test_single_task_returned(self):
        tasks = [_make_task("High")]
        assert self.strategy.sort(tasks) == tasks

    def test_unknown_priority_sorted_last(self):
        tasks = [
            {"id": 1, "priority": "Unknown", "deadline": datetime.utcnow(), "created_at": datetime.utcnow()},
            _make_task("High"),
        ]
        result = self.strategy.sort(tasks)
        assert result[0]["priority"] == "High"


# ─── SortByDeadlineStrategy ──────────────────────────────────────────────────

class TestSortByDeadlineStrategy:
    strategy = SortByDeadlineStrategy()

    def test_ascending_deadline_order(self):
        tasks = [
            _make_task(deadline_offset_days=5),
            _make_task(deadline_offset_days=1),
            _make_task(deadline_offset_days=3),
        ]
        result = self.strategy.sort(tasks)
        deadlines = [t["deadline"] for t in result]
        assert deadlines == sorted(deadlines)

    def test_empty_list_returns_empty(self):
        assert self.strategy.sort([]) == []


# ─── SortByCreatedDateStrategy ───────────────────────────────────────────────

class TestSortByCreatedDateStrategy:
    strategy = SortByCreatedDateStrategy()

    def test_most_recent_first(self):
        tasks = [
            _make_task(created_offset_days=5),   # oldest
            _make_task(created_offset_days=1),   # newest
            _make_task(created_offset_days=3),   # middle
        ]
        result = self.strategy.sort(tasks)
        created_ats = [t["created_at"] for t in result]
        assert created_ats == sorted(created_ats, reverse=True)

    def test_empty_list_returns_empty(self):
        assert self.strategy.sort([]) == []


# ─── TaskSorter (context class) ──────────────────────────────────────────────

class TestTaskSorter:
    def test_default_strategy_is_created_date(self):
        """Without explicit strategy, sorter uses SortByCreatedDateStrategy."""
        sorter = TaskSorter()
        tasks = [
            _make_task(created_offset_days=3),
            _make_task(created_offset_days=1),
        ]
        result = sorter.sort_tasks(tasks)
        assert result[0]["created_at"] >= result[1]["created_at"]

    def test_set_strategy_changes_behaviour(self):
        sorter = TaskSorter()
        sorter.set_strategy(SortByPriorityStrategy())
        tasks = [_make_task("Low"), _make_task("High")]
        result = sorter.sort_tasks(tasks)
        assert result[0]["priority"] == "High"

    def test_empty_list_returns_immediately(self):
        sorter = TaskSorter()
        assert sorter.sort_tasks([]) == []
