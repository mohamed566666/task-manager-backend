import React, { useState } from 'react';
import { Mail, Send, ChevronLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import Input from '../components/Input';
import Button from '../components/Button';
import AuthLayout from '../components/AuthLayout';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const validate = () => {
    if (!email) { setError('Email is required'); return false; }
    if (!/^\S+@\S+\.\S+$/.test(email)) { setError('Email is invalid'); return false; }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setIsLoading(true);
    setTimeout(() => { setIsLoading(false); setIsSent(true); }, 1500);
  };

  if (isSent) {
    return (
      <AuthLayout title="Check your email" subtitle="We've sent a reset link to your email address.">
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '28px' }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Mail size={36} color="#6366f1" />
          </div>
          <p style={{ color: '#64748b', fontSize: '1rem', lineHeight: 1.7, maxWidth: '340px', margin: 0 }}>
            Didn't receive the email? Check your spam folder or try again with a different address.
          </p>
          <Button onClick={() => setIsSent(false)} variant="outline">
            Try another email
          </Button>
          <Link to="/login" style={{ color: '#6366f1', fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.95rem' }}>
            <ChevronLeft size={18} /> Back to login
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Reset Password" subtitle="Enter your email and we'll send you a reset link.">
      <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <Input
          label="Email Address" name="email" type="email" icon={Mail}
          placeholder="name@company.com" value={email}
          onChange={e => { setEmail(e.target.value); setError(''); }}
          error={error}
        />
        <Button type="submit" isLoading={isLoading} icon={Send}>
          Send Reset Link
        </Button>
      </form>

      <div style={{ marginTop: '32px', textAlign: 'center' }}>
        <Link to="/login" style={{ color: '#6366f1', fontWeight: 600, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.95rem' }}>
          <ChevronLeft size={18} /> Back to login
        </Link>
      </div>
    </AuthLayout>
  );
};

export default ForgotPasswordPage;
