import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Calendar, MoreHorizontal, X, Trash2, Eye, Pencil, MessageSquare, Send, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTasks } from '../../context/TaskContext';
import EditTaskModal from '../modals/EditTaskModal';

const priorityColors = {
  high:   { bg: 'rgba(239,68,68,0.15)',  color: '#f87171', border: 'rgba(239,68,68,0.25)' },
  medium: { bg: 'rgba(234,179,8,0.15)',  color: '#fbbf24', border: 'rgba(234,179,8,0.25)' },
  low:    { bg: 'rgba(34,197,94,0.15)',  color: '#4ade80', border: 'rgba(34,197,94,0.25)' },
};

const statusColors = {
  todo:          { bg: 'rgba(148,163,184,0.12)', color: '#94a3b8' },
  'in-progress': { bg: 'rgba(99,102,241,0.15)',  color: '#818cf8' },
  done:          { bg: 'rgba(34,197,94,0.15)',   color: '#4ade80' },
};

const categoryColors = {
  Work:     { bg: 'rgba(34,197,94,0.15)',   color: '#4ade80',  border: 'rgba(34,197,94,0.3)' },
  Study:    { bg: 'rgba(59,130,246,0.15)',  color: '#60a5fa',  border: 'rgba(59,130,246,0.3)' },
  Personal: { bg: 'rgba(168,85,247,0.15)', color: '#c084fc',  border: 'rgba(168,85,247,0.3)' },
  Other:    { bg: 'rgba(148,163,184,0.15)',color: '#94a3b8',  border: 'rgba(148,163,184,0.3)' },
};

const getCategoryStyle = (cat) => categoryColors[cat] || categoryColors.Other;

// ── Format relative time ───────────────────────────────────────────────────
const formatRelative = (dateStr) => {
  const d = new Date(dateStr);
  const now = new Date();
  const diff = Math.floor((now - d) / 1000);
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
};

