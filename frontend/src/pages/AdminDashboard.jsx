import React, { useEffect, useState } from 'react';
import { Users, ShieldAlert, Loader, ShieldCheck, ShieldOff } from 'lucide-react';

const API_BASE = 'http://localhost:8000';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(null); // userId being promoted/demoted

  const currentUserId = (() => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) return null;
      const payload = JSON.parse(atob(token.split('.')[1]));
      return String(payload.sub);
    } catch { return null; }
  })();

  const authHeaders = () => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${localStorage.getItem('access_token')}`,
  });

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/auth/users`, { headers: authHeaders() });
        if (!response.ok) throw new Error("Failed to fetch users");
        const data = await response.json();
        setUsers(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const handlePromote = async (userId) => {
    setActionLoading(userId);
    try {
      const res = await fetch(`${API_BASE}/api/auth/users/${userId}/promote`, {
        method: 'PATCH',
        headers: authHeaders(),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'Failed to promote user');
      }
      const updated = await res.json();
      setUsers(prev => prev.map(u => u.id === updated.id ? updated : u));
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDemote = async (userId) => {
    setActionLoading(userId);
    try {
      const res = await fetch(`${API_BASE}/api/auth/users/${userId}/demote`, {
        method: 'PATCH',
        headers: authHeaders(),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'Failed to demote user');
      }
      const updated = await res.json();
      setUsers(prev => prev.map(u => u.id === updated.id ? updated : u));
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: '#6366f1' }}>
        <Loader size={32} style={{ animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '40px', color: '#ef4444', textAlign: 'center' }}>
        <ShieldAlert size={48} style={{ margin: '0 auto 16px', display: 'block' }} />
        <h2 style={{ color: '#f8fafc' }}>Access Denied</h2>
        <p>{error}</p>
      </div>
    );
  }

  const admins = users.filter(u => u.role === 'admin');
  const regularUsers = users.filter(u => u.role !== 'admin');

  const cardStyle = {
    background: 'rgba(255,255,255,0.02)',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: '20px',
    padding: '24px',
    marginBottom: '24px',
  };

  const UserRow = ({ user }) => {
    const isCurrentUser = String(user.id) === currentUserId;
    const isAdmin = user.role === 'admin';
    const loading = actionLoading === user.id;

    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        padding: '14px 16px',
        borderRadius: '12px',
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(255,255,255,0.04)',
        marginBottom: '8px',
        gap: '16px',
      }}>
        {/* Avatar */}
        <div style={{
          width: '44px', height: '44px', borderRadius: '50%', flexShrink: 0,
          background: isAdmin ? 'linear-gradient(135deg, #6366f1, #4f46e5)' : 'rgba(255,255,255,0.08)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: 700, fontSize: '1.1rem', color: '#f8fafc',
        }}>
          {user.username.charAt(0).toUpperCase()}
        </div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontWeight: 600, color: '#f8fafc', fontSize: '0.95rem' }}>
              {user.username}
            </span>
            {isCurrentUser && (
              <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: '10px', background: 'rgba(99,102,241,0.15)', color: '#818cf8', fontWeight: 600 }}>
                You
              </span>
            )}
            <span style={{
              fontSize: '0.7rem', padding: '2px 8px', borderRadius: '10px', fontWeight: 700,
              background: isAdmin ? 'rgba(99,102,241,0.15)' : 'rgba(148,163,184,0.1)',
              color: isAdmin ? '#818cf8' : '#64748b',
            }}>
              {isAdmin ? '👑 Admin' : 'User'}
            </span>
          </div>
          <div style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {user.email}
          </div>
        </div>

        {/* Action Button */}
        {!isCurrentUser && (
          <button
            onClick={() => isAdmin ? handleDemote(user.id) : handlePromote(user.id)}
            disabled={loading}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '7px 14px', borderRadius: '10px', fontWeight: 600,
              fontSize: '0.82rem', cursor: loading ? 'not-allowed' : 'pointer',
              fontFamily: 'Inter, sans-serif', border: 'none', flexShrink: 0,
              background: isAdmin ? 'rgba(239,68,68,0.1)' : 'rgba(99,102,241,0.15)',
              color: isAdmin ? '#f87171' : '#818cf8',
              opacity: loading ? 0.6 : 1,
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => { if (!loading) e.currentTarget.style.opacity = '0.8'; }}
            onMouseLeave={e => { e.currentTarget.style.opacity = loading ? '0.6' : '1'; }}
          >
            {loading
              ? <Loader size={14} style={{ animation: 'spin 0.8s linear infinite' }} />
              : isAdmin
                ? <><ShieldOff size={14} /> Remove Admin</>
                : <><ShieldCheck size={14} /> Make Admin</>
            }
          </button>
        )}
      </div>
    );
  };

  return (
    <div style={{ padding: '32px', maxWidth: '860px', margin: '0 auto', fontFamily: 'Inter, sans-serif' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#f8fafc', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Users size={32} color="#6366f1" />
          Admin Dashboard
        </h1>
        <p style={{ color: '#64748b', fontSize: '0.95rem' }}>
          Manage system users, promote or demote admin privileges.
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '16px', marginBottom: '32px' }}>
        {[
          { label: 'Total Users', value: users.length, color: '#6366f1' },
          { label: 'Admins', value: admins.length, color: '#a855f7' },
          { label: 'Regular Users', value: regularUsers.length, color: '#22c55e' },
        ].map(stat => (
          <div key={stat.label} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', padding: '20px 24px' }}>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: stat.color }}>{stat.value}</div>
            <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '4px' }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Admins Section */}
      <div style={cardStyle}>
        <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#f8fafc', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          👑 Administrators <span style={{ color: '#64748b', fontWeight: 400 }}>({admins.length})</span>
        </h2>
        {admins.length === 0
          ? <p style={{ color: '#64748b', fontStyle: 'italic', fontSize: '0.9rem' }}>No admins found.</p>
          : admins.map(u => <UserRow key={u.id} user={u} />)
        }
      </div>

      {/* Regular Users Section */}
      <div style={cardStyle}>
        <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#f8fafc', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          👤 Regular Users <span style={{ color: '#64748b', fontWeight: 400 }}>({regularUsers.length})</span>
        </h2>
        {regularUsers.length === 0
          ? <p style={{ color: '#64748b', fontStyle: 'italic', fontSize: '0.9rem' }}>No regular users found.</p>
          : regularUsers.map(u => <UserRow key={u.id} user={u} />)
        }
      </div>
    </div>
  );
};

export default AdminDashboard;
