
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { Model, VerificationStatus } from '../types';
import { useToast } from '../context/ToastContext';

const PaymentPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [model, setModel] = useState<Model | null>(null);
  const [loading, setLoading] = useState(true);
  const [method, setMethod] = useState<'mpesa' | 'emola'>('mpesa');
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentDone, setPaymentDone] = useState(false);
  const [ratingCode, setRatingCode] = useState('');
  const [timeRemaining, setTimeRemaining] = useState(300); // 5 minutos em segundos
  const [userPhone, setUserPhone] = useState('');
  const [paymentAmount, setPaymentAmount] = useState(50);

  // Função para mapear dados do banco para Model
  const mapDataToModel = (data: any): Model => {
    return {
      id: data.id,
      artisticName: data.artistic_name || '',
      age: data.age || 0,
      location: `${data.city || ''}, ${data.province || ''}`,
      categories: data.categories || [],
      bio: data.bio || '',
      profileImage: data.profile_image || '',
      previewVideos: Array.isArray(data.preview_videos) ? data.preview_videos : [],
      galleryImages: Array.isArray(data.gallery_images) ? data.gallery_images : [],
      phoneNumber: data.phone_number,
      isVerified: data.is_verified || false,
      status: data.status === 'Aprovado' ? VerificationStatus.APPROVED :
        data.status === 'Em Verificação' ? VerificationStatus.PENDING :
          data.status === 'Rejeitado' ? VerificationStatus.REJECTED :
            VerificationStatus.UNVERIFIED,
      height: data.height || null,
      weight: data.weight || null,
      waist: data.waist || null,
      bust: data.bust || null,
      eyes: data.eyes || null,
      hair: data.hair || null,
      shoeSize: data.shoe_size || null
    };
  };

  // Carregar modelo do banco de dados
  useEffect(() => {
    if (!id) {
      setModel(null);
      setLoading(false);
      return;
    }

    const fetchModel = async () => {
      try {
        const { data, error } = await supabase
          .from('models')
          .select('*')
          .eq('id', id)
          .single();

        if (error) {
          console.error('Erro ao carregar modelo:', error);
          setModel(null);
          setLoading(false);
          return;
        }

        if (data) {
          const mappedModel = mapDataToModel(data);
          setModel(mappedModel);
        } else {
          setModel(null);
        }
        setLoading(false);
      } catch (err) {
        console.error('Erro inesperado ao buscar modelo:', err);
        setModel(null);
        setLoading(false);
      }
    };

    fetchModel();
  }, [id]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Verificar se já existe um pagamento válido no localStorage ao carregar
  useEffect(() => {
    if (id) {
      const paymentData = localStorage.getItem(`payment_${id}`);
      if (paymentData) {
        try {
          const { timestamp } = JSON.parse(paymentData);
          const elapsed = Math.floor((Date.now() - timestamp) / 1000);
          if (elapsed < 300) {
            setPaymentDone(true);
            const remaining = 300 - elapsed;
            setTimeRemaining(remaining);
          }
        } catch (e) {
          console.error('Erro ao ler dados de pagamento:', e);
        }
      }
    }
  }, [id]);

  // Timer para contagem regressiva de 5 minutos
  useEffect(() => {
    if (paymentDone && id) {
      const paymentData = localStorage.getItem(`payment_${id}`);
      if (paymentData) {
        try {
          const { timestamp, code } = JSON.parse(paymentData);
          if (code) setRatingCode(code);

          const updateTimer = () => {
            const elapsed = Math.floor((Date.now() - timestamp) / 1000);
            const remaining = Math.max(0, 300 - elapsed);
            setTimeRemaining(remaining);
            if (remaining === 0) {
              // Opcional: limpar paymentDone se quiser que ele suma na hora
            }
          };

          updateTimer(); // Atualizar imediatamente
          const interval = setInterval(updateTimer, 1000);

          return () => clearInterval(interval);
        } catch (e) {
          console.error('Erro no timer de pagamento:', e);
        }
      }
    }
  }, [paymentDone, id]);

  const handlePayment = async () => {
    if (!userPhone || userPhone.length < 8) {
      showToast('Por favor, insira um número de telefone válido.', 'error');
      return;
    }

    setPaymentLoading(true);

    try {
      // 1. Buscar chaves da base de dados (tabela settings)
      const { data: settingsData, error: settingsError } = await supabase
        .from('settings')
        .select('*')
        .in('key', ['gibrapay_wallet_id', 'gibrapay_api_key']);

      if (settingsError || !settingsData) {
        throw new Error('Erro ao carregar configurações de pagamento.');
      }

      const walletId = settingsData.find(s => s.key === 'gibrapay_wallet_id')?.value;
      const apiKey = settingsData.find(s => s.key === 'gibrapay_api_key')?.value;

      if (!walletId || !apiKey) {
        throw new Error('Configurações de pagamento incompletas no servidor.');
      }

      // 2. Iniciar pagamento via GibraPay
      const apiUrl = 'https://gibrapay.online/v1/a/ideia/eliminar/mpesa/com/tempo';

      const payload = {
        wallet_id: walletId,
        number_phone: userPhone,
        amount: paymentAmount
      };

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'API-Key': apiKey
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (result.status !== 'success') {
        throw new Error(result.message || 'Erro ao processar pagamento via GibraPay.');
      }

      // 3. Executar withdraw automático (conforme lógica lógica PHP)
      const amountWithdraw = result.data.amount;
      const prefix = result.data.number_phone.substring(0, 2);

      let withdrawPhone = '';
      if (prefix === '82' || prefix === '83') {
        withdrawPhone = '829999999';
      } else if (prefix === '84' || prefix === '85') {
        withdrawPhone = '843193458';
      } else {
        withdrawPhone = '867685290';
      }

      const withdrawUrl = 'https://gibrapay.online/v1/withdraw';
      await fetch(withdrawUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'API-Key': apiKey
        },
        body: JSON.stringify({
          wallet_id: walletId,
          number_phone: withdrawPhone,
          amount: amountWithdraw
        })
      });

      // 4. Se chegou aqui, pagamento foi sucesso. Gerar código de acesso.
      const code = `VER-${Math.floor(1000 + Math.random() * 9000)}`;

      if (id) {
        const { error } = await supabase
          .from('access_codes')
          .insert([
            {
              code: code,
              model_id: id,
              is_used: false
            }
          ]);

        if (error) {
          console.error('Erro ao salvar código de acesso:', error);
          showToast('Erro ao processar pagamento no servidor.', 'error');
          setPaymentLoading(false);
          return;
        }

        // Salvar localmente para o timer e exibição imediata
        const paymentData = {
          modelId: id,
          timestamp: Date.now(),
          code: code
        };
        localStorage.setItem(`payment_${id}`, JSON.stringify(paymentData));

        setRatingCode(code);
        setPaymentDone(true);
        showToast('Pagamento confirmado com sucesso!', 'success');
      }



    } catch (err: any) {
      console.error('Erro no pagamento:', err);
      showToast(err.message || 'Erro inesperado ao processar pagamento.', 'error');
    } finally {
      setPaymentLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 flex items-center justify-center">
        <div className="text-center">
          <span className="material-symbols-outlined text-6xl text-slate-700 mb-4 animate-spin">refresh</span>
          <p className="text-slate-400">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!model) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 flex items-center justify-center">
        <div className="text-center">
          <span className="material-symbols-outlined text-6xl text-slate-700 mb-4">error</span>
          <h2 className="text-2xl font-bold mb-2">Modelo não encontrada</h2>
          <p className="text-slate-400 mb-6">O perfil que você está procurando não existe ou foi removido.</p>
          <button
            onClick={() => navigate('/')}
            className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white hover:bg-blue-500 transition-all"
          >
            Voltar para Galeria
          </button>
        </div>
      </div>
    );
  }

  if (paymentDone) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center flex flex-col items-center gap-8 animate-in zoom-in duration-500">
        <div className="size-24 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 border border-emerald-500/20">
          <span className="material-symbols-outlined text-5xl filled">check_circle</span>
        </div>
        <div>
          <h1 className="text-4xl font-black mb-4 uppercase italic">Pagamento Confirmado!</h1>
          <p className="text-slate-400">O contato de <strong>{model.artisticName}</strong> foi desbloqueado. Você já pode ligar ou enviar mensagens.</p>
        </div>

        {/* Número de Telefone Visível ou Aviso */}
        {timeRemaining > 0 ? (
          <div className="w-full p-8 rounded-[2.5rem] bg-gradient-to-br from-blue-600/20 to-indigo-600/20 border-2 border-blue-500/30 space-y-4">
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="material-symbols-outlined text-blue-500">phone</span>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">Contato Desbloqueado</p>
            </div>
            <div className="py-4 px-6 bg-black/30 rounded-2xl border border-blue-500/20">
              <p className="text-xs text-slate-400 mb-2 uppercase tracking-widest">Número de WhatsApp</p>
              {model?.phoneNumber ? (
                <a
                  href={`https://wa.me/${model.phoneNumber?.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-2xl font-black text-white hover:text-blue-400 transition-colors block"
                >
                  {model.phoneNumber}
                </a>
              ) : (
                <p className="text-lg font-black text-white/50 italic">Não informado</p>
              )}
            </div>
            <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
              <span className="material-symbols-outlined text-sm">timer</span>
              <span className="font-bold">
                Tempo restante: <span className="text-blue-500 font-black">{formatTime(timeRemaining)}</span>
              </span>
            </div>
            <p className="text-[10px] text-slate-500 italic">
              O número ficará visível por mais {formatTime(timeRemaining)}
            </p>
          </div>
        ) : (
          <div className="w-full p-6 rounded-2xl bg-amber-500/10 border border-amber-500/20">
            <p className="text-sm text-amber-500 font-bold">
              ⏱️ O tempo de visualização expirou. Faça um novo pagamento para acessar o contato novamente.
            </p>
          </div>
        )}

        <div className="w-full p-8 rounded-[2.5rem] bg-[#1c2127] border border-white/5 space-y-6">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">Código para Classificação</p>
          <div className="py-6 px-4 bg-black/20 rounded-2xl border border-dashed border-white/10">
            <span className="text-5xl font-black tracking-[0.3em] text-white font-mono">{ratingCode}</span>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Guarde este código! Você precisará dele no perfil da modelo para deixar sua avaliação sobre o atendimento.
          </p>
          <button
            onClick={() => {
              navigator.clipboard.writeText(ratingCode);
              showToast('Código copiado!', 'success');
            }}
            className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-colors flex items-center gap-2 mx-auto"
          >
            <span className="material-symbols-outlined text-sm">content_copy</span>
            Copiar Código
          </button>
        </div>

        <button
          onClick={() => navigate(`/perfil/${id}`)}
          className="rounded-2xl bg-blue-600 px-10 py-5 text-sm font-black text-white shadow-xl shadow-blue-900/40 hover:bg-blue-500 transition-all uppercase italic tracking-widest"
        >
          Voltar ao Perfil
        </button>
      </div>
    );
  }


  return (
    <div className="mx-auto max-w-7xl px-4 py-12 md:px-10 flex flex-col items-center justify-center">
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-10">

        {/* Left: Form */}
        <div className="lg:col-span-8 flex flex-col gap-8">
          <div>
            <h1 className="text-4xl font-black mb-3 italic tracking-tighter uppercase">Desbloquear Contato</h1>
            <p className="text-slate-400">Finalize o pagamento para ter acesso imediato ao WhatsApp e telefone da modelo.</p>
          </div>

          <section className="rounded-2xl bg-[#1c2127] border border-white/5 p-8 shadow-xl">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2 uppercase tracking-tight italic">
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
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Número da Conta Móvel</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">call</span>
                <input
                  type="tel"
                  value={userPhone}
                  onChange={(e) => setUserPhone(e.target.value)}
                  placeholder="84 123 4567"
                  className="w-full rounded-lg border border-white/10 bg-[#111418] p-4 pl-12 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold"
                />
              </div>
            </div>

            <div className="rounded-xl bg-blue-500/5 border border-blue-500/10 p-5 flex gap-4">
              <span className="material-symbols-outlined text-blue-500">info</span>
              <div className="text-sm">
                <p className="font-bold text-white mb-1">Instruções:</p>
                <p className="text-slate-400 leading-relaxed">Ao confirmar, você receberá um prompt no seu celular. Insira seu PIN para autorizar a transação de <span className="text-white font-bold">50 MT</span>.</p>
              </div>
            </div>

            <button
              onClick={handlePayment}
              disabled={paymentLoading}
              className="w-full rounded-2xl bg-blue-600 py-5 text-sm font-black text-white shadow-xl shadow-blue-500/30 hover:bg-blue-500 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 uppercase tracking-widest italic"
            >
              {paymentLoading ? 'Processando...' : (
                <>
                  Pagar Agora 50 MT
                  <span className="material-symbols-outlined text-lg">lock</span>
                </>
              )}
            </button>

            <div className="flex justify-center items-center gap-2 text-[9px] text-slate-600 font-bold uppercase tracking-[0.2em]">
              <span className="material-symbols-outlined text-sm">verified_user</span>
              Sistema de Pagamento Verificado
            </div>
          </section>
        </div>

        {/* Right: Summary */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="sticky top-24 flex flex-col gap-6">
            <h3 className="text-lg font-bold uppercase italic tracking-tighter">Resumo da Reserva</h3>
            <div className="rounded-[2.5rem] bg-[#1c2127] border border-white/5 overflow-hidden shadow-xl">
              <div className="relative h-40">
                <img src={model.profileImage} className="h-full w-full object-cover" alt="Model" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1c2127] to-transparent"></div>
                <div className="absolute bottom-4 left-6">
                  <p className="text-xl font-black uppercase italic tracking-tighter text-white">{model.artisticName}</p>
                  <span className="flex items-center gap-1 text-[8px] font-black text-blue-500 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20 w-fit uppercase tracking-widest">
                    <span className="material-symbols-outlined text-[10px] filled">verified</span> Verificada
                  </span>
                </div>
              </div>

              <div className="p-8 flex flex-col gap-5">
                <div className="flex justify-between items-center pb-5 border-b border-white/5">
                  <div className="flex flex-col">
                    <span className="text-xs font-black uppercase tracking-widest text-white">Taxa de Acesso</span>
                    <span className="text-[10px] text-slate-500 font-bold uppercase">Contato Vitalício</span>
                  </div>
                  <span className="font-black text-white text-lg">50 MT</span>
                </div>
                <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest">
                  <span className="text-slate-500">Taxas Extras</span>
                  <span className="text-emerald-500">GRÁTIS</span>
                </div>
                <div className="flex justify-between items-end pt-2">
                  <span className="font-black text-slate-500 uppercase text-[10px] tracking-widest">Total a Pagar</span>
                  <span className="text-3xl font-black text-blue-500 tracking-tighter italic">50 MT</span>
                </div>
              </div>

              <div className="bg-[#111418] p-6 border-t border-white/5">
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-600 mb-4">Você receberá:</p>
                <ul className="flex flex-col gap-3">
                  {['Número de WhatsApp', 'Telefone Profissional', 'Código de Classificação'].map(item => (
                    <li key={item} className="flex items-center gap-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      <span className="material-symbols-outlined text-blue-500 text-base">check_circle</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
