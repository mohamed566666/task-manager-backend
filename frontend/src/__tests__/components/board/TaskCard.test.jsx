/**
 * Tests for TaskCard.jsx (the board card + its sub-components)
 *
 * Covered sub-components:
 *  TaskCard    - renders task info, opens the 3-dot menu, triggers delete/edit/view
 *  DeleteConfirmDialog - confirms or cancels deletion
 *
 * Notes / Assumptions:
 *  - @dnd-kit/sortable is mocked so we don't need a DnD provider
 *  - framer-motion & lucide-react are stripped to plain HTML
 *  - useTasks() is mocked (deleteTask, editTask, categories)
 *  - fetch is globally mocked for CommentsSection (TaskDetailModal)
 *  - EditTaskModal is mocked to a simple stub to keep tests focused
 */

import React from 'react';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TaskCard from '../../../components/board/TaskCard';

// ── @dnd-kit mock (removes drag-drop dependency) ──────────────────────────
jest.mock('@dnd-kit/sortable', () => ({
  useSortable: () => ({
    attributes: {},
    listeners: {},
    setNodeRef: jest.fn(),
    transform: null,
    transition: null,
    isDragging: false,
  }),
}));
jest.mock('@dnd-kit/utilities', () => ({
  CSS: { Transform: { toString: () => '' } },
}));

// ── framer-motion mock ─────────────────────────────────────────────────────
jest.mock('framer-motion', () => ({
  motion: {
    div:    ({ children, ...p }) => <div {...p}>{children}</div>,
    button: ({ children, ...p }) => <button {...p}>{children}</button>,
  },
  AnimatePresence: ({ children }) => <>{children}</>,
}));

// ── lucide-react mock ──────────────────────────────────────────────────────
jest.mock('lucide-react', () => ({
  Calendar:      () => <span data-testid="icon-calendar" />,
  MoreHorizontal:() => <span data-testid="icon-more" />,
  X:             () => <span data-testid="icon-x" />,
  Trash2:        () => <span data-testid="icon-trash" />,
  Eye:           () => <span data-testid="icon-eye" />,
  Pencil:        () => <span data-testid="icon-pencil" />,
  MessageSquare: () => <span data-testid="icon-message" />,
  Send:          () => <span data-testid="icon-send" />,
  Loader2:       () => <span data-testid="icon-loader" />,
}));

// ── TaskContext mock ───────────────────────────────────────────────────────
const mockDeleteTask = jest.fn();
jest.mock('../../../context/TaskContext', () => ({
  useTasks: () => ({
    deleteTask: mockDeleteTask,
    categories: [],
  }),
}));

// ── EditTaskModal stub (avoid deep testing inside TaskCard tests) ──────────
jest.mock('../../../components/modals/EditTaskModal', () => {
  return ({ onClose }) => (
    <div data-testid="edit-modal">
      <button onClick={onClose}>Close Edit</button>
    </div>
  );
});

// ── Helpers ────────────────────────────────────────────────────────────────
const sampleTask = {
  id: '42',
  backendId: 42,
  title: 'Build Tests',
  description: 'Write comprehensive tests for the frontend.',
  priority: 'high',
  status: 'todo',
  dueDate: '2025-12-01',
  category: 'Work',
  comments_count: 0,
};

const renderCard = (task = sampleTask) => render(<TaskCard task={task} />);

const openMenu = async () => {
  const menuBtn = screen.getByTestId('icon-more').closest('button');
  await userEvent.click(menuBtn);
};

