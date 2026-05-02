import React, { createContext, useContext, useState, useEffect } from 'react';

const TaskContext = createContext();

export const TaskProvider = ({ children }) => {
  const [tasks, setTasks] = useState(() => {
    const savedTasks = localStorage.getItem('task-manager-tasks');
    return savedTasks ? JSON.parse(savedTasks) : [
      { id: '1', title: 'Research competitors', description: 'Analyze Trello and Asana features.', status: 'todo', priority: 'high', dueDate: '2026-05-10' },
      { id: '2', title: 'Design system', description: 'Create color palette and typography.', status: 'in-progress', priority: 'medium', dueDate: '2026-05-12' },
      { id: '3', title: 'Project setup', description: 'Initialize repository and install dependencies.', status: 'done', priority: 'low', dueDate: '2026-05-01' },
    ];
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [filterPriority, setFilterPriority] = useState('all');

  useEffect(() => {
    localStorage.setItem('task-manager-tasks', JSON.stringify(tasks));
  }, [tasks]);

  const addTask = (task) => {
    const newTask = {
      ...task,
      id: Math.random().toString(36).substr(2, 9),
      status: task.status || 'todo'
    };
    setTasks([...tasks, newTask]);
  };

  const updateTaskStatus = (taskId, newStatus) => {
    setTasks(tasks.map(task => 
      task.id === taskId ? { ...task, status: newStatus } : task
    ));
  };

  const deleteTask = (taskId) => {
    setTasks(tasks.filter(task => task.id !== taskId));
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         task.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPriority = filterPriority === 'all' || task.priority === filterPriority;
    return matchesSearch && matchesPriority;
  });

  const stats = {
    total: tasks.length,
    completed: tasks.filter(t => t.status === 'done').length,
    pending: tasks.filter(t => t.status !== 'done').length,
    progress: tasks.length > 0 ? Math.round((tasks.filter(t => t.status === 'done').length / tasks.length) * 100) : 0
  };

  return (
    <TaskContext.Provider value={{ 
      tasks: filteredTasks, 
      addTask, 
      updateTaskStatus, 
      deleteTask,
      searchQuery,
      setSearchQuery,
      filterPriority,
      setFilterPriority,
      stats
    }}>
      {children}
    </TaskContext.Provider>
  );
};

export const useTasks = () => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTasks must be used within a TaskProvider');
  }
  return context;
};
