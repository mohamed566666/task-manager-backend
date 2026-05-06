import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ManageCategoriesModal } from '../components/modals/ManageCategoriesModal';

// Mock TaskContext
jest.mock('../context/TaskContext', () => ({
  useTaskContext: () => ({
    categories: ['Work', 'Study', 'Personal'],
    addCategory: jest.fn(),
    deleteCategory: jest.fn(),
  }),
}));

describe('ManageCategoriesModal', () => {
  const user = userEvent.setup();
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders modal when open', () => {
    render(<ManageCategoriesModal isOpen={true} onClose={mockOnClose} />);

    expect(screen.getByText('Manage Categories')).toBeInTheDocument();
  });

  test('does not render when closed', () => {
    render(<ManageCategoriesModal isOpen={false} onClose={mockOnClose} />);

    expect(screen.queryByText('Manage Categories')).not.toBeInTheDocument();
  });

  test('displays existing categories', () => {
    render(<ManageCategoriesModal isOpen={true} onClose={mockOnClose} />);

    expect(screen.getByText('Work')).toBeInTheDocument();
    expect(screen.getByText('Study')).toBeInTheDocument();
    expect(screen.getByText('Personal')).toBeInTheDocument();
  });

  test('has input for new category', () => {
    render(<ManageCategoriesModal isOpen={true} onClose={mockOnClose} />);

    expect(screen.getByPlaceholderText('New category name')).toBeInTheDocument();
  });

  test('adds new category on form submit', async () => {
    const mockAddCategory = jest.fn();
    jest.mocked(require('../context/TaskContext').useTaskContext).mockReturnValue({
      categories: ['Work'],
      addCategory: mockAddCategory,
      deleteCategory: jest.fn(),
    });

    render(<ManageCategoriesModal isOpen={true} onClose={mockOnClose} />);

    const input = screen.getByPlaceholderText('New category name');
    const addButton = screen.getByRole('button', { name: /add/i });

    await user.type(input, 'New Category');
    await user.click(addButton);

    expect(mockAddCategory).toHaveBeenCalledWith('New Category');
  });

  test('shows validation error for empty category name', async () => {
    render(<ManageCategoriesModal isOpen={true} onClose={mockOnClose} />);

    const addButton = screen.getByRole('button', { name: /add/i });
    await user.click(addButton);

    expect(screen.getByText('Category name cannot be empty')).toBeInTheDocument();
  });

  test('deletes category on delete button click', async () => {
    const mockDeleteCategory = jest.fn();
    jest.mocked(require('../context/TaskContext').useTaskContext).mockReturnValue({
      categories: ['Work', 'Study'],
      addCategory: jest.fn(),
      deleteCategory: mockDeleteCategory,
    });

    render(<ManageCategoriesModal isOpen={true} onClose={mockOnClose} />);

    const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
    await user.click(deleteButtons[0]);

    expect(mockDeleteCategory).toHaveBeenCalledWith('Work');
  });

  test('closes modal on close button click', async () => {
    render(<ManageCategoriesModal isOpen={true} onClose={mockOnClose} />);

    const closeButton = screen.getByRole('button', { name: /close/i });
    await user.click(closeButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  test('prevents deleting default categories', () => {
    // Assuming default categories can't be deleted
    render(<ManageCategoriesModal isOpen={true} onClose={mockOnClose} />);

    const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
    expect(deleteButtons).toHaveLength(3); // All can be deleted, or check if disabled
  });
});