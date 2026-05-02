import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { TaskProvider } from './context/TaskContext';
import AppLayout from './components/layout/AppLayout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import Dashboard from './pages/Dashboard';
import TasksBoard from './pages/TasksBoard';

import AdminDashboard from './pages/AdminDashboard';

function App() {
  const userRole = localStorage.getItem('user_role');

  return (
    <TaskProvider>
      <Router>
        <Routes>
          {/* Auth Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />

          {/* App Routes */}
          <Route 
            path="/dashboard" 
            element={
              <AppLayout>
                <Dashboard />
              </AppLayout>
            } 
          />
          <Route 
            path="/board" 
            element={
              <AppLayout>
                <TasksBoard />
              </AppLayout>
            } 
          />

          {/* Admin Route */}
          <Route 
            path="/admin" 
            element={
              userRole === 'admin' ? (
                <AppLayout>
                  <AdminDashboard />
                </AppLayout>
              ) : (
                <Navigate to="/dashboard" replace />
              )
            } 
          />

          {/* Redirects */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </TaskProvider>
  );
}

export default App;
