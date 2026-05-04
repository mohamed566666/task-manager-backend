import React, { useState } from 'react';
import { Mail, Lock, LogIn, UserPlus, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import AuthLayout from '../components/auth/AuthLayout';

const LoginPage = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  // 'idle' | 'checking' | 'not_found' | 'found'
  const [emailStatus, setEmailStatus] = useState('idle');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    // Reset email status when email field changes
    if (name === 'email') setEmailStatus('idle');
  };

  const validateFormat = () => {
    const newErrors = {};
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/^\S+@\S+\.\S+$/.test(formData.email)) newErrors.email = 'Email is invalid';
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateFormat()) return;
    setIsLoading(true);
    setErrors({});

    try {
      // ── Step 1: Check if email exists ──────────────────────────────────
      setEmailStatus('checking');
      const checkRes = await fetch(
        `http://localhost:8000/api/auth/check-email?email=${encodeURIComponent(formData.email)}`
      );
      const checkData = await checkRes.json();

      if (!checkData.exists) {
        setEmailStatus('not_found');
        setIsLoading(false);
        return;
      }
      setEmailStatus('found');

      // ── Step 2: Attempt login ───────────────────────────────────────────
      const response = await fetch('http://localhost:8000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, password: formData.password }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || 'Login failed');

      localStorage.setItem('access_token', data.access_token);
      try {
        const payload = JSON.parse(atob(data.access_token.split('.')[1]));
        localStorage.setItem('user_name', payload.username || payload.email || formData.email);
        localStorage.setItem('user_role', payload.role || 'user');
      } catch {
        localStorage.setItem('user_name', formData.email);
        localStorage.setItem('user_role', 'user');
      }
      window.location.href = '/dashboard';
    } catch (err) {
      setEmailStatus('idle');
      setErrors({ submit: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout title="Welcome back" subtitle="Enter your credentials to access your workspace">
      <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

        {/* Generic submit error */}
        {errors.submit && (
          <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#f87171', padding: '12px 16px', borderRadius: '12px', fontSize: '0.9rem', textAlign: 'center' }}>
            {errors.submit}
          </div>
        )}

        {/* Email not found banner */}
        {emailStatus === 'not_found' && (
          <div style={{
            background: 'rgba(251,191,36,0.08)',
            border: '1px solid rgba(251,191,36,0.3)',
            borderRadius: '14px',
            padding: '16px 18px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <AlertCircle size={18} color="#fbbf24" style={{ flexShrink: 0 }} />
              <span style={{ color: '#fcd34d', fontSize: '0.92rem', fontWeight: 600 }}>
                No account found with this email address.
              </span>
            </div>
            <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: 0, paddingLeft: '28px' }}>
              Email not found please register first
            </p>

          </div>
        )}

        <Input label="Email Address" name="email" type="email" icon={Mail}
          placeholder="name@company.com" value={formData.email}
          onChange={handleChange} error={errors.email} />

        <Input label="Password" name="password" type="password" icon={Lock}
          placeholder="••••••••" value={formData.password}
          onChange={handleChange} error={errors.password} />

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Link to="/forgot-password" style={{ color: '#6366f1', fontSize: '0.9rem', fontWeight: 600, textDecoration: 'none' }}>
            Forgot password?
          </Link>
        </div>

        <Button type="submit" isLoading={isLoading} icon={LogIn}>
          {isLoading && emailStatus === 'checking' ? 'Checking email…' : 'Sign In to Workspace'}
        </Button>
      </form>

      <div style={{ marginTop: '32px', textAlign: 'center', color: '#64748b', fontSize: '0.95rem' }}>
        Don't have an account?{' '}
        <Link to="/register" style={{ color: '#6366f1', fontWeight: 700, textDecoration: 'none' }}>
          Create one now
        </Link>
      </div>
    </AuthLayout>
  );
};

export default LoginPage;
