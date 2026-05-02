import React from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { motion } from 'framer-motion';

const AppLayout = ({ children }) => {
  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', background: '#0F0F13', color: '#f8fafc', fontFamily: 'Inter, sans-serif', overflow: 'hidden' }}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
        <Navbar />
        <motion.main
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          style={{ flex: 1, padding: '40px', overflowY: 'auto', overflowX: 'hidden' }}
        >
          {children}
        </motion.main>
      </div>
    </div>
  );
};

export default AppLayout;
