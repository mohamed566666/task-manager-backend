import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Loader, Bell, BellOff } from 'lucide-react';
import { useTasks } from '../../context/TaskContext';

// Removed hardcoded CATEGORIES array

const DEFAULT_CATEGORIES = ['Work', 'Study', 'Personal', 'Other'];

const categoryColors = {
  Work:     { bg: 'rgba(34,197,94,0.15)',   color: '#4ade80',  border: 'rgba(34,197,94,0.3)' },
  Study:    { bg: 'rgba(59,130,246,0.15)',  color: '#60a5fa',  border: 'rgba(59,130,246,0.3)' },
  Personal: { bg: 'rgba(168,85,247,0.15)', color: '#c084fc',  border: 'rgba(168,85,247,0.3)' },
  Other:    { bg: 'rgba(148,163,184,0.15)',color: '#94a3b8',  border: 'rgba(148,163,184,0.3)' },
};

const inputStyle = {
  width: '100%',
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '12px',
  padding: '12px 16px',
  color: '#f8fafc',
  fontSize: '0.95rem',
  outline: 'none',
  fontFamily: 'Inter, sans-serif',
  boxSizing: 'border-box',
};

const labelStyle = {
  fontSize: '0.85rem', fontWeight: 500, color: '#94a3b8', marginBottom: '6px', display: 'block',
};

const today = new Date().toISOString().split('T')[0];

// Get tomorrow as minimum deadline date
const tomorrow = (() => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split('T')[0];
})();

