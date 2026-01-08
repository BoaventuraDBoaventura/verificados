
import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
    id: string;
    message: string;
    type: ToastType;
}

interface ToastContextType {
    showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const showToast = useCallback((message: string, type: ToastType = 'info') => {
        const id = Math.random().toString(36).substring(2, 9);
        setToasts((prev) => [...prev, { id, message, type }]);

        // Auto-remove after 4 seconds
        setTimeout(() => {
            setToasts((prev) => prev.filter((toast) => toast.id !== id));
        }, 4000);
    }, []);

    const removeToast = (id: string) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    };

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            {/* Toast Portal/Container */}
            <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[9999] flex flex-col gap-3 pointer-events-none w-full max-w-[400px] px-4">
                {toasts.map((toast) => (
                    <div
                        key={toast.id}
                        onClick={() => removeToast(toast.id)}
                        className={`
              pointer-events-auto w-full p-4 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] 
              flex items-center gap-3 animate-in slide-in-from-top-10 duration-500
              border backdrop-blur-xl cursor-pointer group relative overflow-hidden
              ${toast.type === 'success' ? 'bg-[#064e3b]/80 border-emerald-500/30 text-emerald-400' : ''}
              ${toast.type === 'error' ? 'bg-[#4c0519]/80 border-rose-500/30 text-rose-400' : ''}
              ${toast.type === 'warning' ? 'bg-[#451a03]/80 border-amber-500/30 text-amber-400' : ''}
              ${toast.type === 'info' ? 'bg-[#1e3a8a]/80 border-blue-500/30 text-blue-400' : ''}
            `}
                    >
                        {/* Glow effect */}
                        <div className={`absolute -top-10 -left-10 size-20 blur-3xl opacity-20 rounded-full
              ${toast.type === 'success' ? 'bg-emerald-500' : ''}
              ${toast.type === 'error' ? 'bg-rose-500' : ''}
              ${toast.type === 'warning' ? 'bg-amber-500' : ''}
              ${toast.type === 'info' ? 'bg-blue-500' : ''}
            `}></div>

                        <div className={`size-10 rounded-xl flex items-center justify-center shrink-0
              ${toast.type === 'success' ? 'bg-emerald-500/10' : ''}
              ${toast.type === 'error' ? 'bg-rose-500/10' : ''}
              ${toast.type === 'warning' ? 'bg-amber-500/10' : ''}
              ${toast.type === 'info' ? 'bg-blue-500/10' : ''}
            `}>
                            <span className="material-symbols-outlined filled text-xl">
                                {toast.type === 'success' ? 'check_circle' : ''}
                                {toast.type === 'error' ? 'error' : ''}
                                {toast.type === 'warning' ? 'warning' : ''}
                                {toast.type === 'info' ? 'info' : ''}
                            </span>
                        </div>

                        <div className="flex-grow">
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-50 mb-0.5">
                                {toast.type === 'success' ? 'Sucesso' : ''}
                                {toast.type === 'error' ? 'Erro' : ''}
                                {toast.type === 'warning' ? 'Atenção' : ''}
                                {toast.type === 'info' ? 'Informação' : ''}
                            </p>
                            <p className="text-sm font-bold text-white leading-tight">{toast.message}</p>
                        </div>

                        <button className="size-8 rounded-lg bg-white/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="material-symbols-outlined text-sm">close</span>
                        </button>

                        {/* Progress bar effect */}
                        <div className={`absolute bottom-0 left-0 h-[3px] w-full opacity-30 overflow-hidden
              ${toast.type === 'success' ? 'bg-emerald-500/20' : ''}
              ${toast.type === 'error' ? 'bg-rose-500/20' : ''}
              ${toast.type === 'warning' ? 'bg-amber-500/20' : ''}
              ${toast.type === 'info' ? 'bg-blue-500/20' : ''}
            `}>
                            <div className={`h-full animate-toast-progress origin-left
                ${toast.type === 'success' ? 'bg-emerald-500' : ''}
                ${toast.type === 'error' ? 'bg-rose-500' : ''}
                ${toast.type === 'warning' ? 'bg-amber-500' : ''}
                ${toast.type === 'info' ? 'bg-blue-500' : ''}
              `}></div>
                        </div>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
};

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};
