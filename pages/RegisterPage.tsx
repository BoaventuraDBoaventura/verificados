
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { MOZAMBIQUE_PROVINCES } from '../constants';
import { supabase } from '../supabaseClient';
import { uploadFile } from '../utils/storage';

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(null);
  const [previewVideo, setPreviewVideo] = useState<File | null>(null);
  const [previewVideoName, setPreviewVideoName] = useState<string | null>(null);
  
  // Estados para os termos obrigatórios
  const [agreements, setAgreements] = useState({
    terms: false,
    privacy: false,
    videoCall: false,
    age: false
  });
  const [error, setError] = useState<string | null>(null);

  // Carregar categorias do banco de dados
  useEffect(() => {
    const fetchCategories = async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('name')
        .order('name', { ascending: true });

      if (error) {
        console.error('Erro ao carregar categorias:', error);
        setCategories([]);
        return;
      }

      if (data && data.length > 0) {
        setCategories(data.map((c: any) => c.name as string));
      } else {
        setCategories([]);
      }
    };

    fetchCategories();
  }, []);

  const toggleCategory = (cat: string) => {
    setSelectedCategories(prev => 
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('A imagem deve ter no máximo 5MB.');
        return;
      }
      setProfileImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePreviewVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 30 * 1024 * 1024) {
        setError('O vídeo deve ter no máximo 30MB.');
        return;
      }
      setPreviewVideo(file);
      setPreviewVideoName(file.name);
    }
  };

  const isFormValid = agreements.terms && 
                     agreements.privacy && 
                     agreements.videoCall && 
                     agreements.age && 
                     selectedCategories.length > 0;

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setAgreements(prev => ({ ...prev, [name]: checked }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;

    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);

    setLoading(true);
    setError(null);

    try {
      // Primeiro, inserir o modelo no banco para obter o ID
      const payload = {
        artistic_name: formData.get('artisticName') as string,
        email: formData.get('email') as string,
        password: formData.get('password') as string,
        age: Number(formData.get('age')),
        province: formData.get('province') as string,
        city: formData.get('city') as string,
        categories: selectedCategories,
        phone_number: formData.get('phone') as string,
        agrees_terms: agreements.terms,
        agrees_privacy: agreements.privacy,
        agrees_video_call: agreements.videoCall,
        is_adult: agreements.age
      };

      const { data: insertedData, error: insertError } = await supabase
        .from('models')
        .insert(payload)
        .select()
        .single();

      if (insertError) {
        console.error(insertError);
        setError('Ocorreu um erro ao salvar seu cadastro. Tente novamente.');
        setLoading(false);
        return;
      }

      const modelId = insertedData.id;
      const updateData: any = {};

      // Upload da foto de perfil se houver
      if (profileImage) {
        const timestamp = Date.now();
        const fileExt = profileImage.name.split('.').pop();
        const profileImagePath = `models/${modelId}/profile_${timestamp}.${fileExt}`;
        const profileImageUrl = await uploadFile(profileImage, profileImagePath);
        
        if (profileImageUrl) {
          updateData.profile_image = profileImageUrl;
        } else {
          console.warn('Erro ao fazer upload da foto de perfil, mas continuando...');
        }
      }

      // Upload do vídeo de casting se houver
      if (previewVideo) {
        const timestamp = Date.now();
        const fileExt = previewVideo.name.split('.').pop();
        const videoPath = `models/${modelId}/casting_${timestamp}.${fileExt}`;
        const videoUrl = await uploadFile(previewVideo, videoPath);
        
        if (videoUrl) {
          updateData.verification_video = videoUrl;
        } else {
          console.warn('Erro ao fazer upload do vídeo de casting, mas continuando...');
        }
      }

      // Atualizar o modelo com as URLs das mídias se houver
      if (Object.keys(updateData).length > 0) {
        const { error: updateError } = await supabase
          .from('models')
          .update(updateData)
          .eq('id', modelId);

        if (updateError) {
          console.error('Erro ao atualizar mídias:', updateError);
          // Não falhar o cadastro por causa disso, apenas logar o erro
        }
      }

      setLoading(false);
      navigate('/login');
    } catch (err: any) {
      console.error('Erro ao processar cadastro:', err);
      setError('Ocorreu um erro ao salvar seu cadastro. Tente novamente.');
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 md:py-20">
      <div className="mb-10 text-center md:text-left">
        <h1 className="text-4xl font-black tracking-tight mb-4 uppercase italic tracking-tighter">Cadastro de Modelo</h1>
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
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Nome Artístico</label>
              <input name="artisticName" type="text" placeholder="Ex: Ana Silva" className="rounded-lg border border-white/10 bg-[#111418] p-4 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all" required />
            </div>
            <div className="md:col-span-4 flex flex-col gap-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Idade</label>
              <input name="age" type="number" placeholder="Ex: 25" className="rounded-lg border border-white/10 bg-[#111418] p-4 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all" required />
            </div>
            
            <div className="md:col-span-6 flex flex-col gap-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">E-mail</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-slate-500">email</span>
                <input name="email" type="email" placeholder="exemplo@email.com" className="w-full rounded-lg border border-white/10 bg-[#111418] p-4 pr-12 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all" required />
              </div>
            </div>

            <div className="md:col-span-6 flex flex-col gap-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Senha</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-slate-500">lock</span>
                <input name="password" type="password" placeholder="••••••••" className="w-full rounded-lg border border-white/10 bg-[#111418] p-4 pr-12 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all" required minLength={6} />
              </div>
              <p className="text-[9px] text-slate-500 mt-1">Mínimo 6 caracteres</p>
            </div>
            
            <div className="md:col-span-6 flex flex-col gap-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Província</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">expand_more</span>
                <select 
                  name="province"
                  className="w-full appearance-none rounded-lg border border-white/10 bg-[#111418] p-4 pr-12 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all cursor-pointer" 
                  required
                >
                  <option value="" disabled>Selecionar Província</option>
                  {MOZAMBIQUE_PROVINCES.map(prov => (
                    <option key={prov} value={prov} className="bg-[#1c2127]">{prov}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="md:col-span-6 flex flex-col gap-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Cidade / Distrito</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-slate-500">location_on</span>
                <input name="city" type="text" placeholder="Ex: Maputo, Matola, Beira" className="w-full rounded-lg border border-white/10 bg-[#111418] p-4 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all" required />
              </div>
            </div>
          </div>
        </section>

        {/* Categorias de Atuação */}
        <section className="rounded-2xl bg-[#1c2127] p-6 md:p-10 border border-white/5 shadow-xl">
          <h2 className="text-xl font-bold border-b border-white/5 pb-4 mb-6 flex items-center gap-2">
            <span className="material-symbols-outlined text-blue-500">category</span>
            Categorias de Atuação
          </h2>
          <p className="text-xs text-slate-500 mb-6 uppercase tracking-widest font-bold">Selecione todas as categorias que fazem parte do seu perfil profissional:</p>
          {categories.length === 0 ? (
            <div className="py-8 text-center rounded-xl bg-white/5 border border-white/10">
              <span className="material-symbols-outlined text-4xl text-slate-600 mb-2">category</span>
              <p className="text-sm text-slate-400 font-medium">Nenhuma categoria cadastrada ainda.</p>
              <p className="text-xs text-slate-500 mt-1">Entre em contato com o administrador para cadastrar categorias.</p>
            </div>
          ) : (
            <div className="flex flex-wrap gap-3">
              {categories.map(cat => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => toggleCategory(cat)}
                  className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                    selectedCategories.includes(cat)
                      ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-900/40'
                      : 'bg-[#111418] border-white/10 text-slate-500 hover:border-white/30'
                  }`}
                >
                  {cat}
                  {selectedCategories.includes(cat) && <span className="material-symbols-outlined text-[12px] ml-2">check</span>}
                </button>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-2xl bg-[#1c2127] p-6 md:p-10 border border-white/5 shadow-xl">
          <h2 className="text-xl font-bold border-b border-white/5 pb-4 mb-6 flex items-center gap-2">
            <span className="material-symbols-outlined text-blue-500">lock_person</span>
            Contato Privado
          </h2>
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">WhatsApp / Celular</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-slate-500">lock</span>
              <input name="phone" type="tel" placeholder="(+258) 84 000 0000" className="w-full rounded-lg border border-white/10 bg-[#111418] p-4 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all" required />
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
              <span className="material-symbols-outlined text-sm">visibility_off</span>
              <span className="text-[10px] font-bold uppercase tracking-widest">Este número não será exibido publicamente.</span>
            </div>
          </div>
        </section>

        <section className="rounded-2xl bg-[#1c2127] p-6 md:p-10 border border-white/5 shadow-xl">
          <h2 className="text-xl font-bold border-b border-white/5 pb-4 mb-6 flex items-center gap-2">
            <span className="material-symbols-outlined text-blue-500">upload_file</span>
            Mídia Inicial
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex flex-col gap-4">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Foto de Perfil Principal</label>
              {profileImagePreview ? (
                <div className="relative h-48 rounded-xl overflow-hidden border-2 border-blue-500 bg-[#111418]">
                  <img src={profileImagePreview} alt="Preview" className="w-full h-full object-cover" />
                  <div className="absolute top-2 right-2 flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/90 backdrop-blur-sm">
                    <span className="material-symbols-outlined text-sm text-white">check_circle</span>
                    <span className="text-[9px] font-black text-white uppercase">Carregado</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setProfileImage(null);
                      setProfileImagePreview(null);
                    }}
                    className="absolute top-2 left-2 size-8 rounded-full bg-red-500/90 backdrop-blur-sm flex items-center justify-center hover:bg-red-500 transition-colors"
                  >
                    <span className="material-symbols-outlined text-sm text-white">close</span>
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-48 rounded-xl border-2 border-dashed border-white/10 bg-[#111418] hover:border-blue-500/50 cursor-pointer transition-all group relative overflow-hidden">
                  <span className="material-symbols-outlined text-3xl mb-2 group-hover:scale-110 transition-transform">add_a_photo</span>
                  <span className="text-sm font-bold uppercase tracking-tighter">Clique para enviar foto</span>
                  <span className="text-[10px] text-slate-500 mt-1 uppercase tracking-widest">JPG ou PNG (Max 5MB)</span>
                  <input 
                    type="file" 
                    className="absolute inset-0 opacity-0 cursor-pointer" 
                    accept="image/*" 
                    onChange={handleProfileImageChange}
                  />
                </div>
              )}
            </div>
            <div className="flex flex-col gap-4">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Vídeo de Casting (Opcional)</label>
              {previewVideoName ? (
                <div className="relative h-48 rounded-xl border-2 border-blue-500 bg-[#111418] flex flex-col items-center justify-center p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="material-symbols-outlined text-4xl text-emerald-500">videocam</span>
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-white">{previewVideoName}</span>
                      <span className="text-[9px] text-slate-400">{previewVideo ? ((previewVideo.size / (1024 * 1024)).toFixed(2)) : '0.00'} MB</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/90 backdrop-blur-sm">
                    <span className="material-symbols-outlined text-sm text-white">check_circle</span>
                    <span className="text-[9px] font-black text-white uppercase">Carregado</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setPreviewVideo(null);
                      setPreviewVideoName(null);
                    }}
                    className="absolute top-2 right-2 size-8 rounded-full bg-red-500/90 backdrop-blur-sm flex items-center justify-center hover:bg-red-500 transition-colors"
                  >
                    <span className="material-symbols-outlined text-sm text-white">close</span>
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-48 rounded-xl border-2 border-dashed border-white/10 bg-[#111418] hover:border-blue-500/50 cursor-pointer transition-all group relative overflow-hidden">
                  <span className="material-symbols-outlined text-3xl mb-2 group-hover:scale-110 transition-transform">videocam</span>
                  <span className="text-sm font-bold uppercase tracking-tighter">Carregar vídeo prévia</span>
                  <span className="text-[10px] text-slate-500 mt-1 uppercase tracking-widest">MP4 ou MOV (Max 30MB)</span>
                  <input 
                    type="file" 
                    className="absolute inset-0 opacity-0 cursor-pointer" 
                    accept="video/*" 
                    onChange={handlePreviewVideoChange}
                  />
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="flex flex-col gap-6">
          <div className="flex flex-col gap-4">
            <label className="flex items-start gap-3 cursor-pointer group">
              <input 
                type="checkbox" 
                name="terms"
                checked={agreements.terms}
                onChange={handleCheckboxChange}
                className="mt-1 h-5 w-5 rounded border-white/10 bg-[#1c2127] text-blue-600 focus:ring-0" 
              />
              <span className="text-sm text-slate-400 group-hover:text-white transition-colors">
                Declaro que li e aceito os <Link to="/termos" onClick={(e) => e.stopPropagation()} className="text-blue-500 font-bold hover:underline">Termos de Uso</Link> da plataforma.
              </span>
            </label>
            <label className="flex items-start gap-3 cursor-pointer group">
              <input 
                type="checkbox" 
                name="privacy"
                checked={agreements.privacy}
                onChange={handleCheckboxChange}
                className="mt-1 h-5 w-5 rounded border-white/10 bg-[#1c2127] text-blue-600 focus:ring-0" 
              />
              <span className="text-sm text-slate-400 group-hover:text-white transition-colors">
                Aceito a <Link to="/privacidade" onClick={(e) => e.stopPropagation()} className="text-blue-500 font-bold hover:underline">Política de Privacidade</Link> e o tratamento dos meus dados.
              </span>
            </label>
            <label className="flex items-start gap-3 cursor-pointer group">
              <input 
                type="checkbox" 
                name="videoCall"
                checked={agreements.videoCall}
                onChange={handleCheckboxChange}
                className="mt-1 h-5 w-5 rounded border-white/10 bg-[#1c2127] text-blue-600 focus:ring-0" 
              />
              <span className="text-sm text-slate-400 group-hover:text-white transition-colors">
                Aceito que a equipe <strong className="text-white">Verificados</strong> entre em contacto por vídeo chamada para concluir a verificação.
              </span>
            </label>
            <label className="flex items-start gap-3 cursor-pointer group">
              <input 
                type="checkbox" 
                name="age"
                checked={agreements.age}
                onChange={handleCheckboxChange}
                className="mt-1 h-5 w-5 rounded border-white/10 bg-[#1c2127] text-blue-600 focus:ring-0" 
              />
              <span className="text-sm text-slate-400 group-hover:text-white transition-colors">
                Confirmo que possuo <strong className="text-white">18 anos</strong> ou mais.
              </span>
            </label>
          </div>

          <div className="flex flex-col gap-4 mt-6">
            {error && (
              <p className="text-xs text-red-400 font-bold text-center">
                {error}
              </p>
            )}
            <button 
              type="submit" 
              disabled={loading || !isFormValid}
              className="w-full rounded-xl bg-blue-600 py-5 text-lg font-black text-white shadow-2xl shadow-blue-900/40 hover:bg-blue-500 transition-all active:scale-95 disabled:opacity-30 disabled:grayscale disabled:cursor-not-allowed flex items-center justify-center gap-3 uppercase italic"
            >
              {loading ? 'Processando...' : (
                <>
                  Finalizar Cadastro
                  <span className="material-symbols-outlined">how_to_reg</span>
                </>
              )}
            </button>
            <p className="text-center text-xs text-slate-500 font-bold uppercase tracking-widest">
              Já tem uma conta? <Link to="/login" className="text-blue-500 hover:underline ml-1">Fazer Login</Link>
            </p>
          </div>
        </section>
      </form>
    </div>
  );
};

export default RegisterPage;
