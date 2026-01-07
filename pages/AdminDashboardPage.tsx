
import React, { useState } from 'react';
import { MOCK_MODELS } from '../constants';
import { VerificationStatus, Model } from '../types';

const AdminDashboardPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'verificacoes' | 'modelos' | 'financeiro'>('overview');
  const [models, setModels] = useState<Model[]>(MOCK_MODELS);

  const stats = {
    totalModels: models.length,
    pending: models.filter(m => m.status === VerificationStatus.PENDING).length,
    verified: models.filter(m => m.isVerified).length,
    revenue: "42.800 MT"
  };

  const handleUpdateStatus = (id: string, newStatus: VerificationStatus) => {
    setModels(prev => prev.map(m => m.id === id ? { ...m, status: newStatus, isVerified: newStatus === VerificationStatus.APPROVED } : m));
  };

  return (
    <div className="min-h-screen bg-[#0d1117] flex flex-col md:flex-row">
      {/* Admin Sidebar */}
      <aside className="w-full md:w-64 bg-[#161b22] border-r border-white/5 flex flex-col">
        <div className="p-6 border-b border-white/5 flex items-center gap-3">
          <span className="material-symbols-outlined text-blue-500 filled">shield_person</span>
          <span className="font-black uppercase tracking-tighter text-sm">Painel Admin</span>
        </div>
        
        <nav className="p-4 flex flex-col gap-2">
          {[
            { id: 'overview', icon: 'dashboard', label: 'Visão Geral' },
            { id: 'verificacoes', icon: 'verified_user', label: 'Fila de Verificação' },
            { id: 'modelos', icon: 'group', label: 'Banco de Modelos' },
            { id: 'financeiro', icon: 'payments', label: 'Transações' }
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${
                activeTab === item.id ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'text-slate-400 hover:bg-white/5'
              }`}
            >
              <span className="material-symbols-outlined text-lg">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        <div className="mt-auto p-6 border-t border-white/5">
          <div className="flex items-center gap-3 bg-white/5 p-3 rounded-xl">
            <div className="size-8 rounded-lg bg-blue-500 flex items-center justify-center text-[10px] font-black">SA</div>
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase">Super Admin</span>
              <span className="text-[8px] text-slate-500">Online</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-grow p-6 md:p-10 overflow-y-auto max-h-screen no-scrollbar">
        {activeTab === 'overview' && (
          <div className="space-y-10 animate-in fade-in duration-500">
            <header>
              <h1 className="text-3xl font-black uppercase italic tracking-tighter">Performance da Plataforma</h1>
              <p className="text-slate-500 text-sm">Resumo operacional em tempo real.</p>
            </header>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { label: 'Total Modelos', val: stats.totalModels, icon: 'group', color: 'text-white' },
                { label: 'Aguardando', val: stats.pending, icon: 'pending', color: 'text-amber-500' },
                { label: 'Verificadas', val: stats.verified, icon: 'verified', color: 'text-blue-500' },
                { label: 'Receita Total', val: stats.revenue, icon: 'payments', color: 'text-green-500' }
              ].map(card => (
                <div key={card.label} className="bg-[#161b22] border border-white/5 p-6 rounded-2xl shadow-xl">
                  <span className={`material-symbols-outlined mb-4 ${card.color}`}>{card.icon}</span>
                  <div className="text-2xl font-black">{card.val}</div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mt-1">{card.label}</div>
                </div>
              ))}
            </div>

            {/* Recent Activity */}
            <section className="bg-[#161b22] border border-white/5 rounded-2xl p-8">
              <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-500">history</span>
                Atividade Recente
              </h3>
              <div className="space-y-4">
                {[
                  { user: 'Sarah Jenkins', action: 'Desbloqueio de contato', time: '5 min atrás', val: '+200 MT' },
                  { user: 'Elena R.', action: 'Atualizou fotos de perfil', time: '12 min atrás', val: 'Edit' },
                  { user: 'Marcus J.', action: 'Nova solicitação de verificação', time: '45 min atrás', val: 'New' }
                ].map((act, i) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5">
                    <div className="flex items-center gap-4">
                      <div className="size-10 rounded-full bg-slate-800 flex items-center justify-center text-[10px] font-bold">{act.user[0]}</div>
                      <div>
                        <p className="text-sm font-bold">{act.user}</p>
                        <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">{act.action}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-black text-white">{act.val}</p>
                      <p className="text-[8px] text-slate-600 uppercase font-black">{act.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {activeTab === 'verificacoes' && (
          <div className="animate-in slide-in-from-bottom-4 duration-500 space-y-8">
            <header>
              <h2 className="text-2xl font-black uppercase italic tracking-tighter">Fila de Verificação</h2>
              <p className="text-slate-500 text-sm">Analise identidade e documentos de novos talentos.</p>
            </header>

            <div className="grid grid-cols-1 gap-6">
              {models.filter(m => m.status === VerificationStatus.PENDING || !m.isVerified).map(model => (
                <div key={model.id} className="bg-[#161b22] border border-white/5 rounded-3xl p-6 md:p-8 flex flex-col lg:flex-row gap-8 items-center lg:items-start">
                  <img src={model.profileImage} className="size-40 rounded-2xl object-cover border-4 border-white/5" alt="Profile" />
                  
                  <div className="flex-grow flex flex-col gap-4">
                    <div className="flex flex-col md:flex-row justify-between items-center md:items-start gap-4">
                      <div>
                        <h3 className="text-xl font-black uppercase italic">{model.artisticName}</h3>
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">{model.location} • {model.category}</p>
                      </div>
                      <div className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[10px] font-black uppercase tracking-widest">
                        Aguardando Auditoria
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4 border-y border-white/5">
                       <div className="flex flex-col">
                         <span className="text-[8px] font-black text-slate-600 uppercase">Altura</span>
                         <span className="text-sm font-bold">{model.height || 'N/D'}</span>
                       </div>
                       <div className="flex flex-col">
                         <span className="text-[8px] font-black text-slate-600 uppercase">Idade</span>
                         <span className="text-sm font-bold">{model.age}</span>
                       </div>
                       <div className="flex flex-col">
                         <span className="text-[8px] font-black text-slate-600 uppercase">Status Bio</span>
                         <span className="text-[10px] text-green-500 font-black uppercase">Preenchida</span>
                       </div>
                    </div>

                    <div className="flex items-center gap-4 pt-2">
                       <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-colors">
                         <span className="material-symbols-outlined text-lg">play_circle</span> Ver Vídeo Prova
                       </button>
                       <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-colors">
                         <span className="material-symbols-outlined text-lg">description</span> Ver Documento
                       </button>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 w-full lg:w-48">
                    <button 
                      onClick={() => handleUpdateStatus(model.id, VerificationStatus.APPROVED)}
                      className="w-full py-4 bg-green-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-green-900/20 hover:bg-green-500 transition-all"
                    >
                      Aprovar Perfil
                    </button>
                    <button 
                      onClick={() => handleUpdateStatus(model.id, VerificationStatus.REJECTED)}
                      className="w-full py-4 bg-red-600/10 border border-red-600/20 text-red-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all"
                    >
                      Rejeitar
                    </button>
                  </div>
                </div>
              ))}

              {models.filter(m => m.status === VerificationStatus.PENDING).length === 0 && (
                <div className="py-20 flex flex-col items-center justify-center text-center opacity-40">
                  <span className="material-symbols-outlined text-5xl mb-4">check_circle</span>
                  <h3 className="font-bold">Fila Vazia</h3>
                  <p className="text-xs uppercase font-black tracking-widest">Todos os perfis foram auditados.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'modelos' && (
          <div className="animate-in fade-in duration-500 space-y-8">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <h2 className="text-2xl font-black uppercase italic tracking-tighter">Banco de Talentos</h2>
                <p className="text-slate-500 text-sm">Gestão total de {models.length} perfis cadastrados.</p>
              </div>
              <div className="relative w-full md:w-72">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">search</span>
                <input type="text" placeholder="Buscar por nome..." className="w-full bg-[#161b22] border border-white/10 rounded-xl py-3 pl-12 pr-4 text-xs outline-none focus:ring-1 focus:ring-blue-500 transition-all" />
              </div>
            </header>

            <div className="bg-[#161b22] border border-white/5 rounded-2xl overflow-hidden overflow-x-auto no-scrollbar">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                  <tr className="bg-white/5 border-b border-white/10">
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Talento</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Status</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Localização</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Cadastrado em</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {models.map(model => (
                    <tr key={model.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img src={model.profileImage} className="size-8 rounded-lg object-cover" alt="" />
                          <span className="text-sm font-bold">{model.artisticName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded border ${
                          model.isVerified ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' : 'bg-slate-500/10 text-slate-500 border-slate-500/20'
                        }`}>
                          {model.isVerified ? 'Verificado' : 'Não Verificado'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-400 font-medium">{model.location}</td>
                      <td className="px-6 py-4 text-xs text-slate-500">22/05/2024</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button className="size-8 rounded-lg bg-white/5 flex items-center justify-center hover:bg-white/10 transition-all text-slate-400 hover:text-white">
                            <span className="material-symbols-outlined text-sm">visibility</span>
                          </button>
                          <button className="size-8 rounded-lg bg-white/5 flex items-center justify-center hover:bg-white/10 transition-all text-slate-400 hover:text-white">
                            <span className="material-symbols-outlined text-sm">edit</span>
                          </button>
                          <button className="size-8 rounded-lg bg-red-500/10 flex items-center justify-center hover:bg-red-500 transition-all text-red-500 hover:text-white">
                            <span className="material-symbols-outlined text-sm">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'financeiro' && (
          <div className="animate-in fade-in duration-500 flex flex-col items-center justify-center py-40 opacity-40 text-center">
            <span className="material-symbols-outlined text-6xl mb-4">account_balance_wallet</span>
            <h3 className="font-bold uppercase tracking-widest text-sm">Controle Financeiro</h3>
            <p className="text-xs uppercase font-black tracking-widest mt-2">Módulo em desenvolvimento.</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboardPage;