const AddTaskModal = ({ isOpen, onClose }) => {
  const { addTask, categories } = useTasks();

  // Merge: default categories first, then any user-created ones not in defaults
  const dynamicExtras = categories.filter(c => !DEFAULT_CATEGORIES.includes(c.name)).map(c => c.name);
  const allCategories = [...DEFAULT_CATEGORIES, ...dynamicExtras];

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    status: 'todo',
    dueDate: today,
    deadline: tomorrow,
    deadlineTime: '23:59',
    category: 'Work',
    notifyEnabled: true,
    notifyBefore: '1', // days before
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (field, value) => {
    setFormData(p => ({ ...p, [field]: value }));
    if (errors[field]) setErrors(p => ({ ...p, [field]: '' }));
  };

  const validate = () => {
    const errs = {};
    if (!formData.title.trim()) errs.title = 'Task title is required';
    if (!formData.description.trim()) errs.description = 'Description is required';
    if (!formData.deadline) errs.deadline = 'Deadline is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setIsLoading(true);

    // Store notification preference in localStorage keyed by task after creation
    const taskPayload = {
      ...formData,
      title: formData.title.trim(),
      description: formData.description.trim(),
      dueDate: formData.deadline,
    };

    await addTask(taskPayload);

    // Reset
    setFormData({
      title: '', description: '', priority: 'medium', status: 'todo',
      dueDate: today, deadline: tomorrow, deadlineTime: '23:59',
      category: 'Work', notifyEnabled: true, notifyBefore: '1',
    });
    setErrors({});
    setIsLoading(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)', zIndex: 100 }}
          />

          {/* Centering container */}
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 101, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
            <motion.div
              key="modal"
              initial={{ opacity: 0, scale: 0.93, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.93, y: 20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 28 }}
              onClick={e => e.stopPropagation()}
              style={{
                pointerEvents: 'auto',
                width: '90%', maxWidth: '540px',
                background: '#13131c',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '24px',
                fontFamily: 'Inter, sans-serif',
                boxShadow: '0 24px 80px rgba(0,0,0,0.6)',
                display: 'flex', flexDirection: 'column',
                maxHeight: '90vh',
              }}
            >
              {/* Sticky Header */}
              <div style={{ padding: '22px 26px 16px', borderBottom: '1px solid rgba(255,255,255,0.07)', flexShrink: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: 'rgba(99,102,241,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Plus size={18} color="#6366f1" />
                    </div>
                    <h2 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: '#f8fafc' }}>Add New Task</h2>
                  </div>
                  <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: '#64748b', borderRadius: '10px', padding: '6px', cursor: 'pointer', display: 'flex' }}>
                    <X size={18} />
                  </button>
                </div>
              </div>

              {/* Scrollable Body */}
              <div style={{ overflowY: 'auto', padding: '18px 26px', flex: 1 }}>
                <form id="add-task-form" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

                  {/* Title */}
                  <div>
                    <label style={labelStyle}>Task Title <span style={{ color: '#ef4444' }}>*</span></label>
                    <input
                      autoFocus
                      style={{ ...inputStyle, borderColor: errors.title ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.1)' }}
                      placeholder="What needs to be done?"
                      value={formData.title}
                      onChange={e => handleChange('title', e.target.value)}
                      onFocus={e => e.target.style.borderColor = 'rgba(99,102,241,0.5)'}
                      onBlur={e => e.target.style.borderColor = errors.title ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.1)'}
                    />
                    {errors.title && <p style={{ color: '#f87171', fontSize: '0.78rem', marginTop: '4px' }}>{errors.title}</p>}
                  </div>

                  {/* Description — REQUIRED */}
                  <div>
                    <label style={labelStyle}>Description <span style={{ color: '#ef4444' }}>*</span></label>
                    <textarea
                      style={{ ...inputStyle, resize: 'none', height: '80px', borderColor: errors.description ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.1)' }}
                      placeholder="Describe the task in detail..."
                      value={formData.description}
                      onChange={e => handleChange('description', e.target.value)}
                      onFocus={e => e.target.style.borderColor = 'rgba(99,102,241,0.5)'}
                      onBlur={e => e.target.style.borderColor = errors.description ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.1)'}
                    />
                    {errors.description && <p style={{ color: '#f87171', fontSize: '0.78rem', marginTop: '4px' }}>{errors.description}</p>}
                  </div>

                  {/* Category */}
                  <div>
                    <label style={labelStyle}>Category</label>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      {allCategories.map(catName => {
                        const c = categoryColors[catName] || categoryColors.Other;
                        const isSelected = formData.category === catName;
                        return (
                          <button key={catName} type="button" onClick={() => handleChange('category', catName)}
                            style={{ padding: '5px 14px', borderRadius: '20px', border: `1.5px solid ${isSelected ? c.border : 'rgba(255,255,255,0.08)'}`, background: isSelected ? c.bg : 'rgba(255,255,255,0.03)', color: isSelected ? c.color : '#64748b', fontWeight: isSelected ? 700 : 500, fontSize: '0.82rem', cursor: 'pointer', fontFamily: 'Inter, sans-serif', transition: 'all 0.15s' }}>
                            {catName}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Priority & Status */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={labelStyle}>Priority</label>
                      <select style={{ ...inputStyle, cursor: 'pointer', appearance: 'none' }} value={formData.priority} onChange={e => handleChange('priority', e.target.value)}>
                        <option value="low">🟢 Low</option>
                        <option value="medium">🟡 Medium</option>
                        <option value="high">🔴 High</option>
                      </select>
                    </div>
                    <div>
                      <label style={labelStyle}>Status</label>
                      <select style={{ ...inputStyle, cursor: 'pointer', appearance: 'none' }} value={formData.status} onChange={e => handleChange('status', e.target.value)}>
                        <option value="todo">📋 To Do</option>
                        <option value="in-progress">⚡ In Progress</option>
                        <option value="done">✅ Done</option>
                      </select>
                    </div>
                  </div>

                  {/* Deadline */}
                  <div>
                    <label style={labelStyle}>Deadline <span style={{ color: '#ef4444' }}>*</span></label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '10px' }}>
                      <input
                        type="date"
                        style={{ ...inputStyle, cursor: 'pointer', colorScheme: 'dark', borderColor: errors.deadline ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.1)' }}
                        value={formData.deadline}
                        onChange={e => handleChange('deadline', e.target.value)}
                      />
                      <input
                        type="time"
                        style={{ ...inputStyle, cursor: 'pointer', colorScheme: 'dark', width: 'auto', minWidth: '110px' }}
                        value={formData.deadlineTime}
                        onChange={e => handleChange('deadlineTime', e.target.value)}
                      />
                    </div>
                    {errors.deadline && <p style={{ color: '#f87171', fontSize: '0.78rem', marginTop: '4px' }}>{errors.deadline}</p>}
                  </div>

                  {/* Notification Settings */}
                  <div style={{ background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.15)', borderRadius: '14px', padding: '14px 16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: formData.notifyEnabled ? '12px' : 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {formData.notifyEnabled ? <Bell size={16} color="#818cf8" /> : <BellOff size={16} color="#475569" />}
                        <span style={{ fontSize: '0.88rem', fontWeight: 600, color: formData.notifyEnabled ? '#c7d2fe' : '#475569' }}>
                          Deadline Reminder
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleChange('notifyEnabled', !formData.notifyEnabled)}
                        style={{
                          width: '42px', height: '22px', borderRadius: '11px',
                          background: formData.notifyEnabled ? '#6366f1' : 'rgba(255,255,255,0.1)',
                          border: 'none', cursor: 'pointer', position: 'relative', transition: 'background 0.2s',
                        }}
                      >
                        <div style={{
                          position: 'absolute', top: '3px',
                          left: formData.notifyEnabled ? '22px' : '3px',
                          width: '16px', height: '16px', borderRadius: '50%',
                          background: '#fff', transition: 'left 0.2s',
                        }} />
                      </button>
                    </div>
                    {formData.notifyEnabled && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '0.82rem', color: '#94a3b8' }}>Notify me</span>
                        <select
                          style={{ ...inputStyle, padding: '6px 10px', fontSize: '0.82rem', width: 'auto' }}
                          value={formData.notifyBefore}
                          onChange={e => handleChange('notifyBefore', e.target.value)}
                        >
                          <option value="0">on deadline day</option>
                          <option value="1">1 day before</option>
                          <option value="2">2 days before</option>
                          <option value="3">3 days before</option>
                          <option value="7">1 week before</option>
                        </select>
                      </div>
                    )}
                  </div>

                </form>
              </div>

              {/* Sticky Footer */}
              <div style={{ padding: '14px 26px 20px', borderTop: '1px solid rgba(255,255,255,0.07)', flexShrink: 0, display: 'flex', gap: '12px' }}>
                <button type="button" onClick={onClose}
                  style={{ flex: 1, padding: '11px', borderRadius: '12px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: '0.9rem' }}>
                  Cancel
                </button>
                <motion.button
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                  type="submit" form="add-task-form" disabled={isLoading}
                  style={{ flex: 2, padding: '11px', borderRadius: '12px', background: 'linear-gradient(135deg, #6366f1, #4f46e5)', border: 'none', color: '#fff', fontWeight: 700, cursor: isLoading ? 'not-allowed' : 'pointer', fontFamily: 'Inter, sans-serif', fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: '0 8px 24px rgba(99,102,241,0.3)', opacity: isLoading ? 0.7 : 1 }}>
                  {isLoading ? <Loader size={18} style={{ animation: 'spin 0.8s linear infinite' }} /> : <><Plus size={18} /> Create Task</>}
                </motion.button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default AddTaskModal;