// ── Comments Section ───────────────────────────────────────────────────────
const CommentsSection = ({ taskId }) => {
  const [comments, setComments]   = useState([]);
  const [newText, setNewText]     = useState('');
  const [loading, setLoading]     = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]         = useState('');
  const bottomRef = useRef(null);

  const token = localStorage.getItem('access_token');
  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };

  const fetchComments = useCallback(async () => {
    try {
      const res = await fetch(`http://localhost:8000/api/tasks/${taskId}/comments`, { headers });
      if (!res.ok) throw new Error('Failed to load comments');
      setComments(await res.json());
    } catch {
      setError('Could not load comments.');
    } finally {
      setLoading(false);
    }
  }, [taskId]);

  useEffect(() => { fetchComments(); }, [fetchComments]);

  useEffect(() => {
    if (bottomRef.current) bottomRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [comments]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newText.trim()) return;
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch(`http://localhost:8000/api/tasks/${taskId}/comments`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ content: newText.trim() }),
      });
      if (!res.ok) throw new Error('Failed to post comment');
      const comment = await res.json();
      setComments(prev => [...prev, comment]);
      setNewText('');
    } catch {
      setError('Failed to post comment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ marginTop: '28px' }}>
      {/* Section Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
        <MessageSquare size={16} color="#6366f1" />
        <p style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>
          Comments {comments.length > 0 && `(${comments.length})`}
        </p>
      </div>

      {/* Comments List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '240px', overflowY: 'auto', paddingRight: '4px', marginBottom: '14px' }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
            <Loader2 size={20} color="#6366f1" style={{ animation: 'spin 1s linear infinite' }} />
          </div>
        ) : comments.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '20px 0', color: '#334155', fontSize: '0.85rem' }}>
            No comments yet. Be the first to comment!
          </div>
        ) : (
          comments.map(c => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: '12px',
                padding: '12px 14px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                  {/* Avatar initials */}
                  <div style={{
                    width: '26px', height: '26px', borderRadius: '50%',
                    background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.65rem', fontWeight: 700, color: '#fff', flexShrink: 0,
                  }}>
                    {(c.author_username || 'U').charAt(0).toUpperCase()}
                  </div>
                  <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#c7d2fe' }}>
                    {c.author_username || 'User'}
                  </span>
                </div>
                <span style={{ fontSize: '0.72rem', color: '#475569' }}>
                  {formatRelative(c.created_at)}
                </span>
              </div>
              <p style={{ fontSize: '0.88rem', color: '#94a3b8', margin: 0, lineHeight: 1.6, paddingLeft: '33px' }}>
                {c.content}
              </p>
            </motion.div>
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {/* Error */}
      {error && (
        <p style={{ color: '#f87171', fontSize: '0.82rem', margin: '0 0 10px' }}>{error}</p>
      )}

      {/* Input */}
      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
        <textarea
          value={newText}
          onChange={e => setNewText(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(e); } }}
          placeholder="Write a comment… (Enter to send)"
          rows={2}
          style={{
            flex: 1,
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '12px',
            padding: '10px 14px',
            color: '#e2e8f0',
            fontSize: '0.88rem',
            fontFamily: 'Inter, sans-serif',
            resize: 'none',
            outline: 'none',
            lineHeight: 1.5,
            transition: 'border-color 0.2s',
          }}
          onFocus={e => e.target.style.borderColor = 'rgba(99,102,241,0.5)'}
          onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
          disabled={submitting}
        />
        <button
          type="submit"
          disabled={submitting || !newText.trim()}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: '42px', height: '42px', borderRadius: '12px',
            background: newText.trim() ? 'linear-gradient(135deg, #6366f1, #4f46e5)' : 'rgba(99,102,241,0.15)',
            border: 'none', cursor: newText.trim() ? 'pointer' : 'not-allowed',
            transition: 'all 0.2s', flexShrink: 0,
            boxShadow: newText.trim() ? '0 4px 14px rgba(99,102,241,0.35)' : 'none',
          }}
        >
          {submitting
            ? <Loader2 size={17} color="#fff" style={{ animation: 'spin 1s linear infinite' }} />
            : <Send size={17} color={newText.trim() ? '#fff' : '#475569'} />
          }
        </button>
      </form>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

