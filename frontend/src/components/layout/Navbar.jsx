import React, { useState, useRef, useEffect } from 'react';
import { Search, Bell, User, ChevronDown, LogOut, Shield, Trash2, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import { useTasks } from '../../context/TaskContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const getUserInfo = () => {
  const name = localStorage.getItem('user_name') || 'User';
  const role = localStorage.getItem('user_role') || 'user';
  const displayName = name.includes('@') ? name.split('@')[0] : name;
  return { name: displayName, role };
};

const getDeadlineAlerts = (tasks) => {
  const alerts = [];
  const now = new Date();
  tasks.forEach(task => {
    if (task.status === 'done') return;
    if (!task.dueDate) return;
    const deadline = new Date(task.dueDate + 'T23:59:59');
    if (isNaN(deadline.getTime())) return;
    const daysUntil = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24));
    if (daysUntil < 0) {
      alerts.push({ task, type: 'overdue', daysUntil, label: `Overdue by ${Math.abs(daysUntil)}d` });
    } else if (daysUntil === 0) {
      alerts.push({ task, type: 'today', daysUntil, label: 'Due today' });
    } else if (daysUntil <= 3) {
      alerts.push({ task, type: 'soon', daysUntil, label: `Due in ${daysUntil}d` });
    }
  });
  return alerts.sort((a, b) => a.daysUntil - b.daysUntil);
};

const alertColors = {
  overdue: { bg: 'rgba(239,68,68,0.12)', color: '#f87171', icon: <AlertTriangle size={14} /> },
  today:   { bg: 'rgba(234,179,8,0.12)', color: '#fbbf24', icon: <Clock size={14} /> },
  soon:    { bg: 'rgba(99,102,241,0.12)', color: '#818cf8', icon: <Clock size={14} /> },
};

