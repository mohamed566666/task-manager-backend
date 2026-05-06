import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TaskProvider } from '../context/TaskContext';
import { AddTaskModal } from '../components/modals/AddTaskModal';
import { EditTaskModal } from '../components/modals/EditTaskModal';
import { TaskCard } from '../components/board/TaskCard';

// Mock fetch
global.fetch = jest.fn();

describe('Task Management Flow', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  test('creates a new task successfully', async () => {
    // Mock successful API response
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ id: 1, title: 'New Task', status: 'todo' }),
    });

    render(
      <TaskProvider>
        <AddTaskModal isOpen={true} onClose={jest.fn()} />
      </TaskProvider>
    );

    // Fill form
    await user.type(screen.getByLabelText(/title/i), 'New Task');
    await user.type(screen.getByLabelText(/description/i), 'Task description');
    await user.click(screen.getByRole('button', { name: /add task/i }));

    // Wait for success
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        'http://127.0.0.1:8000/api/tasks/',
        expect.objectContaining({
          method: 'POST',
          body: expect.any(String),
        })
      );
    });
  });

  test('shows validation errors on empty fields', async () => {
    render(
      <TaskProvider>
        <AddTaskModal isOpen={true} onClose={jest.fn()} />
      </TaskProvider>
    );

    const submitButton = screen.getByRole('button', { name: /add task/i });
    await user.click(submitButton);

    expect(screen.getByText('Title is required')).toBeInTheDocument();
    expect(screen.getByText('Description is required')).toBeInTheDocument();
  });

  test('edits an existing task', async () => {
    const mockTask = {
      id: 1,
      title: 'Original Task',
      description: 'Original desc',
      status: 'todo',
      priority: 'medium',
      category: 'Work',
      dueDate: '2025-12-31',
    };

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ ...mockTask, title: 'Updated Task' }),
    });

    render(
      <TaskProvider>
        <EditTaskModal isOpen={true} onClose={jest.fn()} task={mockTask} />
      </TaskProvider>
    );

    // Change title
    const titleInput = screen.getByDisplayValue('Original Task');
    await user.clear(titleInput);
    await user.type(titleInput, 'Updated Task');

    await user.click(screen.getByRole('button', { name: /save changes/i }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        'http://127.0.0.1:8000/api/tasks/1',
        expect.objectContaining({
          method: 'PUT',
        })
      );
    });
  });

  test('deletes a task', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
    });

    render(
      <TaskProvider>
        <TaskCard task={{ id: 1, title: 'Task to Delete' }} />
      </TaskProvider>
    );

    // Open menu
    const menuButton = screen.getByRole('button', { name: /more/i });
    await user.click(menuButton);

    // Click delete
    const deleteButton = screen.getByRole('button', { name: /delete/i });
    await user.click(deleteButton);

    // Confirm delete
    const confirmButton = screen.getByRole('button', { name: /confirm/i });
    await user.click(confirmButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        'http://127.0.0.1:8000/api/tasks/1',
        expect.objectContaining({
          method: 'DELETE',
        })
      );
    });
  });

  test('handles API errors gracefully', async () => {
    global.fetch.mockRejectedValueOnce(new Error('Network error'));

    render(
      <TaskProvider>
        <AddTaskModal isOpen={true} onClose={jest.fn()} />
      </TaskProvider>
    );

    await user.type(screen.getByLabelText(/title/i), 'Task');
    await user.type(screen.getByLabelText(/description/i), 'Desc');
    await user.click(screen.getByRole('button', { name: /add task/i }));

    await waitFor(() => {
      expect(screen.getByText('Failed to create task')).toBeInTheDocument();
    });
  });

  test('handles 401 unauthorized', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
    });

    const mockNavigate = jest.fn();
    jest.mock('react-router-dom', () => ({
      useNavigate: () => mockNavigate,
    }));

    render(
      <TaskProvider>
        <AddTaskModal isOpen={true} onClose={jest.fn()} />
      </TaskProvider>
    );

    await user.type(screen.getByLabelText(/title/i), 'Task');
    await user.type(screen.getByLabelText(/description/i), 'Desc');
    await user.click(screen.getByRole('button', { name: /add task/i }));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });
  });
});