
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { VerificationStatus, Model } from '../types';
import { supabase } from '../supabaseClient';
import { useToast } from '../context/ToastContext';
import { logger } from '../utils/logger';
import { AdminLog } from '../types';

function timeAgo(dateString: string) {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " anos atrás";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " meses atrás";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " dias atrás";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " horas atrás";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " min atrás";
    return "agora mesmo";
}

const AdminDashboardPage: React.FC = () => {
    const { showToast } = useToast();
    const [activeTab, setActiveTab] = useState<'overview' | 'verificacoes' | 'modelos' | 'categorias' | 'financeiro'>('overview');
    const [models, setModels] = useState<Model[]>([]);
    const [categories, setCategories] = useState<string[]>([]);
    const [newCategory, setNewCategory] = useState('');
    const [loading, setLoading] = useState(false);
    const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
    const [logs, setLogs] = useState<AdminLog[]>([]);

    const fetchLogs = async () => {
        const recentLogs = await logger.getRecentLogs();
        setLogs(recentLogs);
    };

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);

            // Carregar modelos
            const { data: modelsData, error: modelsError } = await supabase
                .from('models')
                .select('*')
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
                    profileImage:
                        row.profile_image ||
                        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=600&auto=format&fit=crop',
                    previewVideos: row.preview_videos || [],
                    galleryImages: row.gallery_images || [],
                    phoneNumber: row.phone_number,
                    isVerified: row.is_verified ?? row.status === 'Aprovado',
                    status:
                        row.status === VerificationStatus.APPROVED
                            ? VerificationStatus.APPROVED
                            : row.status === VerificationStatus.REJECTED
                                ? VerificationStatus.REJECTED
                                : row.status === VerificationStatus.UNVERIFIED
                                    ? VerificationStatus.UNVERIFIED
                                    : VerificationStatus.PENDING,
                    height: row.height ?? undefined,
                    weight: row.weight ?? undefined,
                    waist: row.waist ?? undefined,
                    bust: row.bust ?? undefined,
                    eyes: row.eyes ?? undefined,
                    hair: row.hair ?? undefined,
                    shoeSize: row.shoe_size ?? undefined,
                    verificationVideo: row.verification_video || null
                }));
                setModels(mappedModels);
            } else if (modelsError) {
                console.error('Erro ao carregar modelos:', modelsError);
            }

            // Carregar categorias
            const { data: catData, error: catError } = await supabase
                .from('categories')
                .select('name')
                .order('name', { ascending: true });

            if (!catError && catData) {
                setCategories(catData.map((c: any) => c.name as string));
            } else if (catError) {
                console.error('Erro ao carregar categorias:', catError);
            }


            await fetchLogs();

            setLoading(false);
        };

        fetchData();
    }, []);

    const stats = {
        totalModels: models.length,
        pending: models.filter(m => m.status === VerificationStatus.PENDING).length,
        verified: models.filter(m => m.isVerified).length,
        revenue: `${models.filter(m => m.isVerified).length * 200} MT`,
        growth: '+14%'
    };

    const handleUpdateStatus = async (id: string, newStatus: VerificationStatus) => {
        const isVerified = newStatus === VerificationStatus.APPROVED;

        const { error } = await supabase
            .from('models')
            .update({
                status: newStatus,
                is_verified: isVerified
            })
            .eq('id', id);

        if (error) {
            console.error('Erro ao atualizar status do modelo:', error);
            showToast('Erro ao atualizar status da modelo.', 'error');
            return;
        }

        showToast(`Modelo ${newStatus} com sucesso!`, 'success');

        await logger.log(
            'Admin',
            `Alterou status do modelo para ${newStatus}`,
            isVerified ? 'success' : 'danger'
        );
        fetchLogs();

        setModels(prev =>
            prev.map(m =>
                m.id === id ? { ...m, status: newStatus, isVerified } : m
            )
        );
    };

    const handleAddCategory = async (e: React.FormEvent) => {
        e.preventDefault();
        const trimmed = newCategory.trim();
        if (!trimmed || categories.includes(trimmed)) return;

        const { error } = await supabase
            .from('categories')
            .insert({ name: trimmed });

        if (error) {
            console.error('Erro ao adicionar categoria:', error);
            showToast('Erro ao salvar categoria.', 'error');
            return;
        }

        showToast('Categoria adicionada com sucesso!', 'success');
        await logger.log('Admin', `Criou nova categoria: ${trimmed}`, 'info');
        fetchLogs();
        setCategories(prev => [...prev, trimmed]);
        setNewCategory('');
    };

    const handleRemoveCategory = async (catToRemove: string) => {
        const { error } = await supabase
            .from('categories')
            .delete()
            .eq('name', catToRemove);

        if (error) {
            console.error('Erro ao remover categoria:', error);
            showToast('Erro ao remover categoria.', 'error');
            return;
        }

        showToast('Categoria removida com sucesso!', 'success');
        await logger.log('Admin', `Removeu categoria: ${catToRemove}`, 'danger');
        fetchLogs();
        setCategories(prev => prev.filter(cat => cat !== catToRemove));
    };

    const handleDeleteModel = async (id: string, name: string) => {
        const confirmDelete = window.confirm(`Tem certeza que deseja eliminar o perfil de "${name}"? Esta ação não pode ser desfeita e removerá todos os dados permanentemente (incluindo avaliações e códigos).`);

        if (!confirmDelete) return;

        try {
            console.log('🗑️ Iniciando exclusão do modelo:', id);

            // 1. Eliminar dependências primeiro (devido a chaves estrangeiras)
            // Eliminar avaliações
            const { error: revError } = await supabase
                .from('reviews')
                .delete()
                .eq('model_id', id);

            if (revError) console.warn('Aviso: Falha ao limpar avaliações:', revError);

            // Eliminar códigos de acesso
            const { error: codeError } = await supabase
                .from('access_codes')
                .delete()
                .eq('model_id', id);

            if (codeError) console.warn('Aviso: Falha ao limpar códigos:', codeError);

            // 2. Eliminar o modelo
            const { error, data } = await supabase
                .from('models')
                .delete()
                .eq('id', id)
                .select();

            if (error) {
                console.error('Erro detalhado ao eliminar:', error);
                showToast(`Erro no banco de dados ao eliminar: ${error.message}`, 'error');
                return;
            }

            if (!data || data.length === 0) {
                showToast('Modelo não encontrado ou permissão negada.', 'warning');
                return;
            }

            setModels(prev => prev.filter(m => m.id !== id));
            showToast('Modelo e todos os seus dados foram eliminados.', 'success');
            await logger.log('Admin', `Eliminou permanentemente o modelo: ${name}`, 'danger');
            fetchLogs();
        } catch (err) {
            console.error('Erro inesperado:', err);
            showToast('Ocorreu um erro inesperado ao eliminar.', 'error');
        }
    };

    const handleDeleteAllModels = async () => {
        const confirmDelete = window.confirm("⚠️ ATENÇÃO: Você está prestes a eliminar TODOS os modelos da base de dados. Esta ação é irreversível e apagará todas as avaliações e códigos também. Deseja continuar?");

        if (!confirmDelete) return;

        const confirmTwice = window.confirm("Confirme novamente: Você tem certeza absoluta?");
        if (!confirmTwice) return;

        try {
            setLoading(true);
            // Deletar dependências de todos (sem filtro eq, deleta tudo)
            await supabase.from('reviews').delete().neq('id', '00000000-0000-0000-0000-000000000000');
            await supabase.from('access_codes').delete().neq('id', '00000000-0000-0000-0000-000000000000');

            // Deletar todos os modelos
            const { error } = await supabase.from('models').delete().neq('id', '00000000-0000-0000-0000-000000000000');

            if (error) {
                console.error('Erro ao eliminar todos os modelos:', error);
                showToast(`Erro ao limpar base de dados: ${error.message}`, 'error');
            } else {
                setModels([]);
                showToast('Todos os modelos foram eliminados com sucesso.', 'success');
                await logger.log('Admin', 'EXECUTOU LIMPEZA TOTAL DA BASE DE DADOS', 'danger');
                fetchLogs();
            }
        } catch (err) {
            console.error('Erro inesperado:', err);
        } finally {
            setLoading(false);
        }
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
                            <span className="font-black uppercase tracking-tighter text-sm italic">ADMIN</span>
                            <span className="text-[8px] font-black text-blue-500 uppercase tracking-[0.2em]">Verificados Hub</span>
                        </div>
                    </div>
                </div>

                <nav className="flex-grow px-4 space-y-2">
                    {[
                        { id: 'overview', icon: 'grid_view', label: 'Dashboard' },
                        { id: 'verificacoes', icon: 'verified_user', label: 'Fila de Verificação', badge: stats.pending },
                        { id: 'modelos', icon: 'groups', label: 'Gestão de Modelos' },
                        { id: 'categorias', icon: 'category', label: 'Categorias' },
                        { id: 'financeiro', icon: 'account_balance_wallet', label: 'Financeiro' }
                    ].map(item => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id as any)}
                            className={`w-full flex items-center justify-between px-5 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all group ${activeTab === item.id
                                ? 'bg-blue-600 text-white shadow-xl shadow-blue-900/20'
                                : 'text-slate-500 hover:bg-white/5 hover:text-white'
                                }`}
                        >
                            <div className="flex items-center gap-4">
                                <span className={`material-symbols-outlined text-xl ${activeTab === item.id ? 'filled' : ''}`}>{item.icon}</span>
                                {item.label}
                            </div>
                            {item.badge ? (
                                <span className={`px-2 py-0.5 rounded-full text-[8px] ${activeTab === item.id ? 'bg-white text-blue-600' : 'bg-blue-600/10 text-blue-500'}`}>
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
                                <span className="text-[9px] font-black uppercase tracking-wider">Admin Principal</span>
                                <div className="flex items-center gap-1.5">
                                    <span className="size-1.5 rounded-full bg-green-500 animate-pulse"></span>
                                    <span className="text-[7px] text-slate-500 font-bold uppercase">Sessão Ativa</span>
                                </div>
                            </div>
                        </div>
                        <button className="w-full py-3 rounded-xl bg-red-500/10 text-red-500 text-[8px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all">
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
                        <h1 className="text-3xl font-black uppercase italic tracking-tighter">
                            {activeTab === 'overview' && 'Visão Geral'}
                            {activeTab === 'verificacoes' && 'Fila de Auditoria'}
                            {activeTab === 'modelos' && 'Base de Talentos'}
                            {activeTab === 'categorias' && 'Gestão de Categorias'}
                            {activeTab === 'financeiro' && 'Fluxo de Caixa'}
                        </h1>
                        <p className="text-slate-500 text-xs font-medium mt-1">Bem-vindo de volta ao centro de operações.</p>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="hidden md:flex flex-col items-end">
                            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Data de Hoje</span>
                            <span className="text-xs font-bold">{new Date().toLocaleDateString('pt-MZ', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
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
                                    <div className="text-2xl font-black mb-1">{card.val}</div>
                                    <div className="text-[9px] font-black uppercase tracking-widest text-slate-500">{card.label}</div>
                                </div>
                            ))}
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                            {/* Activity Feed */}
                            <section className="lg:col-span-8 bg-[#0d1218] border border-white/5 rounded-[2.5rem] p-10 shadow-2xl">
                                <div className="flex items-center justify-between mb-10">
                                    <h3 className="text-lg font-bold flex items-center gap-3">
                                        <span className="material-symbols-outlined text-blue-500">analytics</span>
                                        Atividade em Tempo Real
                                    </h3>
                                    <button
                                        onClick={fetchLogs}
                                        className="text-[10px] font-black text-blue-500 uppercase tracking-widest hover:underline"
                                    >
                                        Atualizar Logs
                                    </button>
                                </div>
                                <div className="space-y-6">
                                    {logs.length > 0 ? (
                                        logs.map((log) => (
                                            <div key={log.id} className="flex items-center justify-between p-5 rounded-3xl bg-white/[0.02] border border-white/5 group hover:bg-white/[0.05] transition-all">
                                                <div className="flex items-center gap-5">
                                                    <div className={`size-12 rounded-2xl bg-[#141a21] flex items-center justify-center font-black text-xs group-hover:bg-opacity-80 transition-all
                                                        ${log.type === 'success' ? 'text-emerald-500' :
                                                            log.type === 'danger' ? 'text-rose-500' :
                                                                log.type === 'payment' ? 'text-amber-500' : 'text-blue-500'}`}>
                                                        {log.user_name ? log.user_name.substring(0, 2).toUpperCase() : 'SY'}
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-bold text-white mb-0.5">{log.user_name || 'Sistema'}</p>
                                                        <p className="text-[10px] text-slate-500 font-medium">{log.action}</p>
                                                    </div>
                                                </div>
                                                <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{timeAgo(log.created_at)}</span>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-10 text-slate-500 text-xs">
                                            Nenhuma atividade registrada recentemente.
                                        </div>
                                    )}
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

                {activeTab === 'categorias' && (
                    <div className="animate-in slide-in-from-bottom-6 duration-700 space-y-12">
                        <section className="bg-[#0d1218] border border-white/5 rounded-[2.5rem] p-10 shadow-2xl">
                            <h3 className="text-xl font-bold mb-8 flex items-center gap-3">
                                <span className="material-symbols-outlined text-blue-500">add_circle</span>
                                Nova Categoria
                            </h3>
                            <form onSubmit={handleAddCategory} className="flex gap-4">
                                <div className="flex-grow relative">
                                    <span className="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-slate-500">category</span>
                                    <input
                                        type="text"
                                        value={newCategory}
                                        onChange={(e) => setNewCategory(e.target.value)}
                                        placeholder="Ex: Fitness, Comercial, Plus Size..."
                                        className="w-full bg-[#141a21] border border-white/10 rounded-2xl py-5 pl-14 pr-6 text-xs font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-700 text-white"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="px-8 bg-blue-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-xl shadow-blue-900/20 hover:bg-blue-500 transition-all active:scale-95"
                                >
                                    Adicionar
                                </button>
                            </form>
                        </section>

                        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {categories.map((cat) => (
                                <div key={cat} className="bg-[#0d1218] border border-white/5 p-6 rounded-3xl group hover:border-blue-500/30 transition-all flex items-center justify-between shadow-lg">
                                    <div className="flex items-center gap-4">
                                        <div className="size-12 rounded-2xl bg-blue-600/10 flex items-center justify-center text-blue-500 group-hover:bg-blue-600 group-hover:text-white transition-all">
                                            <span className="material-symbols-outlined text-xl">label</span>
                                        </div>
                                        <span className="text-xs font-black text-white">{cat}</span>
                                    </div>
                                    <button
                                        onClick={() => handleRemoveCategory(cat)}
                                        className="size-10 rounded-xl bg-rose-500/5 text-rose-500 flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all"
                                    >
                                        <span className="material-symbols-outlined text-lg">delete</span>
                                    </button>
                                </div>
                            ))}
                            {categories.length === 0 && (
                                <div className="col-span-full py-20 text-center opacity-50 italic">
                                    Nenhuma categoria cadastrada.
                                </div>
                            )}
                        </section>
                    </div>
                )}

                {/* ... manter outras abas existentes (verificacoes, modelos, financeiro) ... */}
                {activeTab === 'verificacoes' && (
                    <div className="animate-in slide-in-from-bottom-6 duration-700 space-y-10">
                        {/* Código da aba de verificações omitido para brevidade, mas deve permanecer igual ao anterior */}
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
                                        {model.verificationVideo ? (
                                            <div className="space-y-3">
                                                <div className="aspect-video rounded-[1.5rem] overflow-hidden border-2 border-blue-500/20 bg-black relative group">
                                                    <video
                                                        src={model.verificationVideo}
                                                        controls
                                                        className="w-full h-full object-contain"
                                                        preload="metadata"
                                                    >
                                                        Seu navegador não suporta vídeo HTML5.
                                                    </video>
                                                    <button
                                                        onClick={() => setSelectedVideo(model.verificationVideo || null)}
                                                        className="absolute top-3 right-3 size-10 bg-black/70 backdrop-blur-sm rounded-xl flex items-center justify-center text-white hover:bg-black/90 transition-all opacity-0 group-hover:opacity-100"
                                                        title="Abrir em tela cheia"
                                                    >
                                                        <span className="material-symbols-outlined text-lg">fullscreen</span>
                                                    </button>
                                                </div>
                                                <div className="flex items-center gap-2 text-[9px] font-black text-emerald-500 uppercase tracking-widest bg-emerald-500/10 px-3 py-2 rounded-xl">
                                                    <span className="material-symbols-outlined text-xs">check_circle</span>
                                                    Vídeo Enviado
                                                </div>
                                            </div>
                                        ) : (
                                            <button className="w-full py-5 bg-slate-800/50 border border-slate-700/50 text-slate-500 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest cursor-not-allowed flex items-center justify-center gap-3">
                                                <span className="material-symbols-outlined">video_library_off</span>
                                                Sem Vídeo
                                            </button>
                                        )}
                                    </div>

                                    {/* Lado Direito: Dados e Ações */}
                                    <div className="flex-grow flex flex-col">
                                        <div className="flex justify-between items-start mb-10">
                                            <div>
                                                <Link
                                                    to={`/perfil/${model.id}`}
                                                    className="block group"
                                                >
                                                    <h3 className="text-2xl font-black uppercase italic tracking-tighter mb-2 group-hover:text-blue-500 transition-colors">{model.artisticName}</h3>
                                                </Link>
                                                <div className="flex items-center gap-3">
                                                    <span className="flex items-center gap-1.5 text-[10px] font-black text-slate-500 uppercase tracking-widest bg-white/5 px-3 py-1 rounded-full">
                                                        <span className="material-symbols-outlined text-xs">location_on</span>
                                                        {model.location}
                                                    </span>
                                                    {/* Fix: changed model.category to model.categories[0] to match Model interface */}
                                                    {model.categories && model.categories.length > 0 && (
                                                        <span className="flex items-center gap-1.5 text-[10px] font-black text-blue-500 uppercase tracking-widest bg-blue-500/5 px-3 py-1 rounded-full border border-blue-500/10">
                                                            {model.categories[0]}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest block mb-1">Submetido em</span>
                                                <span className="text-xs font-bold text-white">22 Mai, 2024</span>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 p-8 rounded-[2rem] bg-white/[0.02] border border-white/5 mb-10">
                                            <div className="space-y-1">
                                                <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Altura</span>
                                                <p className="text-sm font-black">{model.height || '1.75m'}</p>
                                            </div>
                                            <div className="space-y-1">
                                                <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Idade</span>
                                                <p className="text-sm font-black">{model.age} Anos</p>
                                            </div>
                                            <div className="space-y-1">
                                                <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Peso</span>
                                                <p className="text-sm font-black">{model.weight || 'N/A'}</p>
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
                        </div>
                    </div>
                )}

                {activeTab === 'modelos' && (
                    <div className="animate-in slide-in-from-bottom-6 duration-700 space-y-8">
                        <div className="flex justify-end">
                            <button
                                onClick={handleDeleteAllModels}
                                disabled={models.length === 0}
                                className="flex items-center gap-2 px-6 py-3 bg-rose-600/10 border border-rose-600/20 text-rose-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-600 hover:text-white transition-all disabled:opacity-30 disabled:grayscale"
                            >
                                <span className="material-symbols-outlined text-sm">delete_sweep</span>
                                Eliminar Todos os Modelos
                            </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {models.map(model => (
                                <div key={model.id} className="bg-[#0d1218] border border-white/5 rounded-2xl p-4 group hover:border-blue-500/30 transition-all shadow-lg">
                                    {/* Imagem de Perfil */}
                                    <div className="aspect-[3/4] rounded-xl overflow-hidden relative mb-3 border-2 border-white/5">
                                        <img src={model.profileImage} className="w-full h-full object-cover" alt={model.artisticName} />
                                        <div className="absolute top-2 right-2">
                                            {model.isVerified ? (
                                                <span className="px-2 py-1 bg-emerald-500/90 backdrop-blur-sm rounded-lg text-[8px] font-black text-white uppercase flex items-center gap-1">
                                                    <span className="material-symbols-outlined text-xs">verified</span>
                                                    Verificado
                                                </span>
                                            ) : (
                                                <span className="px-2 py-1 bg-amber-500/90 backdrop-blur-sm rounded-lg text-[8px] font-black text-white uppercase">
                                                    Pendente
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Informações */}
                                    <div className="space-y-2">
                                        <Link
                                            to={`/perfil/${model.slug || model.id}`}
                                            className="block group"
                                        >
                                            <h3 className="text-xs font-black uppercase italic tracking-tighter group-hover:text-blue-500 transition-colors truncate">{model.artisticName}</h3>
                                        </Link>
                                        <div className="flex items-center gap-2 text-[9px] text-slate-500 font-bold">
                                            <span className="material-symbols-outlined text-xs">location_on</span>
                                            <span className="truncate">{model.location}</span>
                                        </div>
                                        {model.categories && model.categories.length > 0 && (
                                            <div className="flex flex-wrap gap-1">
                                                {model.categories.slice(0, 2).map((cat, idx) => (
                                                    <span key={idx} className="text-[8px] font-black text-blue-500 uppercase tracking-widest bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/10">
                                                        {cat}
                                                    </span>
                                                ))}
                                                {model.categories.length > 2 && (
                                                    <span className="text-[8px] font-black text-slate-500 uppercase">+{model.categories.length - 2}</span>
                                                )}
                                            </div>
                                        )}

                                        {/* Medidas resumidas */}
                                        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/5">
                                            <div>
                                                <span className="text-[8px] font-black text-slate-600 uppercase">Idade</span>
                                                <p className="text-[10px] font-black">{model.age}</p>
                                            </div>
                                            <div>
                                                <span className="text-[8px] font-black text-slate-600 uppercase">Altura</span>
                                                <p className="text-[10px] font-black">{model.height || 'N/A'}</p>
                                            </div>
                                        </div>

                                        {/* Ações */}
                                        <div className="flex gap-2 pt-2">
                                            <Link
                                                to={`/perfil/${model.id}`}
                                                className="flex-1 py-2 bg-blue-600/10 border border-blue-500/20 text-blue-500 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all flex items-center justify-center gap-1"
                                            >
                                                <span className="material-symbols-outlined text-xs">visibility</span>
                                                Ver
                                            </Link>
                                            {model.status === VerificationStatus.PENDING && (
                                                <button
                                                    onClick={() => handleUpdateStatus(model.id, VerificationStatus.APPROVED)}
                                                    className="px-3 py-2 bg-emerald-600/10 border border-emerald-500/20 text-emerald-500 rounded-lg text-[9px] font-black uppercase hover:bg-emerald-600 hover:text-white transition-all"
                                                    title="Aprovar"
                                                >
                                                    <span className="material-symbols-outlined text-xs">check</span>
                                                </button>
                                            )}
                                            <button
                                                onClick={() => handleDeleteModel(model.id, model.artisticName)}
                                                className="px-3 py-2 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-lg text-[9px] font-black uppercase hover:bg-rose-500 hover:text-white transition-all"
                                                title="Eliminar Modelo"
                                            >
                                                <span className="material-symbols-outlined text-xs">delete</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {models.length === 0 && (
                            <div className="text-center py-20 text-slate-500">
                                <span className="material-symbols-outlined text-6xl mb-4 block">groups_off</span>
                                <p className="text-sm font-bold">Nenhum modelo cadastrado</p>
                            </div>
                        )}
                    </div>
                )}
            </main>

            {/* Modal de Vídeo em Tela Cheia */}
            {selectedVideo && (
                <div
                    className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-6"
                    onClick={() => setSelectedVideo(null)}
                >
                    <div
                        className="relative w-full max-w-6xl aspect-video bg-black rounded-2xl overflow-hidden border-2 border-white/10"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            onClick={() => setSelectedVideo(null)}
                            className="absolute top-4 right-4 size-12 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center text-white hover:bg-white/20 transition-all z-10"
                        >
                            <span className="material-symbols-outlined text-2xl">close</span>
                        </button>
                        <video
                            src={selectedVideo}
                            controls
                            autoPlay
                            className="w-full h-full object-contain"
                        >
                            Seu navegador não suporta vídeo HTML5.
                        </video>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboardPage;
