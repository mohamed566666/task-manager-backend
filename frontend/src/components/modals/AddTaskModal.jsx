import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Loader } from 'lucide-react';
import { useTasks } from '../../context/TaskContext';

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

const AddTaskModal = ({ isOpen, onClose }) => {
  const { addTask } = useTasks();
  const today = new Date().toISOString().split('T')[0];

  const [formData, setFormData] = useState({
    title: '', description: '', priority: 'medium', status: 'todo', dueDate: today
  });
  const [titleError, setTitleError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (field, value) => {
    setFormData(p => ({ ...p, [field]: value }));
    if (field === 'title') setTitleError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) { setTitleError('Title is required'); return; }
    setIsLoading(true);
    setTimeout(() => {
      addTask({ ...formData, title: formData.title.trim() });
      setFormData({ title: '', description: '', priority: 'medium', status: 'todo', dueDate: today });
      setIsLoading(false);
      onClose();
    }, 400);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)', zIndex: 100 }}
          />
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.93, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.93, y: 24 }}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            style={{
              position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
              width: '100%', maxWidth: '520px',
              background: '#13131c',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '24px',
              padding: '32px',
              zIndex: 101,
              fontFamily: 'Inter, sans-serif',
              boxShadow: '0 24px 80px rgba(0,0,0,0.6)',
            }}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(99,102,241,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Plus size={20} color="#6366f1" />
                </div>
                <h2 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 700, color: '#f8fafc' }}>Add New Task</h2>
              </div>
              <button
                onClick={onClose}
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: '#64748b', borderRadius: '10px', padding: '7px', cursor: 'pointer', display: 'flex' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {/* Title */}
              <div>
                <label style={labelStyle}>Task Title <span style={{ color: '#ef4444' }}>*</span></label>
                <input
                  autoFocus
                  style={{ ...inputStyle, borderColor: titleError ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.1)' }}
                  placeholder="What needs to be done?"
                  value={formData.title}
                  onChange={e => handleChange('title', e.target.value)}
                  onFocus={e => e.target.style.borderColor = 'rgba(99,102,241,0.5)'}
                  onBlur={e => e.target.style.borderColor = titleError ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.1)'}
                />
                {titleError && <p style={{ color: '#f87171', fontSize: '0.8rem', marginTop: '4px' }}>{titleError}</p>}
              </div>

              {/* Description */}
              <div>
                <label style={labelStyle}>Description</label>
                <textarea
                  style={{ ...inputStyle, resize: 'none', height: '90px' }}
                  placeholder="Add some details..."
                  value={formData.description}
                  onChange={e => handleChange('description', e.target.value)}
                  onFocus={e => e.target.style.borderColor = 'rgba(99,102,241,0.5)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                />
              </div>

              {/* Priority & Status */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={labelStyle}>Priority</label>
                  <select
                    style={{ ...inputStyle, cursor: 'pointer', appearance: 'none' }}
                    value={formData.priority}
                    onChange={e => handleChange('priority', e.target.value)}
                  >
                    <option value="low">🟢 Low</option>
                    <option value="medium">🟡 Medium</option>
                    <option value="high">🔴 High</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Status</label>
                  <select
                    style={{ ...inputStyle, cursor: 'pointer', appearance: 'none' }}
                    value={formData.status}
                    onChange={e => handleChange('status', e.target.value)}
                  >
                    <option value="todo">📋 To Do</option>
                    <option value="in-progress">⚡ In Progress</option>
                    <option value="done">✅ Done</option>
                  </select>
                </div>
              </div>

              {/* Due Date */}
              <div>
                <label style={labelStyle}>Due Date</label>
                <input
                  type="date"
                  style={{ ...inputStyle, cursor: 'pointer', colorScheme: 'dark' }}
                  value={formData.dueDate}
                  onChange={e => handleChange('dueDate', e.target.value)}
                />
              </div>

              {/* Buttons */}
              <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                <button
                  type="button"
                  onClick={onClose}
                  style={{ flex: 1, padding: '13px', borderRadius: '12px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: '0.95rem' }}
                >
                  Cancel
                </button>
                <motion.button
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                  type="submit"
                  style={{ flex: 2, padding: '13px', borderRadius: '12px', background: 'linear-gradient(135deg, #6366f1, #4f46e5)', border: 'none', color: '#fff', fontWeight: 700, cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: '0.95rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: '0 8px 24px rgba(99,102,241,0.3)' }}
                >
                  {isLoading ? <Loader size={18} style={{ animation: 'spin 0.8s linear infinite' }} /> : <><Plus size={18} /> Create Task</>}
                </motion.button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default AddTaskModal;