// ── Tests ──────────────────────────────────────────────────────────────────
describe('TaskCard', () => {
  beforeEach(() => {
    mockDeleteTask.mockReset();
    // Mock fetch for CommentsSection (in TaskDetailModal)
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue([]),
    });
  });

  afterEach(() => jest.resetAllMocks());

  // ── Rendering ────────────────────────────────────────────────────────────
  test('renders task title', () => {
    renderCard();
    expect(screen.getByText('Build Tests')).toBeInTheDocument();
  });

  test('renders truncated description', () => {
    renderCard();
    expect(screen.getByText(/Write comprehensive tests/i)).toBeInTheDocument();
  });

  test('renders priority badge', () => {
    renderCard();
    expect(screen.getByText('high')).toBeInTheDocument();
  });

  test('renders category badge', () => {
    renderCard();
    expect(screen.getByText('Work')).toBeInTheDocument();
  });

  test('renders due date', () => {
    renderCard();
    expect(screen.getByText('2025-12-01')).toBeInTheDocument();
  });

  test('renders "No date" when dueDate is absent', () => {
    renderCard({ ...sampleTask, dueDate: '' });
    expect(screen.getByText('No date')).toBeInTheDocument();
  });

  test('renders "No description." when description is absent', () => {
    renderCard({ ...sampleTask, description: '' });
    expect(screen.getByText('No description.')).toBeInTheDocument();
  });

  // ── 3-dot menu ────────────────────────────────────────────────────────────
  test('opens the context menu when 3-dot button is clicked', async () => {
    renderCard();
    await openMenu();
    expect(screen.getByText(/edit task/i)).toBeInTheDocument();
    expect(screen.getByText(/view details/i)).toBeInTheDocument();
    expect(screen.getByText(/delete task/i)).toBeInTheDocument();
  });

  // ── Edit ──────────────────────────────────────────────────────────────────
  test('opens EditTaskModal when "Edit Task" is clicked from the menu', async () => {
    renderCard();
    await openMenu();
    await userEvent.click(screen.getByText(/edit task/i));
    expect(screen.getByTestId('edit-modal')).toBeInTheDocument();
  });

  // ── View Details ──────────────────────────────────────────────────────────
  test('opens TaskDetailModal when "View Details" is clicked', async () => {
    renderCard();
    await openMenu();
    await userEvent.click(screen.getByText(/view details/i));
    // The detail modal renders the task title as an h2
    await waitFor(() => {
      expect(screen.getAllByText('Build Tests').length).toBeGreaterThan(1);
    });
  });

  // ── Delete confirm dialog ─────────────────────────────────────────────────
  test('opens delete confirm dialog when "Delete Task" is clicked', async () => {
    renderCard();
    await openMenu();
    await userEvent.click(screen.getByText(/delete task/i));
    expect(screen.getByText(/delete task\?/i)).toBeInTheDocument();
    expect(screen.getByText(/this cannot be undone/i)).toBeInTheDocument();
  });

  test('includes the task title in the confirmation dialog', async () => {
    renderCard();
    await openMenu();
    await userEvent.click(screen.getByText(/delete task/i));
    expect(screen.getByText(/"Build Tests"/)).toBeInTheDocument();
  });

  test('calls deleteTask when Delete button is confirmed', async () => {
    mockDeleteTask.mockResolvedValueOnce(undefined);
    renderCard();
    await openMenu();
    await userEvent.click(screen.getByText(/delete task/i));
    // Click the red "Delete" button in the confirm dialog
    const confirmDeleteBtn = screen.getByRole('button', { name: /^delete$/i });
    await userEvent.click(confirmDeleteBtn);
    await waitFor(() => expect(mockDeleteTask).toHaveBeenCalledWith('42'));
  });

  test('does NOT call deleteTask when Cancel is clicked in confirm dialog', async () => {
    renderCard();
    await openMenu();
    await userEvent.click(screen.getByText(/delete task/i));
    await userEvent.click(screen.getByRole('button', { name: /cancel/i }));
    expect(mockDeleteTask).not.toHaveBeenCalled();
    // Dialog should be gone
    expect(screen.queryByText(/this cannot be undone/i)).not.toBeInTheDocument();
  });

  // ── Comments count badge ──────────────────────────────────────────────────
  test('does NOT render comments badge when comments_count is 0', () => {
    renderCard({ ...sampleTask, comments_count: 0 });
    expect(screen.queryByTestId('icon-message')).not.toBeInTheDocument();
  });

  test('renders comments count badge when comments_count > 0', () => {
    renderCard({ ...sampleTask, comments_count: 3 });
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByTestId('icon-message')).toBeInTheDocument();
  });
});
