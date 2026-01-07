
import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MOCK_MODELS } from '../constants';

const ProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const model = MOCK_MODELS.find(m => m.id === id);
  const [activeTab, setActiveTab] = useState<'fotos' | 'videos' | 'detalhes' | 'avaliacoes'>('fotos');
  
  // Rating logic states
  const [ratingCodeInput, setRatingCodeInput] = useState('');
  const [isRatingUnlocked, setIsRatingUnlocked] = useState(false);
  const [ratingError, setRatingError] = useState('');
  const [userRating, setUserRating] = useState(0);
  const [userComment, setUserComment] = useState('');
  const [hasSubmittedRating, setHasSubmittedRating] = useState(false);

  if (!model) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-10 text-center">
        <span className="material-symbols-outlined text-6xl text-slate-700 mb-4">person_off</span>
        <h2 className="text-2xl font-bold mb-2">Modelo não encontrada</h2>
        <Link to="/" className="text-blue-500 hover:underline">Voltar para a galeria</Link>
      </div>
    );
  }

  const handleValidateCode = () => {
    // Basic logic: any code starting with VER- is considered valid for demo
    if (ratingCodeInput.toUpperCase().startsWith('VER-')) {
      setIsRatingUnlocked(true);
      setRatingError('');
    } else {
      setRatingError('Código inválido. Verifique se digitou corretamente.');
    }
  };

  const handleSubmitRating = (e: React.FormEvent) => {
    e.preventDefault();
    if (userRating === 0) return alert('Por favor, selecione uma nota.');
    setHasSubmittedRating(true);
  };

  return (
    <div className="bg-[#101922] min-h-screen pb-20">
      
      {/* Refined Hero Header Section */}
      <section className="relative pt-8 pb-12 px-4 overflow-hidden bg-gradient-to-b from-blue-600/5 to-transparent">
        {/* Background Decoration */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[400px] bg-blue-600/5 blur-[120px] rounded-full pointer-events-none"></div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col lg:flex-row gap-10 items-center">
            
            {/* Profile Photo Card */}
            <div className="w-full max-w-[320px] shrink-0">
              <div className="aspect-[3/4] rounded-[2.5rem] overflow-hidden border-4 border-white/5 shadow-2xl relative group">
                <img 
                  src={model.profileImage} 
                  className="w-full h-full object-cover" 
                  alt={model.artisticName} 
                />
                <div className="absolute top-4 right-4">
                   <div className="size-10 rounded-full bg-white/10 backdrop-blur-md border border-white/10 flex items-center justify-center">
                      <span className="material-symbols-outlined text-white text-xl">zoom_in</span>
                   </div>
                </div>
              </div>
            </div>

            {/* Profile Essential Info - Centered Vertically */}
            <div className="flex-grow flex flex-col gap-6 w-full text-center lg:text-left">
              <div className="flex flex-col gap-4">
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4">
                  <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase italic">{model.artisticName}</h1>
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20">
                    <span className="material-symbols-outlined filled text-blue-500 text-lg">verified</span>
                    <span className="text-[10px] font-black uppercase tracking-widest text-blue-500">Verificado</span>
                  </div>
                </div>
                
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4">
                  <span className="flex items-center gap-1.5 text-slate-400 text-sm font-bold uppercase tracking-widest">
                    <span className="material-symbols-outlined text-blue-500 text-sm">location_on</span>
                    {model.location}
                  </span>
                  <div className="h-4 w-px bg-white/10 hidden md:block"></div>
                  <div className="flex flex-wrap justify-center lg:justify-start gap-2">
                    {model.categories.map(cat => (
                      <span key={cat} className="px-3 py-1 rounded-lg bg-white/5 border border-white/5 text-[10px] font-black uppercase tracking-widest text-slate-300">
                        {cat}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 mt-2">
                <Link 
                  to={`/pagamento/${model.id}`}
                  className="flex items-center gap-3 rounded-2xl bg-blue-600 px-8 py-4 font-black text-white shadow-xl shadow-blue-900/40 hover:bg-blue-500 transition-all active:scale-95 uppercase tracking-widest italic"
                >
                  <span className="material-symbols-outlined">chat_bubble</span>
                  Contratar Agora
                </Link>
                <div className="flex gap-2">
                  <button className="size-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all text-slate-400 hover:text-white" title="Compartilhar Perfil">
                    <span className="material-symbols-outlined">share</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 md:px-12 grid grid-cols-1 lg:grid-cols-12 gap-12 mt-4">
        
        {/* Left Column: Content Explorer */}
        <div className="lg:col-span-8 flex flex-col gap-10">
          
          {/* Main Content Tabs */}
          <div className="flex border-b border-white/10 gap-8 overflow-x-auto no-scrollbar">
            {[
              { id: 'fotos', label: 'Imagens', icon: 'photo_library' },
              { id: 'videos', label: 'Vídeos', icon: 'videocam' },
              { id: 'detalhes', label: 'Sobre & Medidas', icon: 'straighten' },
              { id: 'avaliacoes', label: 'Avaliações', icon: 'stars' }
            ].map(tab => (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`pb-4 text-[11px] font-black uppercase tracking-[0.2em] transition-all relative flex items-center gap-2 whitespace-nowrap ${
                  activeTab === tab.id ? 'text-white' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                <span className={`material-symbols-outlined text-base ${activeTab === tab.id ? 'text-blue-500' : 'text-slate-600'}`}>
                  {tab.icon}
                </span>
                {tab.label}
                {activeTab === tab.id && <div className="absolute bottom-0 left-0 w-full h-1 bg-blue-500 rounded-full animate-in fade-in zoom-in duration-300"></div>}
              </button>
            ))}
          </div>

          {/* Conditional Content Rendering */}
          <div className="min-h-[400px]">
            {activeTab === 'fotos' && (
              <div className="animate-in fade-in duration-500 space-y-8">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 auto-rows-[250px] md:auto-rows-[350px]">
                  <div className="col-span-2 row-span-2 rounded-[2rem] overflow-hidden group relative border border-white/5">
                    <img src={model.galleryImages[0] || model.profileImage} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-1000" alt="Showcase" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-8 opacity-0 group-hover:opacity-100 transition-opacity">
                       <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white">Full Gallery Experience</span>
                    </div>
                  </div>
                  {model.galleryImages.slice(1, 10).map((img, i) => (
                    <div key={i} className="rounded-[2rem] overflow-hidden group border border-white/5">
                      <img src={img} className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-700" alt={`Portfolio ${i}`} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'videos' && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                  {[1, 2, 3, 4, 5, 6].map(i => (
                    <div key={i} className="aspect-[9/16] rounded-[2rem] bg-[#1c2127] relative overflow-hidden group border border-white/5 cursor-pointer">
                      <img 
                        src={`https://picsum.photos/seed/v${i + 40}/400/711`} 
                        className="h-full w-full object-cover opacity-60 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700" 
                        alt="Casting Video" 
                      />
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                        <div className="size-16 rounded-full bg-blue-600/90 text-white flex items-center justify-center shadow-2xl backdrop-blur-sm group-hover:scale-110 transition-transform">
                          <span className="material-symbols-outlined filled text-3xl">play_arrow</span>
                        </div>
                        <span className="text-[9px] font-black uppercase tracking-widest text-white/60 group-hover:text-white transition-colors">
                          Casting Clip 0{i}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'detalhes' && (
              <div className="flex flex-col gap-12 animate-in slide-in-from-bottom-4 duration-500">
                <section className="bg-[#1c2127] border border-white/5 p-8 rounded-[2rem] shadow-xl">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] mb-6 text-blue-500">Apresentação Profissional</h3>
                  <p className="text-slate-300 leading-relaxed text-xl italic font-medium">
                    "{model.bio}"
                  </p>
                </section>

                <section>
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] mb-8 text-slate-500">Ficha Técnica e Medidas</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { label: 'Idade', val: `${model.age} anos`, icon: 'cake' },
                      { label: 'Altura', val: model.height || '1.76 m', icon: 'height' },
                      { label: 'Peso', val: model.weight || '58 kg', icon: 'fitness_center' },
                      { label: 'Cintura', val: model.waist || '62 cm', icon: 'straighten' },
                      { label: 'Busto', val: model.bust || '88 cm', icon: 'favorite' },
                      { label: 'Olhos', val: model.eyes || 'Verdes', icon: 'visibility' },
                      { label: 'Cabelos', val: model.hair || 'Castanhos', icon: 'face' },
                      { label: 'Calçado', val: model.shoeSize || '37', icon: 'ice_skating' }
                    ].map(item => (
                      <div key={item.label} className="bg-[#1c2127] border border-white/5 p-6 rounded-2xl flex flex-col items-center text-center group hover:border-blue-500/50 transition-all hover:-translate-y-1">
                        <span className="material-symbols-outlined text-slate-600 mb-3 group-hover:text-blue-500 transition-colors">{item.icon}</span>
                        <span className="text-xl font-black text-white">{item.val}</span>
                        <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-1">{item.label}</span>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            )}

            {activeTab === 'avaliacoes' && (
              <div className="animate-in slide-in-from-bottom-4 duration-500 space-y-10">
                {/* Status: Locked/Form */}
                {!isRatingUnlocked ? (
                  <div className="bg-[#1c2127] border border-white/5 p-12 rounded-[2.5rem] flex flex-col items-center text-center gap-6 shadow-2xl">
                    <div className="size-20 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 mb-4 ring-8 ring-blue-500/5">
                      <span className="material-symbols-outlined text-4xl filled">lock</span>
                    </div>
                    <div>
                      <h3 className="text-2xl font-black uppercase italic tracking-tighter">Classificar Modelo</h3>
                      <p className="text-slate-500 text-sm mt-2 max-w-sm mx-auto">
                        Para garantir avaliações reais, você precisa inserir o código recebido após o pagamento do contato.
                      </p>
                    </div>
                    
                    <div className="w-full max-w-xs space-y-4">
                      <div className="relative group">
                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors">key</span>
                        <input 
                          type="text" 
                          placeholder="CÓDIGO (ex: VER-1234)"
                          value={ratingCodeInput}
                          onChange={(e) => setRatingCodeInput(e.target.value.toUpperCase())}
                          className="w-full bg-[#111418] border border-white/10 rounded-xl py-4 pl-12 pr-4 text-center font-mono font-bold uppercase tracking-widest focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        />
                      </div>
                      {ratingError && <p className="text-[10px] text-rose-500 font-black uppercase tracking-widest">{ratingError}</p>}
                      <button 
                        onClick={handleValidateCode}
                        className="w-full py-4 bg-blue-600 rounded-xl text-xs font-black uppercase tracking-[0.2em] shadow-xl shadow-blue-900/40 hover:bg-blue-500 active:scale-95 transition-all"
                      >
                        Desbloquear Avaliação
                      </button>
                    </div>
                  </div>
                ) : hasSubmittedRating ? (
                  <div className="bg-emerald-500/10 border border-emerald-500/20 p-12 rounded-[2.5rem] flex flex-col items-center text-center gap-4 animate-in zoom-in duration-500 shadow-xl">
                    <span className="material-symbols-outlined text-5xl text-emerald-500 filled">check_circle</span>
                    <h3 className="text-xl font-black uppercase italic tracking-tighter">Avaliação Enviada!</h3>
                    <p className="text-slate-400 text-sm">Obrigado por ajudar a comunidade com seu feedback real.</p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmitRating} className="bg-[#1c2127] border border-white/5 p-10 rounded-[2.5rem] shadow-2xl space-y-8 animate-in fade-in duration-500">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-black uppercase italic tracking-tighter">Sua Experiência Profissional</h3>
                      <div className="flex items-center gap-2 px-3 py-1 bg-blue-500/10 rounded-full border border-blue-500/20">
                         <span className="text-[8px] font-black text-blue-500 uppercase tracking-widest">Código: {ratingCodeInput}</span>
                      </div>
                    </div>

                    <div className="flex flex-col items-center gap-4 p-8 bg-black/20 rounded-2xl border border-white/5">
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Sua Nota</span>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setUserRating(star)}
                            className={`size-12 rounded-xl flex items-center justify-center transition-all ${
                              userRating >= star ? 'bg-amber-500/10 text-amber-500' : 'bg-white/5 text-slate-700 hover:text-slate-500'
                            }`}
                          >
                            <span className={`material-symbols-outlined text-3xl ${userRating >= star ? 'filled' : ''}`}>star</span>
                          </button>
                        ))}
                      </div>
                      <span className="text-[10px] font-black uppercase text-amber-500">
                        {userRating === 1 && 'Ruim'}
                        {userRating === 2 && 'Regular'}
                        {userRating === 3 && 'Bom'}
                        {userRating === 4 && 'Ótimo'}
                        {userRating === 5 && 'Excepcional'}
                      </span>
                    </div>

                    <div className="flex flex-col gap-2">
                       <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600">Comentário (Opcional)</label>
                       <textarea 
                          rows={4}
                          value={userComment}
                          onChange={(e) => setUserComment(e.target.value)}
                          placeholder="Como foi trabalhar com esta modelo? Seja profissional no seu feedback."
                          className="w-full bg-[#111418] border border-white/10 rounded-2xl p-5 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none"
                       />
                    </div>

                    <button 
                      type="submit"
                      className="w-full py-5 bg-blue-600 rounded-2xl text-xs font-black uppercase tracking-[0.2em] shadow-xl shadow-blue-900/40 hover:bg-blue-500 active:scale-95 transition-all"
                    >
                      Publicar Classificação
                    </button>
                  </form>
                )}

                {/* Existing Mock Reviews */}
                <div className="space-y-6">
                   <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-600 px-4 flex items-center gap-2">
                     <span className="material-symbols-outlined text-sm">history_edu</span>
                     Relatos de Contratantes
                   </h4>
                   {[
                     { user: 'Recruiter_Maputo', rating: 5, comment: 'Extremamente profissional, chegou no horário e entregou fotos maravilhosas para a nossa campanha.', date: 'Há 1 semana' },
                     { user: 'Estúdio_Luz', rating: 4, comment: 'Boa comunicação e excelente desenvoltura no set. Recomendamos para trabalhos editoriais.', date: 'Há 3 semanas' }
                   ].map((rev, i) => (
                     <div key={i} className="bg-[#1c2127] border border-white/5 p-8 rounded-[2rem] flex flex-col gap-4 shadow-lg hover:border-blue-500/10 transition-colors">
                        <div className="flex justify-between items-start">
                           <div className="flex items-center gap-4">
                              <div className="size-10 rounded-full bg-blue-600/10 flex items-center justify-center font-black text-xs text-blue-500">
                                 {rev.user[0]}
                              </div>
                              <div>
                                 <p className="text-xs font-black uppercase tracking-tight text-white">{rev.user}</p>
                                 <div className="flex gap-0.5 mt-0.5">
                                    {[1,2,3,4,5].map(s => (
                                      <span key={s} className={`material-symbols-outlined text-[10px] ${s <= rev.rating ? 'text-amber-500 filled' : 'text-slate-700'}`}>star</span>
                                    ))}
                                 </div>
                              </div>
                           </div>
                           <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">{rev.date}</span>
                        </div>
                        <p className="text-slate-400 text-sm italic font-medium leading-relaxed leading-relaxed">
                          "{rev.comment}"
                        </p>
                     </div>
                   ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar: Sticky Call to Action */}
        <aside className="lg:col-span-4 flex flex-col gap-8">
          <div className="lg:sticky lg:top-24 space-y-8">
            
            {/* Payment & Contact Card */}
            <div className="relative rounded-[2.5rem] bg-gradient-to-br from-blue-600 to-blue-800 p-8 text-white overflow-hidden shadow-2xl shadow-blue-900/40">
              <div className="absolute -top-10 -right-10 size-40 bg-white/10 rounded-full blur-3xl"></div>
              
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-8">
                  <div className="size-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center">
                    <span className="material-symbols-outlined filled text-white">lock</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold italic tracking-tight uppercase">Contato Direto</h3>
                    <p className="text-blue-100 text-[10px] font-bold uppercase tracking-widest opacity-80">Acesso profissional seguro</p>
                  </div>
                </div>

                <ul className="space-y-4 mb-8">
                  {[
                    'WhatsApp Direto da Modelo',
                    'Telefone Profissional',
                    'Código de Classificação'
                  ].map(item => (
                    <li key={item} className="flex items-center gap-3 text-sm font-medium">
                      <span className="material-symbols-outlined text-blue-200 text-lg">check_circle</span>
                      {item}
                    </li>
                  ))}
                </ul>

                <div className="bg-black/10 backdrop-blur-md rounded-2xl p-5 border border-white/10 mb-8">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] uppercase font-bold tracking-[0.2em] opacity-60">Taxa de Acesso</span>
                    <span className="text-2xl font-black">200 MT</span>
                  </div>
                  <p className="text-[9px] opacity-60 leading-tight font-medium">Pagamento único via M-Pesa ou eMola. Sem comissões.</p>
                </div>

                <Link 
                  to={`/pagamento/${model.id}`}
                  className="w-full rounded-2xl bg-white py-5 text-blue-900 font-black text-center shadow-lg hover:bg-blue-50 transition-all flex items-center justify-center gap-3 group uppercase tracking-widest text-xs"
                >
                  DESBLOQUEAR AGORA
                  <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
                </Link>
              </div>
            </div>

            {/* Trust Markers */}
            <div className="bg-[#1c2127] border border-white/5 rounded-3xl p-6 space-y-6 shadow-xl">
               <div className="flex items-center gap-4">
                  <div className="size-10 shrink-0 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                    <span className="material-symbols-outlined text-xl">verified_user</span>
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-white">Identidade Confirmada</p>
                    <p className="text-[10px] text-slate-500">Auditado manualmente em {new Date().getFullYear()}</p>
                  </div>
               </div>
            </div>

            {/* Tags Cloud */}
            <div className="flex flex-wrap gap-2">
               {['Moçambique', 'Agenciada', 'Profissional', ...model.categories].map(tag => (
                 <span key={tag} className="text-[8px] font-black uppercase tracking-widest bg-white/5 border border-white/5 px-3 py-1.5 rounded-lg text-slate-500">
                    {tag}
                 </span>
               ))}
            </div>

          </div>
        </aside>

      </div>
    </div>
  );
};

export default ProfilePage;
