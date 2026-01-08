# Configuração do Supabase Storage

## Erro 406 (Not Acceptable)

Este erro acontece quando o bucket do Supabase Storage não tem políticas de acesso configuradas.

## ⚡ Solução Rápida (2 Passos)

### Passo 1: Criar/Verificar o Bucket

1. Acesse o **Supabase Dashboard**
2. Vá em **Storage** no menu lateral
3. Se o bucket "verificados" não existir:
   - Clique em **New bucket**
   - Nome: `verificados` (exatamente assim, minúsculas)
   - **IMPORTANTE**: Marque a opção **Public bucket** ✅
   - Clique em **Create bucket**

### Passo 2: Criar as Políticas (Método Mais Fácil)

**Opção A: Usar o arquivo SQL (RECOMENDADO)**

1. Abra o arquivo `storage_policies.sql` que está na raiz do projeto
2. Copie todo o conteúdo do arquivo
3. No Supabase Dashboard, vá em **SQL Editor**
4. Clique em **New Query**
5. Cole o conteúdo do arquivo SQL
6. Clique em **Run** (ou pressione Ctrl+Enter)
7. Pronto! As políticas foram criadas

**Opção B: Criar manualmente no Dashboard**

1. No Supabase Dashboard, vá em **Storage** > **Policies**
2. Selecione o bucket "verificados"
3. Clique em **New Policy**
4. Para cada política abaixo, crie uma nova:

   **Política 1 - Leitura Pública:**
   - Nome: `Public Access - Read`
   - Operation: `SELECT`
   - Target roles: `public`
   - Policy definition: `bucket_id = 'verificados'`

   **Política 2 - Upload:**
   - Nome: `Authenticated users can upload`
   - Operation: `INSERT`
   - Target roles: `authenticated`
   - Policy definition: `bucket_id = 'verificados'`

   **Política 3 - Atualização:**
   - Nome: `Authenticated users can update`
   - Operation: `UPDATE`
   - Target roles: `authenticated`
   - Policy definition: `bucket_id = 'verificados'`

   **Política 4 - Exclusão:**
   - Nome: `Authenticated users can delete`
   - Operation: `DELETE`
   - Target roles: `authenticated`
   - Policy definition: `bucket_id = 'verificados'`

### Passo 3: Verificar

Após criar as políticas, verifique:
- ✅ O bucket "verificados" existe
- ✅ O bucket está marcado como **Public**
- ✅ As 4 políticas foram criadas (você pode ver em Storage > Policies)

## 🔧 Alternativa: Desabilitar RLS (Apenas Desenvolvimento)

⚠️ **ATENÇÃO**: Isso remove TODAS as restrições de segurança. Use APENAS em desenvolvimento/teste!

1. No Supabase Dashboard, vá em **Storage**
2. Clique no bucket "verificados"
3. Vá na aba **Policies**
4. Clique em **Disable RLS** (se disponível)

## ✅ Teste

Após configurar, tente fazer upload de uma imagem novamente. O erro 406 deve desaparecer.

## 📝 Notas Importantes

- O nome do bucket deve ser exatamente `verificados` (sem espaços, minúsculas)
- Se você já tentou fazer upload antes, pode ser necessário limpar o cache do navegador
- As políticas são aplicadas imediatamente após a criação
