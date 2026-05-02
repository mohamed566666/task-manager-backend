import React from 'react';
import { useTasks } from '../context/TaskContext';
import { CheckCircle2, Clock, ListTodo, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

const card = {
  background: 'rgba(255,255,255,0.03)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: '20px',
  padding: '28px',
  transition: 'all 0.3s',
};

const priorityColors = {
  high: { bg: 'rgba(239,68,68,0.12)', color: '#f87171' },
  medium: { bg: 'rgba(234,179,8,0.12)', color: '#fbbf24' },
  low: { bg: 'rgba(34,197,94,0.12)', color: '#4ade80' },
};

const statusColors = {
  todo: { bg: 'rgba(148,163,184,0.12)', color: '#94a3b8' },
  'in-progress': { bg: 'rgba(99,102,241,0.12)', color: '#818cf8' },
  done: { bg: 'rgba(34,197,94,0.12)', color: '#4ade80' },
};

const statIcons = [
  { title: 'Total Tasks', icon: ListTodo, color: '#6366f1', bgColor: 'rgba(99,102,241,0.15)' },
  { title: 'Completed', icon: CheckCircle2, color: '#4ade80', bgColor: 'rgba(34,197,94,0.15)' },
  { title: 'Pending', icon: Clock, color: '#fbbf24', bgColor: 'rgba(234,179,8,0.15)' },
  { title: 'Progress', icon: TrendingUp, color: '#a78bfa', bgColor: 'rgba(167,139,250,0.15)' },
];

const Dashboard = () => {
  const { stats, tasks } = useTasks();
  const statValues = [stats.total, stats.completed, stats.pending, `${stats.progress}%`];
  const recentTasks = [...tasks].slice(0, 6);
  const circumference = 2 * Math.PI * 54;

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '40px' }}>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#f8fafc', margin: 0 }}>Dashboard</h1>
        <p style={{ color: '#64748b', marginTop: '6px', fontSize: '1rem' }}>Welcome back! Here's what's happening.</p>
      </div>

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '40px' }}>
        {statIcons.map((s, i) => (
          <motion.div
            key={s.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            style={{ ...card, cursor: 'default' }}
            whileHover={{ borderColor: 'rgba(99,102,241,0.3)', transform: 'translateY(-2px)' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <p style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 500, marginBottom: '10px' }}>{s.title}</p>
                <p style={{ fontSize: '2.5rem', fontWeight: 800, color: '#f8fafc', lineHeight: 1 }}>{statValues[i]}</p>
              </div>
              <div style={{ background: s.bgColor, borderRadius: '14px', padding: '12px', display: 'flex' }}>
                <s.icon size={24} color={s.color} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Bottom section */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '24px' }}>
        {/* Recent Tasks */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} style={card}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#f8fafc', marginBottom: '20px' }}>Recent Tasks</h2>
          {recentTasks.length === 0 ? (
            <p style={{ color: '#475569', textAlign: 'center', padding: '40px 0' }}>No tasks yet. Add your first task!</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {recentTasks.map((task, i) => {
                const p = priorityColors[task.priority] || priorityColors.low;
                const s = statusColors[task.status] || statusColors.todo;
                return (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + i * 0.07 }}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderRadius: '12px', transition: 'background 0.2s', cursor: 'default' }}
                    whileHover={{ backgroundColor: 'rgba(255,255,255,0.04)' }}
                  >
                    <div style={{ flex: 1 }}>
                      <p style={{ fontWeight: 600, color: '#e2e8f0', fontSize: '0.95rem', margin: 0 }}>{task.title}</p>
                      <p style={{ color: '#475569', fontSize: '0.8rem', margin: '2px 0 0' }}>{task.dueDate}</p>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', padding: '4px 10px', borderRadius: '6px', background: p.bg, color: p.color }}>{task.priority}</span>
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, padding: '4px 10px', borderRadius: '6px', background: s.bg, color: s.color, whiteSpace: 'nowrap' }}>{task.status.replace('-', ' ')}</span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* Progress Circle */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} style={{ ...card, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '24px' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#f8fafc', margin: 0 }}>Completion</h2>
          <div style={{ position: 'relative', width: '160px', height: '160px' }}>
            <svg width="160" height="160" style={{ transform: 'rotate(-90deg)' }}>
              <circle cx="80" cy="80" r="54" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="10" />
              <motion.circle
                cx="80" cy="80" r="54" fill="none"
                stroke="#6366f1" strokeWidth="10" strokeLinecap="round"
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset: circumference - (stats.progress / 100) * circumference }}
                transition={{ duration: 1.5, ease: 'easeOut' }}
              />
            </svg>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: '2rem', fontWeight: 800, color: '#f8fafc' }}>{stats.progress}%</span>
              <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Done</span>
            </div>
          </div>
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              { label: 'Completed', value: stats.completed, color: '#4ade80' },
              { label: 'In Progress', value: tasks.filter(t => t.status === 'in-progress').length, color: '#818cf8' },
              { label: 'To Do', value: tasks.filter(t => t.status === 'todo').length, color: '#94a3b8' },
            ].map(item => (
              <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: item.color }}></div>
                  <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>{item.label}</span>
                </div>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#e2e8f0' }}>{item.value}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
