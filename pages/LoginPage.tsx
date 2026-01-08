
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useToast } from '../context/ToastContext';

interface LoginPageProps {
  onLogin: (role: 'model' | 'admin' | any) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Tentar login como admin primeiro
    const { data: adminData, error: adminError } = await supabase
      .from('admins')
      .select('id, email')
      .eq('email', email)
      .eq('password', password)
      .single();

    if (!adminError && adminData) {
      // Login como admin
      const adminUser = {
        id: adminData.id,
        email: adminData.email,
        role: 'admin' as const
      };
      localStorage.setItem('verificados_user', JSON.stringify(adminUser));
      // Passar usuário completo para onLogin
      onLogin(adminUser);
      setLoading(false);
      navigate('/admin');
      return;
    }

    // Se não for admin, tentar como modelo
    const { data: modelData, error: modelError } = await supabase
      .from('models')
      .select('id, email, artistic_name, slug')
      .eq('email', email)
      .eq('password', password)
      .single();

    if (!modelError && modelData) {
      // Login como modelo
      const modelUser = {
        id: modelData.id,
        email: modelData.email,
        role: 'model' as const,
        modelId: modelData.id,
        slug: modelData.slug
      };
      localStorage.setItem('verificados_user', JSON.stringify(modelUser));
      // Passar usuário completo para onLogin
      onLogin(modelUser);
      setLoading(false);
      navigate('/dashboard');
      return;
    }

    // Se não encontrou nem admin nem modelo
    setError('E-mail ou senha incorretos.');
    showToast('Credenciais inválidas. Verifique seu e-mail e senha.', 'error');
    setLoading(false);
  };

  return (
    <div className="flex min-h-[calc(100vh-64px)] w-full">
      <div className="hidden lg:flex lg:w-1/2 relative bg-[#111418] overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=2000&auto=format&fit=crop"
          className="absolute inset-0 h-full w-full object-cover opacity-40 mix-blend-overlay"
          alt="Login background"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#101922] via-transparent to-transparent"></div>
        <div className="relative z-10 flex flex-col justify-end p-12 h-full">
          <p className="text-2xl font-medium leading-relaxed max-w-md">
            "A plataforma mais confiável para gestão de carreiras e verificação de autenticidade no mercado da moda."
          </p>
          <div className="mt-8 flex items-center gap-3">
            <div className="flex -space-x-2">
              {[1, 2, 3].map(i => (
                <img key={i} src={`https://picsum.photos/seed/${i + 10}/32/32`} className="h-8 w-8 rounded-full border-2 border-[#101922]" alt="Avatar" />
              ))}
            </div>
            <span className="text-sm font-medium text-slate-500">Junte-se a +2.000 profissionais</span>
          </div>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 bg-[#101922]">
        <div className="w-full max-w-[440px] flex flex-col gap-8">
          <div className="text-center lg:text-left">
            <h1 className="text-4xl font-black mb-2 uppercase tracking-tighter italic">Entrar</h1>
            <p className="text-slate-400">Gerencie seu perfil e verificações.</p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">E-mail ou Usuário</label>
              <input
                type="text"
                placeholder="exemplo@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="rounded-xl border border-white/10 bg-[#1c2127] p-4 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Senha</label>
                <a href="#" className="text-[10px] font-black text-blue-500 hover:underline uppercase tracking-widest">Esqueceu?</a>
              </div>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="rounded-xl border border-white/10 bg-[#1c2127] p-4 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                required
              />
            </div>

            {error && (
              <p className="text-xs text-red-400 font-bold text-center">
                {error}
              </p>
            )}
            <button
              type="submit"
              disabled={loading}
              className="mt-4 rounded-xl bg-blue-600 py-4 text-sm font-black text-white shadow-2xl shadow-blue-900/40 hover:bg-blue-500 transition-all active:scale-95 uppercase tracking-widest italic disabled:opacity-50"
            >
              {loading ? 'Entrando...' : 'Acessar Painel'}
            </button>
          </form>

          <div className="flex flex-col items-center gap-6 mt-2">
            <p className="text-xs text-slate-400 font-bold">
              Ainda não é verificado?
              <a href="#/cadastro" className="ml-1 text-blue-500 font-black uppercase tracking-widest hover:underline">Cadastre-se</a>
            </p>
            <div className="flex items-center gap-2 text-slate-700 text-xs">
              <span className="material-symbols-outlined text-sm">lock</span>
              <span className="uppercase font-black tracking-[0.2em] text-[8px]">Segurança Verificada</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-white/5 border border-white/5 text-center">
            <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1">Acesso ao Sistema</p>
            <p className="text-[10px] text-slate-500">Utilize o e-mail e senha cadastrados. Modelos acessam o painel pessoal e administradores o painel admin.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
