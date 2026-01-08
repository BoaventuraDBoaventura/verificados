
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MOZAMBIQUE_PROVINCES } from '../constants';
import { User } from '../types';
import { supabase } from '../supabaseClient';
import { uploadFile, deleteFile, extractPathFromUrl } from '../utils/storage';
import { useToast } from '../context/ToastContext';

interface EditProfilePageProps {
    user: User;
}

const EditProfilePage: React.FC<EditProfilePageProps> = ({ user }) => {
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState<string[]>([]);
    const [formData, setFormData] = useState<any>({
        artistic_name: '',
        age: '',
        province: '',
        city: '',
        categories: [],
        bio: '',
        height: '',
        weight: '',
        waist: '',
        bust: '',
        eyes: '',
        hair: '',
        shoe_size: '',
        profile_image: '',
        phone_number: '',
        gallery_images: [],
        preview_videos: []
    });
    const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
    const [profileImagePreview, setProfileImagePreview] = useState<string | null>(null);
    const [galleryImageFiles, setGalleryImageFiles] = useState<File[]>([]);
    const [galleryImagePreviews, setGalleryImagePreviews] = useState<string[]>([]);
    const [previewVideoFiles, setPreviewVideoFiles] = useState<File[]>([]);
    const [previewVideoNames, setPreviewVideoNames] = useState<string[]>([]);

    // Estados para progresso de upload
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadingFiles, setUploadingFiles] = useState(false);
    const [currentUploadFile, setCurrentUploadFile] = useState<string>('');
    const [totalFiles, setTotalFiles] = useState(0);
    const [completedFiles, setCompletedFiles] = useState(0);

    // Carregar dados do modelo e categorias
    useEffect(() => {
        const fetchData = async () => {
            // Carregar modelo
            if (user.modelId) {
                try {
                    const { data: modelData, error } = await supabase
                        .from('models')
                        .select('*')
                        .eq('id', user.modelId)
                        .single();

                    if (error || !modelData) {
                        console.error('Erro ao carregar modelo:', error);
                        showToast('Atenção: Seu perfil não foi encontrado no banco de dados. Tente fazer login novamente.', 'warning');
                        return;
                    }

                    if (modelData) {
                        setFormData({
                            artistic_name: modelData.artistic_name || '',
                            slug: modelData.slug || '', // Priorizar slug do banco de dados
                            age: modelData.age || '',
                            province: modelData.province || '',
                            city: modelData.city || '',
                            categories: modelData.categories || [],
                            bio: modelData.bio || '',
                            height: modelData.height || '',
                            weight: modelData.weight || '',
                            waist: modelData.waist || '',
                            bust: modelData.bust || '',
                            eyes: modelData.eyes || '',
                            hair: modelData.hair || '',
                            shoe_size: modelData.shoe_size || '',
                            profile_image: modelData.profile_image || '',
                            phone_number: modelData.phone_number || '',
                            gallery_images: modelData.gallery_images || [],
                            preview_videos: modelData.preview_videos || []
                        });
                        if (modelData.profile_image) {
                            setProfileImagePreview(modelData.profile_image);
                        }
                        if (modelData.gallery_images && Array.isArray(modelData.gallery_images) && modelData.gallery_images.length > 0) {
                            setGalleryImagePreviews(modelData.gallery_images);
                        }
                        if (modelData.preview_videos && Array.isArray(modelData.preview_videos) && modelData.preview_videos.length > 0) {
                            // Para vídeos existentes, usar a URL como nome também para rastreamento
                            setPreviewVideoNames(modelData.preview_videos);
                        }
                    }
                } catch (err) {
                    console.error('Erro ao buscar modelo:', err);
                }
            }

            // Carregar categorias
            try {
                const { data: catData, error: catError } = await supabase
                    .from('categories')
                    .select('name')
                    .order('name', { ascending: true });

                if (catError) {
                    console.error('Erro ao carregar categorias:', catError);
                    showToast('Erro ao carregar categorias.', 'error');
                    return;
                }

                if (catData) {
                    setCategories(catData.map((c: any) => c.name));
                }
            } catch (err) {
                console.error('Erro ao buscar categorias:', err);
            }
        };

        fetchData();
    }, [user.modelId]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev: any) => ({ ...prev, [name]: value }));
    };

    const toggleCategory = (cat: string) => {
        const currentCats = formData.categories || [];
        const newCats = currentCats.includes(cat)
            ? currentCats.filter((c: string) => c !== cat)
            : [...currentCats, cat];
        setFormData((prev: any) => ({ ...prev, categories: newCats }));
    };

    const handleProfileImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                showToast('A imagem deve ter no máximo 5MB.', 'warning');
                return;
            }

            // Se já existe uma imagem de perfil, deletar do bucket antes de substituir
            if (formData.profile_image && !formData.profile_image.startsWith('data:') && !formData.profile_image.startsWith('http://localhost')) {
                const oldPath = extractPathFromUrl(formData.profile_image);
                if (oldPath) {
                    console.log('🗑️ Removendo foto de perfil antiga:', oldPath);
                    await deleteFile(oldPath);
                }
            }

            setProfileImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfileImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleGalleryImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []) as File[];
        if (files.length > 0) {
            const currentCount = galleryImagePreviews.length;
            const remainingSlots = 3 - currentCount;

            if (remainingSlots <= 0) {
                showToast('Você já atingiu o limite de 3 imagens. Remova algumas antes de adicionar novas.', 'warning');
                e.target.value = ''; // Limpar o input
                return;
            }

            const filesToAdd = files.slice(0, remainingSlots);
            if (files.length > remainingSlots) {
                showToast(`Você pode adicionar apenas mais ${remainingSlots} imagem(ns). ${files.length - remainingSlots} arquivo(s) foram ignorados.`, 'warning');
            }

            const validFiles = filesToAdd.filter(f => f.size <= 5 * 1024 * 1024);
            if (validFiles.length !== filesToAdd.length) {
                showToast('Algumas imagens excedem 5MB e foram ignoradas.', 'warning');
            }

            // Se estamos substituindo imagens existentes (quando há menos de 3 slots), 
            // não precisamos deletar aqui pois o usuário pode ter removido manualmente
            // Mas se o usuário selecionar um arquivo para substituir diretamente, 
            // isso será tratado no handleSubmit

            // Adicionar arquivos ao array
            setGalleryImageFiles(prev => [...prev, ...validFiles]);

            // Criar previews (data URLs) e adicionar ao final
            validFiles.forEach(file => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    setGalleryImagePreviews(prev => [...prev, reader.result as string]);
                };
                reader.readAsDataURL(file);
            });
        }
        e.target.value = ''; // Limpar o input após processar
    };

    const removeGalleryImage = async (index: number) => {
        const preview = galleryImagePreviews[index];

        // Se é uma URL existente (não data URL), deletar do storage
        if (preview && !preview.startsWith('data:')) {
            const path = extractPathFromUrl(preview);
            if (path) {
                await deleteFile(path);
            }
        }

        // Remover da lista
        // Se é uma data URL, é um novo arquivo que precisa ser removido do array de arquivos
        if (preview && preview.startsWith('data:')) {
            // Contar quantas data URLs existem antes deste índice
            const dataUrlCount = galleryImagePreviews.slice(0, index).filter(p => p.startsWith('data:')).length;
            setGalleryImageFiles(prev => {
                const newFiles = [...prev];
                newFiles.splice(dataUrlCount, 1);
                return newFiles;
            });
        }

        setGalleryImagePreviews(prev => prev.filter((_, i) => i !== index));
    };

    const handlePreviewVideoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []) as File[];
        if (files.length > 0) {
            const currentCount = previewVideoNames.length;
            const remainingSlots = 3 - currentCount;

            if (remainingSlots <= 0) {
                showToast('Você já atingiu o limite de 3 vídeos. Remova alguns antes de adicionar novos.', 'warning');
                e.target.value = ''; // Limpar o input
                return;
            }

            const filesToAdd = files.slice(0, remainingSlots);
            if (files.length > remainingSlots) {
                showToast(`Você pode adicionar apenas mais ${remainingSlots} vídeo(s). ${files.length - remainingSlots} arquivo(s) foram ignorados.`, 'warning');
            }

            const validFiles = filesToAdd.filter(f => f.size <= 30 * 1024 * 1024);
            if (validFiles.length !== filesToAdd.length) {
                showToast('Alguns vídeos excedem 30MB e foram ignoradas.', 'warning');
            }
            setPreviewVideoFiles(prev => [...prev, ...validFiles]);
            // Adicionar nomes dos novos arquivos
            setPreviewVideoNames(prev => [...prev, ...validFiles.map(f => f.name)]);
        }
        e.target.value = ''; // Limpar o input após processar
    };

    const removePreviewVideo = async (index: number) => {
        const item = previewVideoNames[index];

        if (item && item.startsWith('http')) {
            // É uma URL existente, deletar do storage e remover da lista
            const path = extractPathFromUrl(item);
            if (path) {
                await deleteFile(path);
            }
            setPreviewVideoNames(prev => prev.filter((_, i) => i !== index));
        } else {
            // É um novo arquivo, remover tanto do array de arquivos quanto de nomes
            const fileIndex = previewVideoNames.slice(0, index).filter(n => !n.startsWith('http')).length;
            setPreviewVideoFiles(prev => prev.filter((_, i) => i !== fileIndex));
            setPreviewVideoNames(prev => prev.filter((_, i) => i !== index));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!user.modelId) {
            showToast('Erro: ID do modelo não encontrado. Faça login novamente.', 'error');
            return;
        }

        // Validação básica
        if (!formData.artistic_name || !formData.province || !formData.city) {
            showToast('Por favor, preencha todos os campos obrigatórios.', 'warning');
            return;
        }

        setLoading(true);
        setUploadingFiles(false);
        setUploadProgress(0);
        setCompletedFiles(0);
        setCurrentUploadFile('');

        try {
            // Preparar dados para atualização - SEMPRE enviar todos os campos
            const updateData: any = {
                artistic_name: formData.artistic_name.trim(),
                slug: formData.artistic_name.trim()
                    .toLowerCase()
                    .normalize('NFD')
                    .replace(/[\u0300-\u036f]/g, '')
                    .replace(/[^\w\s-]/g, '')
                    .replace(/\s+/g, '-')
                    .replace(/--+/g, '-')
                    .trim(),
                age: formData.age ? Number(formData.age) : null,
                province: String(formData.province).trim(),
                city: String(formData.city).trim(),
                categories: Array.isArray(formData.categories) ? formData.categories : [],
                bio: formData.bio ? formData.bio.trim() : '',
                phone_number: formData.phone_number ? String(formData.phone_number).trim() : '',
                // Campos opcionais - sempre enviar (mesmo se vazios para limpar valores antigos)
                height: formData.height ? String(formData.height).trim() : '',
                weight: formData.weight ? String(formData.weight).trim() : '',
                waist: formData.waist ? String(formData.waist).trim() : '',
                bust: formData.bust ? String(formData.bust).trim() : '',
                eyes: formData.eyes ? String(formData.eyes).trim() : '',
                hair: formData.hair ? String(formData.hair).trim() : '',
                shoe_size: formData.shoe_size ? String(formData.shoe_size).trim() : ''
            };

            console.log('📡 Iniciando processo de salvamento...');
            console.log('🆔 ID do Modelo:', user.modelId);
            console.log('📦 Dados que serão enviados:', updateData);

            // Calcular total de arquivos para upload
            const totalFilesToUpload =
                (profileImageFile ? 1 : 0) +
                galleryImageFiles.length +
                previewVideoFiles.length;

            setTotalFiles(totalFilesToUpload);

            // Se há arquivos para upload, mostrar progresso
            if (totalFilesToUpload > 0) {
                setUploadingFiles(true);
                setUploadProgress(5);
            }

            // Função auxiliar para atualizar progresso
            const updateProgress = (current: number, total: number, fileName: string) => {
                const fileProgress = (current / total) * 100;
                setUploadProgress(Math.min(fileProgress, 95));
                setCurrentUploadFile(fileName);
                setCompletedFiles(current);
            };

            // Função para simular progresso durante upload (retorna intervalo para poder limpar)
            const simulateProgress = (fileIndex: number, totalFiles: number, fileName: string): NodeJS.Timeout => {
                let progress = 0;
                const interval = setInterval(() => {
                    progress += Math.random() * 2 + 0.5;
                    if (progress >= 88) {
                        const fileProgress = ((fileIndex + 0.88) / totalFiles) * 100;
                        setUploadProgress(Math.min(fileProgress, 88));
                    } else {
                        const fileProgress = ((fileIndex + progress / 100) / totalFiles) * 100;
                        setUploadProgress(Math.min(fileProgress, 88));
                    }
                }, 150);
                return interval;
            };

            let fileCounter = 0;
            let progressInterval: NodeJS.Timeout | null = null;
            // Priorizar o slug do formulário (que é o mais atualizado)
            const modelIdentifier = formData.slug || user.slug || user.modelId;

            if (profileImageFile) {
                console.log('📤 Iniciando upload da nova foto de perfil...');
                setCurrentUploadFile(`Foto de perfil: ${profileImageFile.name}`);

                progressInterval = simulateProgress(0, totalFilesToUpload, profileImageFile.name);

                const timestamp = Date.now();
                const fileExt = profileImageFile.name.split('.').pop();
                const profileImagePath = `models/${modelIdentifier}/profile_${timestamp}.${fileExt}`;

                // Remover foto antiga ANTES do upload (se existir)
                if (formData.profile_image && !formData.profile_image.startsWith('data:') && !formData.profile_image.startsWith('http')) {
                    // Se for apenas o nome do arquivo no storage
                } else if (formData.profile_image && formData.profile_image.startsWith('http')) {
                    const oldPath = extractPathFromUrl(formData.profile_image);
                    if (oldPath) {
                        console.log('🗑️ Removendo foto de perfil antiga:', oldPath);
                        await deleteFile(oldPath);
                    }
                }

                const profileImageUrl = await uploadFile(profileImageFile, profileImagePath);

                // Cancelar simulador de progresso
                if (progressInterval) clearInterval(progressInterval);

                if (profileImageUrl) {
                    console.log('✅ Upload concluído! URL:', profileImageUrl);
                    updateData.profile_image = profileImageUrl;
                    fileCounter = 1;
                    updateProgress(1, totalFilesToUpload, `Foto de perfil: ${profileImageFile.name}`);
                } else {
                    console.error('❌ Falha no upload da foto de perfil');
                    // Se falhou, tentamos manter a antiga se ainda for válida (não for data URL)
                    updateData.profile_image = (formData.profile_image && !formData.profile_image.startsWith('data:')) ? formData.profile_image : null;
                    fileCounter = 1;
                }
            } else {
                // Se não há nova foto, manter a existente (desde que não seja data URL) ou limpar se foi removida
                updateData.profile_image = (profileImagePreview && !profileImagePreview.startsWith('data:')) ? profileImagePreview : null;
                console.log('ℹ️ Nenhuma nova foto selecionada, mantendo:', updateData.profile_image);
            }

            // Identificar imagens da galeria que foram removidas
            const originalGalleryUrls = Array.isArray(formData.gallery_images) ? formData.gallery_images : [];
            const currentGalleryUrls = galleryImagePreviews.filter(p => p && !p.startsWith('data:'));
            const removedGalleryUrls = originalGalleryUrls.filter((url: string) => !currentGalleryUrls.includes(url));

            // Deletar imagens removidas do bucket
            for (const removedUrl of removedGalleryUrls) {
                if (removedUrl && !removedUrl.startsWith('data:') && !removedUrl.startsWith('http://localhost')) {
                    const oldPath = extractPathFromUrl(removedUrl);
                    if (oldPath) {
                        console.log('🗑️ Removendo imagem da galeria:', oldPath);
                        await deleteFile(oldPath);
                    }
                }
            }

            // Upload de novas imagens da galeria
            const finalGalleryUrls: string[] = [];
            let newFileIndex = 0;

            for (let i = 0; i < galleryImagePreviews.length; i++) {
                const preview = galleryImagePreviews[i];

                if (preview.startsWith('data:')) {
                    if (newFileIndex < galleryImageFiles.length) {
                        const file = galleryImageFiles[newFileIndex];
                        setCurrentUploadFile(`Imagem da galeria: ${file.name}`);

                        progressInterval = simulateProgress(fileCounter, totalFilesToUpload, file.name);

                        const timestamp = Date.now();
                        const fileExt = file.name.split('.').pop();
                        const galleryImagePath = `models/${modelIdentifier}/gallery_${timestamp}_${i}.${fileExt}`;
                        const galleryImageUrl = await uploadFile(file, galleryImagePath);

                        if (progressInterval) clearInterval(progressInterval);

                        if (galleryImageUrl) {
                            finalGalleryUrls.push(galleryImageUrl);
                            fileCounter++;
                            updateProgress(fileCounter, totalFilesToUpload, file.name);
                        }
                        newFileIndex++;
                    }
                } else {
                    finalGalleryUrls.push(preview);
                }
            }

            updateData.gallery_images = finalGalleryUrls;

            // Identificar vídeos que foram removidos
            const originalVideoUrls = Array.isArray(formData.preview_videos) ? formData.preview_videos : [];
            const currentVideoUrls = previewVideoNames.filter(n => n.startsWith('http'));
            const removedVideoUrls = originalVideoUrls.filter((url: string) => !currentVideoUrls.includes(url));

            // Deletar vídeos removidos do bucket
            for (const removedUrl of removedVideoUrls) {
                if (removedUrl && !removedUrl.startsWith('data:') && !removedUrl.startsWith('http://localhost')) {
                    const oldPath = extractPathFromUrl(removedUrl);
                    if (oldPath) {
                        console.log('🗑️ Removendo vídeo:', oldPath);
                        await deleteFile(oldPath);
                    }
                }
            }

            // Upload de novos vídeos
            const finalVideoUrls: string[] = [];
            const existingVideoUrls = previewVideoNames.filter(name => name.startsWith('http'));
            finalVideoUrls.push(...existingVideoUrls);

            // Fazer upload dos novos vídeos com progresso
            for (let i = 0; i < previewVideoFiles.length; i++) {
                const file = previewVideoFiles[i];
                setCurrentUploadFile(`Vídeo: ${file.name}`);

                progressInterval = simulateProgress(fileCounter, totalFilesToUpload, file.name);

                const timestamp = Date.now();
                const fileExt = file.name.split('.').pop();
                const videoPath = `models/${modelIdentifier}/video_${timestamp}_${i}.${fileExt}`;
                const videoUrl = await uploadFile(file, videoPath);

                if (progressInterval) clearInterval(progressInterval);

                if (videoUrl) {
                    finalVideoUrls.push(videoUrl);
                    fileCounter++;
                    updateProgress(fileCounter, totalFilesToUpload, file.name);
                }
            }

            updateData.preview_videos = finalVideoUrls;

            // Atualizar progresso para 95% antes de salvar no banco
            setUploadProgress(95);
            setCurrentUploadFile('Salvando no banco de dados...');

            console.log('Atualizando modelo ID:', user.modelId);
            console.log('Profile Image File:', profileImageFile ? 'Novo arquivo selecionado' : 'Nenhum arquivo novo');
            console.log('Profile Image Preview:', profileImagePreview ? 'Existe' : 'Não existe');
            console.log('Profile Image URL a ser salva:', updateData.profile_image);
            console.log('Gallery Images:', galleryImagePreviews.length);
            console.log('Preview Videos:', previewVideoNames.length);
            console.log('Dados completos a atualizar:', JSON.stringify(updateData, null, 2));

            // Garantir que todos os campos sejam enviados ao banco
            const { data, error: updateError } = await supabase
                .from('models')
                .update(updateData)
                .eq('id', user.modelId)
                .select();

            if (updateError) {
                console.error('Erro detalhado do Supabase:', updateError);
                setUploadingFiles(false);
                setUploadProgress(0);
                showToast('Erro ao atualizar perfil. Verifique os dados.', 'error');
                setLoading(false);
                return;
            }

            if (!data || data.length === 0) {
                console.warn('⚠️ Nenhuma linha foi atualizada. ID pesquisado:', user.modelId);
                showToast('Seu perfil não foi encontrado ou não houve alterações.', 'warning');
                setUploadingFiles(false);
                setUploadProgress(0);
                setLoading(false);
                return;
            }

            console.log('Dados atualizados com sucesso:', data);
            console.log('Foto de perfil salva:', data[0]?.profile_image);

            // Verificar se a foto foi realmente salva
            if (updateData.profile_image && data[0]?.profile_image !== updateData.profile_image) {
                console.warn('ATENÇÃO: A URL da foto pode não ter sido salva corretamente!');
                console.warn('URL esperada:', updateData.profile_image);
                console.warn('URL salva:', data[0]?.profile_image);
            }

            // Concluir progresso
            setUploadProgress(100);
            setCurrentUploadFile('Concluído!');

            // Pequeno delay para mostrar 100%
            await new Promise(resolve => setTimeout(resolve, 500));

            setUploadingFiles(false);
            setLoading(false);

            // Mostrar mensagem de sucesso
            showToast('Perfil atualizado com sucesso!', 'success');

            // Pequeno delay para garantir que o banco processou a atualização
            setTimeout(() => {
                navigate('/dashboard');
            }, 500);
        } catch (err: any) {
            console.error('Erro ao salvar:', err);
            setUploadingFiles(false);
            setUploadProgress(0);
            showToast(`Erro ao salvar alterações: ${err.message || 'Erro desconhecido'}`, 'error');
            setLoading(false);
        }
    };

    return (
        <>
            {/* Modal de Progresso de Upload */}
            {uploadingFiles && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-[#1c2127] rounded-2xl border border-white/10 p-6 md:p-8 max-w-md w-full shadow-2xl">
                        <div className="flex items-center gap-3 mb-4">
                            <span className="material-symbols-outlined text-blue-500 text-2xl animate-spin">cloud_upload</span>
                            <h3 className="text-lg font-bold text-white">Enviando arquivos...</h3>
                        </div>

                        <div className="mb-4">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm text-slate-400">{currentUploadFile || 'Preparando upload...'}</span>
                                <span className="text-sm font-bold text-blue-500">{Math.round(uploadProgress)}%</span>
                            </div>
                            <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-blue-600 to-blue-500 rounded-full transition-all duration-300 ease-out"
                                    style={{ width: `${uploadProgress}%` }}
                                />
                            </div>
                        </div>

                        {totalFiles > 0 && (
                            <div className="text-xs text-slate-500 text-center">
                                Arquivo {completedFiles} de {totalFiles} concluído{completedFiles !== 1 ? 's' : ''}
                            </div>
                        )}

                        <div className="mt-4 text-xs text-slate-500 text-center">
                            {uploadProgress < 20 ? 'Preparando upload...' :
                                uploadProgress < 50 ? 'Enviando para o servidor...' :
                                    uploadProgress < 85 ? 'Upload em andamento...' :
                                        uploadProgress < 95 ? 'Salvando no banco de dados...' :
                                            uploadProgress < 100 ? 'Finalizando...' : 'Concluído!'}
                        </div>
                    </div>
                </div>
            )}

            <div className="mx-auto max-w-5xl px-4 py-6 md:py-10">
                <div className="mb-6 text-center md:text-left">
                    <h1 className="text-2xl md:text-3xl font-black tracking-tight mb-2 uppercase italic">Editar Perfil Profissional</h1>
                    <p className="text-sm text-slate-400">Mantenha seus dados e medidas atualizados para atrair mais contratantes.</p>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-6">

                    {/* Identidade Artística */}
                    <section className="rounded-2xl bg-[#1c2127] p-4 md:p-6 border border-white/5 shadow-xl">
                        <h2 className="text-lg font-bold border-b border-white/5 pb-3 mb-4 flex items-center gap-2">
                            <span className="material-symbols-outlined text-blue-500 text-lg">palette</span>
                            Identidade Artística
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Nome Artístico</label>
                                <input
                                    name="artistic_name"
                                    value={formData.artistic_name}
                                    onChange={handleChange}
                                    type="text"
                                    className="rounded-xl border border-white/10 bg-[#111418] p-2.5 text-sm text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                    required
                                />
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">WhatsApp / Celular</label>
                                <input
                                    name="phone_number"
                                    value={formData.phone_number}
                                    onChange={handleChange}
                                    type="text"
                                    placeholder="(+258) 84 000 0000"
                                    className="rounded-xl border border-white/10 bg-[#111418] p-2.5 text-sm text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                />
                            </div>

                            <div className="md:col-span-2 flex flex-col gap-3">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Categorias de Atuação</label>
                                <div className="flex flex-wrap gap-2">
                                    {categories.map(cat => (
                                        <button
                                            key={cat}
                                            type="button"
                                            onClick={() => toggleCategory(cat)}
                                            className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all border ${(formData.categories || []).includes(cat)
                                                ? 'bg-blue-600 border-blue-500 text-white'
                                                : 'bg-[#111418] border-white/10 text-slate-500'
                                                }`}
                                        >
                                            {cat}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="md:col-span-2 flex flex-col gap-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Bio / Apresentação</label>
                                <textarea
                                    name="bio"
                                    value={formData.bio}
                                    onChange={handleChange}
                                    rows={3}
                                    className="rounded-xl border border-white/10 bg-[#111418] p-2.5 text-sm text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none"
                                    required
                                />
                            </div>
                        </div>
                    </section>

                    {/* Localização */}
                    <section className="rounded-2xl bg-[#1c2127] p-4 md:p-6 border border-white/5 shadow-xl">
                        <h2 className="text-lg font-bold border-b border-white/5 pb-3 mb-4 flex items-center gap-2">
                            <span className="material-symbols-outlined text-blue-500 text-lg">location_on</span>
                            Localização Atual
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Província</label>
                                <select
                                    name="province"
                                    value={formData.province}
                                    onChange={handleChange}
                                    className="rounded-xl border border-white/10 bg-[#111418] p-2.5 text-sm text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all cursor-pointer"
                                    required
                                >
                                    <option value="">Selecionar Província</option>
                                    {MOZAMBIQUE_PROVINCES.map(prov => (
                                        <option key={prov} value={prov}>{prov}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Cidade</label>
                                <input
                                    name="city"
                                    value={formData.city}
                                    onChange={handleChange}
                                    type="text"
                                    className="rounded-xl border border-white/10 bg-[#111418] p-2.5 text-sm text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                    required
                                />
                            </div>
                        </div>
                    </section>

                    {/* Ficha Técnica / Medidas */}
                    <section className="rounded-2xl bg-[#1c2127] p-4 md:p-6 border border-white/5 shadow-xl">
                        <h2 className="text-lg font-bold border-b border-white/5 pb-3 mb-4 flex items-center gap-2">
                            <span className="material-symbols-outlined text-blue-500 text-lg">straighten</span>
                            Ficha Técnica e Medidas
                        </h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {[
                                { label: 'Idade', name: 'age', type: 'number', placeholder: '24' },
                                { label: 'Altura (m)', name: 'height', type: 'text', placeholder: '1.76 m' },
                                { label: 'Peso (kg)', name: 'weight', type: 'text', placeholder: '58 kg' },
                            ].map(field => (
                                <div key={field.name} className="flex flex-col gap-2">
                                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-500">{field.label}</label>
                                    <input
                                        type={field.type}
                                        name={field.name}
                                        value={formData[field.name] || ''}
                                        onChange={handleChange}
                                        placeholder={field.placeholder}
                                        className="rounded-xl border border-white/10 bg-[#111418] p-2 text-xs text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                    />
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Mídia Principal */}
                    <section className="rounded-2xl bg-[#1c2127] p-4 md:p-6 border border-white/5 shadow-xl">
                        <h2 className="text-lg font-bold border-b border-white/5 pb-3 mb-4 flex items-center gap-2">
                            <span className="material-symbols-outlined text-blue-500 text-lg">imagesmode</span>
                            Mídia do Perfil
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="flex flex-col gap-3">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Foto de Perfil</label>
                                {profileImagePreview ? (
                                    <div className="relative aspect-[3/4] rounded-xl overflow-hidden border-2 border-blue-500">
                                        <img src={profileImagePreview} alt="Profile" className="w-full h-full object-cover" />
                                        <div className="absolute top-1.5 right-1.5 flex items-center gap-1.5 px-2 py-1 rounded-full bg-emerald-500/90 backdrop-blur-sm">
                                            <span className="material-symbols-outlined text-xs text-white">check_circle</span>
                                            <span className="text-[8px] font-black text-white uppercase">Carregado</span>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setProfileImageFile(null);
                                                setProfileImagePreview(null);
                                                // Limpar também do formData para garantir que será removido do banco
                                                setFormData((prev: any) => ({ ...prev, profile_image: '' }));
                                            }}
                                            className="absolute top-1.5 left-1.5 size-6 rounded-full bg-red-500/90 backdrop-blur-sm flex items-center justify-center hover:bg-red-500 transition-colors"
                                        >
                                            <span className="material-symbols-outlined text-xs text-white">close</span>
                                        </button>
                                    </div>
                                ) : (
                                    <div className="aspect-[3/4] rounded-xl bg-[#111418] border-2 border-dashed border-white/10 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500/50 transition-all group relative">
                                        <span className="material-symbols-outlined text-3xl mb-1 text-slate-600 group-hover:text-blue-500 transition-colors">add_a_photo</span>
                                        <span className="text-[10px] font-bold text-slate-500 uppercase">Adicionar Foto</span>
                                        <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleProfileImageChange} />
                                    </div>
                                )}
                            </div>

                            <div className="md:col-span-2 flex flex-col gap-3">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Portfólio (Galeria)</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {galleryImagePreviews.map((preview, index) => (
                                        <div key={index} className="relative aspect-square rounded-lg overflow-hidden border-2 border-blue-500">
                                            <img src={preview} alt={`Gallery ${index}`} className="w-full h-full object-cover" />
                                            <button
                                                type="button"
                                                onClick={() => removeGalleryImage(index)}
                                                className="absolute top-1 right-1 size-5 rounded-full bg-red-500/90 flex items-center justify-center hover:bg-red-500 transition-colors"
                                            >
                                                <span className="material-symbols-outlined text-[10px] text-white">close</span>
                                            </button>
                                        </div>
                                    ))}
                                    {galleryImagePreviews.length < 3 && (
                                        <div className="aspect-square rounded-lg bg-[#111418] border-2 border-dashed border-white/10 flex items-center justify-center cursor-pointer hover:border-blue-500/50 transition-all group relative">
                                            <span className="material-symbols-outlined text-xl text-slate-600 group-hover:text-blue-500 transition-colors">add_photo_alternate</span>
                                            <input type="file" accept="image/*" multiple className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleGalleryImageChange} />
                                        </div>
                                    )}
                                </div>
                                <p className="text-[9px] text-slate-500 font-bold uppercase">Máximo 3 fotos. JPG ou PNG (Max 5MB cada) - {galleryImagePreviews.length}/3</p>
                            </div>
                        </div>

                        {/* Vídeos de Preview */}
                        <div className="mt-6 flex flex-col gap-3">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Vídeos de Preview (Opcional)</label>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                {previewVideoNames.map((nameOrUrl, index) => {
                                    // Se é uma URL, extrair nome do arquivo; senão usar o nome diretamente
                                    const displayName = nameOrUrl.startsWith('http')
                                        ? nameOrUrl.split('/').pop() || 'Vídeo existente'
                                        : nameOrUrl;
                                    return (
                                        <div key={index} className="relative rounded-lg border-2 border-blue-500 bg-[#111418] p-3 flex flex-col items-center justify-center">
                                            <span className="material-symbols-outlined text-2xl text-emerald-500 mb-1">videocam</span>
                                            <span className="text-[10px] font-bold text-white text-center truncate w-full" title={displayName}>{displayName}</span>
                                            <div className="absolute top-1.5 right-1.5 flex items-center gap-1.5 px-1.5 py-0.5 rounded-full bg-emerald-500/90 backdrop-blur-sm">
                                                <span className="material-symbols-outlined text-[10px] text-white">check_circle</span>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => removePreviewVideo(index)}
                                                className="absolute top-1.5 left-1.5 size-5 rounded-full bg-red-500/90 flex items-center justify-center hover:bg-red-500 transition-colors"
                                            >
                                                <span className="material-symbols-outlined text-[10px] text-white">close</span>
                                            </button>
                                        </div>
                                    );
                                })}
                                {previewVideoNames.length < 3 && (
                                    <div className="rounded-lg bg-[#111418] border-2 border-dashed border-white/10 flex flex-col items-center justify-center p-4 cursor-pointer hover:border-blue-500/50 transition-all group relative min-h-[100px]">
                                        <span className="material-symbols-outlined text-2xl mb-1 text-slate-600 group-hover:text-blue-500 transition-colors">videocam</span>
                                        <span className="text-[10px] font-bold text-slate-500 uppercase text-center">Adicionar Vídeo</span>
                                        <input type="file" accept="video/*" multiple className="absolute inset-0 opacity-0 cursor-pointer" onChange={handlePreviewVideoChange} />
                                    </div>
                                )}
                            </div>
                            <p className="text-[9px] text-slate-500 font-bold uppercase">Máximo 3 vídeos. MP4 ou MOV (Max 30MB cada) - {previewVideoNames.length}/3</p>
                        </div>
                    </section>

                    <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-6 border-t border-white/5">
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
                            className="w-full md:w-auto min-w-[200px] rounded-xl bg-blue-600 py-3 text-sm font-black text-white shadow-2xl shadow-blue-900/40 hover:bg-blue-500 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 uppercase italic"
                        >
                            {loading ? 'Salvando...' : (
                                <>
                                    Atualizar Perfil Público
                                    <span className="material-symbols-outlined text-base">save</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div >
        </>
    );
};

export default EditProfilePage;
