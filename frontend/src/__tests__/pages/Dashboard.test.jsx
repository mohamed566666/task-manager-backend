import React from 'react';
import { render, screen } from '@testing-library/react';
import { Dashboard } from '../pages/Dashboard';

// Mock TaskContext
jest.mock('../context/TaskContext', () => ({
  useTaskContext: () => ({
    tasks: [
      { id: 1, title: 'Task 1', status: 'completed', priority: 'high' },
      { id: 2, title: 'Task 2', status: 'pending', priority: 'medium' },
      { id: 3, title: 'Task 3', status: 'pending', priority: 'low' },
    ],
    totalTasks: 3,
    completedTasks: 1,
    pendingTasks: 2,
    progress: 33,
  }),
}));

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
  },
}));

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  CheckCircle: () => <div data-testid="check-circle-icon" />,
  Clock: () => <div data-testid="clock-icon" />,
  AlertCircle: () => <div data-testid="alert-circle-icon" />,
  TrendingUp: () => <div data-testid="trending-up-icon" />,
}));

describe('Dashboard', () => {
  test('renders dashboard title', () => {
    render(<Dashboard />);

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });

  test('displays task statistics', () => {
    render(<Dashboard />);

    expect(screen.getByText('3')).toBeInTheDocument(); // Total tasks
    expect(screen.getByText('1')).toBeInTheDocument(); // Completed
    expect(screen.getByText('2')).toBeInTheDocument(); // Pending
    expect(screen.getByText('33%')).toBeInTheDocument(); // Progress
  });

  test('shows stat cards with icons', () => {
    render(<Dashboard />);

    expect(screen.getByTestId('check-circle-icon')).toBeInTheDocument();
    expect(screen.getByTestId('clock-icon')).toBeInTheDocument();
    expect(screen.getByTestId('alert-circle-icon')).toBeInTheDocument();
    expect(screen.getByTestId('trending-up-icon')).toBeInTheDocument();
  });

  test('displays recent tasks', () => {
    render(<Dashboard />);

    expect(screen.getByText('Task 1')).toBeInTheDocument();
    expect(screen.getByText('Task 2')).toBeInTheDocument();
    expect(screen.getByText('Task 3')).toBeInTheDocument();
  });

  test('shows priority badges', () => {
    render(<Dashboard />);

    expect(screen.getByText('High')).toBeInTheDocument();
    expect(screen.getByText('Medium')).toBeInTheDocument();
    expect(screen.getByText('Low')).toBeInTheDocument();
  });

  test('displays progress circle', () => {
    render(<Dashboard />);

    // Assuming there's a progress indicator
    expect(screen.getByText('33%')).toBeInTheDocument();
  });

  test('handles empty tasks gracefully', () => {
    jest.mocked(require('../context/TaskContext').useTaskContext).mockReturnValue({
      tasks: [],
      totalTasks: 0,
      completedTasks: 0,
      pendingTasks: 0,
      progress: 0,
    });

    render(<Dashboard />);

    expect(screen.getByText('0')).toBeInTheDocument();
  });
});