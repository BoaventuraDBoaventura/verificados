
import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MOCK_MODELS } from '../constants';

const ProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const model = MOCK_MODELS.find(m => m.id === id);
  const [activeTab, setActiveTab] = useState<'portfolio' | 'detalhes'>('portfolio');

  if (!model) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-10 text-center">
        <span className="material-symbols-outlined text-6xl text-slate-700 mb-4">person_off</span>
        <h2 className="text-2xl font-bold mb-2">Modelo não encontrada</h2>
        <Link to="/" className="text-blue-500 hover:underline">Voltar para a galeria</Link>
      </div>
    );
  }

  return (
    <div className="bg-[#101922] min-h-screen pb-20">
      {/* Premium Hero Header */}
      <section className="relative h-[50vh] md:h-[60vh] overflow-hidden">
        <img 
          src={model.profileImage} 
          className="w-full h-full object-cover object-center" 
          alt={model.artisticName} 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#101922] via-[#101922]/40 to-transparent"></div>
        
        <div className="absolute bottom-0 left-0 w-full p-6 md:p-12">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-3">
                <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase">{model.artisticName}</h1>
                <span className="material-symbols-outlined filled text-blue-500 text-3xl md:text-4xl bg-white rounded-full border-4 border-[#101922]">verified</span>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-slate-300 font-medium">
                <span className="flex items-center gap-1.5 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-sm">
                  <span className="material-symbols-outlined text-sm">location_on</span>
                  {model.location}
                </span>
                <div className="flex gap-2">
                  {model.categories.map(cat => (
                    <span key={cat} className="flex items-center gap-1.5 bg-blue-500/20 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-blue-400 border border-blue-500/20">
                      {cat}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button className="rounded-xl bg-white/10 backdrop-blur-md border border-white/10 p-3 hover:bg-white/20 transition-all group">
                <span className="material-symbols-outlined group-hover:scale-110 transition-transform">favorite</span>
              </button>
              <button className="rounded-xl bg-white/10 backdrop-blur-md border border-white/10 p-3 hover:bg-white/20 transition-all group">
                <span className="material-symbols-outlined group-hover:scale-110 transition-transform">share</span>
              </button>
              <Link 
                to={`/pagamento/${model.id}`}
                className="flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-bold text-white shadow-xl shadow-blue-900/40 hover:bg-blue-500 transition-all active:scale-95"
              >
                <span className="material-symbols-outlined text-lg">chat_bubble</span>
                Contratar
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Grid */}
      <div className="max-w-7xl mx-auto px-4 md:px-12 -mt-8 relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* Left: Bio and Details */}
        <div className="lg:col-span-8 flex flex-col gap-12">
          
          {/* Navigation Tabs */}
          <div className="flex border-b border-white/10 gap-8">
            <button 
              onClick={() => setActiveTab('portfolio')}
              className={`pb-4 text-sm font-bold uppercase tracking-widest transition-all relative ${activeTab === 'portfolio' ? 'text-white' : 'text-slate-500 hover:text-slate-300'}`}
            >
              Portfólio
              {activeTab === 'portfolio' && <div className="absolute bottom-0 left-0 w-full h-1 bg-blue-500 rounded-full"></div>}
            </button>
            <button 
              onClick={() => setActiveTab('detalhes')}
              className={`pb-4 text-sm font-bold uppercase tracking-widest transition-all relative ${activeTab === 'detalhes' ? 'text-white' : 'text-slate-500 hover:text-slate-300'}`}
            >
              Sobre & Medidas
              {activeTab === 'detalhes' && <div className="absolute bottom-0 left-0 w-full h-1 bg-blue-500 rounded-full"></div>}
            </button>
          </div>

          {activeTab === 'portfolio' ? (
            <div className="flex flex-col gap-12 animate-in fade-in duration-500">
              {/* Videos Carousel */}
              <section>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold flex items-center gap-2">
                    <span className="material-symbols-outlined text-blue-500">videocam</span>
                    Vídeos de Prévia
                  </h3>
                </div>
                <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar snap-x">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="min-w-[180px] md:min-w-[220px] aspect-[9/16] rounded-2xl bg-[#1c2127] relative overflow-hidden group snap-center cursor-pointer border border-white/5">
                      <img src={`https://picsum.photos/seed/v${i + 20}/400/711`} className="h-full w-full object-cover opacity-70 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500" alt="Video preview" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="size-14 rounded-full bg-blue-600/90 text-white flex items-center justify-center shadow-2xl backdrop-blur-sm group-hover:scale-110 transition-transform">
                          <span className="material-symbols-outlined filled text-2xl">play_arrow</span>
                        </div>
                      </div>
                      <div className="absolute bottom-4 left-4 right-4 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-tighter border border-white/10">
                        Editorial Preview 0{i}
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Dynamic Gallery Grid */}
              <section>
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-xl font-bold flex items-center gap-2">
                    <span className="material-symbols-outlined text-blue-500">photo_library</span>
                    Sessões Recentes
                  </h3>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 auto-rows-[250px] md:auto-rows-[350px]">
                  <div className="col-span-2 row-span-2 rounded-3xl overflow-hidden group relative border border-white/5">
                    <img src={model.galleryImages[0] || model.profileImage} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-1000" alt="Gallery large" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-8">
                       <p className="text-sm font-bold uppercase tracking-widest">Main Showcase</p>
                    </div>
                  </div>
                  <div className="rounded-3xl overflow-hidden group border border-white/5">
                    <img src={model.galleryImages[1] || `https://picsum.photos/seed/p1/500/800`} className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-700" alt="Gallery 2" />
                  </div>
                  <div className="rounded-3xl overflow-hidden group border border-white/5">
                    <img src={model.galleryImages[2] || `https://picsum.photos/seed/p2/500/800`} className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-700" alt="Gallery 3" />
                  </div>
                  <div className="col-span-1 rounded-3xl overflow-hidden group border border-white/5">
                    <img src={`https://picsum.photos/seed/p3/500/800`} className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-700" alt="Gallery 4" />
                  </div>
                  <div className="col-span-2 rounded-3xl overflow-hidden group relative border border-white/5">
                    <img src={`https://picsum.photos/seed/p4/800/500`} className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-1000" alt="Gallery 5" />
                  </div>
                </div>
              </section>
            </div>
          ) : (
            <div className="flex flex-col gap-12 animate-in slide-in-from-bottom-4 duration-500">
              {/* Bio Section */}
              <section className="bg-[#1c2127] border border-white/5 p-8 rounded-3xl shadow-xl">
                <h3 className="text-lg font-bold mb-6 text-blue-500 uppercase tracking-widest">Apresentação</h3>
                <p className="text-slate-300 leading-relaxed text-lg italic">
                  "{model.bio}"
                </p>
              </section>

              {/* Measures Refined */}
              <section>
                <h3 className="text-lg font-bold mb-8 uppercase tracking-widest text-slate-500">Ficha Técnica</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
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
                    <div key={item.label} className="bg-[#1c2127] border border-white/5 p-6 rounded-2xl flex flex-col items-center text-center group hover:border-blue-500/50 transition-colors">
                      <span className="material-symbols-outlined text-slate-600 mb-3 group-hover:text-blue-500 transition-colors">{item.icon}</span>
                      <span className="text-xl font-black text-white">{item.val}</span>
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">{item.label}</span>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          )}
        </div>

        {/* Right Sidebar: Sticky Contact & Trust */}
        <aside className="lg:col-span-4 flex flex-col gap-8">
          <div className="lg:sticky lg:top-24 space-y-8">
            
            {/* Exclusive Contact Card */}
            <div className="relative rounded-3xl bg-gradient-to-br from-blue-600 to-blue-800 p-8 text-white overflow-hidden shadow-2xl shadow-blue-900/40">
              <div className="absolute -top-10 -right-10 size-40 bg-white/10 rounded-full blur-3xl"></div>
              
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="size-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center">
                    <span className="material-symbols-outlined filled text-white">lock</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Contato Direto</h3>
                    <p className="text-blue-100 text-xs">Acesso exclusivo e seguro</p>
                  </div>
                </div>

                <ul className="space-y-4 mb-8">
                  <li className="flex items-center gap-3 text-sm">
                    <span className="material-symbols-outlined text-blue-200">check_circle</span>
                    WhatsApp Privado
                  </li>
                  <li className="flex items-center gap-3 text-sm">
                    <span className="material-symbols-outlined text-blue-200">check_circle</span>
                    Email Profissional
                  </li>
                  <li className="flex items-center gap-3 text-sm">
                    <span className="material-symbols-outlined text-blue-200">check_circle</span>
                    Links de Redes Sociais
                  </li>
                </ul>

                <div className="bg-black/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 mb-8">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] uppercase font-bold tracking-widest opacity-60">Taxa de Desbloqueio</span>
                    <span className="text-lg font-black">200 MT</span>
                  </div>
                  <p className="text-[9px] opacity-60 leading-tight">Pagamento único. Acesso vitalício às informações de contato desta modelo.</p>
                </div>

                <Link 
                  to={`/pagamento/${model.id}`}
                  className="w-full rounded-2xl bg-white py-4 text-blue-900 font-black text-center shadow-lg hover:bg-blue-50 transition-all flex items-center justify-center gap-2 group"
                >
                  DESBLOQUEAR AGORA
                  <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
                </Link>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="bg-[#1c2127] border border-white/5 rounded-3xl p-6 space-y-4 shadow-xl">
               <div className="flex items-center gap-4">
                  <div className="size-10 shrink-0 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
                    <span className="material-symbols-outlined text-xl">verified_user</span>
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-white">Identidade Confirmada</p>
                    <p className="text-[10px] text-slate-500">Verificado manualmente por vídeo em 24/05/2023</p>
                  </div>
               </div>
               <div className="flex items-center gap-4">
                  <div className="size-10 shrink-0 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
                    <span className="material-symbols-outlined text-xl">shield_moon</span>
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-white">Ambiente Seguro</p>
                    <p className="text-[10px] text-slate-500">Seus dados e transações são criptografados</p>
                  </div>
               </div>
            </div>

            {/* Tags/Categories Mini */}
            <div className="flex flex-wrap gap-2">
               {['Agenciada', 'Passaporte Ativo', 'Disponível para Viagens', 'Moçambique', ...model.categories].map(tag => (
                 <span key={tag} className="text-[9px] font-bold uppercase tracking-widest bg-white/5 border border-white/5 px-3 py-1.5 rounded-lg text-slate-400">
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
