import React from 'react';
import { motion } from 'framer-motion';

const AuthLayout = ({ children, title, subtitle }) => {
  return (
    <div style={{
      width: '100vw',
      minHeight: '100vh',
      background: '#0a0a0f',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 24px',
      position: 'relative',
      overflow: 'hidden',
      fontFamily: 'Inter, sans-serif',
    }}>
      {/* Background Orbs */}
      <div style={{ position: 'absolute', top: '-5%', left: '-5%', width: '40vw', height: '40vw', borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.18), transparent 70%)', filter: 'blur(60px)', zIndex: 0 }} />
      <div style={{ position: 'absolute', bottom: '-5%', right: '-5%', width: '35vw', height: '35vw', borderRadius: '50%', background: 'radial-gradient(circle, rgba(168,85,247,0.12), transparent 70%)', filter: 'blur(60px)', zIndex: 0 }} />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        style={{
          position: 'relative',
          zIndex: 1,
          width: '100%',
          maxWidth: '680px',
          minHeight: '82vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          background: 'rgba(255,255,255,0.025)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '32px',
          padding: '64px 72px',
          boxShadow: '0 32px 80px rgba(0,0,0,0.5)',
        }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <h2 style={{ fontSize: '2.6rem', fontWeight: 800, color: '#f8fafc', margin: '0 0 14px', lineHeight: 1.2, letterSpacing: '-0.02em' }}>
            {title}
          </h2>
          {subtitle && (
            <p style={{ color: '#64748b', fontSize: '1.05rem', margin: 0, lineHeight: 1.6 }}>
              {subtitle}
            </p>
          )}
        </div>

        {children}
      </motion.div>
    </div>
  );
};

export default AuthLayout;
