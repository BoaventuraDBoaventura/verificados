
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MOCK_MODELS } from '../constants';

const PaymentPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const model = MOCK_MODELS.find(m => m.id === id);
  const [method, setMethod] = useState<'mpesa' | 'emola'>('mpesa');
  const [loading, setLoading] = useState(false);

  if (!model) return <div>Modelo não encontrada.</div>;

  const handlePayment = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      alert('Pagamento processado com sucesso! Contato desbloqueado.');
      navigate(`/perfil/${id}`);
    }, 2000);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 md:px-10 flex flex-col items-center justify-center">
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Left: Form */}
        <div className="lg:col-span-8 flex flex-col gap-8">
          <div>
            <h1 className="text-4xl font-black mb-3">Desbloquear Contato</h1>
            <p className="text-slate-400">Finalize o pagamento para ter acesso imediato ao WhatsApp e telefone da modelo.</p>
          </div>

          <section className="rounded-2xl bg-[#1c2127] border border-white/5 p-8 shadow-xl">
             <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
               <span className="material-symbols-outlined text-blue-500">payments</span>
               Método de Pagamento
             </h3>
             <div className="flex flex-col gap-4">
                <label className={`flex items-center justify-between p-5 rounded-xl border cursor-pointer transition-all ${method === 'mpesa' ? 'border-blue-500 bg-blue-500/5' : 'border-white/10 bg-[#111418] hover:border-white/20'}`}>
                  <div className="flex items-center gap-4">
                    <input type="radio" name="pay" checked={method === 'mpesa'} onChange={() => setMethod('mpesa')} className="h-5 w-5 border-white/20 bg-transparent text-blue-600 focus:ring-0" />
                    <div className="flex flex-col">
                      <span className="font-bold">M-Pesa</span>
                      <span className="text-xs text-slate-500">Vodacom</span>
                    </div>
                  </div>
                  <div className="rounded bg-red-600 px-2 py-1 text-[10px] font-bold text-white uppercase tracking-widest">M-Pesa</div>
                </label>

                <label className={`flex items-center justify-between p-5 rounded-xl border cursor-pointer transition-all ${method === 'emola' ? 'border-blue-500 bg-blue-500/5' : 'border-white/10 bg-[#111418] hover:border-white/20'}`}>
                  <div className="flex items-center gap-4">
                    <input type="radio" name="pay" checked={method === 'emola'} onChange={() => setMethod('emola')} className="h-5 w-5 border-white/20 bg-transparent text-blue-600 focus:ring-0" />
                    <div className="flex flex-col">
                      <span className="font-bold">eMola</span>
                      <span className="text-xs text-slate-500">Movitel</span>
                    </div>
                  </div>
                  <div className="rounded bg-orange-500 px-2 py-1 text-[10px] font-bold text-white uppercase tracking-widest">eMola</div>
                </label>
             </div>
          </section>

          <section className="rounded-2xl bg-[#1c2127] border border-white/5 p-8 shadow-xl flex flex-col gap-6">
             <div className="flex flex-col gap-4">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Número de Telefone</label>
                <div className="relative">
                   <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">call</span>
                   <input type="tel" placeholder="84 123 4567" className="w-full rounded-lg border border-white/10 bg-[#111418] p-4 pl-12 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
                </div>
             </div>

             <div className="rounded-xl bg-blue-500/5 border border-blue-500/10 p-5 flex gap-4">
                <span className="material-symbols-outlined text-blue-500">info</span>
                <div className="text-sm">
                   <p className="font-bold text-white mb-1">Instruções:</p>
                   <p className="text-slate-400 leading-relaxed">Ao confirmar, você receberá um prompt no seu celular. Insira seu PIN para autorizar a transação de <span className="text-white font-bold">200 MT</span>.</p>
                </div>
             </div>

             <button 
                onClick={handlePayment}
                disabled={loading}
                className="w-full rounded-xl bg-blue-600 py-4 text-lg font-bold text-white shadow-xl shadow-blue-500/30 hover:bg-blue-500 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? 'Processando...' : (
                  <>
                    Confirmar e Pagar 200 MT
                    <span className="material-symbols-outlined text-lg">lock</span>
                  </>
                )}
             </button>

             <div className="flex justify-center items-center gap-2 text-[10px] text-slate-600 font-bold uppercase tracking-widest">
               <span className="material-symbols-outlined text-sm">verified_user</span>
               Pagamento 100% Seguro
             </div>
          </section>
        </div>

        {/* Right: Summary */}
        <div className="lg:col-span-4 flex flex-col gap-6">
           <div className="sticky top-24 flex flex-col gap-6">
              <h3 className="text-lg font-bold">Resumo do Pedido</h3>
              <div className="rounded-2xl bg-[#1c2127] border border-white/5 overflow-hidden shadow-xl">
                 <div className="relative h-40">
                    <img src={model.profileImage} className="h-full w-full object-cover" alt="Model" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1c2127] to-transparent"></div>
                    <div className="absolute bottom-4 left-4">
                       <p className="text-lg font-bold">@{model.artisticName.replace(' ', '')}</p>
                       <span className="flex items-center gap-1 text-[10px] font-bold text-blue-500 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20 w-fit">
                         <span className="material-symbols-outlined text-[12px] filled">verified</span> Verificada
                       </span>
                    </div>
                 </div>

                 <div className="p-6 flex flex-col gap-4">
                    <div className="flex justify-between items-center pb-4 border-b border-white/5">
                       <div className="flex flex-col">
                          <span className="text-sm font-bold">Desbloqueio de Contato</span>
                          <span className="text-xs text-slate-500">Acesso vitalício</span>
                       </div>
                       <span className="font-bold text-white">200 MT</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                       <span className="text-slate-500">Taxa de serviço</span>
                       <span className="text-slate-500">0 MT</span>
                    </div>
                    <div className="flex justify-between items-end pt-4">
                       <span className="font-bold text-slate-400">Total</span>
                       <span className="text-2xl font-black text-blue-500">200 MT</span>
                    </div>
                 </div>

                 <div className="bg-[#111418] p-5 border-t border-white/5">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-3">Incluído:</p>
                    <ul className="flex flex-col gap-2">
                       {['Número de WhatsApp', 'Telefone para ligações', 'Redes sociais'].map(item => (
                         <li key={item} className="flex items-center gap-2 text-xs text-slate-300">
                           <span className="material-symbols-outlined text-green-500 text-sm">check_circle</span>
                           {item}
                         </li>
                       ))}
                    </ul>
                 </div>
              </div>
              <p className="text-center text-xs text-slate-600 hover:text-white transition-colors cursor-pointer">Termos e Condições</p>
           </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
