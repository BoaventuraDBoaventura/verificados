
import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { User, VerificationStatus } from '../types';
import { supabase } from '../supabaseClient';
import { uploadFile } from '../utils/storage';
import { useToast } from '../context/ToastContext';
import { logger } from '../utils/logger';

interface DashboardPageProps {
  user: User;
}

const DashboardPage: React.FC<DashboardPageProps> = ({ user }) => {
  const [modelData, setModelData] = useState<any>(null);
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadAttempt, setUploadAttempt] = useState(0);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchModelData = async () => {
      if (!user.modelId) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('models')
          .select('*')
          .eq('id', user.modelId)
          .single();

        if (error) {
          console.error('Erro ao carregar dados do modelo:', error);
          setLoading(false);
          return;
        }

        if (data) {
          console.log('Dados do modelo carregados:', data);
          setModelData(data);
        }
      } catch (err) {
        console.error('Erro ao buscar modelo:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchModelData();
  }, [user.modelId]);

  // Não carregar preview do vídeo se já foi enviado
  // O vídeo enviado não deve ser exibido no painel

  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validar tamanho (máximo 50MB para vídeo de verificação)
      if (file.size > 50 * 1024 * 1024) {
        showToast('O vídeo deve ter no máximo 50MB.', 'warning');
        return;
      }

      // Validar tipo
      if (!file.type.startsWith('video/')) {
        showToast('Por favor, selecione um arquivo de vídeo.', 'warning');
        return;
      }

      setVideoFile(file);

      // Criar preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setVideoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleVideoUpload = async () => {
    if (!videoFile || !user.modelId) {
      showToast('Por favor, selecione um vídeo primeiro.', 'warning');
      return;
    }

    // Verificar tamanho do arquivo
    const fileSizeMB = videoFile.size / (1024 * 1024);
    if (fileSizeMB > 50) {
      showToast(`O vídeo é muito grande (${fileSizeMB.toFixed(2)}MB). O tamanho máximo é 50MB. Por favor, comprima o vídeo ou use um arquivo menor.`, 'warning');
      return;
    }

    setUploadingVideo(true);
    setUploadProgress(0);

    let progressInterval: NodeJS.Timeout | null = null;
    let uploadTimeout: NodeJS.Timeout | null = null;

    try {
      const timestamp = Date.now();
      const fileExt = videoFile.name.split('.').pop();
      const modelIdentifier = user.slug || user.modelId;
      const videoPath = `models/${modelIdentifier}/verification_${timestamp}.${fileExt}`;

      console.log('📤 Fazendo upload do vídeo de verificação...');
      console.log(`📊 Tamanho do arquivo: ${fileSizeMB.toFixed(2)}MB`);

      // Simular progresso durante o upload (mais lento para vídeos grandes)
      const progressSpeed = fileSizeMB > 20 ? 300 : fileSizeMB > 10 ? 200 : 150;
      let uploadCompleted = false;

      progressInterval = setInterval(() => {
        if (uploadCompleted) {
          if (progressInterval) clearInterval(progressInterval);
          return;
        }

        setUploadProgress(prev => {
          // Progresso continua até 88% enquanto aguarda o upload
          if (prev >= 88) {
            return 88; // Para em 88% e aguarda conclusão real
          }
          // Incremento menor e mais constante
          const increment = Math.random() * 1.5 + 0.3;
          return Math.min(prev + increment, 88);
        });
      }, progressSpeed);

      // Timeout de segurança (mais tempo para vídeos grandes - 10 minutos para vídeos grandes)
      const timeoutDuration = fileSizeMB > 20 ? 600000 : fileSizeMB > 10 ? 300000 : 180000;
      uploadTimeout = setTimeout(() => {
        if (progressInterval) clearInterval(progressInterval);
        uploadCompleted = true;
        setUploadingVideo(false);
        setUploadProgress(0);
        showToast('O upload está demorando muito. Verifique sua conexão.', 'warning');
      }, timeoutDuration);

      console.log('⏳ Iniciando upload...');
      setUploadProgress(5);

      // Fazer upload (a função já tem retry automático)
      let videoUrl: string | null = null;
      try {
        videoUrl = await uploadFile(videoFile, videoPath);
        uploadCompleted = true;
      } catch (err: any) {
        uploadCompleted = true;
        console.error('Erro no upload:', err);
        // A função uploadFile já tratou o erro e mostrou mensagem
      }

      if (progressInterval) clearInterval(progressInterval);
      if (uploadTimeout) clearTimeout(uploadTimeout);

      console.log('📊 Upload retornou:', videoUrl ? 'Sucesso' : 'Falhou');

      if (!videoUrl) {
        setUploadingVideo(false);
        setUploadProgress(0);
        return; // A função uploadFile já mostrou o erro
      }

      // Upload concluído com sucesso, atualizar progresso
      setUploadProgress(92);

      if (videoUrl) {
        console.log('✅ Upload concluído! URL:', videoUrl);

        // Atualizar no banco de dados
        setUploadProgress(95);
        const { data, error } = await supabase
          .from('models')
          .update({ verification_video: videoUrl })
          .eq('id', user.modelId)
          .select();

        if (error) {
          console.error('Erro ao salvar vídeo no banco:', error);
          showToast('Vídeo enviado, mas houve um erro ao salvar.', 'error');
          setUploadingVideo(false);
          setUploadProgress(0);
          return;
        }

        console.log('✅ Vídeo salvo no banco de dados!');
        setUploadProgress(100);

        // Atualizar o estado local
        setModelData((prev: any) => ({
          ...prev,
          verification_video: videoUrl
        }));

        // Pequeno delay antes de mostrar sucesso
        await new Promise(resolve => setTimeout(resolve, 500));

        showToast('Vídeo de verificação enviado com sucesso!', 'success');

        // Log activity
        logger.log(artisticName, 'Enviou vídeo de verificação', 'success');

        setVideoFile(null);
        setVideoPreview(null);
        setUploadingVideo(false);
        setUploadProgress(0);

        // Recarregar dados
        const { data: updatedData } = await supabase
          .from('models')
          .select('*')
          .eq('id', user.modelId)
          .single();

        if (updatedData) {
          setModelData(updatedData);
        }
      } else {
        showToast('Erro ao fazer upload do vídeo.', 'error');
        setUploadingVideo(false);
        setUploadProgress(0);
      }
    } catch (err: any) {
      console.error('Erro ao fazer upload:', err);

      if (progressInterval) clearInterval(progressInterval);
      if (uploadTimeout) clearTimeout(uploadTimeout);

      setUploadingVideo(false);
      setUploadProgress(0);

      if (err.message?.includes('Timeout')) {
        showToast('O upload demorou muito e foi cancelado.', 'warning');
      } else {
        showToast(`Erro ao fazer upload: ${err.message || 'Erro desconhecido'}`, 'error');
      }
    }
  };

  const handleRemoveVideo = () => {
    if (uploadingVideo) {
      const confirmCancel = window.confirm('O upload está em andamento. Deseja realmente cancelar?');
      if (!confirmCancel) return;
    }

    setVideoFile(null);
    setVideoPreview(null);
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-10">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <span className="material-symbols-outlined text-6xl text-slate-700 mb-4 animate-spin">refresh</span>
            <p className="text-slate-400">Carregando seu perfil...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!modelData) {
    return (
      <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-10">
        <div className="text-center py-20">
          <span className="material-symbols-outlined text-6xl text-slate-700 mb-4">error</span>
          <h2 className="text-2xl font-bold mb-2">Erro ao carregar perfil</h2>
          <p className="text-slate-400">Não foi possível carregar seus dados. Tente fazer login novamente.</p>
        </div>
      </div>
    );
  }

  const artisticName = modelData.artistic_name || 'Modelo';
  const status = modelData.status || 'Em Verificação';
  const statusText = status === 'Aprovado' ? 'Aprovado' : status === 'Rejeitado' ? 'Rejeitado' : 'Em Verificação';
  const statusColor = status === 'Aprovado' ? 'text-green-500' : status === 'Rejeitado' ? 'text-red-500' : 'text-amber-500';
  const statusIcon = status === 'Aprovado' ? 'check_circle' : status === 'Rejeitado' ? 'cancel' : 'pending';

  return (
    <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-10">
      <div className="mb-10">
        <h1 className="text-2xl sm:text-3xl font-black mb-3 leading-tight tracking-tight">Olá, {artisticName}.</h1>
        <p className="text-sm sm:text-base text-slate-400">Estamos analisando seu perfil. Acompanhe o status e complete as etapas pendentes.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4">
        <div className="lg:col-span-2 flex flex-col gap-3 sm:gap-4">
          {/* Status Card */}
          <div className="flex flex-col sm:flex-row items-stretch gap-3 sm:gap-4 rounded-lg bg-[#1c2127] border border-white/5 p-3 sm:p-4 shadow-xl max-w-lg">
            <div className="flex flex-col justify-center gap-1.5 flex-1">
              <div className="flex items-center gap-1.5">
                <span className={`material-symbols-outlined ${statusColor} text-xl sm:text-2xl`}>{statusIcon}</span>
                <h3 className="text-sm sm:text-base font-bold">Status: {statusText}</h3>
              </div>
              <p className="text-[10px] sm:text-xs text-slate-400 leading-snug">
                {status === 'Aprovado'
                  ? 'Parabéns! Seu perfil foi aprovado e está visível na plataforma.'
                  : status === 'Rejeitado'
                    ? 'Seu perfil foi rejeitado. Entre em contato com o suporte para mais informações.'
                    : 'Recebemos seu cadastro completo. Nossa equipe de confiança e segurança está validando suas informações manualmente.'}
              </p>
              {status === 'Em Verificação' && (
                <div className="flex items-center gap-1 text-[9px] sm:text-[10px] font-bold text-blue-500 uppercase tracking-widest mt-1">
                  <span className="material-symbols-outlined text-xs">timer</span>
                  Prazo estimado: 24h
                </div>
              )}
            </div>
            <div className="w-full sm:w-32 h-20 sm:h-auto rounded-md bg-gradient-to-br from-blue-600/20 to-purple-600/20 flex items-center justify-center border border-white/5">
              <span className="material-symbols-outlined text-xl sm:text-2xl opacity-50">verified_user</span>
            </div>
          </div>

          {/* Upload Area - Só mostra se o vídeo ainda não foi enviado */}
          {!modelData?.verification_video && (
            <div className="rounded-xl bg-[#1c2127] border border-white/5 p-4 sm:p-6 shadow-xl">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h3 className="text-base sm:text-lg font-bold">Vídeo de Verificação</h3>
                <span className="rounded-full bg-red-500/10 px-2.5 py-1 text-[10px] sm:text-xs font-bold text-red-500 uppercase">Necessário</span>
              </div>

              {videoPreview ? (
                // Preview do vídeo selecionado
                <div className="flex flex-col items-center justify-center rounded-lg border-2 border-blue-500/20 bg-[#111418] py-6 px-4 sm:py-8 sm:px-6">
                  {!uploadingVideo && (
                    <video
                      src={videoPreview}
                      controls
                      className="w-full max-w-md rounded-lg mb-3 sm:mb-4"
                    />
                  )}

                  {uploadingVideo && (
                    <div className="w-full max-w-md mb-3 sm:mb-4">
                      <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                        <span className="text-xs sm:text-sm font-bold text-blue-500">Enviando vídeo...</span>
                        <span className="text-xs sm:text-sm font-bold text-blue-500">{Math.round(uploadProgress)}%</span>
                      </div>
                      <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden relative">
                        <div
                          className="h-full bg-gradient-to-r from-blue-600 to-blue-500 rounded-full transition-all duration-300 ease-out flex items-center justify-end pr-2"
                          style={{ width: `${uploadProgress}%` }}
                        >
                          {uploadProgress > 10 && (
                            <span className="material-symbols-outlined text-xs text-white animate-pulse">arrow_forward</span>
                          )}
                        </div>
                      </div>
                      <p className="text-[10px] sm:text-xs text-slate-500 mt-1.5 sm:mt-2 text-center">
                        {uploadProgress < 20 ? 'Preparando upload...' :
                          uploadProgress < 50 ? 'Enviando para o servidor...' :
                            uploadProgress < 85 ? 'Upload em andamento...' :
                              uploadProgress < 95 ? 'Salvando no banco de dados...' :
                                uploadProgress < 100 ? 'Finalizando...' : 'Concluído!'}
                      </p>
                      {videoFile && (
                        <div className="text-[10px] sm:text-xs text-slate-600 mt-1 text-center space-y-0.5">
                          <p>Tamanho: {(videoFile.size / (1024 * 1024)).toFixed(2)}MB</p>
                          {uploadAttempt > 1 && (
                            <p className="text-amber-500">Tentativa {uploadAttempt}/3</p>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex gap-2 sm:gap-3">
                    <button
                      onClick={handleVideoUpload}
                      disabled={uploadingVideo}
                      className="flex items-center gap-1.5 sm:gap-2 rounded-lg bg-blue-600 px-4 sm:px-6 py-2 sm:py-2.5 text-xs sm:text-sm font-bold text-white hover:bg-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {uploadingVideo ? (
                        <>
                          <span className="material-symbols-outlined text-base sm:text-lg animate-spin">refresh</span>
                          Enviando...
                        </>
                      ) : (
                        <>
                          <span className="material-symbols-outlined text-base sm:text-lg">cloud_upload</span>
                          Enviar Vídeo
                        </>
                      )}
                    </button>
                    <button
                      onClick={handleRemoveVideo}
                      disabled={uploadingVideo}
                      className="flex items-center gap-1.5 sm:gap-2 rounded-lg bg-white/5 px-4 sm:px-6 py-2 sm:py-2.5 text-xs sm:text-sm font-bold text-white hover:bg-white/10 transition-all disabled:opacity-50"
                    >
                      <span className="material-symbols-outlined text-base sm:text-lg">close</span>
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                // Área de seleção
                <div
                  className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-white/10 bg-[#111418] py-8 sm:py-12 px-4 sm:px-6 text-center hover:border-blue-500/50 cursor-pointer transition-all group"
                  onClick={() => {
                    if (fileInputRef.current) {
                      fileInputRef.current.click();
                    }
                  }}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="video/*"
                    onChange={handleVideoSelect}
                    className="hidden"
                  />
                  <div className="size-12 sm:size-16 rounded-full bg-white/5 flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 group-hover:bg-blue-500/10 transition-all">
                    <span className="material-symbols-outlined text-2xl sm:text-3xl group-hover:text-blue-500 transition-colors">videocam</span>
                  </div>
                  <h4 className="text-base sm:text-lg font-bold mb-1.5 sm:mb-2 text-white">Verificação de Identidade</h4>
                  <div className="text-xs sm:text-sm text-slate-400 max-w-md mb-4 sm:mb-6 space-y-3">
                    <p>
                      Para garantir a segurança da nossa plataforma e confirmar que você é real, solicitamos um breve vídeo.
                    </p>
                    <p className="bg-blue-600/10 border border-blue-500/20 p-3 rounded-lg text-blue-100 italic">
                      "Mostre seu rosto e diga: <span className="font-black text-blue-400">Meu nome é [Seu Nome], tenho [Sua Idade] anos e este é o vídeo de verificação do site Verificados.</span>"
                    </p>
                    <p className="text-[10px] sm:text-xs">
                      <span className="material-symbols-outlined text-xs align-middle mr-1 text-emerald-500">lock</span>
                      Informação importante: Este vídeo é <span className="text-white font-bold">estritamente privado</span>. Ele nunca será exibido no seu perfil ou para outros usuários. Serve apenas para nossa auditoria interna.
                    </p>
                  </div>
                  <button
                    type="button"
                    className="flex items-center gap-1.5 sm:gap-2 rounded-lg bg-blue-600 px-4 sm:px-6 py-2 sm:py-2.5 text-xs sm:text-sm font-bold text-white hover:bg-blue-500 transition-all shadow-lg"
                  >
                    <span className="material-symbols-outlined text-base sm:text-lg">cloud_upload</span>
                    Selecionar Arquivo
                  </button>
                  <p className="text-[10px] sm:text-xs text-slate-600 mt-3 sm:mt-4">MP4, MOV ou AVI (Máx. 50MB)</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="flex flex-col gap-3 sm:gap-4">
          {/* Profile Preview */}
          <div className="rounded-xl bg-[#1c2127] border border-white/5 p-4 sm:p-6 shadow-xl">
            <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
              {modelData.profile_image ? (
                <img
                  src={modelData.profile_image}
                  className="size-12 sm:size-16 rounded-full object-cover"
                  alt={artisticName}
                />
              ) : (
                <div className="size-12 sm:size-16 rounded-full bg-[#111418] flex items-center justify-center border border-white/5">
                  <span className="material-symbols-outlined text-xl text-slate-700">person</span>
                </div>
              )}
              <div>
                <h3 className="text-sm sm:text-base font-bold">{artisticName}</h3>
                <p className="text-[10px] sm:text-xs text-slate-500 uppercase tracking-widest">ID: #{modelData.id?.slice(0, 8) || 'N/A'}</p>
              </div>
            </div>
            <div className="space-y-3 sm:space-y-4 border-t border-white/5 pt-4 sm:pt-6">
              <div className="flex justify-between text-xs sm:text-sm">
                <span className="text-slate-500">Localização</span>
                <span className="font-medium text-xs sm:text-sm">{modelData.city || 'N/A'}, {modelData.province || 'N/A'}</span>
              </div>
              <div className="flex justify-between text-xs sm:text-sm">
                <span className="text-slate-500">Idade</span>
                <span className="font-medium text-xs sm:text-sm">{modelData.age ? `${modelData.age} anos` : 'N/A'}</span>
              </div>
              <div className="flex justify-between text-xs sm:text-sm">
                <span className="text-slate-500">Categorias</span>
                <span className="font-medium text-xs sm:text-sm">
                  {Array.isArray(modelData.categories) && modelData.categories.length > 0
                    ? modelData.categories.slice(0, 2).join(', ')
                    : 'Nenhuma'}
                </span>
              </div>
            </div>
            <Link
              to="/dashboard/editar"
              className="w-full mt-4 sm:mt-6 inline-flex items-center justify-center rounded-lg bg-white/5 py-2 sm:py-2.5 text-xs sm:text-sm font-bold hover:bg-white/10 transition-colors"
            >
              Editar Perfil
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
