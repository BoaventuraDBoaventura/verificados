
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MOZAMBIQUE_PROVINCES, MOCK_MODELS } from '../constants';
import { User, Model } from '../types';

interface EditProfilePageProps {
  user: User;
}

const EditProfilePage: React.FC<EditProfilePageProps> = ({ user }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<Model>>({});

  useEffect(() => {
    const currentModel = MOCK_MODELS.find(m => m.id === user.modelId);
    if (currentModel) {
      setFormData(currentModel);
    }
  }, [user.modelId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulation: in a real app, update backend here
    setTimeout(() => {
      setLoading(false);
      navigate('/dashboard');
    }, 1500);
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 md:py-20">
      <div className="mb-10 text-center md:text-left">
        <h1 className="text-4xl font-black tracking-tight mb-4 uppercase italic">Editar Perfil Profissional</h1>
        <p className="text-lg text-slate-400">Mantenha seus dados e medidas atualizados para atrair mais contratantes.</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-10">
        
        {/* Identidade Artística */}
        <section className="rounded-2xl bg-[#1c2127] p-6 md:p-10 border border-white/5 shadow-xl">
          <h2 className="text-xl font-bold border-b border-white/5 pb-4 mb-8 flex items-center gap-2">
            <span className="material-symbols-outlined text-blue-500">palette</span>
            Identidade Artística
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Nome Artístico</label>
              <input 
                name="artisticName"
                value={formData.artisticName || ''}
                onChange={handleChange}
                type="text" 
                className="rounded-xl border border-white/10 bg-[#111418] p-4 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all" 
                required 
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Categoria Principal</label>
              <select 
                name="category"
                value={formData.category || ''}
                onChange={handleChange}
                className="rounded-xl border border-white/10 bg-[#111418] p-4 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all cursor-pointer"
                required
              >
                {['Fashion', 'Editorial', 'Comercial', 'Runway', 'Alternative'].map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2 flex flex-col gap-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Bio / Apresentação</label>
              <textarea 
                name="bio"
                value={formData.bio || ''}
                onChange={handleChange}
                rows={4}
                className="rounded-xl border border-white/10 bg-[#111418] p-4 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none"
                required
              />
            </div>
          </div>
        </section>

        {/* Localização */}
        <section className="rounded-2xl bg-[#1c2127] p-6 md:p-10 border border-white/5 shadow-xl">
          <h2 className="text-xl font-bold border-b border-white/5 pb-4 mb-8 flex items-center gap-2">
            <span className="material-symbols-outlined text-blue-500">location_on</span>
            Localização Atual
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Província</label>
              <select 
                name="location"
                value={formData.location || ''}
                onChange={handleChange}
                className="rounded-xl border border-white/10 bg-[#111418] p-4 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all cursor-pointer"
                required
              >
                {MOZAMBIQUE_PROVINCES.map(prov => (
                  <option key={prov} value={prov}>{prov}</option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {/* Ficha Técnica / Medidas */}
        <section className="rounded-2xl bg-[#1c2127] p-6 md:p-10 border border-white/5 shadow-xl">
          <h2 className="text-xl font-bold border-b border-white/5 pb-4 mb-8 flex items-center gap-2">
            <span className="material-symbols-outlined text-blue-500">straighten</span>
            Ficha Técnica e Medidas
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { label: 'Idade', name: 'age', type: 'number', placeholder: '24' },
              { label: 'Altura (m)', name: 'height', type: 'text', placeholder: '1.76 m' },
              { label: 'Peso (kg)', name: 'weight', type: 'text', placeholder: '58 kg' },
              { label: 'Cintura (cm)', name: 'waist', type: 'text', placeholder: '62 cm' },
              { label: 'Busto (cm)', name: 'bust', type: 'text', placeholder: '88 cm' },
              { label: 'Olhos', name: 'eyes', type: 'text', placeholder: 'Verdes' },
              { label: 'Cabelos', name: 'hair', type: 'text', placeholder: 'Castanhos' },
              { label: 'Calçado', name: 'shoeSize', type: 'text', placeholder: '37' },
            ].map(field => (
              <div key={field.name} className="flex flex-col gap-2">
                <label className="text-[9px] font-black uppercase tracking-widest text-slate-500">{field.label}</label>
                <input 
                  type={field.type}
                  name={field.name}
                  value={(formData as any)[field.name] || ''}
                  onChange={handleChange}
                  placeholder={field.placeholder}
                  className="rounded-xl border border-white/10 bg-[#111418] p-3 text-sm text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                />
              </div>
            ))}
          </div>
        </section>

        {/* Mídia Principal */}
        <section className="rounded-2xl bg-[#1c2127] p-6 md:p-10 border border-white/5 shadow-xl">
          <h2 className="text-xl font-bold border-b border-white/5 pb-4 mb-8 flex items-center gap-2">
            <span className="material-symbols-outlined text-blue-500">imagesmode</span>
            Mídia do Perfil
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col gap-4">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Foto de Perfil Atual</label>
              <div className="aspect-[3/4] rounded-2xl bg-[#111418] border border-white/10 overflow-hidden relative group cursor-pointer">
                <img src={formData.profileImage} className="h-full w-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" alt="Current" />
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="material-symbols-outlined text-white">edit</span>
                </div>
                <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" />
              </div>
            </div>
            
            <div className="md:col-span-2 flex flex-col gap-4">
               <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Portfólio (Galeria)</label>
               <div className="grid grid-cols-3 gap-2">
                 {[1,2,3,4,5,6].map(i => (
                   <div key={i} className="aspect-square rounded-xl bg-[#111418] border border-white/10 flex items-center justify-center cursor-pointer hover:border-blue-500/50 transition-all text-slate-600">
                     <span className="material-symbols-outlined">add_photo_alternate</span>
                   </div>
                 ))}
               </div>
               <p className="text-[9px] text-slate-500 font-bold uppercase">Mínimo 3 fotos de alta qualidade recomendadas.</p>
            </div>
          </div>
        </section>

        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-10 border-t border-white/5">
           <button 
             type="button"
             onClick={() => navigate('/dashboard')}
             className="text-xs font-black uppercase tracking-widest text-slate-500 hover:text-white transition-colors"
           >
             Cancelar Alterações
           </button>
           <button 
              type="submit" 
              disabled={loading}
              className="w-full md:w-auto min-w-[280px] rounded-xl bg-blue-600 py-5 text-lg font-black text-white shadow-2xl shadow-blue-900/40 hover:bg-blue-500 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3 uppercase italic"
            >
              {loading ? 'Salvando...' : (
                <>
                  Atualizar Perfil Público
                  <span className="material-symbols-outlined">save</span>
                </>
              )}
            </button>
        </div>
      </form>
    </div>
  );
};

export default EditProfilePage;
