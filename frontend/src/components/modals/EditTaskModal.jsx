import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Pencil, Loader } from 'lucide-react';
import { useTasks } from '../../context/TaskContext';

const CATEGORIES = ['Work', 'Study', 'Personal', 'Other'];

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

const EditTaskModal = ({ task, onClose }) => {
  const { editTask } = useTasks();

  const [formData, setFormData] = useState({
    title:       task.title || '',
    description: task.description || '',
    priority:    task.priority || 'medium',
    status:      task.status || 'todo',
    dueDate:     task.dueDate || '',
    category:    task.category || 'Work',
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [saveError, setSaveError] = useState('');

  const handleChange = (field, value) => {
    setFormData(p => ({ ...p, [field]: value }));
    if (errors[field]) setErrors(p => ({ ...p, [field]: '' }));
  };

  const validate = () => {
    const errs = {};
    if (!formData.title.trim()) errs.title = 'Task title is required';
    if (!formData.description.trim()) errs.description = 'Description is required';
    if (!formData.dueDate) errs.dueDate = 'Deadline is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setIsLoading(true);
    setSaveError('');
    try {
      await editTask(task.id, {
        title: formData.title.trim(),
        description: formData.description.trim(),
        priority: formData.priority,
        status: formData.status,
        dueDate: formData.dueDate,
        category: formData.category,
      });
      onClose();
    } catch (err) {
      setSaveError(err.message || 'Failed to save. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <>
        {/* Backdrop */}
        <motion.div
          key="edit-backdrop"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={onClose}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)', zIndex: 200 }}
        />

        {/* Centering container */}
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 201, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
          <motion.div
            key="edit-modal"
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
                  <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: 'rgba(251,191,36,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Pencil size={17} color="#fbbf24" />
                  </div>
                  <div>
                    <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc' }}>Edit Task</h2>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: '#475569' }}>Make changes to your task</p>
                  </div>
                </div>
                <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: '#64748b', borderRadius: '10px', padding: '6px', cursor: 'pointer', display: 'flex' }}>
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Scrollable Body */}
            <div style={{ overflowY: 'auto', padding: '18px 26px', flex: 1 }}>
              <form id="edit-task-form" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

                {/* Title */}
                <div>
                  <label style={labelStyle}>Task Title <span style={{ color: '#ef4444' }}>*</span></label>
                  <input
                    autoFocus
                    style={{ ...inputStyle, borderColor: errors.title ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.1)' }}
                    placeholder="Task title..."
                    value={formData.title}
                    onChange={e => handleChange('title', e.target.value)}
                    onFocus={e => e.target.style.borderColor = 'rgba(251,191,36,0.5)'}
                    onBlur={e => e.target.style.borderColor = errors.title ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.1)'}
                  />
                  {errors.title && <p style={{ color: '#f87171', fontSize: '0.78rem', marginTop: '4px' }}>{errors.title}</p>}
                </div>

                {/* Description */}
                <div>
                  <label style={labelStyle}>Description <span style={{ color: '#ef4444' }}>*</span></label>
                  <textarea
                    style={{ ...inputStyle, resize: 'none', height: '90px', borderColor: errors.description ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.1)' }}
                    placeholder="Describe the task..."
                    value={formData.description}
                    onChange={e => handleChange('description', e.target.value)}
                    onFocus={e => e.target.style.borderColor = 'rgba(251,191,36,0.5)'}
                    onBlur={e => e.target.style.borderColor = errors.description ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.1)'}
                  />
                  {errors.description && <p style={{ color: '#f87171', fontSize: '0.78rem', marginTop: '4px' }}>{errors.description}</p>}
                </div>

                {/* Category */}
                <div>
                  <label style={labelStyle}>Category</label>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {CATEGORIES.map(cat => {
                      const c = categoryColors[cat];
                      const isSelected = formData.category === cat;
                      return (
                        <button key={cat} type="button" onClick={() => handleChange('category', cat)}
                          style={{ padding: '5px 14px', borderRadius: '20px', border: `1.5px solid ${isSelected ? c.border : 'rgba(255,255,255,0.08)'}`, background: isSelected ? c.bg : 'rgba(255,255,255,0.03)', color: isSelected ? c.color : '#64748b', fontWeight: isSelected ? 700 : 500, fontSize: '0.82rem', cursor: 'pointer', fontFamily: 'Inter, sans-serif', transition: 'all 0.15s' }}>
                          {cat}
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
                  <input
                    type="date"
                    style={{ ...inputStyle, cursor: 'pointer', colorScheme: 'dark', borderColor: errors.dueDate ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.1)' }}
                    value={formData.dueDate}
                    onChange={e => handleChange('dueDate', e.target.value)}
                  />
                  {errors.dueDate && <p style={{ color: '#f87171', fontSize: '0.78rem', marginTop: '4px' }}>{errors.dueDate}</p>}
                </div>

              </form>
            </div>

            {/* Sticky Footer */}
            <div style={{ padding: '14px 26px 20px', borderTop: '1px solid rgba(255,255,255,0.07)', flexShrink: 0 }}>
              {saveError && (
                <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '10px', padding: '10px 14px', marginBottom: '12px', color: '#f87171', fontSize: '0.85rem' }}>
                  {saveError}
                </div>
              )}
              <div style={{ display: 'flex', gap: '12px' }}>
                <button type="button" onClick={onClose}
                  style={{ flex: 1, padding: '11px', borderRadius: '12px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: '0.9rem' }}>
                  Cancel
                </button>
                <motion.button
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                  type="submit" form="edit-task-form" disabled={isLoading}
                  style={{ flex: 2, padding: '11px', borderRadius: '12px', background: 'linear-gradient(135deg, #f59e0b, #d97706)', border: 'none', color: '#fff', fontWeight: 700, cursor: isLoading ? 'not-allowed' : 'pointer', fontFamily: 'Inter, sans-serif', fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: '0 8px 24px rgba(245,158,11,0.25)', opacity: isLoading ? 0.7 : 1 }}>
                  {isLoading
                    ? <Loader size={18} style={{ animation: 'spin 0.8s linear infinite' }} />
                    : <><Pencil size={16} /> Save Changes</>
                  }
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      </>
    </AnimatePresence>
  );
};

export default EditTaskModal;
