import React from 'react';
import { motion } from 'framer-motion';

const Button = ({ children, isLoading, icon: Icon, variant = 'primary', onClick, type = 'button', style: customStyle, ...props }) => {
  const styles = {
    primary: {
      background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
      color: '#fff',
      border: 'none',
      boxShadow: '0 8px 24px rgba(99,102,241,0.3)',
    },
    outline: {
      background: 'rgba(255,255,255,0.04)',
      color: '#94a3b8',
      border: '1px solid rgba(255,255,255,0.1)',
    },
    danger: {
      background: 'linear-gradient(135deg, #ef4444, #dc2626)',
      color: '#fff',
      border: 'none',
      boxShadow: '0 8px 24px rgba(239,68,68,0.3)',
    }
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02, filter: 'brightness(1.1)' }}
      whileTap={{ scale: 0.97 }}
      type={type}
      onClick={onClick}
      disabled={isLoading}
      style={{
        width: '100%',
        padding: '16px 24px',
        borderRadius: '14px',
        fontWeight: 700,
        fontSize: '1rem',
        fontFamily: 'Inter, sans-serif',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '10px',
        cursor: isLoading ? 'not-allowed' : 'pointer',
        opacity: isLoading ? 0.7 : 1,
        transition: 'all 0.2s',
        ...styles[variant],
        ...customStyle,
      }}
      {...props}
    >
      {isLoading ? (
        <div style={{
          width: '22px', height: '22px',
          border: '2px solid rgba(255,255,255,0.3)',
          borderTopColor: '#fff',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }} />
      ) : (
        <>
          {Icon && <Icon size={20} />}
          <span>{children}</span>
        </>
      )}
    </motion.button>
  );
};

export default Button;
