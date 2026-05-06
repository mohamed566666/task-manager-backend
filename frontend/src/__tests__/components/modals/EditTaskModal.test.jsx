/**
 * Integration tests for EditTaskModal.jsx
 *
 * Tests:
 *  - renders pre-filled form values from the task prop
 *  - shows validation errors on empty title / description / dueDate
 *  - calls editTask with the updated payload on valid submit
 *  - shows save error message when editTask throws
 *  - calls onClose after successful save
 *  - calls onClose when Cancel button is clicked
 *  - category selection updates the active category
 *
 * Assumption:
 *  - framer-motion and lucide-react are mocked to plain elements
 *  - useTasks() is mocked to provide editTask and categories
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import EditTaskModal from '../../../components/modals/EditTaskModal';

// ── Mocks ─────────────────────────────────────────────────────────────────
jest.mock('framer-motion', () => ({
  motion: {
    div:    ({ children, ...p }) => <div {...p}>{children}</div>,
    button: ({ children, ...p }) => <button {...p}>{children}</button>,
  },
  AnimatePresence: ({ children }) => <>{children}</>,
}));

jest.mock('lucide-react', () => ({
  X:      () => <span />,
  Pencil: () => <span />,
  Loader: () => <span />,
}));

const mockEditTask = jest.fn();
jest.mock('../../../context/TaskContext', () => ({
  useTasks: () => ({
    editTask: mockEditTask,
    categories: [{ id: 1, name: 'Work' }, { id: 2, name: 'Study' }],
  }),
}));

// ── Sample task ────────────────────────────────────────────────────────────
const sampleTask = {
  id: '1',
  title: 'Fix Login Bug',
  description: 'The login page crashes on invalid token',
  priority: 'high',
  status: 'in-progress',
  dueDate: '2025-12-31',
  category: 'Work',
};

const renderModal = (task = sampleTask, onClose = jest.fn()) =>
  render(<EditTaskModal task={task} onClose={onClose} />);

// ── Tests ──────────────────────────────────────────────────────────────────
describe('EditTaskModal', () => {
  beforeEach(() => mockEditTask.mockReset());

  // ── Pre-fill ──────────────────────────────────────────────────────────────
  test('renders with task title pre-filled', () => {
    renderModal();
    expect(screen.getByDisplayValue('Fix Login Bug')).toBeInTheDocument();
  });

  test('renders with task description pre-filled', () => {
    renderModal();
    expect(screen.getByDisplayValue(/crashes on invalid token/i)).toBeInTheDocument();
  });

  test('renders with correct due date pre-filled', () => {
    renderModal();
    expect(screen.getByDisplayValue('2025-12-31')).toBeInTheDocument();
  });

  test('renders "Edit Task" header', () => {
    renderModal();
    expect(screen.getByText(/edit task/i)).toBeInTheDocument();
  });

  // ── Validation ───────────────────────────────────────────────────────────
  test('shows "Task title is required" when title is cleared', async () => {
    renderModal();
    const titleInput = screen.getByDisplayValue('Fix Login Bug');
    await userEvent.clear(titleInput);
    await userEvent.click(screen.getByRole('button', { name: /save changes/i }));
    expect(await screen.findByText(/task title is required/i)).toBeInTheDocument();
  });

  test('shows "Description is required" when description is cleared', async () => {
    renderModal();
    const descInput = screen.getByDisplayValue(/crashes on invalid token/i);
    await userEvent.clear(descInput);
    await userEvent.click(screen.getByRole('button', { name: /save changes/i }));
    expect(await screen.findByText(/description is required/i)).toBeInTheDocument();
  });

  test('shows "Deadline is required" when date is cleared', async () => {
    renderModal();
    const dateInput = screen.getByDisplayValue('2025-12-31');
    await userEvent.clear(dateInput);
    await userEvent.click(screen.getByRole('button', { name: /save changes/i }));
    expect(await screen.findByText(/deadline is required/i)).toBeInTheDocument();
  });

  // ── Successful save ───────────────────────────────────────────────────────
  test('calls editTask with updated fields on save', async () => {
    mockEditTask.mockResolvedValueOnce(undefined);
    const onClose = jest.fn();
    render(<EditTaskModal task={sampleTask} onClose={onClose} />);

    const titleInput = screen.getByDisplayValue('Fix Login Bug');
    await userEvent.clear(titleInput);
    await userEvent.type(titleInput, 'Fixed Login Bug');

    await userEvent.click(screen.getByRole('button', { name: /save changes/i }));

    await waitFor(() => {
      expect(mockEditTask).toHaveBeenCalledWith(
        '1',
        expect.objectContaining({ title: 'Fixed Login Bug' })
      );
    });
  });

  test('calls onClose after successful save', async () => {
    mockEditTask.mockResolvedValueOnce(undefined);
    const onClose = jest.fn();
    render(<EditTaskModal task={sampleTask} onClose={onClose} />);
    await userEvent.click(screen.getByRole('button', { name: /save changes/i }));
    await waitFor(() => expect(onClose).toHaveBeenCalled());
  });

  // ── Save error ────────────────────────────────────────────────────────────
  test('shows save error banner when editTask throws', async () => {
    mockEditTask.mockRejectedValueOnce(new Error('Network timeout'));
    renderModal();
    await userEvent.click(screen.getByRole('button', { name: /save changes/i }));
    expect(await screen.findByText(/network timeout/i)).toBeInTheDocument();
  });

  // ── Cancel ────────────────────────────────────────────────────────────────
  test('calls onClose when Cancel button is clicked', async () => {
    const onClose = jest.fn();
    render(<EditTaskModal task={sampleTask} onClose={onClose} />);
    await userEvent.click(screen.getByRole('button', { name: /cancel/i }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  // ── Category selection ────────────────────────────────────────────────────
  test('switching category changes selected category', async () => {
    mockEditTask.mockResolvedValueOnce(undefined);
    const onClose = jest.fn();
    render(<EditTaskModal task={sampleTask} onClose={onClose} />);

    await userEvent.click(screen.getByRole('button', { name: /^study$/i }));
    await userEvent.click(screen.getByRole('button', { name: /save changes/i }));

    await waitFor(() => {
      const payload = mockEditTask.mock.calls[0][1];
      expect(payload.category).toBe('Study');
    });
  });

  // ── Priority & Status selects ─────────────────────────────────────────────
  test('changing priority select updates the submission payload', async () => {
    mockEditTask.mockResolvedValueOnce(undefined);
    const onClose = jest.fn();
    render(<EditTaskModal task={sampleTask} onClose={onClose} />);

    await userEvent.selectOptions(screen.getByDisplayValue(/high/i), 'low');
    await userEvent.click(screen.getByRole('button', { name: /save changes/i }));

    await waitFor(() => {
      const payload = mockEditTask.mock.calls[0][1];
      expect(payload.priority).toBe('low');
    });
  });
});
