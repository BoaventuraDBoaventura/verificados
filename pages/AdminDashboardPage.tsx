
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
    revenue: "42.800 MT",
    growth: "+14%"
  };

  const handleUpdateStatus = (id: string, newStatus: VerificationStatus) => {
    setModels(prev => prev.map(m => m.id === id ? { ...m, status: newStatus, isVerified: newStatus === VerificationStatus.APPROVED } : m));
  };

  return (
    <div className="min-h-screen bg-[#0a0f14] flex flex-col md:flex-row">
      {/* Admin Sidebar - Refined */}
      <aside className="w-full md:w-72 bg-[#0d1218] border-r border-white/5 flex flex-col sticky top-0 h-screen">
        <div className="p-8 mb-4">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-900/40">
              <span className="material-symbols-outlined text-white text-2xl filled">shield_person</span>
            </div>
            <div className="flex flex-col">
              <span className="font-black uppercase tracking-tighter text-base italic">ADMIN</span>
              <span className="text-[9px] font-black text-blue-500 uppercase tracking-[0.2em]">Verificados Hub</span>
            </div>
          </div>
        </div>
        
        <nav className="flex-grow px-4 space-y-2">
          {[
            { id: 'overview', icon: 'grid_view', label: 'Dashboard' },
            { id: 'verificacoes', icon: 'verified_user', label: 'Fila de Verificação', badge: stats.pending },
            { id: 'modelos', icon: 'groups', label: 'Gestão de Modelos' },
            { id: 'financeiro', icon: 'account_balance_wallet', label: 'Financeiro' }
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`w-full flex items-center justify-between px-5 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all group ${
                activeTab === item.id 
                  ? 'bg-blue-600 text-white shadow-xl shadow-blue-900/20' 
                  : 'text-slate-500 hover:bg-white/5 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-4">
                <span className={`material-symbols-outlined text-xl ${activeTab === item.id ? 'filled' : ''}`}>{item.icon}</span>
                {item.label}
              </div>
              {item.badge ? (
                <span className={`px-2 py-0.5 rounded-full text-[9px] ${activeTab === item.id ? 'bg-white text-blue-600' : 'bg-blue-600/10 text-blue-500'}`}>
                  {item.badge}
                </span>
              ) : null}
            </button>
          ))}
        </nav>

        <div className="p-6 mt-auto">
          <div className="p-5 rounded-2xl bg-white/5 border border-white/5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center font-black text-xs">AD</div>
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-wider">Admin Principal</span>
                <div className="flex items-center gap-1.5">
                  <span className="size-1.5 rounded-full bg-green-500 animate-pulse"></span>
                  <span className="text-[8px] text-slate-500 font-bold uppercase">Sessão Ativa</span>
                </div>
              </div>
            </div>
            <button className="w-full py-3 rounded-xl bg-red-500/10 text-red-500 text-[9px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all">
              Encerrar Sessão
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-grow p-6 md:p-12 overflow-y-auto h-screen no-scrollbar">
        
        {/* Header de Contexto */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-black uppercase italic tracking-tighter">
              {activeTab === 'overview' && 'Visão Geral'}
              {activeTab === 'verificacoes' && 'Fila de Auditoria'}
              {activeTab === 'modelos' && 'Base de Talentos'}
              {activeTab === 'financeiro' && 'Fluxo de Caixa'}
            </h1>
            <p className="text-slate-500 text-sm font-medium mt-1">Bem-vindo de volta ao centro de operações.</p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden md:flex flex-col items-end">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Data de Hoje</span>
              <span className="text-sm font-bold">{new Date().toLocaleDateString('pt-MZ', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
            </div>
            <button className="size-12 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center text-slate-400 hover:text-white transition-colors relative">
              <span className="material-symbols-outlined">notifications</span>
              <span className="absolute top-3 right-3 size-2 bg-blue-500 rounded-full ring-4 ring-[#0a0f14]"></span>
            </button>
          </div>
        </div>

        {activeTab === 'overview' && (
          <div className="space-y-12 animate-in fade-in duration-700">
            {/* Stats Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { label: 'Modelos Ativos', val: stats.totalModels, icon: 'groups', color: 'blue', trend: '+5%' },
                { label: 'Pendentes', val: stats.pending, icon: 'hourglass_empty', color: 'amber', trend: '-2%' },
                { label: 'Verificados', val: stats.verified, icon: 'verified', color: 'emerald', trend: '+12%' },
                { label: 'Receita Total', val: stats.revenue, icon: 'payments', color: 'indigo', trend: stats.growth }
              ].map(card => (
                <div key={card.label} className="bg-[#0d1218] border border-white/5 p-8 rounded-[2rem] shadow-2xl group hover:border-blue-500/30 transition-all relative overflow-hidden">
                  <div className={`absolute -right-4 -top-4 size-24 bg-${card.color}-500/5 blur-3xl rounded-full`}></div>
                  <div className="flex items-start justify-between mb-6">
                    <div className={`size-12 rounded-2xl bg-${card.color}-500/10 flex items-center justify-center text-${card.color}-500 group-hover:scale-110 transition-transform`}>
                      <span className="material-symbols-outlined filled">{card.icon}</span>
                    </div>
                    <span className={`text-[10px] font-black px-2 py-1 rounded-lg ${card.trend.startsWith('+') ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                      {card.trend}
                    </span>
                  </div>
                  <div className="text-3xl font-black mb-1">{card.val}</div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">{card.label}</div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Activity Feed */}
              <section className="lg:col-span-8 bg-[#0d1218] border border-white/5 rounded-[2.5rem] p-10 shadow-2xl">
                <div className="flex items-center justify-between mb-10">
                  <h3 className="text-xl font-bold flex items-center gap-3">
                    <span className="material-symbols-outlined text-blue-500">analytics</span>
                    Atividade em Tempo Real
                  </h3>
                  <button className="text-[10px] font-black text-blue-500 uppercase tracking-widest hover:underline">Ver Log Completo</button>
                </div>
                <div className="space-y-6">
                  {[
                    { user: 'Ana Paula', action: 'Completou verificação de vídeo', time: 'Há 4 min', type: 'success' },
                    { user: 'João M.', action: 'Desbloqueou contato de Sarah Jenkins', time: 'Há 15 min', type: 'payment' },
                    { user: 'Equipe Admin', action: 'Novo modelo reprovado (ID #921)', time: 'Há 1h', type: 'danger' },
                    { user: 'Zito F.', action: 'Atualizou fotos de portfólio', time: 'Há 2h', type: 'info' }
                  ].map((act, i) => (
                    <div key={i} className="flex items-center justify-between p-5 rounded-3xl bg-white/[0.02] border border-white/5 group hover:bg-white/[0.05] transition-all">
                      <div className="flex items-center gap-5">
                        <div className="size-12 rounded-2xl bg-[#141a21] flex items-center justify-center font-black text-xs text-slate-400 group-hover:text-blue-500 transition-colors">
                          {act.user.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white mb-0.5">{act.user}</p>
                          <p className="text-[11px] text-slate-500 font-medium">{act.action}</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{act.time}</span>
                    </div>
                  ))}
                </div>
              </section>

              {/* Quick Actions / System Health */}
              <div className="lg:col-span-4 flex flex-col gap-8">
                 <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-blue-900/30">
                    <h4 className="text-lg font-bold mb-4 italic">Monitor de Verificação</h4>
                    <p className="text-sm text-blue-100 mb-8 leading-relaxed">Existem {stats.pending} perfis aguardando sua auditoria para aparecerem na galeria.</p>
                    <button 
                      onClick={() => setActiveTab('verificacoes')}
                      className="w-full py-4 bg-white text-blue-600 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg hover:scale-[1.02] active:scale-95 transition-all"
                    >
                      Auditar Agora
                    </button>
                 </div>

                 <div className="bg-[#0d1218] border border-white/5 rounded-[2.5rem] p-8 shadow-2xl">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-6">Status dos Serviços</h4>
                    <div className="space-y-4">
                      {[
                        { label: 'API Gateway', status: 'Operacional', color: 'emerald' },
                        { label: 'Media Storage', status: 'Operacional', color: 'emerald' },
                        { label: 'Payments (M-Pesa)', status: 'Lento', color: 'amber' }
                      ].map(s => (
                        <div key={s.label} className="flex items-center justify-between py-2">
                          <span className="text-xs font-bold text-slate-400">{s.label}</span>
                          <div className={`flex items-center gap-2 text-[9px] font-black uppercase text-${s.color}-500`}>
                            <span className={`size-1.5 rounded-full bg-${s.color}-500`}></span>
                            {s.status}
                          </div>
                        </div>
                      ))}
                    </div>
                 </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'verificacoes' && (
          <div className="animate-in slide-in-from-bottom-6 duration-700 space-y-10">
            <div className="grid grid-cols-1 gap-8">
              {models.filter(m => m.status === VerificationStatus.PENDING).map(model => (
                <div key={model.id} className="bg-[#0d1218] border border-white/5 rounded-[3rem] p-10 flex flex-col lg:flex-row gap-12 group hover:border-blue-500/20 transition-all shadow-2xl">
                  {/* Lado Esquerdo: Mídia */}
                  <div className="lg:w-72 shrink-0 space-y-4">
                    <div className="aspect-[3/4] rounded-[2rem] overflow-hidden relative border-4 border-white/5">
                      <img src={model.profileImage} className="size-full object-cover" alt="Review" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-6">
                        <button className="w-full py-3 bg-white/10 backdrop-blur-md border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white/20 transition-all flex items-center justify-center gap-2">
                          <span className="material-symbols-outlined text-sm">zoom_in</span>
                          Ampliar Foto
                        </button>
                      </div>
                    </div>
                    <button className="w-full py-5 bg-blue-600/10 border border-blue-600/20 text-blue-500 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all flex items-center justify-center gap-3">
                      <span className="material-symbols-outlined">play_circle</span>
                      Vídeo de Prova
                    </button>
                  </div>
                  
                  {/* Lado Direito: Dados e Ações */}
                  <div className="flex-grow flex flex-col">
                    <div className="flex justify-between items-start mb-10">
                      <div>
                        <h3 className="text-3xl font-black uppercase italic tracking-tighter mb-2">{model.artisticName}</h3>
                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-1.5 text-[10px] font-black text-slate-500 uppercase tracking-widest bg-white/5 px-3 py-1 rounded-full">
                            <span className="material-symbols-outlined text-xs">location_on</span>
                            {model.location}
                          </span>
                          <span className="flex items-center gap-1.5 text-[10px] font-black text-blue-500 uppercase tracking-widest bg-blue-500/5 px-3 py-1 rounded-full border border-blue-500/10">
                            {model.category}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-1">Submetido em</span>
                        <span className="text-sm font-bold text-white">22 Mai, 2024</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 p-8 rounded-[2rem] bg-white/[0.02] border border-white/5 mb-10">
                       <div className="space-y-1">
                         <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Altura</span>
                         <p className="text-lg font-black">{model.height || '1.75m'}</p>
                       </div>
                       <div className="space-y-1">
                         <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Idade</span>
                         <p className="text-lg font-black">{model.age} Anos</p>
                       </div>
                       <div className="space-y-1">
                         <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Cintura</span>
                         <p className="text-lg font-black">{model.waist || '60cm'}</p>
                       </div>
                       <div className="space-y-1">
                         <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Documento</span>
                         <p className="text-[10px] font-black text-emerald-500 uppercase flex items-center gap-1">
                            <span className="material-symbols-outlined text-xs">check_circle</span> Enviado
                         </p>
                       </div>
                    </div>

                    <div className="mt-auto grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <button 
                        onClick={() => handleUpdateStatus(model.id, VerificationStatus.APPROVED)}
                        className="py-5 bg-emerald-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-xl shadow-emerald-900/20 hover:bg-emerald-500 active:scale-95 transition-all flex items-center justify-center gap-2"
                      >
                        <span className="material-symbols-outlined">verified</span>
                        Aprovar e Publicar
                      </button>
                      <button 
                        onClick={() => handleUpdateStatus(model.id, VerificationStatus.REJECTED)}
                        className="py-5 bg-rose-600/10 border border-rose-600/20 text-rose-500 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-rose-600 hover:text-white active:scale-95 transition-all flex items-center justify-center gap-2"
                      >
                        <span className="material-symbols-outlined text-lg">close</span>
                        Rejeitar Perfil
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {models.filter(m => m.status === VerificationStatus.PENDING).length === 0 && (
                <div className="py-32 flex flex-col items-center justify-center text-center">
                  <div className="size-24 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 mb-6">
                    <span className="material-symbols-outlined text-5xl filled">check_circle</span>
                  </div>
                  <h3 className="text-2xl font-black uppercase italic tracking-tighter">Fila Limpa</h3>
                  <p className="text-slate-500 font-medium max-w-xs mt-2">Excelente! Não há modelos aguardando verificação no momento.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'modelos' && (
          <div className="animate-in fade-in duration-700 space-y-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
               <div className="relative flex-grow max-w-xl group">
                 <span className="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors">search</span>
                 <input 
                   type="text" 
                   placeholder="Filtrar por nome, província ou ID..." 
                   className="w-full bg-[#0d1218] border border-white/5 rounded-2xl py-5 pl-14 pr-6 text-xs font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-700" 
                 />
               </div>
               <div className="flex items-center gap-3">
                  <button className="flex items-center gap-2 px-6 py-4 rounded-2xl bg-white/5 border border-white/5 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-all">
                    <span className="material-symbols-outlined text-lg">filter_list</span> Filtrar
                  </button>
                  <button className="flex items-center gap-2 px-6 py-4 rounded-2xl bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest shadow-xl shadow-blue-900/30 hover:bg-blue-500 transition-all">
                    <span className="material-symbols-outlined text-lg">add</span> Novo Perfil
                  </button>
               </div>
            </div>

            <div className="bg-[#0d1218] border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl overflow-x-auto no-scrollbar">
              <table className="w-full text-left border-collapse min-w-[1000px]">
                <thead>
                  <tr className="bg-white/5">
                    <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Talento / ID</th>
                    <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Status Atual</th>
                    <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Localização</th>
                    <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Ficha Técnica</th>
                    <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {models.map(model => (
                    <tr key={model.id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="px-10 py-6">
                        <div className="flex items-center gap-5">
                          <img src={model.profileImage} className="size-12 rounded-xl object-cover ring-2 ring-white/5 group-hover:ring-blue-500/50 transition-all" alt="" />
                          <div className="flex flex-col">
                            <span className="text-sm font-black text-white">{model.artisticName}</span>
                            <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">ID: #MZ-0{model.id}492</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-10 py-6">
                        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-[9px] font-black uppercase tracking-widest ${
                          model.isVerified 
                            ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' 
                            : model.status === VerificationStatus.PENDING 
                              ? 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                              : 'bg-slate-500/10 text-slate-500 border-slate-500/20'
                        }`}>
                          <span className={`size-1.5 rounded-full bg-current ${model.status === VerificationStatus.PENDING ? 'animate-pulse' : ''}`}></span>
                          {model.isVerified ? 'Ativo / Verificado' : model.status}
                        </div>
                      </td>
                      <td className="px-10 py-6">
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-slate-300">{model.location}</span>
                          <span className="text-[10px] font-medium text-slate-600">Moçambique</span>
                        </div>
                      </td>
                      <td className="px-10 py-6">
                         <div className="flex items-center gap-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                           <div className="flex flex-col">
                             <span className="text-slate-700">Alt</span>
                             <span className="text-slate-300">{model.height || '1.75m'}</span>
                           </div>
                           <div className="flex flex-col">
                             <span className="text-slate-700">Cat</span>
                             <span className="text-blue-500">{model.category}</span>
                           </div>
                         </div>
                      </td>
                      <td className="px-10 py-6">
                        <div className="flex items-center justify-end gap-3">
                          <button className="size-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all text-slate-500">
                            <span className="material-symbols-outlined text-lg">visibility</span>
                          </button>
                          <button className="size-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-white/10 transition-all text-slate-500 hover:text-white">
                            <span className="material-symbols-outlined text-lg">edit</span>
                          </button>
                          <button className="size-10 rounded-xl bg-rose-500/5 flex items-center justify-center hover:bg-rose-500 transition-all text-rose-500 hover:text-white">
                            <span className="material-symbols-outlined text-lg">block</span>
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
          <div className="animate-in fade-in duration-700 space-y-10">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
               <div className="lg:col-span-1 bg-[#0d1218] border border-white/5 p-10 rounded-[2.5rem] shadow-2xl flex flex-col justify-center text-center">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4">Ganhos do Mês</span>
                  <div className="text-5xl font-black text-white mb-2 tracking-tighter italic">42.800 <span className="text-blue-500 text-2xl not-italic tracking-normal">MT</span></div>
                  <div className="flex items-center justify-center gap-2 text-emerald-500 text-sm font-bold">
                    <span className="material-symbols-outlined text-sm">trending_up</span>
                    +24% vs mês passado
                  </div>
               </div>
               
               <div className="lg:col-span-2 bg-[#0d1218] border border-white/5 p-10 rounded-[2.5rem] shadow-2xl">
                  <h3 className="text-xl font-bold mb-8">Transações Recentes</h3>
                  <div className="space-y-4">
                    {[
                      { ref: '#TX9201', user: 'Carlos Alberto', method: 'M-Pesa', val: '200 MT', date: 'Hoje, 14:20' },
                      { ref: '#TX9200', user: 'Mariana Z.', method: 'eMola', val: '200 MT', date: 'Hoje, 09:15' },
                      { ref: '#TX9199', user: 'Agência Flash', method: 'M-Pesa', val: '200 MT', date: 'Ontem, 18:40' }
                    ].map(tx => (
                      <div key={tx.ref} className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                        <div className="flex items-center gap-4">
                          <div className={`size-10 rounded-xl flex items-center justify-center font-black text-[8px] uppercase ${tx.method === 'M-Pesa' ? 'bg-rose-600/10 text-rose-500' : 'bg-orange-500/10 text-orange-500'}`}>
                            {tx.method}
                          </div>
                          <div>
                            <p className="text-sm font-bold">{tx.user}</p>
                            <p className="text-[10px] text-slate-500 font-bold uppercase">{tx.ref}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-black text-emerald-500">{tx.val}</p>
                          <p className="text-[9px] text-slate-600 font-black uppercase">{tx.date}</p>
                        </div>
                      </div>
                    ))}
                  </div>
               </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboardPage;
