-- Execute este script no Editor SQL do Supabase para criar a tabela de logs

create table if not exists admin_logs (
  id uuid default gen_random_uuid() primary key,
  user_name text, -- Nome do usuário ou sistema que realizou a ação
  action text not null, -- Descrição da ação
  type text default 'info', -- Typo de alerta: 'success', 'payment', 'danger', 'info'
  created_at timestamp with time zone default now()
);

-- Habilitar RLS (Opcional, mas recomendado)
alter table admin_logs enable row level security;

-- Política para permitir leitura pública (ou restrinja apenas para admins se tiver autenticação configurada)
create policy "Permitir leitura de logs" on admin_logs for select using (true);

-- Política para permitir inserção
create policy "Permitir inserção de logs" on admin_logs for insert with check (true);
