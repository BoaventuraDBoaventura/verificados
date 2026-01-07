
import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer className="relative border-t border-white/5 bg-[#0d141b] pt-20 pb-10 overflow-hidden">
      {/* Elemento Decorativo de Fundo */}
      <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 size-96 bg-blue-600/5 blur-[120px] rounded-full pointer-events-none"></div>
      
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8 mb-16">
          
          {/* Coluna 1: Marca e Bio */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            <Link to="/" className="flex items-center gap-2 w-fit">
              <span className="material-symbols-outlined filled text-blue-500 text-3xl">verified</span>
              <span className="text-2xl font-black tracking-tighter uppercase italic">Verificados</span>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
              A maior rede de talentos autenticados de Moçambique. Conectamos modelos profissionais a marcas globais através de um ecossistema seguro e transparente.
            </p>
            <div className="flex items-center gap-4 mt-2">
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Métodos de Pagamento</span>
                <div className="flex items-center gap-3">
                  <div className="h-6 px-2 bg-red-600/10 border border-red-600/20 rounded flex items-center">
                    <span className="text-[8px] font-black text-red-500">M-PESA</span>
                  </div>
                  <div className="h-6 px-2 bg-orange-500/10 border border-orange-500/20 rounded flex items-center">
                    <span className="text-[8px] font-black text-orange-500">E-MOLA</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Coluna 2: Navegação */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">Explorar</h4>
            <ul className="flex flex-col gap-4">
              <li><Link to="/" className="text-sm text-slate-400 hover:text-white transition-colors">Modelos</Link></li>
              <li><Link to="/info" className="text-sm text-slate-400 hover:text-white transition-colors">Como Funciona</Link></li>
              <li><Link to="#" className="text-sm text-slate-400 hover:text-white transition-colors">Agências</Link></li>
            </ul>
          </div>

          {/* Coluna 3: Institucional */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">Institucional</h4>
            <ul className="flex flex-col gap-4">
              <li><Link to="#" className="text-sm text-slate-400 hover:text-white transition-colors">Sobre Nós</Link></li>
              <li><Link to="#" className="text-sm text-slate-400 hover:text-white transition-colors">Carreiras</Link></li>
              <li><Link to="#" className="text-sm text-slate-400 hover:text-white transition-colors">Termos de Uso</Link></li>
              <li><Link to="#" className="text-sm text-slate-400 hover:text-white transition-colors">Privacidade</Link></li>
            </ul>
          </div>

          {/* Coluna 4: CTA / Comunidade */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            <div className="p-6 rounded-3xl bg-white/5 border border-white/5 relative overflow-hidden group">
              <div className="relative z-10">
                <h4 className="text-sm font-bold text-white mb-2">Quer ser um talento verificado?</h4>
                <p className="text-xs text-slate-400 mb-4">Destaque-se no mercado profissional com o selo de autenticidade.</p>
                <Link 
                  to="/cadastro" 
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-white shadow-lg shadow-blue-900/40 hover:bg-blue-500 transition-all active:scale-95"
                >
                  Criar Perfil Grátis
                  <span className="material-symbols-outlined text-xs">add_circle</span>
                </Link>
              </div>
              <div className="absolute -bottom-4 -right-4 size-20 bg-blue-600/20 blur-2xl rounded-full group-hover:scale-150 transition-transform duration-700"></div>
            </div>
            
            <div className="flex flex-col gap-3">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Siga-nos</span>
              <div className="flex items-center gap-3">
                {['facebook', 'instagram', 'x', 'linkedin'].map(social => (
                  <a key={social} href="#" className="size-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-slate-400 hover:bg-blue-600 hover:text-white hover:border-blue-500 transition-all">
                    <i className={`fa-brands fa-${social} text-sm`}></i>
                    {!['facebook', 'instagram', 'x', 'linkedin'].includes(social) ? null : <span className="material-symbols-outlined text-sm">{social === 'x' ? 'close' : 'share'}</span>}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-col md:flex-row items-center gap-2 md:gap-6 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 text-center md:text-left">
            <p>© 2024 VERIFICADOS INC.</p>
            <span className="hidden md:block opacity-20">|</span>
            <p className="flex items-center gap-2">
              FEITO COM <span className="text-red-500 material-symbols-outlined filled text-[12px]">favorite</span> EM MOÇAMBIQUE
            </p>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-600">
              <span className="material-symbols-outlined text-sm">language</span>
              PORTUGUÊS (MZ)
            </div>
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-500">
              <span className="size-1.5 rounded-full bg-green-500 animate-pulse"></span>
              <span className="text-[9px] font-black uppercase tracking-widest">Sistemas Online</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