// ── Task Detail Modal ──────────────────────────────────────────────────────
const TaskDetailModal = ({ task, onClose }) => {
  const p = priorityColors[task.priority] || priorityColors.low;
  const s = statusColors[task.status] || statusColors.todo;
  const c = getCategoryStyle(task.category);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)', zIndex: 200 }}
      />
      <div style={{ position: 'fixed', inset: 0, zIndex: 201, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 20 }}
          transition={{ type: 'spring', stiffness: 300, damping: 28 }}
          onClick={e => e.stopPropagation()}
          style={{
            pointerEvents: 'auto',
            width: '90%', maxWidth: '640px',
            background: '#13131c', border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: '28px', padding: '36px',
            fontFamily: 'Inter, sans-serif', boxShadow: '0 40px 100px rgba(0,0,0,0.7)',
            maxHeight: '90vh', overflowY: 'auto',
          }}
        >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
          <div style={{ flex: 1, paddingRight: '12px' }}>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#f8fafc', margin: '0 0 10px' }}>{task.title}</h2>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', padding: '3px 10px', borderRadius: '6px', background: p.bg, color: p.color, border: `1px solid ${p.border}` }}>{task.priority}</span>
              <span style={{ fontSize: '0.7rem', fontWeight: 600, padding: '3px 10px', borderRadius: '6px', background: s.bg, color: s.color }}>{task.status.replace('-', ' ')}</span>
              {task.category && (
                <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '3px 10px', borderRadius: '6px', background: c.bg, color: c.color, border: `1px solid ${c.border}` }}>{task.category}</span>
              )}
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#64748b', borderRadius: '10px', padding: '8px', cursor: 'pointer', display: 'flex', flexShrink: 0 }}>
            <X size={18} />
          </button>
        </div>

        <div style={{ height: '1px', background: 'rgba(255,255,255,0.07)', marginBottom: '20px' }} />

        {/* Description */}
        <div style={{ marginBottom: '20px' }}>
          <p style={{ fontSize: '0.78rem', fontWeight: 600, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Description</p>
          <p style={{ fontSize: '0.95rem', color: '#94a3b8', lineHeight: 1.7, margin: 0 }}>{task.description || 'No description provided.'}</p>
        </div>

        {/* Deadline */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', padding: '12px 16px' }}>
          <Calendar size={18} color="#6366f1" />
          <div>
            <p style={{ fontSize: '0.72rem', color: '#475569', margin: 0, fontWeight: 500 }}>Deadline</p>
            <p style={{ fontSize: '0.95rem', color: '#e2e8f0', margin: 0, fontWeight: 600 }}>{task.dueDate || 'Not set'}</p>
          </div>
        </div>

        {/* Divider */}
        <div style={{ height: '1px', background: 'rgba(255,255,255,0.07)', marginTop: '28px' }} />

        {/* Comments */}
        <CommentsSection taskId={task.id} />
      </motion.div>
      </div>
    </AnimatePresence>
  );
};

// ── Delete Confirm Dialog ──────────────────────────────────────────────────
const DeleteConfirmDialog = ({ task, onConfirm, onCancel }) => (
  <AnimatePresence>
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onCancel}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)', zIndex: 300 }}
    />
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 301, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 16 }}
        onClick={e => e.stopPropagation()}
        style={{ background: '#13131c', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '20px', padding: '28px', maxWidth: '380px', width: '90%', fontFamily: 'Inter, sans-serif', boxShadow: '0 24px 60px rgba(0,0,0,0.7)' }}
      >
        <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(239,68,68,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
          <Trash2 size={22} color="#f87171" />
        </div>
        <h3 style={{ color: '#f8fafc', fontWeight: 700, margin: '0 0 8px', fontSize: '1.1rem' }}>Delete Task?</h3>
        <p style={{ color: '#94a3b8', fontSize: '0.88rem', margin: '0 0 20px', lineHeight: 1.6 }}>
          Are you sure you want to delete <strong style={{ color: '#e2e8f0' }}>"{task.title}"</strong>? This cannot be undone.
        </p>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={onCancel}
            style={{ flex: 1, padding: '10px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: '0.88rem' }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            style={{ flex: 1, padding: '10px', borderRadius: '10px', background: 'linear-gradient(135deg, #ef4444, #dc2626)', border: 'none', color: '#fff', fontWeight: 700, cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: '0.88rem', boxShadow: '0 4px 16px rgba(239,68,68,0.3)' }}
          >
            Delete
          </button>
        </div>
      </motion.div>
    </div>
  </AnimatePresence>
);

// ── TaskCard ───────────────────────────────────────────────────────────────
const TaskCard = ({ task }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id });
  const { deleteTask } = useTasks();
  const [showDetail, setShowDetail] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const menuRef = useRef(null);

  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.3 : 1 };
  const p = priorityColors[task.priority] || priorityColors.low;
  const c = getCategoryStyle(task.category);

  useEffect(() => {
    const handler = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleDelete = async () => {
    setIsDeleting(true);
    await deleteTask(task.id);
    setIsDeleting(false);
    setShowDeleteConfirm(false);
  };

  return (
    <>
      <div
        ref={setNodeRef}
        style={{
          ...style,
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: '16px', padding: '16px', cursor: 'grab',
          transition: 'border-color 0.2s, background 0.2s', userSelect: 'none',
          position: 'relative', opacity: isDeleting ? 0.5 : (isDragging ? 0.3 : 1),
        }}
        {...attributes}
        {...listeners}
        onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(99,102,241,0.35)'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'; e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
      >
        {/* Badges Row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
          <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', flex: 1, marginRight: '6px' }}>
            <span style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', padding: '2px 8px', borderRadius: '5px', background: p.bg, color: p.color, border: `1px solid ${p.border}` }}>
              {task.priority}
            </span>
            {task.category && (
              <span style={{ fontSize: '0.68rem', fontWeight: 700, padding: '2px 8px', borderRadius: '5px', background: c.bg, color: c.color, border: `1px solid ${c.border}` }}>
                {task.category}
              </span>
            )}
          </div>

          {/* 3-dot menu */}
          <div ref={menuRef} style={{ position: 'relative', flexShrink: 0 }}>
            <button
              onPointerDown={e => e.stopPropagation()}
              onClick={e => { e.stopPropagation(); setMenuOpen(v => !v); }}
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', color: '#64748b', borderRadius: '7px', padding: '4px 6px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
            >
              <MoreHorizontal size={15} />
            </button>

            <AnimatePresence>
              {menuOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: -4 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: -4 }}
                  transition={{ duration: 0.15 }}
                  style={{ position: 'absolute', top: 'calc(100% + 6px)', right: 0, background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '6px', minWidth: '160px', zIndex: 50, boxShadow: '0 12px 40px rgba(0,0,0,0.5)' }}
                >
                  <button
                    onPointerDown={e => e.stopPropagation()}
                    onClick={e => { e.stopPropagation(); setMenuOpen(false); setShowEdit(true); }}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', background: 'transparent', border: 'none', color: '#fbbf24', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: '0.85rem', textAlign: 'left', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '8px' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(251,191,36,0.1)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <Pencil size={15} /> Edit Task
                  </button>

                  <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)', margin: '4px 0' }} />

                  <button
                    onPointerDown={e => e.stopPropagation()}
                    onClick={e => { e.stopPropagation(); setMenuOpen(false); setShowDetail(true); }}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', background: 'transparent', border: 'none', color: '#e2e8f0', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: '0.85rem', textAlign: 'left', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '8px' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(99,102,241,0.12)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <Eye size={15} color="#818cf8" /> View Details
                  </button>

                  <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)', margin: '4px 0' }} />

                  <button
                    onPointerDown={e => e.stopPropagation()}
                    onClick={e => { e.stopPropagation(); setMenuOpen(false); setShowDeleteConfirm(true); }}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', background: 'transparent', border: 'none', color: '#f87171', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: '0.85rem', textAlign: 'left', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '8px' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.1)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <Trash2 size={15} /> Delete Task
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Title & Description */}
        <h4 style={{ fontSize: '0.92rem', fontWeight: 600, color: '#e2e8f0', margin: '0 0 5px', lineHeight: 1.4 }}>{task.title}</h4>
        <p style={{ fontSize: '0.8rem', color: '#475569', margin: '0 0 14px', lineHeight: 1.5, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
          {task.description || 'No description.'}
        </p>

        {/* Footer */}
        <div style={{ display: 'flex', alignItems: 'center', paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.06)', gap: '6px', color: '#475569', fontSize: '0.76rem' }}>
          <Calendar size={12} />
          <span>{task.dueDate || 'No date'}</span>
          {task.comments_count > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginLeft: 'auto', color: '#6366f1' }}>
              <MessageSquare size={12} />
              <span>{task.comments_count}</span>
            </div>
          )}
        </div>
      </div>

      {showDetail && <TaskDetailModal task={task} onClose={() => setShowDetail(false)} />}
      {showEdit && <EditTaskModal task={task} onClose={() => setShowEdit(false)} />}
      {showDeleteConfirm && (
        <DeleteConfirmDialog
          task={task}
          onConfirm={handleDelete}
          onCancel={() => setShowDeleteConfirm(false)}
        />
      )}
    </>
  );
};

export default TaskCard;
