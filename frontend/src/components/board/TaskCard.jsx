import React, { useState, useRef, useEffect } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Calendar, MoreHorizontal, X, Trash2, Eye, Pencil } from 'lucide-react';
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

// ── Task Detail Modal ─────────────────────────────────────────
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
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 20 }}
        transition={{ type: 'spring', stiffness: 300, damping: 28 }}
        onClick={e => e.stopPropagation()}
        style={{
          position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
          width: '90%', maxWidth: '640px',
          background: '#13131c', border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: '28px', padding: '36px', zIndex: 201,
          fontFamily: 'Inter, sans-serif', boxShadow: '0 40px 100px rgba(0,0,0,0.7)',
          maxHeight: '85vh', overflowY: 'auto',
        }}
      >
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

        <div style={{ marginBottom: '20px' }}>
          <p style={{ fontSize: '0.78rem', fontWeight: 600, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Description</p>
          <p style={{ fontSize: '0.95rem', color: '#94a3b8', lineHeight: 1.7, margin: 0 }}>{task.description || 'No description provided.'}</p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', padding: '12px 16px' }}>
          <Calendar size={18} color="#6366f1" />
          <div>
            <p style={{ fontSize: '0.72rem', color: '#475569', margin: 0, fontWeight: 500 }}>Deadline</p>
            <p style={{ fontSize: '0.95rem', color: '#e2e8f0', margin: 0, fontWeight: 600 }}>{task.dueDate || 'Not set'}</p>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

// ── Delete Confirm Dialog ─────────────────────────────────────
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

// ── TaskCard ──────────────────────────────────────────────────
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
