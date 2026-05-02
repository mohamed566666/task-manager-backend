import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { initNotifications, saveNotifPref } from '../utils/notificationEngine';

const TaskContext = createContext();

const API_BASE = 'http://localhost:8000';

// Map backend task → frontend shape
const mapTask = (t) => ({
  id: String(t.id),
  backendId: t.id,
  title: t.title,
  description: t.description || '',
  status: t.status || (t.is_completed ? 'done' : 'todo'),
  priority: (t.priority || 'Medium').toLowerCase(),
  dueDate: t.deadline ? t.deadline.split('T')[0] : '',
  category: t.category_label || 'Work',
  owner_id: t.owner_id,
});

// Map frontend form → backend payload
const mapToBackend = (task) => ({
  title: task.title,
  description: task.description || '',
  deadline: task.dueDate ? `${task.dueDate}T23:59:59` : new Date().toISOString(),
  priority: task.priority
    ? task.priority.charAt(0).toUpperCase() + task.priority.slice(1)
    : 'Medium',
  status: task.status || 'todo',
  category_label: task.category || 'Work',
});

export const TaskProvider = ({ children }) => {
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');

  const getToken = () => localStorage.getItem('access_token');
  const getRole  = () => localStorage.getItem('user_role');

  const authHeaders = () => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${getToken()}`,
  });

  // Auto logout on 401
  const handleUnauthorized = () => {
    localStorage.clear();
    window.location.href = '/login';
  };

  // ── FETCH ──────────────────────────────────────────────────
  const fetchTasks = useCallback(async () => {
    const token = getToken();
    if (!token) { setIsLoading(false); return; }
    setIsLoading(true);
    setError('');
    try {
      const role = getRole();
      const endpoint = role === 'admin'
        ? `${API_BASE}/api/tasks/all`
        : `${API_BASE}/api/tasks/`;
      const res = await fetch(endpoint, { headers: authHeaders() });
      if (res.status === 401) { handleUnauthorized(); return; }
      if (!res.ok) throw new Error('Failed to fetch tasks');
      const data = await res.json();
      const mapped = data.map(mapTask);
      setTasks(mapped);
      initNotifications(() => mapped);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  // ── ADD ────────────────────────────────────────────────────
  const addTask = async (task) => {
    try {
      const res = await fetch(`${API_BASE}/api/tasks/`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(mapToBackend(task)),
      });
      if (res.status === 401) { handleUnauthorized(); return; }
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || 'Failed to create task');
      }
      const newTask = await res.json();
      const mapped = mapTask(newTask);
      setTasks(prev => [mapped, ...prev]);
      if (task.notifyEnabled && task.deadline) {
        saveNotifPref(mapped.backendId, `${task.deadline}T${task.deadlineTime || '23:59'}:00`, true, task.notifyBefore || 1);
      }
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // ── EDIT ───────────────────────────────────────────────────
  const editTask = async (taskId, updatedFields) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    // Optimistic update
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, ...updatedFields } : t));
    try {
      const deadline = updatedFields.dueDate
        ? `${updatedFields.dueDate}T23:59:59`
        : (task.dueDate ? `${task.dueDate}T23:59:59` : new Date().toISOString());
      const priority = updatedFields.priority || task.priority;
      const res = await fetch(`${API_BASE}/api/tasks/${task.backendId}`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify({
          title: updatedFields.title ?? task.title,
          description: updatedFields.description ?? task.description,
          deadline,
          priority: priority.charAt(0).toUpperCase() + priority.slice(1),
          status: updatedFields.status ?? task.status,
          is_completed: (updatedFields.status ?? task.status) === 'done',
          category_label: updatedFields.category ?? task.category,
        }),
      });
      if (res.status === 401) { handleUnauthorized(); return; }
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || 'Failed to update task');
      }
      const updated = await res.json();
      setTasks(prev => prev.map(t => t.id === taskId ? mapTask(updated) : t));
    } catch (err) {
      // Revert on failure
      setTasks(prev => prev.map(t => t.id === taskId ? task : t));
      setError(err.message);
      throw err;
    }
  };

  // ── UPDATE STATUS (drag-drop) ──────────────────────────────
  const updateTaskStatus = async (taskId, newStatus) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
    try {
      const res = await fetch(`${API_BASE}/api/tasks/${task.backendId}`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify({
          title: task.title,
          description: task.description,
          deadline: task.dueDate ? `${task.dueDate}T23:59:59` : new Date().toISOString(),
          priority: task.priority.charAt(0).toUpperCase() + task.priority.slice(1),
          status: newStatus,
          is_completed: newStatus === 'done',
          category_label: task.category,
        }),
      });
      if (res.status === 401) { handleUnauthorized(); return; }
      if (!res.ok) throw new Error('Failed to update task status');
    } catch (err) {
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: task.status } : t));
      setError(err.message);
    }
  };

  // ── DELETE ─────────────────────────────────────────────────
  const deleteTask = async (taskId) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    setTasks(prev => prev.filter(t => t.id !== taskId));
    try {
      const res = await fetch(`${API_BASE}/api/tasks/${task.backendId}`, {
        method: 'DELETE',
        headers: authHeaders(),
      });
      if (res.status === 401) { handleUnauthorized(); return; }
      if (!res.ok && res.status !== 204) throw new Error('Failed to delete task');
    } catch (err) {
      setTasks(prev => [...prev, task]);
      setError(err.message);
    }
  };

  // ── FILTER ─────────────────────────────────────────────────
  const filteredTasks = tasks.filter(task => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (task.description || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPriority = filterPriority === 'all' || task.priority === filterPriority;
    const matchesCategory = filterCategory === 'all' || task.category === filterCategory;
    return matchesSearch && matchesPriority && matchesCategory;
  });

  const stats = {
    total: tasks.length,
    completed: tasks.filter(t => t.status === 'done').length,
    pending: tasks.filter(t => t.status !== 'done').length,
    progress: tasks.length > 0
      ? Math.round((tasks.filter(t => t.status === 'done').length / tasks.length) * 100)
      : 0,
  };

  return (
    <TaskContext.Provider value={{
      tasks: filteredTasks,
      isLoading,
      error,
      addTask,
      editTask,
      updateTaskStatus,
      deleteTask,
      searchQuery, setSearchQuery,
      filterPriority, setFilterPriority,
      filterCategory, setFilterCategory,
      stats,
      refetch: fetchTasks,
    }}>
      {children}
    </TaskContext.Provider>
  );
};

export const useTasks = () => {
  const context = useContext(TaskContext);
  if (!context) throw new Error('useTasks must be used within a TaskProvider');
  return context;
};
