import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Login } from './components/Login';
import { Signup } from './components/Signup';
import { CustomerDashboard } from './components/customer/CustomerDashboard';
import { ManagerDashboard } from './components/manager/ManagerDashboard';
import { DeliveryDashboard } from './components/delivery/DeliveryDashboard';
import { AdminDashboard } from './components/admin/AdminDashboard';

function AppContent() {
  const { user, isAuthenticated } = useAuth();
  const [showLogin, setShowLogin] = useState(true);

  if (!isAuthenticated) {
    return showLogin ? (
      <Login onSwitchToSignup={() => setShowLogin(false)} />
    ) : (
      <Signup onSwitchToLogin={() => setShowLogin(true)} />
    );
  }

  switch (user?.user_type) {
    case 'customer':
      return <CustomerDashboard />;
    case 'manager':
      return <ManagerDashboard />;
    case 'delivery':
      return <DeliveryDashboard />;
    case 'admin':
      return <AdminDashboard />;
    default:
      return <CustomerDashboard />;
  }
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
