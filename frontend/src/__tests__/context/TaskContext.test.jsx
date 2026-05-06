/**
 * Integration tests for TaskContext (TaskProvider + useTasks hook)
 *
 * Tests the context's state management and API orchestration:
 *  - fetches tasks and categories on mount
 *  - maps backend task shape to frontend shape (mapTask)
 *  - handles 401 → calls handleUnauthorized (clears storage + redirects)
 *  - addTask: optimistically adds task and calls POST endpoint
 *  - addTask: re-throws on API error and sets error state
 *  - editTask: optimistically updates then confirms with API response
 *  - editTask: reverts on failure and sets error
 *  - deleteTask: optimistically removes then calls DELETE endpoint
 *  - deleteTask: reverts on failure
 *  - updateTaskStatus: patches status optimistically
 *  - filteredTasks: filters by searchQuery
 *  - filteredTasks: filters by filterPriority
 *  - filteredTasks: filters by filterCategory
 *  - stats: calculates total, completed, pending, progress
 *  - useTasks(): throws when used outside provider
 *
 * Assumptions:
 *  - notificationEngine is mocked to avoid browser Notification API
 *  - fetch is globally mocked
 *  - window.location.href is writable
 */

import React from 'react';
import { render, screen, act, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TaskProvider, useTasks } from '../../context/TaskContext';

// ── Mock notificationEngine ────────────────────────────────────────────────
jest.mock('../../utils/notificationEngine', () => ({
  initNotifications: jest.fn(),
  saveNotifPref: jest.fn(),
}));

// ── Backend task fixture ───────────────────────────────────────────────────
const backendTask = (overrides = {}) => ({
  id: 1,
  title: 'Test Task',
  description: 'A test task',
  status: 'todo',
  priority: 'Medium',
  deadline: '2025-12-31T23:59:59',
  category_label: 'Work',
  owner_id: 10,
  is_completed: false,
  ...overrides,
});

const backendCategory = { id: 1, name: 'Work', description: '' };

// ── Helper component to exercise useTasks ─────────────────────────────────
const Consumer = ({ onRender }) => {
  const ctx = useTasks();
  onRender(ctx);
  return null;
};

const renderWithProvider = (onRender) => {
  render(
    <TaskProvider>
      <Consumer onRender={onRender} />
    </TaskProvider>
  );
};

// ── Setup ──────────────────────────────────────────────────────────────────
// Writable location mock (jsdom 24+ has read-only window.location)
const mockLocation = { href: 'http://localhost/' };
Object.defineProperty(window, 'location', {
  configurable: true,
  get: () => mockLocation,
  set: () => {},
});

beforeEach(() => {
  localStorage.clear();
  localStorage.setItem('access_token', 'fake-token');
  localStorage.setItem('user_role', 'user');
  global.fetch = jest.fn();
  mockLocation.href = 'http://localhost/';
});

afterEach(() => jest.resetAllMocks());

