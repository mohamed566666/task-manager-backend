import React, { useState } from 'react';
import { Mail, Lock, User, UserPlus } from 'lucide-react';
import { Link } from 'react-router-dom';
import Input from '../components/Input';
import Button from '../components/Button';
import AuthLayout from '../components/AuthLayout';

const RegisterPage = () => {
  const [formData, setFormData] = useState({ username: '', name: '', email: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.username) newErrors.username = 'Username is required';
    if (!formData.name) newErrors.name = 'Full name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/^\S+@\S+\.\S+$/.test(formData.email)) newErrors.email = 'Email is invalid';
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:8000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: formData.username, full_name: formData.name, email: formData.email, password: formData.password }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || 'Registration failed');
      // Store username for profile display after login
      localStorage.setItem('user_name', formData.username);
      localStorage.setItem('user_role', 'user');
      window.location.href = '/login';
    } catch (err) {
      setErrors({ submit: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout title="Create an account" subtitle="Join us today and start managing your tasks.">
      <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

        {errors.submit && (
          <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#f87171', padding: '12px 16px', borderRadius: '12px', fontSize: '0.9rem', textAlign: 'center' }}>
            {errors.submit}
          </div>
        )}

        <Input label="Username" name="username" type="text" icon={User}
          placeholder="johndoe123" value={formData.username}
          onChange={handleChange} error={errors.username} />

        <Input label="Full Name" name="name" type="text" icon={User}
          placeholder="John Doe" value={formData.name}
          onChange={handleChange} error={errors.name} />

        <Input label="Email Address" name="email" type="email" icon={Mail}
          placeholder="name@company.com" value={formData.email}
          onChange={handleChange} error={errors.email} />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <Input label="Password" name="password" type="password" icon={Lock}
            placeholder="••••••••" value={formData.password}
            onChange={handleChange} error={errors.password} />

          <Input label="Confirm Password" name="confirmPassword" type="password" icon={Lock}
            placeholder="••••••••" value={formData.confirmPassword}
            onChange={handleChange} error={errors.confirmPassword} />
        </div>

        <div style={{ marginTop: '8px' }}>
          <Button type="submit" isLoading={isLoading} icon={UserPlus}>
            Create Account
          </Button>
        </div>
      </form>

      <div style={{ marginTop: '28px', textAlign: 'center', color: '#64748b', fontSize: '0.95rem' }}>
        Already have an account?{' '}
        <Link to="/login" style={{ color: '#6366f1', fontWeight: 700, textDecoration: 'none' }}>
          Sign in instead
        </Link>
      </div>
    </AuthLayout>
  );
};

export default RegisterPage;
