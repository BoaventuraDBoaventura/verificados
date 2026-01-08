import { supabase } from '../supabaseClient';

const BUCKET_NAME = 'verificados';

/**
 * Verifica se o bucket existe e está acessível
 */
export async function checkBucketAccess(): Promise<boolean> {
  try {
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .list('', {
        limit: 1
      });

    if (error) {
      console.error('Erro ao verificar acesso ao bucket:', error);
      return false;
    }

    return true;
  } catch (err) {
    console.error('Erro ao verificar bucket:', err);
    return false;
  }
}

/**
 * Faz upload de um arquivo para o bucket verificados no Supabase Storage
 * @param file Arquivo a ser enviado
 * @param path Caminho onde o arquivo será salvo (ex: 'models/{modelId}/profile.jpg')
 * @returns URL pública do arquivo ou null em caso de erro
 */
export async function uploadFile(file: File, path: string, retries: number = 3): Promise<string | null> {
  const fileSizeMB = file.size / (1024 * 1024);

  // Determinar Content-Type baseado na extensão do arquivo
  const getContentType = (filename: string): string => {
    const ext = filename.split('.').pop()?.toLowerCase();
    const contentTypes: { [key: string]: string } = {
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'gif': 'image/gif',
      'webp': 'image/webp',
      'mp4': 'video/mp4',
      'mov': 'video/quicktime',
      'avi': 'video/x-msvideo',
      'webm': 'video/webm'
    };
    return contentTypes[ext || ''] || file.type || 'application/octet-stream';
  };

  const contentType = getContentType(file.name);

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`📤 Tentativa ${attempt}/${retries} - Fazendo upload de ${file.name} (${fileSizeMB.toFixed(2)}MB) para ${path}`);

      // Verificar acesso ao bucket apenas na primeira tentativa
      if (attempt === 1) {
        const hasAccess = await checkBucketAccess();
        if (!hasAccess) {
          console.warn('Aviso: Possível problema de acesso ao bucket. Continuando com upload...');
        }
      }

      // Timeout baseado no tamanho do arquivo (mais tempo para arquivos maiores)
      // Aumentado para dar mais tempo ao upload
      const timeoutDuration = fileSizeMB > 20 ? 600000 : fileSizeMB > 10 ? 300000 : 180000;

      // Criar promise de upload
      const uploadPromise = supabase.storage
        .from(BUCKET_NAME)
        .upload(path, file, {
          cacheControl: '3600',
          upsert: true,
          contentType: contentType
        });

      // Adicionar timeout
      const timeoutPromise = new Promise<{ data: null; error: { message: string } }>((resolve) => {
        setTimeout(() => {
          resolve({
            data: null,
            error: {
              message: `Upload timeout após ${timeoutDuration / 1000} segundos. O arquivo pode ser muito grande ou a conexão está lenta. Tente comprimir o vídeo ou verificar sua conexão.`
            }
          });
        }, timeoutDuration);
      });

      // Fazer upload do arquivo com timeout
      console.log(`⏳ Aguardando resposta do servidor (timeout: ${timeoutDuration / 1000}s)...`);
      let uploadResult: any;

      try {
        uploadResult = await Promise.race([uploadPromise, timeoutPromise]);
        console.log('✅ Promise.race concluído');
      } catch (raceError: any) {
        console.error('❌ Erro no Promise.race:', raceError);
        // Se o timeout ganhou, tratar como erro
        if (raceError?.message?.includes('timeout')) {
          throw raceError;
        }
        // Se foi outro erro, tentar novamente
        throw new Error(`Erro de conexão: ${raceError.message || 'Erro desconhecido'}`);
      }

      const { data, error } = uploadResult;
      console.log(`📦 Resposta recebida - data: ${data ? `OK (path: ${data.path})` : 'null'}, error: ${error ? error.message : 'null'}`);

      // Verificar se realmente houve erro ou se foi apenas o timeout que ganhou
      if (!data && !error) {
        console.warn('⚠️ Resposta vazia do servidor, pode ser timeout');
        // Tratar como erro de timeout para retry - criar objeto de erro
        const timeoutErrorMsg = `Timeout: O servidor não respondeu após ${timeoutDuration / 1000} segundos. Tente novamente.`;
        // Continuar para o tratamento de erro abaixo simulando um erro
        const fakeError: any = {
          message: timeoutErrorMsg,
          statusCode: 0,
          status: 0
        };
        // Vamos tratar isso como um erro de conexão para retry
        throw fakeError;
      }

      if (error) {
        const errorMessage = error.message || '';
        const statusCode = (error as any).statusCode || (error as any).status;

        console.error(`❌ Erro na tentativa ${attempt}/${retries}:`, {
          message: errorMessage,
          statusCode: statusCode,
          error: error
        });

        // Erros que não devem ser retentados
        if (errorMessage.includes('406') || statusCode === 406) {
          const errorMsg = `Erro 406: O bucket "verificados" precisa ser configurado no Supabase Storage.\n\n` +
            `Por favor:\n` +
            `1. Acesse o Supabase Dashboard\n` +
            `2. Vá em Storage > Policies\n` +
            `3. Configure as políticas de acesso para o bucket "verificados"\n` +
            `4. Certifique-se de que o bucket está marcado como "Public"\n\n` +
            `Veja o arquivo CONFIGURACAO_STORAGE.md para mais detalhes.`;
          console.error(errorMsg);
          return null;
        } else if (errorMessage.includes('413') || statusCode === 413) {
          console.error('Arquivo muito grande (413).');
          return null;
        } else if (errorMessage.includes('404') || statusCode === 404) {
          console.error('Bucket "verificados" não encontrado (404).');
          return null;
        }

        // Erros de conexão que devem ser retentados
        const isConnectionError =
          errorMessage.includes('ERR_CONNECTION_RESET') ||
          errorMessage.includes('network') ||
          errorMessage.includes('ECONNRESET') ||
          errorMessage.includes('timeout') ||
          errorMessage.includes('Timeout') ||
          statusCode === 0 ||
          !statusCode;

        if (isConnectionError && attempt < retries) {
          const waitTime = attempt * 2000; // Backoff exponencial: 2s, 4s, 6s
          console.log(`🔄 Erro de conexão detectado. Tentando novamente em ${waitTime / 1000} segundos...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
          continue; // Tentar novamente
        } else if (isConnectionError) {
          console.error('O upload falhou devido a problemas de conexão após retries.');
          return null;
        } else if (errorMessage.includes('timeout') || errorMessage.includes('Timeout')) {
          if (attempt < retries) {
            const waitTime = attempt * 2000;
            console.log(`⏱️ Timeout detectado. Tentando novamente em ${waitTime / 1000} segundos...`);
            await new Promise(resolve => setTimeout(resolve, waitTime));
            continue;
          } else {
            console.error(`⏱️ Timeout após retries: ${errorMessage}`);
            return null;
          }
        } else {
          // Outros erros
          if (attempt < retries) {
            const waitTime = attempt * 2000;
            console.log(`⚠️ Erro detectado. Tentando novamente em ${waitTime / 1000} segundos...`);
            await new Promise(resolve => setTimeout(resolve, waitTime));
            continue;
          } else {
            console.error(`Erro ao fazer upload na última tentativa: ${errorMessage || 'Erro desconhecido'}`, { statusCode });
            return null;
          }
        }
      }

      if (!data) {
        if (attempt < retries) {
          const waitTime = attempt * 2000;
          console.log(`⚠️ Upload sem dados retornados. Tentando novamente em ${waitTime / 1000} segundos...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
          continue;
        } else {
          console.error('Upload concluído mas nenhum dado retornado após todas as tentativas');
          return null;
        }
      }

      // Obter URL pública do arquivo
      const { data: urlData } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(data.path);

      console.log(`✅ Upload concluído com sucesso na tentativa ${attempt}!`, urlData.publicUrl);
      return urlData.publicUrl;

    } catch (err: any) {
      console.error(`❌ Erro inesperado na tentativa ${attempt}/${retries}:`, err);

      // Verificar se é erro de conexão ou timeout
      const errorMessage = err.message || String(err) || '';
      const statusCode = err.statusCode || err.status || 0;

      const isConnectionError =
        errorMessage.includes('ERR_CONNECTION_RESET') ||
        errorMessage.includes('network') ||
        errorMessage.includes('ECONNRESET') ||
        errorMessage.includes('Failed to fetch') ||
        errorMessage.includes('Timeout') ||
        errorMessage.includes('timeout') ||
        statusCode === 0;

      if (isConnectionError && attempt < retries) {
        const waitTime = attempt * 2000;
        console.log(`🔄 Erro de conexão/timeout detectado. Tentando novamente em ${waitTime / 1000} segundos...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        continue; // Tentar novamente
      } else if (attempt >= retries) {
        console.error(`❌ Erro ao fazer upload após ${retries} tentativas.`, { errorMessage, statusCode });
        return null;
      }
    }
  }

  // Se chegou aqui, todas as tentativas falharam
  console.error('❌ Todas as tentativas de upload falharam');
  return null;
}

/**
 * Remove um arquivo do bucket verificados
 * @param path Caminho do arquivo a ser removido
 */
export async function deleteFile(path: string): Promise<boolean> {
  try {
    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([path]);

    if (error) {
      console.error('Erro ao remover arquivo:', error);
      return false;
    }

    return true;
  } catch (err) {
    console.error('Erro ao remover arquivo:', err);
    return false;
  }
}

/**
 * Extrai o caminho do arquivo de uma URL pública do Supabase Storage
 * @param url URL pública do arquivo
 * @returns Caminho do arquivo ou null
 */
export function extractPathFromUrl(url: string): string | null {
  try {
    if (!url) return null;

    // URL do Supabase Storage pode ter diferentes formatos:
    // https://{project}.supabase.co/storage/v1/object/public/{bucket}/{path}
    // http://{domain}/storage/v1/object/public/{bucket}/{path}

    // Tentar extrair o caminho após o nome do bucket
    const patterns = [
      /\/storage\/v1\/object\/public\/[^/]+\/(.+)$/,  // Formato padrão
      /\/storage\/v1\/object\/public\/(.+)$/,          // Sem bucket explícito
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }

    // Se não encontrou, tentar extrair tudo após o último "/" antes de query params
    const urlWithoutParams = url.split('?')[0];
    const parts = urlWithoutParams.split('/');
    const bucketIndex = parts.findIndex(p => p === BUCKET_NAME);
    if (bucketIndex >= 0 && bucketIndex < parts.length - 1) {
      return parts.slice(bucketIndex + 1).join('/');
    }

    return null;
  } catch {
    return null;
  }
}

