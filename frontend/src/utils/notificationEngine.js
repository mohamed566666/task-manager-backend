/**
 * Notification Engine — checks task deadlines and fires browser notifications.
 * Called once on app load and repeats every hour.
 */

const NOTIF_KEY = 'task-notifications';

function getNotifPrefs() {
  try {
    return JSON.parse(localStorage.getItem(NOTIF_KEY) || '{}');
  } catch {
    return {};
  }
}

export function saveNotifPref(taskId, deadlineISO, notifyEnabled, notifyBeforeDays) {
  const prefs = getNotifPrefs();
  prefs[taskId] = { deadlineISO, notifyEnabled, notifyBeforeDays: Number(notifyBeforeDays) };
  localStorage.setItem(NOTIF_KEY, JSON.stringify(prefs));
}

export function removeNotifPref(taskId) {
  const prefs = getNotifPrefs();
  delete prefs[taskId];
  localStorage.setItem(NOTIF_KEY, JSON.stringify(prefs));
}

async function requestPermission() {
  if (!('Notification' in window)) return false;
  if (Notification.permission === 'granted') return true;
  if (Notification.permission === 'denied') return false;
  const result = await Notification.requestPermission();
  return result === 'granted';
}

function showNotification(title, body, tag) {
  if (Notification.permission !== 'granted') return;
  try {
    new Notification(title, {
      body,
      tag,
      icon: '/vite.svg',
      badge: '/vite.svg',
    });
  } catch (e) {
    console.warn('Notification error:', e);
  }
}

function checkDeadlines(tasks) {
  const prefs = getNotifPrefs();
  const now = new Date();

  tasks.forEach(task => {
    if (task.status === 'done') return;

    const pref = prefs[task.backendId] || prefs[task.id];
    if (!pref || !pref.notifyEnabled) return;

    const deadline = new Date(task.dueDate + 'T23:59:00');
    if (isNaN(deadline.getTime())) return;

    const daysUntil = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24));
    const notifyDays = pref.notifyBeforeDays ?? 1;

    // Already past
    if (daysUntil < 0) {
      showNotification(
        `⚠️ Overdue: ${task.title}`,
        `This task was due ${Math.abs(daysUntil)} day(s) ago!`,
        `task-overdue-${task.id}`
      );
      return;
    }

    // Due today
    if (daysUntil === 0) {
      showNotification(
        `🔔 Due Today: ${task.title}`,
        `This task is due today! Category: ${task.category}`,
        `task-today-${task.id}`
      );
      return;
    }

    // Upcoming reminder based on user preference
    if (daysUntil <= notifyDays) {
      showNotification(
        `⏰ Upcoming: ${task.title}`,
        `Due in ${daysUntil} day(s) — ${task.category} · ${task.priority} priority`,
        `task-upcoming-${task.id}`
      );
    }
  });
}

let intervalId = null;

export async function initNotifications(getTasksFn) {
  const granted = await requestPermission();
  if (!granted) return;

  // Initial check
  const tasks = getTasksFn();
  checkDeadlines(tasks);

  // Check every 60 minutes
  if (intervalId) clearInterval(intervalId);
  intervalId = setInterval(() => {
    const latestTasks = getTasksFn();
    checkDeadlines(latestTasks);
  }, 60 * 60 * 1000);
}

export function stopNotifications() {
  if (intervalId) clearInterval(intervalId);
}
