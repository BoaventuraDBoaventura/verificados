
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MOZAMBIQUE_PROVINCES } from '../constants';

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigate('/login');
    }, 1500);
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 md:py-20">
      <div className="mb-10 text-center md:text-left">
        <h1 className="text-4xl font-black tracking-tight mb-4">Cadastro de Modelo</h1>
        <p className="text-lg text-slate-400">Junte-se à nossa plataforma exclusiva e inicie seu processo de verificação profissional.</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-10">
        <section className="rounded-2xl bg-[#1c2127] p-6 md:p-10 border border-white/5 shadow-xl">
          <h2 className="text-xl font-bold border-b border-white/5 pb-4 mb-6 flex items-center gap-2">
            <span className="material-symbols-outlined text-blue-500">person</span>
            Dados Pessoais
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            <div className="md:col-span-8 flex flex-col gap-2">
              <label className="text-sm font-bold text-slate-300">Nome Artístico</label>
              <input type="text" placeholder="Ex: Ana Silva" className="rounded-lg border border-white/10 bg-[#111418] p-4 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all" required />
            </div>
            <div className="md:col-span-4 flex flex-col gap-2">
              <label className="text-sm font-bold text-slate-300">Idade</label>
              <input type="number" placeholder="Ex: 25" className="rounded-lg border border-white/10 bg-[#111418] p-4 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all" required />
            </div>
            
            {/* Província de Moçambique */}
            <div className="md:col-span-6 flex flex-col gap-2">
              <label className="text-sm font-bold text-slate-300">Província</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">expand_more</span>
                <select 
                  className="w-full appearance-none rounded-lg border border-white/10 bg-[#111418] p-4 pr-12 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all cursor-pointer" 
                  required
                >
                  <option value="" disabled selected>Selecionar Província</option>
                  {MOZAMBIQUE_PROVINCES.map(prov => (
                    <option key={prov} value={prov} className="bg-[#1c2127]">{prov}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Cidade/Distrito */}
            <div className="md:col-span-6 flex flex-col gap-2">
              <label className="text-sm font-bold text-slate-300">Cidade / Distrito</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-slate-500">location_on</span>
                <input type="text" placeholder="Ex: Maputo, Matola, Beira" className="w-full rounded-lg border border-white/10 bg-[#111418] p-4 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all" required />
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-2xl bg-[#1c2127] p-6 md:p-10 border border-white/5 shadow-xl">
          <h2 className="text-xl font-bold border-b border-white/5 pb-4 mb-6 flex items-center gap-2">
            <span className="material-symbols-outlined text-blue-500">lock_person</span>
            Contato Privado
          </h2>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-slate-300">WhatsApp / Celular</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-slate-500">lock</span>
              <input type="tel" placeholder="(+258) 00 000 0000" className="w-full rounded-lg border border-white/10 bg-[#111418] p-4 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all" required />
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
              <span className="material-symbols-outlined text-sm">visibility_off</span>
              Este número não será exibido publicamente no seu perfil.
            </div>
          </div>
        </section>

        <section className="rounded-2xl bg-[#1c2127] p-6 md:p-10 border border-white/5 shadow-xl">
          <h2 className="text-xl font-bold border-b border-white/5 pb-4 mb-6 flex items-center gap-2">
            <span className="material-symbols-outlined text-blue-500">upload_file</span>
            Mídia e Verificação
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex flex-col gap-4">
              <label className="text-sm font-bold text-slate-300">Foto de Perfil</label>
              <div className="flex flex-col items-center justify-center h-48 rounded-xl border-2 border-dashed border-white/10 bg-[#111418] hover:border-blue-500/50 cursor-pointer transition-all group relative overflow-hidden">
                <span className="material-symbols-outlined text-3xl mb-2 group-hover:scale-110 transition-transform">add_a_photo</span>
                <span className="text-sm font-bold">Clique para enviar foto</span>
                <span className="text-[10px] text-slate-500 mt-1 uppercase">JPG ou PNG (Max 5MB)</span>
                <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" />
              </div>
            </div>
            <div className="flex flex-col gap-4">
              <label className="text-sm font-bold text-slate-300">Vídeo de Apresentação</label>
              <div className="flex flex-col items-center justify-center h-48 rounded-xl border-2 border-dashed border-white/10 bg-[#111418] hover:border-blue-500/50 cursor-pointer transition-all group relative overflow-hidden">
                <span className="material-symbols-outlined text-3xl mb-2 group-hover:scale-110 transition-transform">videocam</span>
                <span className="text-sm font-bold">Carregar vídeo prévia</span>
                <span className="text-[10px] text-slate-500 mt-1 uppercase">MP4 ou MOV (Max 30MB)</span>
                <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept="video/*" />
              </div>
            </div>
          </div>
        </section>

        <section className="flex flex-col gap-6">
          <div className="flex flex-col gap-4">
            <label className="flex items-start gap-3 cursor-pointer group">
              <input type="checkbox" className="mt-1 h-5 w-5 rounded border-white/10 bg-[#1c2127] text-blue-600 focus:ring-0" required />
              <span className="text-sm text-slate-400 group-hover:text-white transition-colors">Declaro que li e aceito os <a href="#" className="text-blue-500 hover:underline">Termos de Uso</a> da plataforma.</span>
            </label>
            <label className="flex items-start gap-3 cursor-pointer group">
              <input type="checkbox" className="mt-1 h-5 w-5 rounded border-white/10 bg-[#1c2127] text-blue-600 focus:ring-0" required />
              <span className="text-sm text-slate-400 group-hover:text-white transition-colors">Concordo com a <a href="#" className="text-blue-500 hover:underline">Política de Privacidade</a> e o tratamento de dados.</span>
            </label>
          </div>
          
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-6 border-t border-white/5">
            <div className="flex items-center gap-2 text-slate-500 text-sm">
              <span className="material-symbols-outlined">verified_user</span>
              <span className="font-bold uppercase tracking-widest text-[10px]">Ambiente Seguro</span>
            </div>
            <button 
              type="submit" 
              disabled={loading}
              className="w-full md:w-auto min-w-[240px] rounded-xl bg-blue-600 py-4 text-lg font-bold text-white shadow-xl shadow-blue-900/40 hover:bg-blue-500 transition-all active:scale-95 disabled:opacity-50"
            >
              {loading ? 'Processando...' : 'Enviar Cadastro'}
            </button>
          </div>
        </section>
      </form>
    </div>
  );
};

export default RegisterPage;
