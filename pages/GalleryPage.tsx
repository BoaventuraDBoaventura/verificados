
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MOZAMBIQUE_PROVINCES } from '../constants';
import { supabase } from '../supabaseClient';
import { Model, VerificationStatus } from '../types';

const GalleryPage: React.FC = () => {
  const [filter, setFilter] = useState('');
  const [activeCategory, setActiveCategory] = useState('Todas');
  const [activeProvince, setActiveProvince] = useState('Todas');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isProvinceModalOpen, setIsProvinceModalOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(12);
  const [categories, setCategories] = useState<string[]>(['Todas']);
  const [models, setModels] = useState<Model[]>([]);
  const [loading, setLoading] = useState(true);

  const provinces = ['Todas', ...MOZAMBIQUE_PROVINCES];

  // Carregar modelos e categorias do banco de dados
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      // Carregar modelos verificados
      const { data: modelsData, error: modelsError } = await supabase
        .from('models')
        .select('*')
        .eq('is_verified', true)
        .eq('status', 'Aprovado')
        .order('created_at', { ascending: false });

      if (!modelsError && modelsData) {
        const mappedModels: Model[] = modelsData.map((row: any) => ({
          id: row.id,
          slug: row.slug,
          artisticName: row.artistic_name,
          age: row.age,
          location: `${row.city}, ${row.province}`,
          categories: row.categories || [],
          bio: row.bio || '',
          profileImage: row.profile_image || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=600&auto=format&fit=crop',
          previewVideos: row.preview_videos || [],
          galleryImages: row.gallery_images || [],
          phoneNumber: row.phone_number,
          isVerified: row.is_verified || false,
          status: row.status === 'Aprovado' ? VerificationStatus.APPROVED :
            row.status === 'Em Verificação' ? VerificationStatus.PENDING :
              row.status === 'Rejeitado' ? VerificationStatus.REJECTED :
                VerificationStatus.UNVERIFIED,
          height: row.height,
          weight: row.weight,
          waist: row.waist,
          bust: row.bust,
          eyes: row.eyes,
          hair: row.hair,
          shoeSize: row.shoe_size
        }));
        setModels(mappedModels);
      }

      // Carregar categorias
      const { data: catData, error: catError } = await supabase
        .from('categories')
        .select('name')
        .order('name', { ascending: true });

      if (!catError && catData) {
        setCategories(['Todas', ...catData.map((c: any) => c.name as string)]);
      }

      setLoading(false);
    };

    fetchData();
  }, []);

  // Prevent scroll when modal is open
  useEffect(() => {
    if (isProvinceModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isProvinceModalOpen]);

  const filteredModels = models.filter(m => {
    const matchesSearch = m.location.toLowerCase().includes(filter.toLowerCase()) ||
      m.artisticName.toLowerCase().includes(filter.toLowerCase());
    const matchesCategory = activeCategory === 'Todas' || m.categories.includes(activeCategory);
    const matchesProvince = activeProvince === 'Todas' || m.location.toLowerCase().includes(activeProvince.toLowerCase());

    return m.isVerified && matchesSearch && matchesCategory && matchesProvince;
  });

  const displayedModels = filteredModels.slice(0, visibleCount);

  const toggleDrawer = () => setIsDrawerOpen(!isDrawerOpen);

  const clearFilters = () => {
    setFilter('');
    setActiveCategory('Todas');
    setActiveProvince('Todas');
    setVisibleCount(12);
  };

  const handleProvinceSelect = (prov: string) => {
    setActiveProvince(prov);
    setIsProvinceModalOpen(false);
    setVisibleCount(12);
  };

  const handleLoadMore = () => {
    setVisibleCount(prev => prev + 12);
  };

  return (
    <div className="min-h-screen bg-[#101922] relative overflow-x-hidden">

      {/* Province Selection Modal (Popup) */}
      <div
        className={`fixed inset-0 z-[100] flex items-center justify-center p-4 transition-all duration-300 ${isProvinceModalOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/80 backdrop-blur-md"
          onClick={() => setIsProvinceModalOpen(false)}
        ></div>

        {/* Modal Content */}
        <div className={`relative w-full max-w-lg bg-[#1c2127] rounded-[2rem] border border-white/10 shadow-2xl overflow-hidden transition-all duration-300 transform ${isProvinceModalOpen ? 'scale-100 translate-y-0' : 'scale-95 translate-y-10'}`}>
          <div className="p-8 flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-black uppercase tracking-tighter">Selecionar Província</h3>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Filtre talentos por localização</p>
              </div>
              <button
                onClick={() => setIsProvinceModalOpen(false)}
                className="size-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[60vh] overflow-y-auto no-scrollbar pr-2">
              {provinces.map(prov => (
                <button
                  key={prov}
                  onClick={() => handleProvinceSelect(prov)}
                  className={`w-full text-left px-5 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${activeProvince === prov
                    ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-900/40'
                    : 'bg-white/5 border-transparent text-slate-400 hover:text-white hover:bg-white/10 hover:border-white/10'
                    }`}
                >
                  <div className="flex items-center justify-between">
                    {prov}
                    {activeProvince === prov && <span className="material-symbols-outlined text-[14px]">check_circle</span>}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-black/20 p-6 flex justify-center">
            <button
              onClick={() => { setActiveProvince('Todas'); setIsProvinceModalOpen(false); setVisibleCount(12); }}
              className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 hover:text-white transition-colors"
            >
              Limpar Localização
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Filter Drawer Overlay */}
      <div
        className={`fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm transition-opacity duration-300 md:hidden ${isDrawerOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={toggleDrawer}
      ></div>

      {/* Mobile Filter Drawer Content */}
      <aside
        className={`fixed top-0 right-0 z-[70] h-full w-[85%] max-w-[340px] bg-[#1c2127] border-l border-white/10 p-6 md:p-8 transition-transform duration-500 md:hidden flex flex-col ${isDrawerOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-xl font-black uppercase tracking-tighter">Filtros</h3>
          <button onClick={toggleDrawer} className="size-10 rounded-full bg-white/5 flex items-center justify-center">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="flex-grow overflow-y-auto no-scrollbar space-y-8 pr-2">
          {/* Categorias Mobile */}
          <div>
            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">category</span> Categorias
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => { setActiveCategory(cat); setVisibleCount(12); }}
                  className={`px-3 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all border ${activeCategory === cat
                    ? 'bg-blue-600 border-blue-500 text-white'
                    : 'bg-white/5 border-transparent text-slate-400'
                    }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Províncias Mobile Trigger */}
          <div>
            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">location_on</span> Províncias
            </h4>
            <button
              onClick={() => setIsProvinceModalOpen(true)}
              className="w-full flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 active:scale-95 transition-transform"
            >
              <span className="text-[10px] font-bold uppercase tracking-widest text-white">
                {activeProvince === 'Todas' ? 'Selecionar Província' : activeProvince}
              </span>
              <span className="material-symbols-outlined text-blue-500 text-sm">open_in_new</span>
            </button>
          </div>
        </div>

        <div className="pt-6 mt-6 border-t border-white/5 space-y-3">
          <button
            onClick={() => { clearFilters(); toggleDrawer(); }}
            className="w-full py-4 bg-white/5 rounded-xl text-[10px] font-black uppercase tracking-widest text-white border border-white/5"
          >
            Limpar Filtros
          </button>
          <button
            onClick={toggleDrawer}
            className="w-full py-4 bg-blue-600 rounded-xl text-[10px] font-black uppercase tracking-widest text-white shadow-lg shadow-blue-900/40"
          >
            Ver Resultados
          </button>
        </div>
      </aside>

      {/* Header Minimalista */}
      <div className="pt-6 pb-3 flex justify-center px-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20">
          <span className="material-symbols-outlined filled text-blue-500 text-sm">verified</span>
          <span className="text-[10px] font-black uppercase tracking-widest text-blue-500">Perfis Verificados</span>
        </div>
      </div>

      {/* Interface de Filtros & Busca Sticky */}
      <section className="bg-[#101922] border-b border-white/5 py-3 px-4 sticky top-[64px] z-50 backdrop-blur-md bg-[#101922]/90">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-6 justify-between">

          <div className="flex flex-wrap items-center gap-4 md:gap-6 w-full md:w-auto">
            {/* Categorias (Desktop) */}
            <div className="hidden md:flex items-center gap-2 flex-wrap">
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 shrink-0">Categorias:</span>
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => { setActiveCategory(cat); setVisibleCount(12); }}
                  className={`px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap border ${activeCategory === cat
                    ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-900/40'
                    : 'bg-white/5 border-white/5 text-slate-500 hover:text-white hover:bg-white/10'
                    }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Província Popup Trigger (Desktop) */}
            <div className="hidden md:flex items-center gap-2 relative shrink-0">
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 mr-1">Local:</span>
              <button
                onClick={() => setIsProvinceModalOpen(true)}
                className={`flex items-center gap-2 px-5 py-2 rounded-full text-[9px] font-black uppercase tracking-widest transition-all border ${activeProvince !== 'Todas'
                  ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-900/40'
                  : 'bg-white/5 border-white/10 text-white hover:border-blue-500/50'
                  }`}
              >
                {activeProvince === 'Todas' ? 'Todas as Províncias' : activeProvince}
                <span className="material-symbols-outlined text-[14px]">location_on</span>
              </button>
            </div>
          </div>

          {/* Busca e Filtro Mobile Trigger */}
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-grow md:w-72 group">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors text-xl">search</span>
              <input
                type="text"
                placeholder="Nome ou local..."
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-white/10 bg-[#1c2127] text-xs font-medium focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-600"
                value={filter}
                onChange={(e) => { setFilter(e.target.value); setVisibleCount(12); }}
              />
            </div>

            <button
              onClick={toggleDrawer}
              className="md:hidden size-12 flex items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-900/40 active:scale-95 transition-transform"
            >
              <span className="material-symbols-outlined">tune</span>
            </button>
          </div>
        </div>
      </section>

      {/* Grade de Modelos */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-4">
        <div className="flex flex-col items-center mb-6">
          <h2 className="text-2xl font-black font-display uppercase italic tracking-tighter mb-2">Acompanhantes</h2>
          <div className="h-0.5 w-10 bg-blue-600 rounded-full"></div>
        </div>

        <div className="grid grid-cols-2 sm:flex sm:flex-wrap justify-center gap-3 sm:gap-6">
          {displayedModels.map((model) => (
            <Link
              key={model.id}
              to={`/perfil/${model.slug || model.id}`}
              className="group relative w-full sm:w-[200px] flex flex-col overflow-hidden rounded-3xl bg-[#1c2127] border border-white/5 transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl hover:shadow-blue-500/20"
            >
              <div className="aspect-[3/4] relative overflow-hidden">
                <img
                  src={model.profileImage}
                  className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-105"
                  alt={model.artisticName}
                />

                <div className="absolute inset-0 bg-gradient-to-t from-[#101922] via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity"></div>

                <div className="absolute top-2 left-2">
                  <div className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-black/40 backdrop-blur-md border border-white/10">
                    <span className="material-symbols-outlined filled text-blue-500 text-[10px]">verified</span>
                    <span className="text-[7px] font-black text-white uppercase tracking-widest">Verificado</span>
                  </div>
                </div>

                <div className="absolute bottom-0 left-0 w-full p-3 text-center">
                  <h3 className="text-sm font-black text-white mb-0.5 uppercase tracking-tighter group-hover:text-blue-400 transition-colors truncate">
                    {model.artisticName}
                  </h3>
                  <div className="flex flex-col items-center gap-0.5">
                    <span className="text-[8px] font-bold text-white uppercase tracking-widest flex items-center gap-0.5 truncate w-full justify-center">
                      <span className="material-symbols-outlined text-[10px]">location_on</span>
                      <span className="truncate">{model.location}</span>
                    </span>
                    <span className="text-[8px] font-black text-blue-500 uppercase tracking-widest truncate">
                      {model.categories[0]} {model.categories.length > 1 && `+${model.categories.length - 1}`}
                    </span>
                  </div>
                </div>
              </div>

              <div className="px-3 py-2 bg-[#111418]/50 border-t border-white/5 flex justify-center">
                <span className="text-[8px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-1">
                  Ver <span className="material-symbols-outlined text-[9px]">arrow_forward</span>
                </span>
              </div>
            </Link>
          ))}
        </div>

        {/* Empty State */}
        {displayedModels.length === 0 && (
          <div className="py-8 flex flex-col items-center justify-center text-center animate-in fade-in duration-500">
            <span className="material-symbols-outlined text-4xl text-slate-700 mb-3">location_off</span>
            <h3 className="text-base font-bold">Nenhum Acompanhante encontrado</h3>
            <p className="text-slate-500 text-xs mt-1 max-w-xs mx-auto">Não encontramos acompanhantes em <span className="text-blue-500">{activeProvince}</span> com os filtros selecionados.</p>
            <button
              onClick={clearFilters}
              className="mt-4 text-[10px] font-black uppercase tracking-widest text-blue-500 hover:underline"
            >
              Resetar Filtros
            </button>
          </div>
        )}

        {/* Load More */}
        {filteredModels.length > visibleCount && (
          <div className="mt-8 flex flex-col items-center gap-4">
            <button
              onClick={handleLoadMore}
              className="flex items-center gap-2 rounded-full border border-white/10 px-8 py-3 text-[10px] font-black uppercase tracking-widest hover:bg-white/5 transition-all active:scale-95 group"
            >
              <span className="material-symbols-outlined text-blue-500 group-hover:rotate-180 transition-transform">autorenew</span>
              Mais Acompanhantes
            </button>
          </div>
        )}
      </section>
    </div>
  );
};

export default GalleryPage;
