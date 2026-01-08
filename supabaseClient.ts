import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'http://supabase-supabase-c59c89-83-171-248-77.traefik.me';
const SUPABASE_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3Njc1Mzc1NDksImV4cCI6MTg5MzQ1NjAwMCwicm9sZSI6ImFub24iLCJpc3MiOiJzdXBhYmFzZSJ9.tXc12bFLFopBYmlhp4jwmHvr-pnuATYp06VbZ9j1YRo';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);




