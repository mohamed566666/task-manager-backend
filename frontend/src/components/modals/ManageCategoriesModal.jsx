import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Trash2, Edit2, Check, Folder } from 'lucide-react';
import { useTasks } from '../../context/TaskContext';

const ManageCategoriesModal = ({ isOpen, onClose }) => {
  const { categories, addCategory, updateCategory, deleteCategory } = useTasks();
  const [newCatName, setNewCatName] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [error, setError] = useState('');

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    try {
      await addCategory(newCatName.trim());
      setNewCatName('');
      setError('');
    } catch (err) {
      setError(err.message);
    }
  };

  const startEdit = (cat) => {
    setEditingId(cat.id);
    setEditName(cat.name);
  };

  const handleSaveEdit = async (id) => {
    if (!editName.trim()) return;
    try {
      await updateCategory(id, editName.trim());
      setEditingId(null);
      setError('');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this category? Tasks using it will fall back to "Work".')) {
      try {
        await deleteCategory(id);
        setError('');
      } catch (err) {
        setError(err.message);
      }
    }
  };

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop - blocks all interaction with background */}
          <motion.div
            key="cat-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.75)',
              backdropFilter: 'blur(6px)',
              zIndex: 300,
            }}
          />

          {/* Centering wrapper - same pattern as AddTaskModal */}
          <div
            style={{
              position: 'fixed',
              top: 0, left: 0, right: 0, bottom: 0,
              zIndex: 301,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              pointerEvents: 'none',
            }}
          >
            <motion.div
              key="cat-modal"
              initial={{ opacity: 0, scale: 0.93, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.93, y: 20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 28 }}
              onClick={e => e.stopPropagation()}
              style={{
                pointerEvents: 'auto',
                width: '90%',
                maxWidth: '520px',
                background: '#13131c',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '24px',
                fontFamily: 'Inter, sans-serif',
                boxShadow: '0 24px 80px rgba(0,0,0,0.8)',
                display: 'flex',
                flexDirection: 'column',
                maxHeight: '90vh',
              }}
            >
              {/* Header */}
              <div style={{ padding: '22px 26px 16px', borderBottom: '1px solid rgba(255,255,255,0.07)', flexShrink: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: 'rgba(168,85,247,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Folder size={18} color="#c084fc" />
                    </div>
                    <h2 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: '#f8fafc' }}>Manage Categories</h2>
                  </div>
                  <button
                    onClick={onClose}
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: '#64748b', borderRadius: '10px', padding: '6px', cursor: 'pointer', display: 'flex' }}
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              {/* Scrollable Body */}
              <div style={{ overflowY: 'auto', padding: '18px 26px', flex: 1 }}>

                {error && (
                  <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '10px', padding: '10px 14px', marginBottom: '14px', color: '#f87171', fontSize: '0.85rem' }}>
                    {error}
                  </div>
                )}

                {/* Add new category form */}
                <form onSubmit={handleAdd} style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                  <input
                    type="text"
                    placeholder="New category name..."
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    style={{
                      flex: 1, padding: '12px 16px', borderRadius: '12px',
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      color: '#f8fafc', outline: 'none', fontSize: '0.95rem',
                      fontFamily: 'Inter, sans-serif',
                    }}
                    onFocus={e => e.target.style.borderColor = 'rgba(168,85,247,0.5)'}
                    onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                  />
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    type="submit"
                    disabled={!newCatName.trim()}
                    style={{
                      background: 'linear-gradient(135deg, #c084fc, #a855f7)',
                      color: '#fff', border: 'none', padding: '0 20px',
                      borderRadius: '12px',
                      cursor: newCatName.trim() ? 'pointer' : 'not-allowed',
                      fontWeight: 700, fontSize: '0.9rem',
                      display: 'flex', alignItems: 'center', gap: '7px',
                      boxShadow: '0 8px 24px rgba(168,85,247,0.3)',
                      opacity: newCatName.trim() ? 1 : 0.5,
                      fontFamily: 'Inter, sans-serif',
                      flexShrink: 0,
                    }}
                  >
                    <Plus size={17} /> Add
                  </motion.button>
                </form>

                {/* Category list */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {categories.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '30px 0', color: '#64748b' }}>
                      <Folder size={32} style={{ marginBottom: '10px', opacity: 0.4 }} />
                      <p style={{ margin: 0, fontSize: '0.9rem' }}>No categories yet. Create your first one!</p>
                    </div>
                  ) : (
                    categories.map(cat => (
                      <div
                        key={cat.id}
                        style={{
                          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                          background: 'rgba(255,255,255,0.04)',
                          padding: '13px 16px',
                          borderRadius: '12px',
                          border: '1px solid rgba(255,255,255,0.07)',
                        }}
                      >
                        {editingId === cat.id ? (
                          <input
                            autoFocus
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleSaveEdit(cat.id);
                              if (e.key === 'Escape') setEditingId(null);
                            }}
                            style={{
                              flex: 1, padding: '7px 12px', borderRadius: '8px',
                              background: 'rgba(255,255,255,0.08)',
                              border: '1px solid rgba(168,85,247,0.5)',
                              color: '#f8fafc', outline: 'none', marginRight: '12px',
                              fontSize: '0.95rem', fontFamily: 'Inter, sans-serif',
                            }}
                          />
                        ) : (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#c084fc', flexShrink: 0 }} />
                            <span style={{ color: '#f8fafc', fontWeight: 600, fontSize: '1rem' }}>{cat.name}</span>
                          </div>
                        )}

                        <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                          {editingId === cat.id ? (
                            <>
                              <button
                                onClick={() => handleSaveEdit(cat.id)}
                                style={{ background: 'rgba(34,197,94,0.15)', border: 'none', color: '#4ade80', padding: '7px', borderRadius: '8px', cursor: 'pointer', display: 'flex' }}
                              >
                                <Check size={15} />
                              </button>
                              <button
                                onClick={() => setEditingId(null)}
                                style={{ background: 'rgba(255,255,255,0.08)', border: 'none', color: '#94a3b8', padding: '7px', borderRadius: '8px', cursor: 'pointer', display: 'flex' }}
                              >
                                <X size={15} />
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => startEdit(cat)}
                                style={{ background: 'rgba(99,102,241,0.12)', border: 'none', color: '#818cf8', padding: '7px', borderRadius: '8px', cursor: 'pointer', display: 'flex' }}
                              >
                                <Edit2 size={15} />
                              </button>
                              <button
                                onClick={() => handleDelete(cat.id)}
                                style={{ background: 'rgba(239,68,68,0.12)', border: 'none', color: '#f87171', padding: '7px', borderRadius: '8px', cursor: 'pointer', display: 'flex' }}
                              >
                                <Trash2 size={15} />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Footer */}
              <div style={{ padding: '14px 26px 20px', borderTop: '1px solid rgba(255,255,255,0.07)', flexShrink: 0 }}>
                <button
                  onClick={onClose}
                  style={{
                    width: '100%', padding: '11px', borderRadius: '12px',
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: '#94a3b8', fontWeight: 600, cursor: 'pointer',
                    fontFamily: 'Inter, sans-serif', fontSize: '0.9rem',
                  }}
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default ManageCategoriesModal;