const Navbar = () => {
  const { searchQuery, setSearchQuery, tasks } = useTasks();
  const [profileOpen, setProfileOpen] = useState(false);
  const [bellOpen, setBellOpen] = useState(false);
  const profileRef = useRef(null);
  const bellRef = useRef(null);
  const navigate = useNavigate();
  const user = getUserInfo();
  const alerts = getDeadlineAlerts(tasks);

  useEffect(() => {
    const handler = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
      if (bellRef.current && !bellRef.current.contains(e.target)) setBellOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <div style={{
      height: '72px',
      background: 'rgba(13,13,20,0.85)',
      backdropFilter: 'blur(20px)',
      borderBottom: '1px solid rgba(255,255,255,0.07)',
      padding: '0 32px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'sticky',
      top: 0,
      zIndex: 30,
      gap: '24px',
    }}>
      {/* Search Bar */}
      <div style={{ flex: 1, maxWidth: '480px', position: 'relative' }}>
        <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#475569' }} />
        <input
          type="text"
          placeholder="Search tasks..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '10px 16px 10px 42px', color: '#f8fafc', fontSize: '0.9rem', outline: 'none', fontFamily: 'Inter, sans-serif' }}
        />
      </div>

      {/* Right Side */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>

        {/* 🔔 Notification Bell */}
        <div ref={bellRef} style={{ position: 'relative' }}>
          <button
            onClick={() => setBellOpen(v => !v)}
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#94a3b8', borderRadius: '10px', padding: '8px', cursor: 'pointer', display: 'flex', position: 'relative', transition: 'all 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
          >
            <Bell size={20} color={alerts.length > 0 ? '#818cf8' : '#94a3b8'} />
            {alerts.length > 0 && (
              <span style={{ position: 'absolute', top: '5px', right: '5px', minWidth: '16px', height: '16px', background: alerts.some(a => a.type === 'overdue') ? '#ef4444' : '#6366f1', borderRadius: '8px', border: '2px solid #0d0d14', fontSize: '0.6rem', fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 2px' }}>
                {alerts.length}
              </span>
            )}
          </button>

          <AnimatePresence>
            {bellOpen && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.95 }}
                transition={{ duration: 0.18 }}
                style={{ position: 'absolute', top: 'calc(100% + 10px)', right: 0, background: '#13131c', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '8px', minWidth: '300px', boxShadow: '0 24px 60px rgba(0,0,0,0.5)', zIndex: 200, maxHeight: '400px', overflowY: 'auto' }}
              >
                <div style={{ padding: '12px 14px 8px', borderBottom: '1px solid rgba(255,255,255,0.07)', marginBottom: '6px' }}>
                  <p style={{ fontWeight: 700, color: '#f8fafc', margin: 0, fontSize: '0.9rem' }}>Deadline Alerts</p>
                  <p style={{ color: '#64748b', margin: '2px 0 0', fontSize: '0.75rem' }}>
                    {alerts.length === 0 ? 'No upcoming deadlines' : `${alerts.length} task${alerts.length > 1 ? 's' : ''} need attention`}
                  </p>
                </div>

                {alerts.length === 0 ? (
                  <div style={{ padding: '20px', textAlign: 'center', color: '#475569' }}>
                    <CheckCircle size={28} style={{ margin: '0 auto 8px', display: 'block', color: '#4ade80' }} />
                    <p style={{ fontSize: '0.85rem' }}>All tasks on schedule!</p>
                  </div>
                ) : (
                  alerts.map(({ task, type, label }) => {
                    const style = alertColors[type];
                    return (
                      <div key={task.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '10px 12px', borderRadius: '10px', background: style.bg, margin: '4px 0' }}>
                        <span style={{ color: style.color, flexShrink: 0, marginTop: '2px' }}>{style.icon}</span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontWeight: 600, color: '#e2e8f0', margin: 0, fontSize: '0.85rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{task.title}</p>
                          <div style={{ display: 'flex', gap: '8px', marginTop: '3px' }}>
                            <span style={{ fontSize: '0.72rem', color: style.color, fontWeight: 700 }}>{label}</span>
                            <span style={{ fontSize: '0.72rem', color: '#475569' }}>{task.category}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Profile Dropdown */}
        <div ref={profileRef} style={{ position: 'relative' }}>
          <button
            onClick={() => setProfileOpen(v => !v)}
            style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '8px 14px', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}
          >
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#fff', fontSize: '0.9rem' }}>
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div style={{ textAlign: 'left' }}>
              <p style={{ fontSize: '0.85rem', fontWeight: 600, color: '#f8fafc', margin: 0, lineHeight: 1.2 }}>{user.name}</p>
              <p style={{ fontSize: '0.72rem', color: '#6366f1', margin: 0, textTransform: 'capitalize', fontWeight: 600 }}>{user.role}</p>
            </div>
            <ChevronDown size={16} color="#64748b" style={{ transition: 'transform 0.2s', transform: profileOpen ? 'rotate(180deg)' : 'rotate(0deg)' }} />
          </button>

          <AnimatePresence>
            {profileOpen && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.95 }}
                transition={{ duration: 0.18 }}
                style={{ position: 'absolute', top: 'calc(100% + 10px)', right: 0, background: '#13131c', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '8px', minWidth: '220px', boxShadow: '0 24px 60px rgba(0,0,0,0.5)', zIndex: 200 }}
              >
                <div style={{ padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.07)', marginBottom: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#fff', fontSize: '1.1rem' }}>
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p style={{ fontWeight: 700, color: '#f8fafc', margin: 0, fontSize: '0.95rem' }}>{user.name}</p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '2px' }}>
                        <Shield size={12} color="#6366f1" />
                        <p style={{ color: '#6366f1', margin: 0, fontSize: '0.78rem', textTransform: 'capitalize', fontWeight: 600 }}>{user.role}</p>
                      </div>
                    </div>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '11px 16px', borderRadius: '10px', background: 'transparent', border: 'none', color: '#f87171', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: '0.9rem', fontWeight: 600, transition: 'background 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.1)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <LogOut size={18} />
                  Sign Out
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
