
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
import TermsPage from './pages/TermsPage';
import PrivacyPage from './pages/PrivacyPage';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { User } from './types';
import { ToastProvider } from './context/ToastContext';

const App: React.FC = () => {
  // Carregar usuário do localStorage ao iniciar
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('verificados_user');
    if (savedUser) {
      try {
        return JSON.parse(savedUser);
      } catch {
        return null;
      }
    }
    return null;
  });

  // Salvar usuário no localStorage sempre que mudar
  useEffect(() => {
    if (user) {
      localStorage.setItem('verificados_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('verificados_user');
    }
  }, [user]);

  // Função para atualizar usuário (pode receber role ou usuário completo)
  const login = (userOrRole: 'model' | 'admin' | User) => {
    if (typeof userOrRole === 'string') {
      // Modo compatibilidade: se passar apenas role, carrega do localStorage
      const savedUser = localStorage.getItem('verificados_user');
      if (savedUser) {
        try {
          const parsed = JSON.parse(savedUser);
          setUser(parsed);
        } catch {
          setUser(null);
        }
      } else {
        setUser(null);
      }
    } else {
      // Se passar usuário completo, usa ele
      setUser(userOrRole);
    }
  };

  // Listener para mudanças no localStorage (para quando LoginPage atualiza de outras abas)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'verificados_user') {
        if (e.newValue) {
          try {
            const parsed = JSON.parse(e.newValue);
            setUser(parsed);
          } catch {
            // Ignora erros de parse
          }
        } else {
          setUser(null);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const logout = () => {
    setUser(null);
    localStorage.removeItem('verificados_user');
  };

  return (
    <Router>
      <ToastProvider>
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
              <Route path="/termos" element={<TermsPage />} />
              <Route path="/privacidade" element={<PrivacyPage />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </ToastProvider>
    </Router>
  );
};

export default App;
