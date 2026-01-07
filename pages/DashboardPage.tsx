
import React from 'react';
import { Link } from 'react-router-dom';
import { User, VerificationStatus } from '../types';

interface DashboardPageProps {
  user: User;
}

const DashboardPage: React.FC<DashboardPageProps> = ({ user }) => {
  return (
    <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-10">
      <div className="mb-10">
        <h1 className="text-4xl font-black mb-3 leading-tight tracking-tight">Olá, Ana.</h1>
        <p className="text-lg text-slate-400">Estamos analisando seu perfil. Acompanhe o status e complete as etapas pendentes.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 flex flex-col gap-8">
          {/* Status Card */}
          <div className="flex flex-col sm:flex-row items-stretch gap-6 rounded-2xl bg-[#1c2127] border border-white/5 p-6 shadow-xl">
            <div className="flex flex-col justify-center gap-3 flex-1">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-amber-500 text-3xl">pending</span>
                <h3 className="text-xl font-bold">Status: Em Verificação</h3>
              </div>
              <p className="text-sm text-slate-400 leading-relaxed">
                Recebemos seu cadastro completo. Nossa equipe de confiança e segurança está validando suas informações manualmente.
              </p>
              <div className="flex items-center gap-2 text-xs font-bold text-blue-500 uppercase tracking-widest mt-2">
                <span className="material-symbols-outlined text-base">timer</span>
                Prazo estimado: 24h
              </div>
            </div>
            <div className="w-full sm:w-48 h-32 sm:h-auto rounded-xl bg-gradient-to-br from-blue-600/20 to-purple-600/20 flex items-center justify-center border border-white/5">
              <span className="material-symbols-outlined text-4xl opacity-50">verified_user</span>
            </div>
          </div>

          {/* Upload Area */}
          <div className="rounded-2xl bg-[#1c2127] border border-white/5 p-8 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold">Etapa Pendente: Vídeo de Verificação</h3>
              <span className="rounded-full bg-red-500/10 px-3 py-1 text-xs font-bold text-red-500 uppercase">Necessário</span>
            </div>
            
            <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-white/10 bg-[#111418] py-12 px-6 text-center hover:border-blue-500/50 cursor-pointer transition-all group">
               <div className="size-16 rounded-full bg-white/5 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-blue-500/10 transition-all">
                  <span className="material-symbols-outlined text-3xl group-hover:text-blue-500 transition-colors">videocam</span>
               </div>
               <h4 className="text-lg font-bold mb-2">Envie seu Vídeo</h4>
               <p className="text-sm text-slate-500 max-w-sm mb-6">Grave um vídeo de 5s segurando seu documento ao lado do rosto em um ambiente bem iluminado.</p>
               <button className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-bold text-white hover:bg-blue-500 transition-all">
                 <span className="material-symbols-outlined text-lg">cloud_upload</span>
                 Selecionar Arquivo
               </button>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="flex flex-col gap-8">
           {/* Profile Preview */}
           <div className="rounded-2xl bg-[#1c2127] border border-white/5 p-6 shadow-xl">
             <div className="flex items-center gap-4 mb-6">
               <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=128&auto=format&fit=crop" className="size-16 rounded-full object-cover" alt="Avatar" />
               <div>
                 <h3 className="font-bold">Ana Silva</h3>
                 <p className="text-xs text-slate-500 uppercase tracking-widest">ID: #849201</p>
               </div>
             </div>
             <div className="space-y-4 border-t border-white/5 pt-6">
               <div className="flex justify-between text-sm">
                 <span className="text-slate-500">Localização</span>
                 <span className="font-medium">São Paulo, SP</span>
               </div>
               <div className="flex justify-between text-sm">
                 <span className="text-slate-500">Idade</span>
                 <span className="font-medium">24 anos</span>
               </div>
               <div className="flex justify-between text-sm">
                 <span className="text-slate-500">Categoria</span>
                 <span className="font-medium">Comercial</span>
               </div>
             </div>
             <Link 
               to="/dashboard/editar"
               className="w-full mt-6 inline-flex items-center justify-center rounded-lg bg-white/5 py-2.5 text-sm font-bold hover:bg-white/10 transition-colors"
             >
               Editar Perfil
             </Link>
           </div>

           {/* Progress Timeline */}
           <div className="rounded-2xl bg-[#1c2127] border border-white/5 p-6 shadow-xl flex-1">
             <h3 className="text-lg font-bold mb-6">Etapas da Verificação</h3>
             <div className="flex flex-col gap-6 relative">
               <div className="absolute left-[11px] top-2 bottom-2 w-px bg-white/10"></div>
               
               <div className="flex gap-4 relative">
                  <span className="material-symbols-outlined filled text-green-500 text-2xl z-10 bg-[#1c2127]">check_circle</span>
                  <div className="flex flex-col">
                    <p className="text-sm font-bold">Cadastro Inicial</p>
                    <p className="text-xs text-slate-500">Dados enviados</p>
                  </div>
               </div>

               <div className="flex gap-4 relative">
                  <div className="size-6 rounded-full bg-blue-600 flex items-center justify-center z-10">
                    <span className="material-symbols-outlined text-white text-[14px]">videocam</span>
                  </div>
                  <div className="flex flex-col">
                    <p className="text-sm font-bold text-blue-500">Envio de Vídeo</p>
                    <p className="text-xs text-slate-500">Ação necessária agora</p>
                  </div>
               </div>

               <div className="flex gap-4 relative">
                  <span className="material-symbols-outlined text-slate-700 text-2xl z-10 bg-[#1c2127]">lock</span>
                  <div className="flex flex-col">
                    <p className="text-sm font-bold text-slate-600">Aprovação Final</p>
                    <p className="text-xs text-slate-500">Aguardando etapas</p>
                  </div>
               </div>
             </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
