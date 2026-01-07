
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import GalleryPage from './pages/GalleryPage';
import RegisterPage from './pages/RegisterPage';
import EditProfilePage from './pages/EditProfilePage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import ProfilePage from './pages/ProfilePage';
import PaymentPage from './pages/PaymentPage';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { User } from './types';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);

  // Simple auth simulation
  const login = (role: 'model' | 'admin') => {
    setUser({
      id: role === 'model' ? 'u1' : 'admin-id',
      email: role === 'model' ? 'ana@example.com' : 'admin@verificados.com',
      role: role,
      modelId: role === 'model' ? '1' : undefined
    });
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-[#101922] text-white">
        <Navbar user={user} onLogout={logout} />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<GalleryPage />} />
            <Route path="/info" element={<LandingPage />} />
            <Route path="/cadastro" element={<RegisterPage />} />
            <Route path="/login" element={<LoginPage onLogin={login} />} />
            <Route path="/dashboard" element={user?.role === 'model' ? <DashboardPage user={user} /> : user?.role === 'admin' ? <Navigate to="/admin" /> : <Navigate to="/login" />} />
            <Route path="/dashboard/editar" element={user?.role === 'model' ? <EditProfilePage user={user} /> : <Navigate to="/login" />} />
            
            {/* Super Admin Route */}
            <Route path="/admin" element={user?.role === 'admin' ? <AdminDashboardPage /> : <Navigate to="/login" />} />
            
            <Route path="/perfil/:id" element={<ProfilePage />} />
            <Route path="/pagamento/:id" element={<PaymentPage />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
};

export default App;
