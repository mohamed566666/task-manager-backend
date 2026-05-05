import React, { useState } from 'react';
import { Mail, Send, ChevronLeft, KeyRound, Lock, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import AuthLayout from '../components/auth/AuthLayout';

const API_BASE = 'http://127.0.0.1:8000';

const ForgotPasswordPage = () => {
  const [step, setStep] = useState(1); // 1: Email, 2: OTP & Password, 3: Success
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    if (!email) { setError('Email is required'); return; }
    if (!/^\S+@\S+\.\S+$/.test(email)) { setError('Email is invalid'); return; }
    
    setIsLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      if (!res.ok) {
        const data = await res.json().catch(()=>({}));
        throw new Error(data.detail || 'Failed to send OTP');
      }
      setStep(2);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!otp) { setError('OTP is required'); return; }
    if (!newPassword || newPassword.length < 6) { setError('Password must be at least 6 characters'); return; }
    
    setIsLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, new_password: newPassword })
      });
      if (!res.ok) {
        const data = await res.json().catch(()=>({}));
        throw new Error(data.detail || 'Failed to reset password');
      }
      setStep(3);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (step === 3) {
    return (
      <AuthLayout title="Password Reset Complete" subtitle="Your password has been successfully updated.">
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '28px' }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CheckCircle2 size={36} color="#22c55e" />
          </div>
          <p style={{ color: '#64748b', fontSize: '1rem', lineHeight: 1.7, maxWidth: '340px', margin: 0 }}>
            You can now log in with your new password to access your task manager.
          </p>
          <Link to="/login" style={{ width: '100%', textDecoration: 'none' }}>
            <Button>Go to Login</Button>
          </Link>
        </div>
      </AuthLayout>
    );
  }

  if (step === 2) {
    return (
      <AuthLayout title="Verify OTP" subtitle={`We sent a 6-digit code to ${email}`}>
        <form onSubmit={handleResetPassword} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {error && <div style={{ color: '#ef4444', fontSize: '0.85rem', background: 'rgba(239,68,68,0.1)', padding: '10px', borderRadius: '8px', border: '1px solid rgba(239,68,68,0.2)' }}>{error}</div>}
          
          <Input
            label="6-Digit OTP" name="otp" type="text" icon={KeyRound}
            placeholder="Enter OTP code" value={otp}
            onChange={e => { setOtp(e.target.value); setError(''); }}
            maxLength={6}
          />
          <Input
            label="New Password" name="password" type="password" icon={Lock}
            placeholder="Enter new password" value={newPassword}
            onChange={e => { setNewPassword(e.target.value); setError(''); }}
          />
          <Button type="submit" isLoading={isLoading} icon={Lock} style={{ marginTop: '8px' }}>
            Reset Password
          </Button>
        </form>
        <div style={{ marginTop: '24px', textAlign: 'center' }}>
          <button onClick={() => setStep(1)} style={{ background: 'none', border: 'none', color: '#6366f1', fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.95rem', padding: 0 }}>
            <ChevronLeft size={18} /> Back to email
          </button>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Forgot Password" subtitle="Enter your email and we'll send you an OTP to reset your password.">
      <form onSubmit={handleRequestOtp} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {error && <div style={{ color: '#ef4444', fontSize: '0.85rem', background: 'rgba(239,68,68,0.1)', padding: '10px', borderRadius: '8px', border: '1px solid rgba(239,68,68,0.2)' }}>{error}</div>}
        
        <Input
          label="Email Address" name="email" type="email" icon={Mail}
          placeholder="name@company.com" value={email}
          onChange={e => { setEmail(e.target.value); setError(''); }}
        />
        <Button type="submit" isLoading={isLoading} icon={Send} style={{ marginTop: '8px' }}>
          Send OTP
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