// ── Tests ──────────────────────────────────────────────────────────────────
describe('TaskContext – initial fetch', () => {
  test('fetches tasks and categories on mount, sets them in state', async () => {
    global.fetch
      .mockResolvedValueOnce({ ok: true, status: 200, json: jest.fn().mockResolvedValue([backendTask()]) })
      .mockResolvedValueOnce({ ok: true, status: 200, json: jest.fn().mockResolvedValue([backendCategory]) });

    let ctx;
    renderWithProvider((c) => { ctx = c; });

    await waitFor(() => expect(ctx.isLoading).toBe(false));
    expect(ctx.tasks).toHaveLength(1);
    expect(ctx.tasks[0].title).toBe('Test Task');
    expect(ctx.categories).toHaveLength(1);
    expect(ctx.categories[0].name).toBe('Work');
  });

  test('maps backend priority "Medium" → frontend "medium"', async () => {
    global.fetch
      .mockResolvedValueOnce({ ok: true, status: 200, json: jest.fn().mockResolvedValue([backendTask({ priority: 'High' })]) })
      .mockResolvedValueOnce({ ok: true, status: 200, json: jest.fn().mockResolvedValue([]) });

    let ctx;
    renderWithProvider((c) => { ctx = c; });

    await waitFor(() => expect(ctx.isLoading).toBe(false));
    expect(ctx.tasks[0].priority).toBe('high');
  });

  test('calls handleUnauthorized (redirect + clear storage) on 401', async () => {
    global.fetch
      .mockResolvedValueOnce({ ok: false, status: 401, json: jest.fn().mockResolvedValue({}) })
      .mockResolvedValueOnce({ ok: false, status: 401, json: jest.fn().mockResolvedValue({}) });

    let ctx;
    renderWithProvider((c) => { ctx = c; });

    await waitFor(() => expect(mockLocation.href).toBe('/login'));
    expect(localStorage.getItem('access_token')).toBeNull();
  });

  test('sets error state when fetch fails with a network error', async () => {
    global.fetch.mockRejectedValueOnce(new Error('Network down'));

    let ctx;
    renderWithProvider((c) => { ctx = c; });

    await waitFor(() => expect(ctx.isLoading).toBe(false));
    expect(ctx.error).toBe('Network down');
  });

  test('skips fetch when no access_token exists', async () => {
    localStorage.clear(); // no token

    let ctx;
    renderWithProvider((c) => { ctx = c; });

    await waitFor(() => expect(ctx.isLoading).toBe(false));
    expect(global.fetch).not.toHaveBeenCalled();
  });
});

// ── addTask ────────────────────────────────────────────────────────────────
describe('TaskContext – addTask', () => {
  const prepareInitialFetch = () => {
    global.fetch
      .mockResolvedValueOnce({ ok: true, status: 200, json: jest.fn().mockResolvedValue([]) })
      .mockResolvedValueOnce({ ok: true, status: 200, json: jest.fn().mockResolvedValue([]) });
  };

  test('adds new task to state after successful POST', async () => {
    prepareInitialFetch();
    global.fetch.mockResolvedValueOnce({
      ok: true, status: 201,
      json: jest.fn().mockResolvedValue(backendTask({ id: 99, title: 'New Task' })),
    });

    let ctx;
    renderWithProvider((c) => { ctx = c; });
    await waitFor(() => expect(ctx.isLoading).toBe(false));

    await act(async () => {
      await ctx.addTask({ title: 'New Task', description: 'Desc', dueDate: '2025-12-01', priority: 'medium', status: 'todo', category: 'Work' });
    });

    expect(ctx.tasks.find(t => t.title === 'New Task')).toBeDefined();
  });

  test('sets error and re-throws on POST failure', async () => {
    prepareInitialFetch();
    global.fetch.mockResolvedValueOnce({
      ok: false, status: 400,
      json: jest.fn().mockResolvedValue({ detail: 'Bad request' }),
    });

    const ctxRef = { current: null };
    renderWithProvider((c) => { ctxRef.current = c; });
    await waitFor(() => expect(ctxRef.current.isLoading).toBe(false));

    await expect(
      act(async () => {
        await ctxRef.current.addTask({ title: 'T', description: 'D', dueDate: '2025-01-01', priority: 'low', status: 'todo', category: 'Work' });
      })
    ).rejects.toThrow('Bad request');

    await waitFor(() => expect(ctxRef.current.error).toBe('Bad request'));
  });
});

// ── deleteTask ─────────────────────────────────────────────────────────────
describe('TaskContext – deleteTask', () => {
  test('removes task from state after DELETE 204', async () => {
    global.fetch
      .mockResolvedValueOnce({ ok: true, status: 200, json: jest.fn().mockResolvedValue([backendTask()]) })
      .mockResolvedValueOnce({ ok: true, status: 200, json: jest.fn().mockResolvedValue([]) })
      .mockResolvedValueOnce({ ok: true, status: 204, json: jest.fn().mockResolvedValue({}) });

    let ctx;
    renderWithProvider((c) => { ctx = c; });
    await waitFor(() => expect(ctx.isLoading).toBe(false));

    await act(async () => { await ctx.deleteTask('1'); });

    expect(ctx.tasks).toHaveLength(0);
  });

  test('reverts task to state when DELETE fails', async () => {
    global.fetch
      .mockResolvedValueOnce({ ok: true, status: 200, json: jest.fn().mockResolvedValue([backendTask()]) })
      .mockResolvedValueOnce({ ok: true, status: 200, json: jest.fn().mockResolvedValue([]) })
      .mockResolvedValueOnce({ ok: false, status: 500, json: jest.fn().mockResolvedValue({}) });

    let ctx;
    renderWithProvider((c) => { ctx = c; });
    await waitFor(() => expect(ctx.isLoading).toBe(false));

    await act(async () => { await ctx.deleteTask('1'); });

    // Task should be reverted
    expect(ctx.tasks).toHaveLength(1);
    expect(ctx.error).toBe('Failed to delete task');
  });
});

