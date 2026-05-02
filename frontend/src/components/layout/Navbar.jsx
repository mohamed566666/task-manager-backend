import React, { useState, useRef, useEffect } from 'react';
import { Search, Bell, User, ChevronDown, LogOut, Shield } from 'lucide-react';
import { useTasks } from '../../context/TaskContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

// Read user info from localStorage
const getUserInfo = () => {
  const name = localStorage.getItem('user_name') || 'Ahmed';
  const role = localStorage.getItem('user_role') || 'admin';
  // Shorten if it's an email
  const displayName = name.includes('@') ? name.split('@')[0] : name;
  return { name: displayName, role };
};

const Navbar = () => {
  const { searchQuery, setSearchQuery } = useTasks();
  const [profileOpen, setProfileOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const user = getUserInfo();

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
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
          style={{
            width: '100%',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '12px',
            padding: '10px 16px 10px 42px',
            color: '#f8fafc',
            fontSize: '0.9rem',
            outline: 'none',
            fontFamily: 'Inter, sans-serif',
          }}
        />
      </div>

      {/* Right Side */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {/* Bell */}
        <button style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#94a3b8', borderRadius: '10px', padding: '8px', cursor: 'pointer', display: 'flex', position: 'relative' }}>
          <Bell size={20} />
          <span style={{ position: 'absolute', top: '6px', right: '6px', width: '8px', height: '8px', background: '#6366f1', borderRadius: '50%', border: '2px solid #0d0d14' }}></span>
        </button>

        {/* Profile Dropdown */}
        <div ref={dropdownRef} style={{ position: 'relative' }}>
          <button
            onClick={() => setProfileOpen(v => !v)}
            style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '8px 14px', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}
          >
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <User size={16} color="#fff" />
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
                style={{
                  position: 'absolute', top: 'calc(100% + 10px)', right: 0,
                  background: '#13131c', border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '16px', padding: '8px', minWidth: '220px',
                  boxShadow: '0 24px 60px rgba(0,0,0,0.5)', zIndex: 200,
                }}
              >
                {/* User Info Header */}
                <div style={{ padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.07)', marginBottom: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <User size={20} color="#fff" />
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

                {/* Logout Button */}
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
