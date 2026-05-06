/**
 * Integration tests for RegisterPage.jsx
 *
 * Tests:
 *  - renders all form fields
 *  - shows required validation errors on empty submit
 *  - shows invalid email error
 *  - shows password too short error
 *  - shows "passwords do not match" error
 *  - clears field error as user types
 *  - calls /api/auth/register with correct payload
 *  - navigates to /login on success
 *  - shows server error message on registration failure
 *  - shows "Sign in instead" link
 *
 * Assumption: AuthLayout, lucide-react, and framer-motion are mocked the same
 * way as in LoginPage.test.jsx for consistency.
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import RegisterPage from '../../pages/RegisterPage';

// ── Mocks ─────────────────────────────────────────────────────────────────

jest.mock('framer-motion', () => {
  const actual = jest.requireActual('framer-motion');
  return {
    ...actual,
    motion: {
      ...actual.motion,
      button: ({ children, ...props }) => <button {...props}>{children}</button>,
      p: ({ children, ...props }) => <p {...props}>{children}</p>,
    },
    AnimatePresence: ({ children }) => <>{children}</>,
  };
});

jest.mock('lucide-react', () => ({
  Mail: () => <span />,
  Lock: () => <span />,
  User: () => <span />,
  UserPlus: () => <span />,
}));

jest.mock('../../components/auth/AuthLayout', () => {
  return ({ children }) => <div>{children}</div>;
});

// ── Helpers ────────────────────────────────────────────────────────────────

// Writable location mock for jsdom 24+
const mockLocation = { href: 'http://localhost/' };
Object.defineProperty(window, 'location', {
  configurable: true,
  get: () => mockLocation,
  set: () => {},
});

const renderRegisterPage = () =>
  render(
    <MemoryRouter>
      <RegisterPage />
    </MemoryRouter>
  );

const fillForm = async ({ username = '', name = '', email = '', password = '', confirmPassword = '' }) => {
  if (username) await userEvent.type(screen.getByPlaceholderText(/zizo/i), username);
  if (name)     await userEvent.type(screen.getByPlaceholderText(/ahmed mohamed/i), name);
  if (email)    await userEvent.type(screen.getByPlaceholderText(/ahmed@gmail.com/i), email);
  
  // There are two password fields (password + confirmPassword)
  const passwordInputs = screen.getAllByPlaceholderText(/••••••••/i);
  if (password)        await userEvent.type(passwordInputs[0], password);
  if (confirmPassword) await userEvent.type(passwordInputs[1], confirmPassword);
};

// ── Tests ──────────────────────────────────────────────────────────────────

describe('RegisterPage', () => {
  beforeEach(() => {
    localStorage.clear();
    global.fetch = jest.fn();
    mockLocation.href = 'http://localhost/';
  });

  afterEach(() => jest.resetAllMocks());

  // ── Rendering ────────────────────────────────────────────────────────────
  test('renders all required form fields', () => {
    renderRegisterPage();
    expect(screen.getByPlaceholderText(/zizo/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/ahmed mohamed/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/ahmed@gmail.com/i)).toBeInTheDocument();
    expect(screen.getAllByPlaceholderText(/••••••••/i)).toHaveLength(2);
  });

  test('renders "Create Account" submit button', () => {
    renderRegisterPage();
    expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
  });

  test('renders "Sign in instead" link', () => {
    renderRegisterPage();
    expect(screen.getByText(/sign in instead/i)).toBeInTheDocument();
  });

  // ── Validation ───────────────────────────────────────────────────────────
  test('shows all required errors when form is empty and submitted', async () => {
    renderRegisterPage();
    await userEvent.click(screen.getByRole('button', { name: /create account/i }));
    expect(await screen.findByText(/username is required/i)).toBeInTheDocument();
    expect(screen.getByText(/full name is required/i)).toBeInTheDocument();
    expect(screen.getByText(/email is required/i)).toBeInTheDocument();
    expect(screen.getByText(/password is required/i)).toBeInTheDocument();
  });

  test('shows invalid email error for bad email format', async () => {
    renderRegisterPage();
    await fillForm({ username: 'zizo', name: 'Zizo', email: 'notanemail', password: 'pass123', confirmPassword: 'pass123' });
    await userEvent.click(screen.getByRole('button', { name: /create account/i }));
    expect(await screen.findByText(/email is invalid/i)).toBeInTheDocument();
  });

  test('shows password too short error', async () => {
    renderRegisterPage();
    await fillForm({ username: 'zizo', name: 'Zizo', email: 'z@test.com', password: '123', confirmPassword: '123' });
    await userEvent.click(screen.getByRole('button', { name: /create account/i }));
    expect(await screen.findByText(/at least 6 characters/i)).toBeInTheDocument();
  });

  test('shows "passwords do not match" error', async () => {
    renderRegisterPage();
    await fillForm({ username: 'zizo', name: 'Zizo', email: 'z@test.com', password: 'pass123', confirmPassword: 'different' });
    await userEvent.click(screen.getByRole('button', { name: /create account/i }));
    expect(await screen.findByText(/passwords do not match/i)).toBeInTheDocument();
  });

  test('clears username error when user types into the field', async () => {
    renderRegisterPage();
    await userEvent.click(screen.getByRole('button', { name: /create account/i }));
    expect(await screen.findByText(/username is required/i)).toBeInTheDocument();
    await userEvent.type(screen.getByPlaceholderText(/zizo/i), 'a');
    expect(screen.queryByText(/username is required/i)).not.toBeInTheDocument();
  });

  // ── API: success ──────────────────────────────────────────────────────────
  test('calls register API with correct payload on valid submit', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValue({ id: 1 }),
    });

    renderRegisterPage();
    await fillForm({ username: 'zizo', name: 'Ahmed Zizo', email: 'z@test.com', password: 'pass123', confirmPassword: 'pass123' });
    await userEvent.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        'http://127.0.0.1:8000/api/auth/register',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            username: 'zizo',
            full_name: 'Ahmed Zizo',
            email: 'z@test.com',
            password: 'pass123',
          }),
        })
      );
    });
  });

  test('redirects to /login after successful registration', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValue({ id: 1 }),
    });

    renderRegisterPage();
    await fillForm({ username: 'zizo', name: 'Zizo', email: 'z@test.com', password: 'pass123', confirmPassword: 'pass123' });
    await userEvent.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() => {
      expect(mockLocation.href).toBe('/login');
    });
  });

  // ── API: failure ──────────────────────────────────────────────────────────
  test('shows server error message when registration fails', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      json: jest.fn().mockResolvedValue({ detail: 'Username already exists' }),
    });

    renderRegisterPage();
    await fillForm({ username: 'takenuser', name: 'Taken', email: 'taken@test.com', password: 'pass123', confirmPassword: 'pass123' });
    await userEvent.click(screen.getByRole('button', { name: /create account/i }));

    expect(await screen.findByText(/username already exists/i)).toBeInTheDocument();
  });

  test('shows fallback error when fetch throws', async () => {
    global.fetch.mockRejectedValueOnce(new Error('Network down'));
    renderRegisterPage();
    await fillForm({ username: 'zizo', name: 'Zizo', email: 'z@test.com', password: 'pass123', confirmPassword: 'pass123' });
    await userEvent.click(screen.getByRole('button', { name: /create account/i }));
    expect(await screen.findByText(/network down/i)).toBeInTheDocument();
  });
});
