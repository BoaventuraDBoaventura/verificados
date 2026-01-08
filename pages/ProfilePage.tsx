
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { Model, VerificationStatus } from '../types';
import { useToast } from '../context/ToastContext';

const ProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [model, setModel] = useState<Model | null>(null);
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'fotos' | 'videos' | 'servicos' | 'avaliacoes'>('servicos');

  // Rating logic states
  const [ratingCodeInput, setRatingCodeInput] = useState('');
  const [isRatingUnlocked, setIsRatingUnlocked] = useState(false);
  const [ratingError, setRatingError] = useState('');
  const [userRating, setUserRating] = useState(0);
  const [userComment, setUserComment] = useState('');
  const [hasSubmittedRating, setHasSubmittedRating] = useState(false);
  const [reviews, setReviews] = useState<any[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);

  // Image modal state
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Video modal state
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);

  // Payment unlock state
  const [isContactUnlocked, setIsContactUnlocked] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);

  // Função para mapear dados do banco para Model
  const mapDataToModel = (data: any): Model => {
    return {
      id: data.id,
      slug: data.slug || null,
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
      shoeSize: data.shoe_size || null,
      services: Array.isArray(data.services) ? data.services : []
    };
  };

  // Carregar modelo do banco de dados com Real-time
  useEffect(() => {
    if (!id) {
      console.warn('⚠️ ProfilePage - Nenhum ID fornecido');
      setModel(null);
      setLoading(false);
      return;
    }

    console.log('🔍 ProfilePage - ID recebido:', id);
    setLoading(true);

    // Buscar dados iniciais
    const fetchModel = async () => {
      try {
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);

        let query = supabase.from('models').select('*');

        if (isUUID) {
          query = query.eq('id', id);
        } else {
          query = query.eq('slug', id);
        }

        const { data, error } = await query.single();

        if (error) {
          console.error('❌ Erro ao carregar modelo:', error);
          setModel(null);
          setLoading(false);
          return;
        }

        if (!data) {
          console.warn('⚠️ Modelo não encontrado no banco de dados. ID:', id);
          setModel(null);
          setLoading(false);
          return;
        }

        console.log('✅ Dados carregados:', data);
        const mappedModel = mapDataToModel(data);
        setModel(mappedModel);
        setLoading(false);
      } catch (err) {
        console.error('❌ Erro inesperado ao buscar modelo:', err);
        setModel(null);
        setLoading(false);
      }
    };

    const fetchReviews = async () => {
      if (!id) return;
      setReviewsLoading(true);
      try {
        const { data, error } = await supabase
          .from('reviews')
          .select('*')
          .eq('model_id', id)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Erro ao buscar avaliações:', error);
          return;
        }

        setReviews(data || []);
      } catch (err) {
        console.error('Erro inesperado ao buscar avaliações:', err);
      } finally {
        setReviewsLoading(false);
      }
    };

    // Buscar imediatamente
    fetchModel();
    fetchReviews();
    const channel = supabase
      .channel(`model-${id}`)
      .on(
        'postgres_changes',
        {
          event: '*', // Escuta INSERT, UPDATE, DELETE
          schema: 'public',
          table: 'models',
          filter: `id=eq.${id}`
        },
        (payload) => {
          console.log('🔄 Mudança detectada via Real-time:', payload);

          if (payload.eventType === 'DELETE') {
            console.warn('⚠️ Modelo foi deletado');
            setModel(null);
            return;
          }

          if (payload.new) {
            const mappedModel = mapDataToModel(payload.new);
            console.log('✅ Modelo atualizado via Real-time:', mappedModel);
            setModel(mappedModel);
            setLoading(false);
          }
        }
      )
      .subscribe((status) => {
        console.log('📡 Status da subscription Real-time:', status);
      });

    // Cleanup
    return () => {
      console.log('🧹 Limpando subscription Real-time');
      supabase.removeChannel(channel);
    };
  }, [id]);

  // Verificar se há pagamento recente (dentro de 5 minutos)
  useEffect(() => {
    if (!id) return;

    const checkPayment = () => {
      const paymentData = localStorage.getItem(`payment_${id}`);
      if (paymentData) {
        try {
          const { timestamp } = JSON.parse(paymentData);
          const elapsed = Math.floor((Date.now() - timestamp) / 1000);
          const remaining = Math.max(0, 300 - elapsed); // 5 minutos = 300 segundos

          if (remaining > 0) {
            setIsContactUnlocked(true);
            setTimeRemaining(remaining);
          } else {
            setIsContactUnlocked(false);
            localStorage.removeItem(`payment_${id}`);
          }
        } catch (err) {
          console.error('Erro ao verificar pagamento:', err);
        }
      } else {
        setIsContactUnlocked(false);
      }
    };

    checkPayment();
    const interval = setInterval(checkPayment, 1000);

    return () => clearInterval(interval);
  }, [id]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-10">
        <span className="material-symbols-outlined text-6xl text-slate-700 mb-4 animate-spin">refresh</span>
        <p className="text-slate-400">Carregando perfil...</p>
      </div>
    );
  }

  if (!model) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-10">
        <span className="material-symbols-outlined text-6xl text-slate-700 mb-4">person_off</span>
        <h2 className="text-2xl font-black mb-2">Modelo não encontrado</h2>
        <p className="text-slate-400 mb-6">O perfil que você está procurando não existe ou foi removido.</p>
        <Link
          to="/"
          className="px-6 py-3 bg-blue-600 text-white rounded-xl font-black uppercase tracking-widest hover:bg-blue-500 transition-all"
        >
          Voltar para Galeria
        </Link>
      </div>
    );
  }

  const handleValidateCode = async () => {
    if (!ratingCodeInput) return;

    try {
      const { data, error } = await supabase
        .from('access_codes')
        .select('*')
        .eq('code', ratingCodeInput.trim())
        .eq('model_id', id)
        .eq('is_used', false)
        .single();

      if (error || !data) {
        setRatingError('Código inválido, já utilizado ou não pertence a esta modelo.');
        return;
      }

      setIsRatingUnlocked(true);
      setRatingError('');
    } catch (err) {
      console.error('Erro ao validar código:', err);
      setRatingError('Erro ao validar código. Tente novamente.');
    }
  };

  const handleSubmitRating = async (e: React.FormEvent) => {
    e.preventDefault();
    if (userRating === 0) return showToast('Por favor, selecione uma nota.', 'warning');

    try {
      // 1. Inserir a avaliação
      const { error: reviewError } = await supabase
        .from('reviews')
        .insert([
          {
            model_id: id,
            code: ratingCodeInput.trim(),
            rating: userRating,
            comment: userComment,
            user_display_name: 'Usuário Verificado'
          }
        ]);

      if (reviewError) {
        console.error('Erro ao salvar avaliação:', reviewError);
        showToast('Erro ao enviar avaliação. Tente novamente.', 'error');
        return;
      }

      // 2. Marcar o código como usado
      const { error: codeError } = await supabase
        .from('access_codes')
        .update({ is_used: true, used_at: new Date().toISOString() })
        .eq('code', ratingCodeInput.trim());

      if (codeError) {
        console.error('Erro ao desativar código:', codeError);
      }

      setHasSubmittedRating(true);

      // Recarregar avaliações
      const { data: newReviews } = await supabase
        .from('reviews')
        .select('*')
        .eq('model_id', id)
        .order('created_at', { ascending: false });

      if (newReviews) setReviews(newReviews);

    } catch (err) {
      console.error('Erro inesperado ao enviar avaliação:', err);
      showToast('Erro inesperado. Tente novamente.', 'error');
    }
  };

  const handleRefresh = () => {
    if (id) {
      setLoading(true);
      const fetchModel = async () => {
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);

        let query = supabase.from('models').select('*');

        if (isUUID) {
          query = query.eq('id', id);
        } else {
          query = query.eq('slug', id);
        }

        const { data, error } = await query.single();

        if (error || !data) {
          console.error('Erro ao recarregar modelo:', error);
          setLoading(false);
          return;
        }

        const mappedModel: Model = {
          id: data.id,
          slug: data.slug || null,
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

        setModel(mappedModel);
        setLoading(false);
      };
      fetchModel();
    }
  };

  return (
    <div className="bg-[#101922] min-h-screen pb-4">

      {/* Refined Hero Header Section */}
      <section className="relative pt-0 pb-4 px-0 sm:px-4 lg:px-6 overflow-hidden bg-gradient-to-b from-blue-600/5 to-transparent">
        {/* Background Decoration */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[150px] bg-blue-600/5 blur-[60px] rounded-full pointer-events-none"></div>

        <div className="max-w-5xl mx-auto relative z-20 mb-4 px-4 sm:px-0">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors group"
          >
            <div className="size-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-blue-600 group-hover:border-blue-500 transition-all">
              <span className="material-symbols-outlined text-sm">arrow_back</span>
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest">Voltar</span>
          </button>
        </div>

        <div className="max-w-5xl mx-auto relative z-10">
          <div className="flex flex-col lg:flex-row gap-0 sm:gap-3 lg:gap-4 items-center">

            {/* Profile Photo Card - Large on Mobile */}
            <div className="w-full lg:w-auto lg:max-w-[140px] shrink-0 flex justify-center lg:justify-start">
              <div className="w-full aspect-[3/4] sm:aspect-[3/4] lg:aspect-[3/4] max-h-[70vh] sm:max-h-[60vh] lg:max-h-none lg:w-[140px] rounded-none sm:rounded-lg overflow-hidden border-0 sm:border border-white/5 shadow-sm relative group">
                <button
                  onClick={() => setSelectedImage(model.profileImage)}
                  className="w-full h-full block cursor-pointer transition-opacity hover:opacity-90"
                >
                  {model.profileImage ? (
                    <img
                      src={`${model.profileImage}?t=${Date.now()}`}
                      className="w-full h-full object-cover"
                      alt={model.artisticName}
                      onError={(e) => {
                        console.error('❌ Erro ao carregar imagem:', model.profileImage);
                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x600?text=Erro+ao+Carregar';
                      }}
                      onLoad={() => {
                        console.log('✅ Imagem carregada:', model.profileImage);
                      }}
                      key={model.profileImage} // Força recarregar quando a URL mudar
                    />
                  ) : (
                    <div className="w-full h-full bg-[#1c2127] flex items-center justify-center">
                      <span className="material-symbols-outlined text-6xl sm:text-8xl text-slate-700">person</span>
                    </div>
                  )}
                  <div className="absolute top-2 right-2 sm:top-3 sm:right-3 pointer-events-none">
                    <div className="size-8 sm:size-10 lg:size-6 rounded-full bg-white/10 backdrop-blur-md border border-white/10 flex items-center justify-center">
                      <span className="material-symbols-outlined text-white text-base sm:text-lg lg:text-xs">zoom_in</span>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* Profile Essential Info - Centered Vertically */}
            <div className="flex-grow flex flex-col gap-2 sm:gap-2.5 w-full text-center lg:text-left px-4 sm:px-0">
              <div className="flex flex-col gap-2">
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2">
                  <h1 className="text-base sm:text-lg md:text-xl font-black tracking-tighter uppercase italic">{model.artisticName}</h1>
                  <div className="flex items-center gap-0.5 px-2 py-1 rounded-full bg-blue-500/10 border border-blue-500/20">
                    <span className="material-symbols-outlined filled text-blue-500 text-xs sm:text-sm">verified</span>
                    <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest text-blue-500">Verificado</span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2">
                  <span className="flex items-center gap-1 text-slate-400 text-xs sm:text-sm font-bold uppercase tracking-widest">
                    <span className="material-symbols-outlined text-blue-500 text-xs sm:text-sm">location_on</span>
                    {model.location}
                  </span>
                  <div className="h-4 w-px bg-white/10 hidden sm:block"></div>
                  <span className="flex items-center gap-1 text-slate-400 text-xs sm:text-sm font-bold uppercase tracking-widest">
                    <span className="material-symbols-outlined text-blue-500 text-xs sm:text-sm">cake</span>
                    {model.age} Anos
                  </span>
                  <div className="h-4 w-px bg-white/10 hidden sm:block"></div>
                  <div className="flex flex-wrap justify-center lg:justify-start gap-1.5">
                    {model.categories.map(cat => (
                      <span key={cat} className="px-2 py-1 rounded-md bg-white/5 border border-white/5 text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-slate-300">
                        {cat}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 mt-2">
                  {model?.id && isContactUnlocked && (
                    <a
                      href={`https://wa.me/${model.phoneNumber?.replace(/\D/g, '') || ''}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 sm:px-5 sm:py-2.5 text-xs sm:text-sm font-black text-white shadow-sm shadow-emerald-900/40 hover:bg-emerald-500 transition-all active:scale-95 uppercase tracking-widest italic"
                    >
                      <span className="material-symbols-outlined text-sm sm:text-base">chat_bubble</span>
                      WhatsApp
                    </a>
                  )}
                  <div className="flex gap-2">
                    <button
                      onClick={handleRefresh}
                      className="size-8 sm:size-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all text-slate-400 hover:text-white"
                      title="Atualizar Perfil"
                    >
                      <span className="material-symbols-outlined text-sm sm:text-base">refresh</span>
                    </button>
                    <button
                      onClick={async () => {
                        const shareData = {
                          title: `Verificados - ${model.artisticName}`,
                          text: `Confira o perfil de ${model.artisticName} no Verificados!`,
                          url: window.location.href,
                        };

                        if (navigator.share) {
                          try {
                            await navigator.share(shareData);
                          } catch (err) {
                            console.error('Erro ao compartilhar:', err);
                          }
                        } else {
                          try {
                            await navigator.clipboard.writeText(window.location.href);
                            showToast('Link copiado para a área de transferência!', 'success');
                          } catch (err) {
                            console.error('Erro ao copiar link:', err);
                          }
                        }
                      }}
                      className="size-8 sm:size-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all text-slate-400 hover:text-white"
                      title="Compartilhar Perfil"
                    >
                      <span className="material-symbols-outlined text-sm sm:text-base">share</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-3 grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-8 mt-4 sm:mt-6">
        {/* Left Column: Content Explorer */}
        <div className="lg:col-span-7 flex flex-col gap-3 sm:gap-4 relative z-0">
          {/* Main Content Tabs */}
          <div className="flex border-b border-white/10 gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar pb-1">
            {
              [
                { id: 'servicos', label: 'Serviços', icon: 'room_service' },
                { id: 'fotos', label: 'Imagens', icon: 'photo_library' },
                { id: 'videos', label: 'Vídeos', icon: 'videocam' },
                { id: 'avaliacoes', label: 'Avaliações', icon: 'stars' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`pb-1.5 sm:pb-2 text-[9px] sm:text-[10px] font-black uppercase tracking-[0.05em] transition-all relative flex items-center gap-0.5 sm:gap-1 whitespace-nowrap px-1.5 sm:px-2 ${activeTab === tab.id ? 'text-white' : 'text-slate-500 hover:text-slate-300'
                    }`}
                >
                  <span className={`material-symbols-outlined text-[10px] sm:text-xs ${activeTab === tab.id ? 'text-blue-500' : 'text-slate-600'}`}>
                    {tab.icon}
                  </span>
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
                  {activeTab === tab.id && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-500 rounded-full animate-in fade-in zoom-in duration-300"></div>}
                </button>
              ))
            }
          </div>

          {/* Conditional Content Rendering */}
          <div className="min-h-[250px] sm:min-h-[300px] overflow-hidden">
            {activeTab === 'fotos' && (
              <div className="animate-in fade-in duration-500 space-y-2 sm:space-y-3">
                {model.galleryImages && model.galleryImages.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-4">
                    {model.galleryImages.slice(0, 3).map((img, i) => (
                      <div
                        key={i}
                        onClick={() => setSelectedImage(img)}
                        className="relative rounded-lg overflow-hidden group border border-white/5 bg-black flex items-center justify-center aspect-square min-h-[120px] sm:min-h-[140px] md:min-h-[160px] cursor-pointer hover:border-blue-500/50 transition-all"
                      >
                        <img src={img} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" alt={`Portfolio ${i + 1}`} />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors pointer-events-none flex items-center justify-center">
                          <span className="material-symbols-outlined text-white text-xl sm:text-2xl opacity-0 group-hover:opacity-100 transition-opacity">zoom_in</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-4">
                    <div
                      onClick={() => setSelectedImage(model.profileImage)}
                      className="relative rounded-lg overflow-hidden group border border-white/5 bg-black flex items-center justify-center aspect-square min-h-[120px] sm:min-h-[140px] md:min-h-[160px] cursor-pointer hover:border-blue-500/50 transition-all"
                    >
                      <img src={model.profileImage} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" alt="Profile" />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors pointer-events-none flex items-center justify-center">
                        <span className="material-symbols-outlined text-white text-xl sm:text-2xl opacity-0 group-hover:opacity-100 transition-opacity">zoom_in</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {
              activeTab === 'videos' && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  {model.previewVideos && model.previewVideos.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 gap-3 sm:gap-4">
                      {model.previewVideos.slice(0, 3).map((videoUrl, i) => (
                        <div
                          key={i}
                          onClick={() => setSelectedVideo(videoUrl)}
                          className="aspect-[9/16] rounded-lg bg-[#1c2127] relative overflow-hidden group border border-white/5 cursor-pointer hover:border-blue-500/50 transition-all"
                        >
                          <video
                            src={videoUrl}
                            className="h-full w-full object-cover opacity-60 group-hover:opacity-100 transition-opacity duration-700"
                            controls={false}
                            preload="metadata"
                            muted
                          />
                          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 pointer-events-none">
                            <div className="size-12 sm:size-14 rounded-full bg-blue-600/90 text-white flex items-center justify-center shadow-md backdrop-blur-sm group-hover:scale-110 transition-transform">
                              <span className="material-symbols-outlined filled text-xl sm:text-2xl">play_arrow</span>
                            </div>
                            <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-white/60 group-hover:text-white transition-colors">
                              Vídeo {i + 1}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 sm:py-16 text-center">
                      <span className="material-symbols-outlined text-4xl sm:text-5xl text-slate-700 mb-3">videocam_off</span>
                      <p className="text-slate-400 text-sm sm:text-base font-medium">Nenhum vídeo disponível ainda</p>
                      <p className="text-slate-500 text-xs sm:text-sm mt-1">A modelo ainda não adicionou vídeos ao seu perfil.</p>
                    </div>
                  )}
                </div>
              )
            }

            {
              activeTab === 'servicos' && (
                <div className="flex flex-col gap-4 sm:gap-5 animate-in slide-in-from-bottom-4 duration-500">
                  {/* Services Section */}
                  <section className="bg-[#1c2127] border border-white/5 p-4 sm:p-5 rounded-lg shadow-sm">
                    <h3 className="text-xs sm:text-sm font-black uppercase tracking-[0.1em] mb-4 text-blue-500 flex items-center gap-2">
                      <span className="material-symbols-outlined text-lg">payments</span>
                      Serviços
                    </h3>

                    {model.services && model.services.length > 0 ? (
                      <div className="flex flex-col gap-2">
                        {model.services.map((service, idx) => (
                          <div key={idx} className="flex justify-between items-center p-2 sm:p-3 bg-black/20 rounded-lg border border-white/5 hover:border-blue-500/30 transition-all group">
                            <div className="flex items-center gap-2 sm:gap-3">
                              <div className="size-5 sm:size-6 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                                <span className="material-symbols-outlined text-[10px] sm:text-xs">check</span>
                              </div>
                              <span className="text-[10px] sm:text-xs font-bold text-slate-200 group-hover:text-white transition-colors uppercase tracking-wide">{service.name}</span>
                            </div>
                            <span className="text-[10px] sm:text-xs font-black text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                              {new Intl.NumberFormat('pt-MZ', { style: 'currency', currency: 'MZN' }).format(Number(service.price))}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6 border border-dashed border-white/10 rounded-lg">
                        <span className="material-symbols-outlined text-3xl text-slate-600 mb-2">event_busy</span>
                        <p className="text-slate-500 text-sm italic">Nenhum serviço listado publicamente.</p>
                      </div>
                    )}
                  </section>
                </div>
              )
            }

            {
              activeTab === 'avaliacoes' && (
                <div className="animate-in slide-in-from-bottom-4 duration-500 space-y-4 sm:space-y-5">
                  {/* Status: Locked/Form */}
                  {!isRatingUnlocked ? (
                    <div className="bg-[#1c2127] border border-white/5 p-5 sm:p-6 rounded-lg flex flex-col items-center text-center gap-3 sm:gap-4 shadow-sm">
                      <div className="size-12 sm:size-14 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 mb-2 ring-2 ring-blue-500/5">
                        <span className="material-symbols-outlined text-xl sm:text-2xl filled">lock</span>
                      </div>
                      <div>
                        <h3 className="text-base sm:text-lg font-black uppercase italic tracking-tighter">Classificar Modelo</h3>
                        <p className="text-slate-500 text-xs sm:text-sm mt-1 max-w-sm mx-auto">
                          Para garantir avaliações reais, você precisa inserir o código recebido após o pagamento do contato.
                        </p>
                      </div>

                      <div className="w-full max-w-xs sm:max-w-sm space-y-2 sm:space-y-3">
                        <div className="relative group">
                          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-base group-focus-within:text-blue-500 transition-colors">key</span>
                          <input
                            type="text"
                            placeholder="CÓDIGO (ex: VER-1234)"
                            value={ratingCodeInput}
                            onChange={(e) => setRatingCodeInput(e.target.value.toUpperCase())}
                            className="w-full bg-[#111418] border border-white/10 rounded-lg py-2.5 sm:py-3 pl-12 pr-3 text-center font-mono font-bold uppercase tracking-widest text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                          />
                        </div>
                        {ratingError && <p className="text-xs sm:text-sm text-rose-500 font-black uppercase tracking-widest">{ratingError}</p>}
                        <button
                          onClick={handleValidateCode}
                          className="w-full py-2.5 sm:py-3 bg-blue-600 rounded-lg text-xs sm:text-sm font-black uppercase tracking-[0.1em] shadow-sm shadow-blue-900/40 hover:bg-blue-500 active:scale-95 transition-all"
                        >
                          Desbloquear Avaliação
                        </button>
                      </div>
                    </div>
                  ) : hasSubmittedRating ? (
                    <div className="bg-emerald-500/10 border border-emerald-500/20 p-5 sm:p-6 rounded-lg flex flex-col items-center text-center gap-2 sm:gap-3 animate-in zoom-in duration-500 shadow-sm">
                      <span className="material-symbols-outlined text-3xl sm:text-4xl text-emerald-500 filled">check_circle</span>
                      <h3 className="text-base sm:text-lg font-black uppercase italic tracking-tighter">Avaliação Enviada!</h3>
                      <p className="text-slate-400 text-xs sm:text-sm">Obrigado por ajudar a comunidade com seu feedback real.</p>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmitRating} className="bg-[#1c2127] border border-white/5 p-4 sm:p-5 rounded-lg shadow-sm space-y-4 sm:space-y-5 animate-in fade-in duration-500">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                        <h3 className="text-sm sm:text-base font-black uppercase italic tracking-tighter">Sua Experiência Profissional</h3>
                        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-500/10 rounded-full border border-blue-500/20">
                          <span className="text-[9px] sm:text-[10px] font-black text-blue-500 uppercase tracking-widest">Código: {ratingCodeInput}</span>
                        </div>
                      </div>

                      <div className="flex flex-col items-center gap-2 sm:gap-3 p-4 sm:p-5 bg-black/20 rounded-lg border border-white/5">
                        <span className="text-xs sm:text-sm font-black uppercase tracking-[0.1em] text-slate-500">Sua Nota</span>
                        <div className="flex gap-2 sm:gap-2.5">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setUserRating(star)}
                              className={`size-10 sm:size-12 rounded-lg flex items-center justify-center transition-all ${userRating >= star ? 'bg-amber-500/10 text-amber-500' : 'bg-white/5 text-slate-700 hover:text-slate-500'
                                }`}
                            >
                              <span className={`material-symbols-outlined text-lg sm:text-xl ${userRating >= star ? 'filled' : ''}`}>star</span>
                            </button>
                          ))}
                        </div>
                        <span className="text-xs sm:text-sm font-black uppercase text-amber-500">
                          {userRating === 1 && 'Ruim'}
                          {userRating === 2 && 'Regular'}
                          {userRating === 3 && 'Bom'}
                          {userRating === 4 && 'Ótimo'}
                          {userRating === 5 && 'Excepcional'}
                        </span>
                      </div>

                      <div className="flex flex-col gap-2">
                        <label className="text-xs sm:text-sm font-black uppercase tracking-[0.1em] text-slate-600">Comentário (Opcional)</label>
                        <textarea
                          rows={3}
                          value={userComment}
                          onChange={(e) => setUserComment(e.target.value)}
                          placeholder="Como foi trabalhar com esta modelo? Seja profissional no seu feedback."
                          className="w-full bg-[#111418] border border-white/10 rounded-lg p-3 sm:p-4 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none"
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full py-3 sm:py-3.5 bg-blue-600 rounded-lg text-xs sm:text-sm font-black uppercase tracking-[0.1em] shadow-sm shadow-blue-900/40 hover:bg-blue-500 active:scale-95 transition-all"
                      >
                        Publicar Classificação
                      </button>
                    </form>
                  )}

                  {/* Relatos de Contratantes Reais */}
                  <div className="space-y-3 sm:space-y-4">
                    <h4 className="text-xs sm:text-sm font-black uppercase tracking-[0.2em] text-slate-600 px-2 sm:px-3 flex items-center gap-2">
                      <span className="material-symbols-outlined text-base sm:text-lg">history_edu</span>
                      Relatos de Contratantes
                    </h4>

                    {reviewsLoading ? (
                      <div className="flex justify-center py-8">
                        <span className="material-symbols-outlined animate-spin text-slate-700">refresh</span>
                      </div>
                    ) : reviews.length > 0 ? (
                      reviews.map((rev, i) => (
                        <div key={rev.id || i} className="bg-[#1c2127] border border-white/5 p-4 sm:p-5 rounded-lg flex flex-col gap-2 sm:gap-3 shadow-sm hover:border-blue-500/10 transition-colors">
                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                            <div className="flex items-center gap-2 sm:gap-3">
                              <div className="size-8 sm:size-10 rounded-full bg-blue-600/10 flex items-center justify-center font-black text-xs sm:text-sm text-blue-500">
                                {(rev.user_display_name || 'U')[0]}
                              </div>
                              <div>
                                <p className="text-xs sm:text-sm font-black uppercase tracking-tight text-white">{rev.user_display_name || 'Usuário Verificado'}</p>
                                <div className="flex gap-0.5 mt-1">
                                  {[1, 2, 3, 4, 5].map(s => (
                                    <span key={s} className={`material-symbols-outlined text-xs sm:text-sm ${s <= rev.rating ? 'text-amber-500 filled' : 'text-slate-700'}`}>star</span>
                                  ))}
                                </div>
                              </div>
                            </div>
                            <span className="text-[9px] sm:text-[10px] font-black text-slate-600 uppercase tracking-widest">
                              {new Date(rev.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-slate-400 text-xs sm:text-sm italic font-medium leading-relaxed">
                            "{rev.comment}"
                          </p>
                        </div>
                      ))
                    ) : (
                      <div className="bg-[#1c2127] border border-white/5 p-8 rounded-lg text-center">
                        <p className="text-slate-500 text-sm italic font-medium">Nenhuma avaliação real ainda. Seja o primeiro a avaliar após contratar!</p>
                      </div>
                    )}
                  </div>
                </div>
              )
            }
          </div>
        </div>

        {/* Right Sidebar: Sticky Call to Action */}
        <aside className="lg:col-span-5 flex flex-col gap-4 sm:gap-5 lg:gap-5 order-last lg:order-last relative z-10">
          <div className="lg:sticky lg:top-20 space-y-4 sm:space-y-5 lg:space-y-3">

            {/* Payment & Contact Card */}
            <div className="relative rounded-lg sm:rounded-xl bg-gradient-to-br from-blue-600 to-blue-800 p-4 sm:p-5 lg:p-3 text-white overflow-hidden shadow-sm shadow-blue-900/40">
              <div className="absolute -top-3 -right-3 size-16 bg-white/10 rounded-full blur-xl"></div>

              <div className="relative z-10">
                <div className="flex items-center gap-2 sm:gap-2.5 mb-4 sm:mb-5 lg:mb-3">
                  <div className="size-10 sm:size-12 lg:size-8 rounded-lg lg:rounded-md bg-white/20 backdrop-blur-md flex items-center justify-center">
                    <span className="material-symbols-outlined filled text-white text-base sm:text-lg lg:text-xs">lock</span>
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base lg:text-xs font-bold italic tracking-tight uppercase">Contato Direto</h3>
                    <p className="text-blue-100 text-[9px] sm:text-[10px] lg:text-[8px] font-bold uppercase tracking-widest opacity-80">Acesso profissional seguro</p>
                  </div>
                </div>

                <ul className="space-y-2 sm:space-y-2.5 lg:space-y-1.5 mb-4 sm:mb-5 lg:mb-3">
                  {[
                    'WhatsApp Direto da Modelo',
                    'Telefone Profissional',
                    'Código de Classificação'
                  ].map(item => (
                    <li key={item} className="flex items-center gap-2 text-xs sm:text-sm lg:text-[10px] font-medium">
                      <span className="material-symbols-outlined text-blue-200 text-base sm:text-lg lg:text-xs">check_circle</span>
                      {item}
                    </li>
                  ))}
                </ul>

                <div className="bg-black/10 backdrop-blur-md rounded-lg lg:rounded-md p-3 sm:p-4 lg:p-2.5 border border-white/10 mb-4 sm:mb-5 lg:mb-3">
                  <div className="flex justify-between items-center mb-1 sm:mb-1.5 lg:mb-0.5">
                    <span className="text-[9px] sm:text-[10px] lg:text-[8px] uppercase font-bold tracking-[0.1em] opacity-60">Taxa de Acesso</span>
                    <span className="text-lg sm:text-xl lg:text-base font-black">50 MT</span>
                  </div>
                  <p className="text-[8px] sm:text-[9px] lg:text-[7px] opacity-60 leading-tight font-medium">Pagamento único via M-Pesa ou eMola. Sem comissões.</p>
                </div>

                {isContactUnlocked ? (
                  <div className="w-full rounded-lg lg:rounded-md bg-emerald-500/20 border-2 border-emerald-500/30 p-3 sm:p-4 lg:p-2.5 space-y-2">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <span className="material-symbols-outlined text-emerald-500 text-sm">phone</span>
                      <p className="text-[9px] sm:text-[10px] lg:text-[8px] font-black uppercase tracking-widest text-emerald-500">Contato Desbloqueado</p>
                    </div>
                    {model?.phoneNumber ? (
                      <a
                        href={`https://wa.me/${model.phoneNumber.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block text-center text-base sm:text-lg lg:text-sm font-black text-white hover:text-emerald-300 transition-colors"
                      >
                        {model.phoneNumber}
                      </a>
                    ) : (
                      <p className="text-center text-[10px] text-white/70 italic">Número de telefone indisponível.</p>
                    )}
                    <div className="flex items-center justify-center gap-1 text-[8px] sm:text-[9px] lg:text-[7px] text-emerald-400">
                      <span className="material-symbols-outlined text-xs">timer</span>
                      <span>Expira em: {formatTime(timeRemaining)}</span>
                    </div>
                  </div>
                ) : (
                  model?.id && (
                    <Link
                      to={`/pagamento/${model.id}`}
                      className="w-full rounded-lg lg:rounded-md bg-white py-3 sm:py-3.5 lg:py-2 text-blue-900 font-black text-center shadow-sm hover:bg-blue-50 transition-all flex items-center justify-center gap-2 group uppercase tracking-widest text-xs sm:text-sm lg:text-[9px]"
                    >
                      DESBLOQUEAR AGORA
                      <span className="material-symbols-outlined text-base sm:text-lg lg:text-xs group-hover:translate-x-1 transition-transform">arrow_forward</span>
                    </Link>
                  )
                )}
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-300"
          onClick={() => setSelectedImage(null)}
        >
          <button
            onClick={() => setSelectedImage(null)}
            className="absolute top-2 right-2 sm:top-4 sm:right-4 size-10 sm:size-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-all z-20"
            title="Fechar"
          >
            <span className="material-symbols-outlined text-xl sm:text-2xl">close</span>
          </button>

          {(model.galleryImages && model.galleryImages.length > 0) || model.profileImage ? (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  const allImages = [model.profileImage, ...(model.galleryImages || [])].filter(Boolean);
                  const currentIndex = allImages.indexOf(selectedImage);
                  const prevIndex = (currentIndex - 1 + allImages.length) % allImages.length;
                  setSelectedImage(allImages[prevIndex]);
                }}
                className="absolute left-2 top-1/2 -translate-y-1/2 size-10 sm:size-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-all z-20"
              >
                <span className="material-symbols-outlined text-xl sm:text-2xl">chevron_left</span>
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  const allImages = [model.profileImage, ...(model.galleryImages || [])].filter(Boolean);
                  const currentIndex = allImages.indexOf(selectedImage);
                  const nextIndex = (currentIndex + 1) % allImages.length;
                  setSelectedImage(allImages[nextIndex]);
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 size-10 sm:size-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-all z-20"
              >
                <span className="material-symbols-outlined text-xl sm:text-2xl">chevron_right</span>
              </button>
            </>
          ) : null}

          <div className="max-w-7xl max-h-[95vh] sm:max-h-[90vh] w-full h-full flex items-center justify-center">
            <img
              src={selectedImage}
              className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
              alt="Imagem ampliada"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}

      {/* Video Modal */}
      {selectedVideo && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-300"
          onClick={() => setSelectedVideo(null)}
        >
          <button
            onClick={() => setSelectedVideo(null)}
            className="absolute top-2 right-2 sm:top-4 sm:right-4 size-10 sm:size-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-all z-10"
            title="Fechar"
          >
            <span className="material-symbols-outlined text-xl sm:text-2xl">close</span>
          </button>
          <div className="max-w-7xl max-h-[95vh] sm:max-h-[90vh] w-full h-full flex items-center justify-center p-4">
            <video
              src={selectedVideo}
              className="max-w-full max-h-full object-contain rounded-lg"
              controls
              autoPlay
              onClick={(e) => e.stopPropagation()}
            >
              Seu navegador não suporta vídeo HTML5.
            </video>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