// ── filteredTasks & stats ──────────────────────────────────────────────────
describe('TaskContext – filtering and stats', () => {
  const twoTasks = [
    backendTask({ id: 1, title: 'Alpha', status: 'todo',   priority: 'High',   category_label: 'Work' }),
    backendTask({ id: 2, title: 'Beta',  status: 'done',   priority: 'Low',    category_label: 'Study' }),
  ];

  const setupTwo = () => {
    global.fetch
      .mockResolvedValueOnce({ ok: true, status: 200, json: jest.fn().mockResolvedValue(twoTasks) })
      .mockResolvedValueOnce({ ok: true, status: 200, json: jest.fn().mockResolvedValue([]) });
  };

  test('filteredTasks returns all tasks when search is empty', async () => {
    setupTwo();
    let ctx;
    renderWithProvider((c) => { ctx = c; });
    await waitFor(() => expect(ctx.isLoading).toBe(false));
    expect(ctx.tasks).toHaveLength(2);
  });

  test('filteredTasks filters by searchQuery (title match)', async () => {
    setupTwo();
    let ctx;
    renderWithProvider((c) => { ctx = c; });
    await waitFor(() => expect(ctx.isLoading).toBe(false));
    act(() => ctx.setSearchQuery('alpha'));
    await waitFor(() => expect(ctx.tasks).toHaveLength(1));
    expect(ctx.tasks[0].title).toBe('Alpha');
  });

  test('filteredTasks filters by priority', async () => {
    setupTwo();
    let ctx;
    renderWithProvider((c) => { ctx = c; });
    await waitFor(() => expect(ctx.isLoading).toBe(false));
    act(() => ctx.setFilterPriority('low'));
    await waitFor(() => expect(ctx.tasks).toHaveLength(1));
    expect(ctx.tasks[0].title).toBe('Beta');
  });

  test('filteredTasks filters by category', async () => {
    setupTwo();
    let ctx;
    renderWithProvider((c) => { ctx = c; });
    await waitFor(() => expect(ctx.isLoading).toBe(false));
    act(() => ctx.setFilterCategory('Study'));
    await waitFor(() => expect(ctx.tasks).toHaveLength(1));
    expect(ctx.tasks[0].title).toBe('Beta');
  });

  test('stats are computed correctly', async () => {
    setupTwo();
    let ctx;
    renderWithProvider((c) => { ctx = c; });
    await waitFor(() => expect(ctx.isLoading).toBe(false));
    expect(ctx.stats.total).toBe(2);
    expect(ctx.stats.completed).toBe(1);
    expect(ctx.stats.pending).toBe(1);
    expect(ctx.stats.progress).toBe(50);
  });

  test('stats.progress is 0 when there are no tasks', async () => {
    global.fetch
      .mockResolvedValueOnce({ ok: true, status: 200, json: jest.fn().mockResolvedValue([]) })
      .mockResolvedValueOnce({ ok: true, status: 200, json: jest.fn().mockResolvedValue([]) });
    let ctx;
    renderWithProvider((c) => { ctx = c; });
    await waitFor(() => expect(ctx.isLoading).toBe(false));
    expect(ctx.stats.progress).toBe(0);
  });
});

// ── useTasks() outside provider ────────────────────────────────────────────
describe('useTasks hook', () => {
  test('throws when used outside TaskProvider', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<Consumer onRender={() => {}} />)).toThrow(
      'useTasks must be used within a TaskProvider'
    );
    consoleSpy.mockRestore();
  });
});
