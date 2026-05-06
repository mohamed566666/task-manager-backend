/**
 * Unit tests for notificationEngine.js
 *
 * Tests:
 *  - saveNotifPref: persists notification preferences to localStorage
 *  - removeNotifPref: removes a specific task preference
 *  - initNotifications: does NOT start if permission is denied
 *  - initNotifications: calls getTasksFn and checks deadlines when granted
 *  - stopNotifications: clears the polling interval
 */

import {
  saveNotifPref,
  removeNotifPref,
  initNotifications,
  stopNotifications,
} from '../../utils/notificationEngine';

const NOTIF_KEY = 'task-notifications';

beforeEach(() => {
  localStorage.clear();
  jest.useFakeTimers();
  // Reset Notification mock
  global.Notification = {
    permission: 'granted',
    requestPermission: jest.fn().mockResolvedValue('granted'),
  };
});

afterEach(() => {
  stopNotifications();
  jest.useRealTimers();
});

// ── saveNotifPref ──────────────────────────────────────────────────────────
describe('saveNotifPref', () => {
  test('saves a preference object to localStorage', () => {
    saveNotifPref(42, '2025-12-31T23:59:00', true, 2);

    const stored = JSON.parse(localStorage.getItem(NOTIF_KEY));
    expect(stored[42]).toEqual({
      deadlineISO: '2025-12-31T23:59:00',
      notifyEnabled: true,
      notifyBeforeDays: 2,
    });
  });

  test('coerces notifyBeforeDays to a number', () => {
    saveNotifPref(1, '2025-01-01T00:00:00', true, '3');
    const stored = JSON.parse(localStorage.getItem(NOTIF_KEY));
    expect(typeof stored[1].notifyBeforeDays).toBe('number');
    expect(stored[1].notifyBeforeDays).toBe(3);
  });

  test('overwrites an existing preference for the same taskId', () => {
    saveNotifPref(5, '2025-06-01T00:00:00', true, 1);
    saveNotifPref(5, '2025-07-01T00:00:00', false, 0);

    const stored = JSON.parse(localStorage.getItem(NOTIF_KEY));
    expect(stored[5].deadlineISO).toBe('2025-07-01T00:00:00');
    expect(stored[5].notifyEnabled).toBe(false);
  });
});

// ── removeNotifPref ────────────────────────────────────────────────────────
describe('removeNotifPref', () => {
  test('removes the preference for a specific task', () => {
    saveNotifPref(10, '2025-01-01T00:00:00', true, 1);
    saveNotifPref(20, '2025-02-01T00:00:00', true, 1);

    removeNotifPref(10);

    const stored = JSON.parse(localStorage.getItem(NOTIF_KEY));
    expect(stored[10]).toBeUndefined();
    expect(stored[20]).toBeDefined();
  });

  test('is a no-op for a task that does not exist', () => {
    saveNotifPref(99, '2025-01-01T00:00:00', true, 1);
    expect(() => removeNotifPref(999)).not.toThrow();
    const stored = JSON.parse(localStorage.getItem(NOTIF_KEY));
    expect(stored[99]).toBeDefined();
  });
});

// ── initNotifications ──────────────────────────────────────────────────────
describe('initNotifications', () => {
  test('does not start if permission is denied', async () => {
    global.Notification = {
      permission: 'denied',
      requestPermission: jest.fn().mockResolvedValue('denied'),
    };
    const getTasksFn = jest.fn().mockReturnValue([]);

    await initNotifications(getTasksFn);

    expect(getTasksFn).not.toHaveBeenCalled();
  });

  test('calls getTasksFn immediately when permission is granted', async () => {
    global.Notification = {
      permission: 'granted',
      requestPermission: jest.fn().mockResolvedValue('granted'),
    };
    const getTasksFn = jest.fn().mockReturnValue([]);

    await initNotifications(getTasksFn);

    expect(getTasksFn).toHaveBeenCalledTimes(1);
  });

  test('re-checks tasks every 60 minutes via setInterval', async () => {
    global.Notification = {
      permission: 'granted',
      requestPermission: jest.fn().mockResolvedValue('granted'),
    };
    const getTasksFn = jest.fn().mockReturnValue([]);

    await initNotifications(getTasksFn);
    // initial call = 1
    jest.advanceTimersByTime(60 * 60 * 1000); // +1 hour
    expect(getTasksFn).toHaveBeenCalledTimes(2);
    jest.advanceTimersByTime(60 * 60 * 1000); // +2 hours
    expect(getTasksFn).toHaveBeenCalledTimes(3);
  });
});

// ── stopNotifications ──────────────────────────────────────────────────────
describe('stopNotifications', () => {
  test('stops the polling interval', async () => {
    global.Notification = {
      permission: 'granted',
      requestPermission: jest.fn().mockResolvedValue('granted'),
    };
    const getTasksFn = jest.fn().mockReturnValue([]);
    await initNotifications(getTasksFn);

    stopNotifications();

    jest.advanceTimersByTime(60 * 60 * 1000 * 5); // advance 5 hours
    // Should still only have 1 call (the initial one)
    expect(getTasksFn).toHaveBeenCalledTimes(1);
  });
});
