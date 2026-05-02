import React, { useState, useRef, useEffect } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Calendar, Flag, MoreHorizontal, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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

const TaskDetailModal = ({ task, onClose }) => {
  const p = priorityColors[task.priority] || priorityColors.low;
  const s = statusColors[task.status]    || statusColors.todo;

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
          width: '90%', maxWidth: '680px',
          background: '#13131c',
          border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: '28px', padding: '40px', zIndex: 201,
          fontFamily: 'Inter, sans-serif', boxShadow: '0 40px 100px rgba(0,0,0,0.7)',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '22px' }}>
          <div style={{ flex: 1, paddingRight: '12px' }}>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#f8fafc', margin: '0 0 8px' }}>{task.title}</h2>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', padding: '3px 10px', borderRadius: '6px', background: p.bg, color: p.color, border: `1px solid ${p.border}` }}>
                {task.priority}
              </span>
              <span style={{ fontSize: '0.72rem', fontWeight: 600, padding: '3px 10px', borderRadius: '6px', background: s.bg, color: s.color }}>
                {task.status.replace('-', ' ')}
              </span>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#64748b', borderRadius: '10px', padding: '8px', cursor: 'pointer', display: 'flex', flexShrink: 0 }}>
            <X size={18} />
          </button>
        </div>

        {/* Divider */}
        <div style={{ height: '1px', background: 'rgba(255,255,255,0.07)', marginBottom: '20px' }} />

        {/* Description */}
        <div style={{ marginBottom: '20px' }}>
          <p style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Description</p>
          <p style={{ fontSize: '0.95rem', color: '#94a3b8', lineHeight: 1.7, margin: 0 }}>
            {task.description || 'No description provided for this task.'}
          </p>
        </div>

        {/* Due Date */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', padding: '12px 16px' }}>
          <Calendar size={18} color="#6366f1" />
          <div>
            <p style={{ fontSize: '0.75rem', color: '#475569', margin: 0, fontWeight: 500 }}>Due Date</p>
            <p style={{ fontSize: '0.95rem', color: '#e2e8f0', margin: 0, fontWeight: 600 }}>{task.dueDate || 'Not set'}</p>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

const TaskCard = ({ task }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id });
  const [showDetail, setShowDetail] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.3 : 1 };
  const p = priorityColors[task.priority] || priorityColors.low;

  useEffect(() => {
    const handler = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <>
      <div
        ref={setNodeRef}
        style={{
          ...style,
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: '16px', padding: '18px', cursor: 'grab',
          transition: 'border-color 0.2s, background 0.2s', userSelect: 'none',
          position: 'relative',
        }}
        {...attributes}
        {...listeners}
        onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(99,102,241,0.35)'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'; e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
      >
        {/* Top Row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
          <span style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', padding: '3px 10px', borderRadius: '6px', background: p.bg, color: p.color, border: `1px solid ${p.border}` }}>
            {task.priority}
          </span>
          {/* 3-dot menu */}
          <div ref={menuRef} style={{ position: 'relative' }}>
            <button
              onPointerDown={e => e.stopPropagation()}
              onClick={e => { e.stopPropagation(); setMenuOpen(v => !v); }}
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', color: '#64748b', borderRadius: '8px', padding: '4px 6px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
            >
              <MoreHorizontal size={16} />
            </button>
            <AnimatePresence>
              {menuOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: -4 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: -4 }}
                  transition={{ duration: 0.15 }}
                  style={{ position: 'absolute', top: 'calc(100% + 6px)', right: 0, background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '6px', minWidth: '150px', zIndex: 50, boxShadow: '0 12px 40px rgba(0,0,0,0.5)' }}
                >
                  <button
                    onPointerDown={e => e.stopPropagation()}
                    onClick={e => { e.stopPropagation(); setMenuOpen(false); setShowDetail(true); }}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', background: 'transparent', border: 'none', color: '#e2e8f0', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: '0.88rem', textAlign: 'left', fontWeight: 500 }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(99,102,241,0.12)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    📋 View Details
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#e2e8f0', margin: '0 0 6px', lineHeight: 1.4 }}>
          {task.title}
        </h4>
        <p style={{ fontSize: '0.82rem', color: '#475569', margin: '0 0 16px', lineHeight: 1.5, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
          {task.description || 'No description.'}
        </p>

        <div style={{ display: 'flex', alignItems: 'center', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.06)', gap: '6px', color: '#475569', fontSize: '0.78rem' }}>
          <Calendar size={13} />
          <span>{task.dueDate || 'No date'}</span>
        </div>
      </div>

      {showDetail && <TaskDetailModal task={task} onClose={() => setShowDetail(false)} />}
    </>
  );
};

export default TaskCard;
