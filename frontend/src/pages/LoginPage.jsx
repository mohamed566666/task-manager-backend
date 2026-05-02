import React, { useState } from 'react';
import { Mail, Lock, LogIn } from 'lucide-react';
import { Link } from 'react-router-dom';
import Input from '../components/Input';
import Button from '../components/Button';
import AuthLayout from '../components/AuthLayout';

const LoginPage = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
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
    if (!validate()) return;
    setIsLoading(true);
    try {
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
      setErrors({ submit: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout title="Welcome back" subtitle="Enter your credentials to access your workspace">
      <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

        {errors.submit && (
          <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#f87171', padding: '12px 16px', borderRadius: '12px', fontSize: '0.9rem', textAlign: 'center' }}>
            {errors.submit}
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
          Sign In to Workspace
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
