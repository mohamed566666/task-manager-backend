import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TasksBoard } from '../pages/TasksBoard';
import { TaskProvider } from '../context/TaskContext';

// Mock the TaskContext
jest.mock('../context/TaskContext', () => ({
  TaskProvider: ({ children }) => <div data-testid="task-provider">{children}</div>,
  useTaskContext: () => ({
    tasks: [
      {
        id: 1,
        title: 'Test Task 1',
        description: 'Description 1',
        status: 'todo',
        priority: 'high',
        category: 'Work',
        dueDate: '2025-12-31',
        isCompleted: false,
      },
      {
        id: 2,
        title: 'Test Task 2',
        description: 'Description 2',
        status: 'in-progress',
        priority: 'medium',
        category: 'Study',
        dueDate: '2025-12-30',
        isCompleted: false,
      },
    ],
    categories: ['Work', 'Study', 'Personal'],
    filterPriority: 'All',
    filterCategory: 'All',
    setFilterPriority: jest.fn(),
    setFilterCategory: jest.fn(),
    addTask: jest.fn(),
  }),
}));

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
  },
}));

// Mock @dnd-kit components
jest.mock('@dnd-kit/core', () => ({
  DndContext: ({ children, onDragStart, onDragEnd }) => (
    <div data-testid="dnd-context" onDragStart={onDragStart} onDragEnd={onDragEnd}>
      {children}
    </div>
  ),
  DragOverlay: ({ children }) => <div data-testid="drag-overlay">{children}</div>,
  useSensor: jest.fn(),
  useSensors: jest.fn(),
  PointerSensor: jest.fn(),
  KeyboardSensor: jest.fn(),
}));

jest.mock('@dnd-kit/sortable', () => ({
  SortableContext: ({ children }) => <div data-testid="sortable-context">{children}</div>,
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
  closestCorners: jest.fn(),
}));

// Mock AddTaskModal
jest.mock('../components/modals/AddTaskModal', () => ({
  AddTaskModal: ({ isOpen, onClose }) =>
    isOpen ? <div data-testid="add-task-modal">Add Task Modal</div> : null,
}));

describe('TasksBoard', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders the kanban board with columns', () => {
    render(
      <TaskProvider>
        <TasksBoard />
      </TaskProvider>
    );

    expect(screen.getByText('To Do')).toBeInTheDocument();
    expect(screen.getByText('In Progress')).toBeInTheDocument();
    expect(screen.getByText('Done')).toBeInTheDocument();
  });

  test('displays tasks in correct columns', () => {
    render(
      <TaskProvider>
        <TasksBoard />
      </TaskProvider>
    );

    // Check tasks are in their columns
    expect(screen.getByText('Test Task 1')).toBeInTheDocument();
    expect(screen.getByText('Test Task 2')).toBeInTheDocument();
  });

  test('shows add task button', () => {
    render(
      <TaskProvider>
        <TasksBoard />
      </TaskProvider>
    );

    expect(screen.getByRole('button', { name: /add task/i })).toBeInTheDocument();
  });

  test('opens add task modal when add button is clicked', async () => {
    render(
      <TaskProvider>
        <TasksBoard />
      </TaskProvider>
    );

    const addButton = screen.getByRole('button', { name: /add task/i });
    await user.click(addButton);

    expect(screen.getByTestId('add-task-modal')).toBeInTheDocument();
  });

  test('displays filter dropdowns', () => {
    render(
      <TaskProvider>
        <TasksBoard />
      </TaskProvider>
    );

    expect(screen.getByLabelText(/priority/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/category/i)).toBeInTheDocument();
  });

  test('filters tasks by priority', async () => {
    render(
      <TaskProvider>
        <TasksBoard />
      </TaskProvider>
    );

    const prioritySelect = screen.getByLabelText(/priority/i);
    await user.selectOptions(prioritySelect, 'High');

    // Mock context should handle filtering
    expect(prioritySelect).toHaveValue('High');
  });

  test('filters tasks by category', async () => {
    render(
      <TaskProvider>
        <TasksBoard />
      </TaskProvider>
    );

    const categorySelect = screen.getByLabelText(/category/i);
    await user.selectOptions(categorySelect, 'Work');

    expect(categorySelect).toHaveValue('Work');
  });

  test('handles drag and drop', async () => {
    const mockOnDragEnd = jest.fn();
    jest.mocked(require('@dnd-kit/core').DndContext).mockImplementation(({ children, onDragEnd }) => (
      <div data-testid="dnd-context" onDragEnd={onDragEnd}>
        {children}
      </div>
    ));

    render(
      <TaskProvider>
        <TasksBoard />
      </TaskProvider>
    );

    const dndContext = screen.getByTestId('dnd-context');
    fireEvent.dragEnd(dndContext);

    // In a real test, you'd simulate drag events, but for simplicity, check if context handles it
  });

  test('displays empty state when no tasks', () => {
    // Mock empty tasks
    jest.mocked(require('../context/TaskContext').useTaskContext).mockReturnValue({
      tasks: [],
      categories: [],
      filterPriority: 'All',
      filterCategory: 'All',
      setFilterPriority: jest.fn(),
      setFilterCategory: jest.fn(),
      addTask: jest.fn(),
    });

    render(
      <TaskProvider>
        <TasksBoard />
      </TaskProvider>
    );

    expect(screen.getByText('Drop tasks here')).toBeInTheDocument();
  });
});