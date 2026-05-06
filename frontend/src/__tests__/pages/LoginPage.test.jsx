/**
 * Integration tests for LoginPage.jsx
 *
 * Tests:
 *  - renders email, password fields and submit button
 *  - shows validation errors on empty submit
 *  - shows email invalid error for bad format
 *  - shows password-too-short error
 *  - on valid credentials: calls check-email then login API
 *  - shows "email not found" banner when check-email returns exists:false
 *  - shows generic error on login API failure
 *  - shows "Forgot password?" link
 *  - shows "Create one now" registration link
 *  - clears field-level error when user starts typing again
 *
 * Assumptions:
 *  - window.location.href is used for navigation after login (mocked below)
 *  - fetch is globally mocked per test
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import LoginPage from '../../pages/LoginPage';

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

// Replace lucide-react icons with no-op spans to avoid SVG rendering issues
jest.mock('lucide-react', () => ({
  Mail: () => <span data-testid="icon-mail" />,
  Lock: () => <span data-testid="icon-lock" />,
  LogIn: () => <span data-testid="icon-login" />,
  UserPlus: () => <span data-testid="icon-userplus" />,
  AlertCircle: () => <span data-testid="icon-alert" />,
}));

// Stub AuthLayout to just render its children
jest.mock('../../components/auth/AuthLayout', () => {
  return ({ children }) => <div data-testid="auth-layout">{children}</div>;
});

// Helper: encode a fake JWT
const fakeJWT = () => {
  const payload = { username: 'testuser', role: 'user', sub: '1' };
  const b64 = btoa(JSON.stringify(payload));
  return `header.${b64}.sig`;
};

// ── Helpers ────────────────────────────────────────────────────────────────

// ── Helpers ────────────────────────────────────────────────────────────────

const renderLoginPage = () =>
  render(
    <MemoryRouter>
      <LoginPage />
    </MemoryRouter>
  );

const fillAndSubmit = async (email, password) => {
  await userEvent.type(screen.getByPlaceholderText(/name@company.com/i), email);
  await userEvent.type(screen.getByPlaceholderText(/••••••••/i), password);
  await userEvent.click(screen.getByRole('button', { name: /sign in/i }));
};

// ── Tests ──────────────────────────────────────────────────────────────────

describe('LoginPage', () => {
  beforeEach(() => {
    localStorage.clear();
    global.fetch = jest.fn();
    window.location.href = 'http://localhost/';
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  // ── Rendering ────────────────────────────────────────────────────────────
  test('renders email and password inputs', () => {
    renderLoginPage();
    expect(screen.getByPlaceholderText(/name@company.com/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/••••••••/i)).toBeInTheDocument();
  });

  test('renders submit button with "Sign In" text', () => {
    renderLoginPage();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  test('renders "Forgot password?" link', () => {
    renderLoginPage();
    expect(screen.getByText(/forgot password\?/i)).toBeInTheDocument();
  });

  test('renders "Create one now" link', () => {
    renderLoginPage();
    expect(screen.getByText(/create one now/i)).toBeInTheDocument();
  });

  // ── Validation ───────────────────────────────────────────────────────────
  test('shows required errors when both fields are empty and form is submitted', async () => {
    renderLoginPage();
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }));
    expect(await screen.findByText(/email is required/i)).toBeInTheDocument();
    expect(screen.getByText(/password is required/i)).toBeInTheDocument();
  });

  test('shows email invalid error for malformed email', async () => {
    renderLoginPage();
    await userEvent.type(screen.getByPlaceholderText(/name@company.com/i), 'notanemail');
    await userEvent.type(screen.getByPlaceholderText(/••••••••/i), 'password123');
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }));
    expect(await screen.findByText(/email is invalid/i)).toBeInTheDocument();
  });

  test('shows password too short error', async () => {
    renderLoginPage();
    await userEvent.type(screen.getByPlaceholderText(/name@company.com/i), 'user@test.com');
    await userEvent.type(screen.getByPlaceholderText(/••••••••/i), '123');
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }));
    expect(await screen.findByText(/at least 6 characters/i)).toBeInTheDocument();
  });

  test('clears email error when user starts typing again', async () => {
    renderLoginPage();
    // trigger error
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }));
    expect(await screen.findByText(/email is required/i)).toBeInTheDocument();
    // start typing
    await userEvent.type(screen.getByPlaceholderText(/name@company.com/i), 'a');
    expect(screen.queryByText(/email is required/i)).not.toBeInTheDocument();
  });

  // ── API: email not found ──────────────────────────────────────────────────
  test('shows "email not found" banner when API says exists:false', async () => {
    global.fetch.mockResolvedValueOnce({
      json: jest.fn().mockResolvedValue({ exists: false }),
    });
    renderLoginPage();
    await fillAndSubmit('unknown@test.com', 'password123');
    expect(
      await screen.findByText(/no account found with this email address/i)
    ).toBeInTheDocument();
  });

  // ── API: successful login ─────────────────────────────────────────────────
  test('navigates to /dashboard after successful login', async () => {
    global.fetch
      .mockResolvedValueOnce({
        json: jest.fn().mockResolvedValue({ exists: true }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue({ access_token: fakeJWT() }),
      });

    renderLoginPage();
    await fillAndSubmit('user@test.com', 'password123');

    await waitFor(() => {
      expect(window.location.href).toBe('/dashboard');
    });
  });

  test('stores access_token in localStorage after login', async () => {
    const token = fakeJWT();
    global.fetch
      .mockResolvedValueOnce({ json: jest.fn().mockResolvedValue({ exists: true }) })
      .mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue({ access_token: token }),
      });

    renderLoginPage();
    await fillAndSubmit('user@test.com', 'password123');

    await waitFor(() => {
      expect(localStorage.getItem('access_token')).toBe(token);
    });
  });

  // ── API: login failure ────────────────────────────────────────────────────
  test('shows error message when login API fails', async () => {
    global.fetch
      .mockResolvedValueOnce({ json: jest.fn().mockResolvedValue({ exists: true }) })
      .mockResolvedValueOnce({
        ok: false,
        json: jest.fn().mockResolvedValue({ detail: 'Invalid password' }),
      });

    renderLoginPage();
    await fillAndSubmit('user@test.com', 'wrongpass');

    expect(await screen.findByText(/invalid password/i)).toBeInTheDocument();
  });

  // ── Edge: network error ───────────────────────────────────────────────────
  test('shows fallback error when fetch throws a network error', async () => {
    global.fetch.mockRejectedValueOnce(new Error('Network Error'));
    renderLoginPage();
    await fillAndSubmit('user@test.com', 'password123');
    expect(await screen.findByText(/network error/i)).toBeInTheDocument();
  });
});
