import { supabase } from '../supabaseClient';
import { AdminLog } from '../types';

export const logger = {
    /**
     * Registra uma nova atividade nos logs do sistema
     */
    log: async (
        userName: string,
        action: string,
        type: 'success' | 'payment' | 'danger' | 'info' = 'info'
    ) => {
        try {
            const { error } = await supabase
                .from('admin_logs')
                .insert({
                    user_name: userName,
                    action,
                    type
                });

            if (error) {
                console.error('Falha ao registrar log:', error);
            }
        } catch (err) {
            console.error('Erro inesperado ao registrar log:', err);
        }
    },

    /**
     * Busca os logs recentes
     */
    getRecentLogs: async (limit = 20): Promise<AdminLog[]> => {
        try {
            const { data, error } = await supabase
                .from('admin_logs')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(limit);

            if (error) {
                console.error('Erro ao buscar logs:', error);
                return [];
            }

            return data as AdminLog[];
        } catch (err) {
            console.error('Erro inesperado ao buscar logs:', err);
            return [];
        }
    }
};
