import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Input = ({ label, icon: Icon, error, ...props }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
      {label && (
        <label style={{ fontSize: '0.875rem', fontWeight: 600, color: '#94a3b8', marginLeft: '2px' }}>
          {label}
        </label>
      )}
      <div style={{ position: 'relative' }}>
        {Icon && (
          <div style={{
            position: 'absolute', left: '16px', top: '50%',
            transform: 'translateY(-50%)', color: '#475569',
            display: 'flex', alignItems: 'center', pointerEvents: 'none',
          }}>
            <Icon size={20} />
          </div>
        )}
        <input
          style={{
            width: '100%',
            background: 'rgba(255,255,255,0.04)',
            border: error ? '1.5px solid rgba(239,68,68,0.6)' : '1.5px solid rgba(255,255,255,0.08)',
            borderRadius: '14px',
            padding: `14px 18px 14px ${Icon ? '50px' : '18px'}`,
            color: '#f8fafc',
            fontSize: '1rem',
            outline: 'none',
            transition: 'border-color 0.2s, box-shadow 0.2s',
            fontFamily: 'Inter, sans-serif',
            boxSizing: 'border-box',
          }}
          onFocus={e => {
            e.target.style.borderColor = 'rgba(99,102,241,0.7)';
            e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.1)';
          }}
          onBlur={e => {
            e.target.style.borderColor = error ? 'rgba(239,68,68,0.6)' : 'rgba(255,255,255,0.08)';
            e.target.style.boxShadow = 'none';
          }}
          {...props}
        />
      </div>
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            style={{ color: '#f87171', fontSize: '0.82rem', margin: 0, marginLeft: '2px' }}
          >
            ⚠ {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Input;
