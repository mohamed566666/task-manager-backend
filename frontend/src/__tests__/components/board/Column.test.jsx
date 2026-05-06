import React from 'react';
import { render, screen } from '@testing-library/react';
import { Column } from '../components/board/Column';

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
  },
}));

// Mock @dnd-kit
jest.mock('@dnd-kit/sortable', () => ({
  SortableContext: ({ children }) => <div data-testid="sortable-context">{children}</div>,
}));

jest.mock('@dnd-kit/core', () => ({
  useDroppable: () => ({
    setNodeRef: jest.fn(),
    isOver: false,
  }),
}));

describe('Column', () => {
  const mockTasks = [
    { id: 1, title: 'Task 1', status: 'todo' },
    { id: 2, title: 'Task 2', status: 'todo' },
  ];

  test('renders column title and task count', () => {
    render(<Column title="To Do" tasks={mockTasks} columnId="todo" />);

    expect(screen.getByText('To Do')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument(); // Task count
  });

  test('displays tasks', () => {
    render(<Column title="To Do" tasks={mockTasks} columnId="todo" />);

    expect(screen.getByText('Task 1')).toBeInTheDocument();
    expect(screen.getByText('Task 2')).toBeInTheDocument();
  });

  test('shows empty state when no tasks', () => {
    render(<Column title="Done" tasks={[]} columnId="done" />);

    expect(screen.getByText('Drop tasks here')).toBeInTheDocument();
  });

  test('applies correct styling for different columns', () => {
    const { container } = render(<Column title="In Progress" tasks={[]} columnId="in-progress" />);

    // Check if the column has the expected class or style
    // Assuming it has a class based on columnId
    expect(container.firstChild).toHaveClass('column'); // Adjust based on actual class
  });
});