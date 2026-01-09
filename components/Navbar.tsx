
import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { User } from '../types';

interface NavbarProps {
  user: User | null;
  onLogout: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-[#101922]/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2 group">
          <span className="material-symbols-outlined filled text-primary text-blue-500 text-3xl transition-transform group-hover:scale-110">verified</span>
          <span className="text-xl font-black tracking-tighter uppercase italic">Verificados</span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          <Link
            to="/"
            className={`text-xs font-black uppercase tracking-widest transition-colors ${isActive('/') ? 'text-white' : 'text-slate-400 hover:text-white'
              }`}
          >
            Acompanhantes
          </Link>

        </nav>

        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-4">
              <Link
                to={user.role === 'admin' ? "/admin" : "/dashboard"}
                className="text-[10px] font-black uppercase tracking-widest text-blue-500 border border-blue-500/20 px-4 py-2 rounded-lg bg-blue-500/5 hover:bg-blue-500 hover:text-white transition-all"
              >
                {user.role === 'admin' ? "Portal Admin" : "Meu Painel"}
              </Link>
              <button
                onClick={() => { onLogout(); navigate('/'); }}
                className="text-[10px] font-black text-slate-500 hover:text-red-500 uppercase tracking-widest transition-colors"
              >
                Sair
              </button>
            </div>
          ) : (
            <>
              <Link to="/login" className="text-xs font-black uppercase tracking-widest text-slate-400 hover:text-white transition-colors hidden sm:block">Login</Link>
              <Link to="/cadastro" className="rounded-xl bg-blue-600 px-3 py-2 sm:px-5 sm:py-2.5 text-[10px] font-black uppercase tracking-widest text-white shadow-xl shadow-blue-900/20 hover:bg-blue-500 transition-all active:scale-95 italic whitespace-nowrap">
                Sou Acompanhante
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
