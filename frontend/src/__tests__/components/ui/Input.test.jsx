/**
 * Component tests for Input.jsx
 *
 * Tests:
 *  - renders label when provided
 *  - renders input element
 *  - renders icon when provided
 *  - shows error message when error prop is truthy
 *  - does NOT show error message when error is absent
 *  - calls onChange handler when user types
 *  - passes additional props to the underlying input (e.g., placeholder, name, type)
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Input from '../../../components/ui/Input';

// framer-motion mock (AnimatePresence + motion.p)
jest.mock('framer-motion', () => {
  const actual = jest.requireActual('framer-motion');
  return {
    ...actual,
    motion: {
      ...actual.motion,
      p: ({ children, style }) => <p style={style}>{children}</p>,
    },
    AnimatePresence: ({ children }) => <>{children}</>,
  };
});

describe('Input component', () => {
  test('renders label text when label prop is provided', () => {
    render(<Input label="Email Address" />);
    expect(screen.getByText('Email Address')).toBeInTheDocument();
  });

  test('does not render a label when label prop is absent', () => {
    const { container } = render(<Input />);
    expect(container.querySelector('label')).not.toBeInTheDocument();
  });

  test('renders an input element', () => {
    render(<Input label="Email" name="email" />);
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  test('renders an icon when provided', () => {
    const MockIcon = ({ size }) => <svg data-testid="input-icon" width={size} height={size} />;
    render(<Input label="Email" icon={MockIcon} />);
    expect(screen.getByTestId('input-icon')).toBeInTheDocument();
  });

  test('shows error text prefixed with ⚠ when error prop is set', () => {
    render(<Input label="Email" error="Email is required" />);
    expect(screen.getByText(/Email is required/i)).toBeInTheDocument();
  });

  test('does not show error text when error prop is absent', () => {
    render(<Input label="Email" />);
    expect(screen.queryByText(/required/i)).not.toBeInTheDocument();
  });

  test('calls onChange when user types', async () => {
    const handleChange = jest.fn();
    render(<Input label="Email" onChange={handleChange} />);
    await userEvent.type(screen.getByRole('textbox'), 'hello');
    expect(handleChange).toHaveBeenCalled();
  });

  test('forwards placeholder and name props to the native input', () => {
    render(<Input label="Email" name="email" placeholder="name@company.com" />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('name', 'email');
    expect(input).toHaveAttribute('placeholder', 'name@company.com');
  });

  test('renders password input when type=password', () => {
    const { container } = render(<Input label="Password" type="password" />);
    expect(container.querySelector('input[type="password"]')).toBeInTheDocument();
  });
});
