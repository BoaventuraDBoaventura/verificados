# Protocolo de Segurança - Verificados Hub

Este documento descreve as medidas de segurança implementadas e as pendências para garantir a integridade dos dados.

## ✅ Implementado no Frontend
1. **Saneamento de Inputs**: Todos os dados enviados via `EditProfilePage` são limpos (`trim()`) e as medidas técnicas não aceitam valores nulos que possam causar injeção de dados inesperados.
2. **Identificadores Únicos**: Migração de IDs sequenciais para UUIDs e Slugs, dificultando o "scraping" (raspagem) de dados por robôs.
3. **Validação de Sessão**: Verificação de integridade básica no `App.tsx` para evitar acessos diretos a rotas protegidas.

## ⚠️ Pendências Críticas (Ação Necessária no Supabase)

### 1. Políticas de RLS (Urgente)
Você deve executar o script de Row Level Security no seu console do Supabase. Sem isso, o sistema está vulnerável a deleções acidentais ou maliciosas.

### 2. Migração para Supabase Auth
Atualmente usamos uma tabela manual de `admins` e `models`.
- **Risco**: Senhas em texto simples.
- **Solução**: Mover o login para `supabase.auth.signInWithPassword()`. Isso garantirá que as senhas sejam criptografadas com algoritmos de nível bancário (Bcrypt).

### 3. Proteção de Storage
Configurar as políticas do Bucket `verificados`:
- **Read**: Público.
- **Write**: Apenas usuários autenticados cujos arquivos comecem com `models/${auth.uid()}/`.

## 🛡️ Próximos Passos Sugeridos
1. Remover a coluna `password` das tabelas públicas assim que migrarmos para o Auth oficial.
2. Implementar logs de auditoria para ações do administrador.
3. Adicionar limite de tentativas de login (Rate Limiting).
