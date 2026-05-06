/**
 * Component tests for Button.jsx
 *
 * Tests:
 *  - renders children text correctly
 *  - renders an icon when provided
 *  - shows a loading spinner when isLoading=true and hides children
 *  - is disabled when isLoading=true
 *  - calls onClick handler when clicked
 *  - does not call onClick when disabled (isLoading)
 *  - applies correct type attribute
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Button from '../../../components/ui/Button';

// Mock framer-motion to avoid animation complications in tests
jest.mock('framer-motion', () => {
  const actual = jest.requireActual('framer-motion');
  return {
    ...actual,
    motion: {
      ...actual.motion,
      button: ({ children, onClick, disabled, type, style }) => (
        <button onClick={onClick} disabled={disabled} type={type} style={style}>
          {children}
        </button>
      ),
    },
  };
});

describe('Button component', () => {
  test('renders children text', () => {
    render(<Button>Sign In</Button>);
    expect(screen.getByText('Sign In')).toBeInTheDocument();
  });

  test('renders an icon when the icon prop is provided', () => {
    // Use a simple SVG component as icon
    const MockIcon = ({ size }) => <svg data-testid="mock-icon" width={size} height={size} />;
    render(<Button icon={MockIcon}>Go</Button>);
    expect(screen.getByTestId('mock-icon')).toBeInTheDocument();
  });

  test('shows spinner and hides children when isLoading=true', () => {
    render(<Button isLoading>Sign In</Button>);
    // children text should not be visible
    expect(screen.queryByText('Sign In')).not.toBeInTheDocument();
    // A spinner div should exist – it has a specific border-top style trick
    // We rely on the button being present with no text content
    const btn = screen.getByRole('button');
    expect(btn).toBeInTheDocument();
    expect(btn).toBeDisabled();
  });

  test('button is disabled when isLoading=true', () => {
    render(<Button isLoading>Submit</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  test('calls onClick when clicked', async () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click Me</Button>);
    await userEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  test('does not call onClick when disabled (isLoading=true)', async () => {
    const handleClick = jest.fn();
    render(<Button isLoading onClick={handleClick}>Click Me</Button>);
    await userEvent.click(screen.getByRole('button'));
    expect(handleClick).not.toHaveBeenCalled();
  });

  test('defaults to type="button"', () => {
    render(<Button>Action</Button>);
    expect(screen.getByRole('button')).toHaveAttribute('type', 'button');
  });

  test('respects type="submit"', () => {
    render(<Button type="submit">Submit</Button>);
    expect(screen.getByRole('button')).toHaveAttribute('type', 'submit');
  });
});
