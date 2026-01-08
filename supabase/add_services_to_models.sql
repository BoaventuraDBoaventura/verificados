-- Execute este comando no Editor SQL do Supabase para adicionar a coluna de serviços
alter table models add column if not exists services jsonb default '[]'::jsonb;
