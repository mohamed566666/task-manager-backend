import React, { useState } from 'react';
import { LayoutDashboard, Kanban, LogOut, ChevronLeft, ChevronRight, CheckSquare, Users } from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';

const Sidebar = ({ onAddTask }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    navigate('/login');
  };

  const userRole = localStorage.getItem('user_role');

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: Kanban, label: 'Tasks Board', path: '/board' },
  ];

  if (userRole === 'admin') {
    menuItems.push({ icon: Users, label: 'Admin Dashboard', path: '/admin' });
  }

  const sidebarStyle = {
    width: isCollapsed ? '80px' : '280px',
    height: '100vh',
    background: '#0d0d14',
    borderRight: '1px solid rgba(255,255,255,0.07)',
    display: 'flex',
    flexDirection: 'column',
    position: 'sticky',
    top: 0,
    transition: 'width 0.3s ease',
    overflow: 'hidden',
    flexShrink: 0,
  };

  return (
    <div style={sidebarStyle}>
      {/* Logo */}
      <div style={{ padding: '24px 20px', display: 'flex', alignItems: 'center', justifyContent: isCollapsed ? 'center' : 'space-between', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        {!isCollapsed && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '34px', height: '34px', background: 'linear-gradient(135deg, #6366f1, #a855f7)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CheckSquare size={18} color="#fff" />
            </div>
            <span style={{ fontWeight: 700, fontSize: '1.1rem', color: '#f8fafc', whiteSpace: 'nowrap' }}>Task Master</span>
          </div>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: '#94a3b8', borderRadius: '8px', padding: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
        >
          {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* Nav Items */}
      <nav style={{ flex: 1, padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 14px',
              borderRadius: '12px',
              textDecoration: 'none',
              fontWeight: 500,
              fontSize: '0.95rem',
              transition: 'all 0.2s',
              background: isActive ? 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(99,102,241,0.1))' : 'transparent',
              color: isActive ? '#6366f1' : '#94a3b8',
              border: isActive ? '1px solid rgba(99,102,241,0.2)' : '1px solid transparent',
              justifyContent: isCollapsed ? 'center' : 'flex-start',
            })}
          >
            <item.icon size={22} style={{ flexShrink: 0 }} />
            {!isCollapsed && <span style={{ whiteSpace: 'nowrap' }}>{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div style={{ padding: '12px', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
        <button
          onClick={handleLogout}
          style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 14px', borderRadius: '12px', background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', fontWeight: 500, fontSize: '0.95rem', justifyContent: isCollapsed ? 'center' : 'flex-start', fontFamily: 'Inter, sans-serif', transition: 'background 0.15s' }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.1)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
          <LogOut size={22} />
          {!isCollapsed && <span>Logout</span>}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
