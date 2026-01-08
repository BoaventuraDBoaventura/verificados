
import React from 'react';
import { Link } from 'react-router-dom';

const LandingPage: React.FC = () => {
  return (
    <div className="flex flex-col bg-[#101922] min-h-screen">
      
      {/* Hero Section - Clean & Direct */}
      <section className="pt-12 pb-10 px-4 border-b border-white/5">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-2xl md:text-3xl font-extrabold mb-4 tracking-tight text-white leading-tight">
            Transparência e <span className="text-blue-500">Autenticidade</span> na Moda
          </h1>
          <p className="text-slate-400 text-sm md:text-base font-medium max-w-2xl mx-auto">
            Entenda como conectamos os melhores talentos de Moçambique a contratantes profissionais de forma segura.
          </p>
        </div>
      </section>

      {/* Overview - 3 Simple Steps */}
      <section className="py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            {[
              { step: '01', title: 'Cadastro e Verificação', desc: 'Modelos criam perfis e passam por uma auditoria manual de identidade.' },
              { step: '02', title: 'Curadoria de Talentos', desc: 'Apenas perfis reais e atualizados são exibidos na galeria principal.' },
              { step: '03', title: 'Conexão Direta', desc: 'Contratantes desbloqueiam contatos e negociam sem intermediários.' }
            ].map((item) => (
              <div key={item.step} className="flex flex-col items-center">
                <span className="text-[10px] font-black text-blue-500 bg-blue-500/10 px-2 py-1 rounded-full mb-3 tracking-widest uppercase">Passo {item.step}</span>
                <h3 className="text-base font-bold mb-2">{item.title}</h3>
                <p className="text-slate-500 text-xs leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Dual Journey Section - Balanced */}
      <section className="py-12 px-4 bg-[#0d141b]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* For Models */}
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-xl bg-blue-600/10 flex items-center justify-center text-blue-500">
                <span className="material-symbols-outlined text-xl">person_search</span>
              </div>
              <h2 className="text-xl font-bold uppercase tracking-tight italic">Para Modelos</h2>
            </div>
            
            <p className="text-slate-400 text-sm leading-relaxed">Sua carreira merece a proteção de uma plataforma que valoriza seu trabalho e imagem.</p>
            
            <ul className="space-y-4">
              {[
                { icon: 'task_alt', title: 'Selo de Verificado', text: 'Destaque-se com a garantia de que você é quem diz ser.' },
                { icon: 'visibility_off', title: 'Privacidade Controlada', text: 'Seu número de telefone é oculto por padrão.' },
                { icon: 'trending_up', title: 'Maior Visibilidade', text: 'Seja vista pelas maiores marcas e agências do país.' }
              ].map(feat => (
                <li key={feat.title} className="flex gap-3">
                  <span className="material-symbols-outlined text-blue-500 shrink-0 text-lg">{feat.icon}</span>
                  <div>
                    <h4 className="font-bold text-xs mb-1">{feat.title}</h4>
                    <p className="text-[11px] text-slate-500">{feat.text}</p>
                  </div>
                </li>
              ))}
            </ul>
            
            <Link to="/cadastro" className="mt-2 inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-xs font-bold text-white hover:bg-blue-500 transition-all w-fit">
              Cadastrar Perfil
              <span className="material-symbols-outlined text-xs">arrow_forward</span>
            </Link>
          </div>

          {/* For Recruiters */}
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-xl bg-slate-800 flex items-center justify-center text-slate-400">
                <span className="material-symbols-outlined text-xl">business_center</span>
              </div>
              <h2 className="text-xl font-bold uppercase tracking-tight italic">Para Marcas</h2>
            </div>
            
            <p className="text-slate-400 text-sm leading-relaxed">Acesse um banco de talentos pré-auditado, economizando tempo e garantindo segurança.</p>
            
            <ul className="space-y-4">
              {[
                { icon: 'flash_on', title: 'Agilidade na Contratação', text: 'Desbloqueie contatos em segundos via M-Pesa ou eMola.' },
                { icon: 'verified_user', title: 'Fim dos Perfis Falsos', text: 'Todos os talentos passam por verificação biométrica.' },
                { icon: 'history_edu', title: 'Sem Comissões', text: 'Negocie diretamente com o talento ou agência.' }
              ].map(feat => (
                <li key={feat.title} className="flex gap-3">
                  <span className="material-symbols-outlined text-slate-400 shrink-0 text-lg">{feat.icon}</span>
                  <div>
                    <h4 className="font-bold text-xs mb-1">{feat.title}</h4>
                    <p className="text-[11px] text-slate-500">{feat.text}</p>
                  </div>
                </li>
              ))}
            </ul>

            <Link to="/" className="mt-2 inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-6 py-2.5 text-xs font-bold text-white hover:bg-white/10 transition-all w-fit">
              Explorar Galeria
              <span className="material-symbols-outlined text-xs">search</span>
            </Link>
          </div>

        </div>
      </section>

      {/* Simple Footer CTA */}
      <section className="py-12 px-4 border-t border-white/5">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-xl md:text-2xl font-bold mb-4 italic tracking-tight uppercase">Sua Jornada Profissional Começa Aqui</h2>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link to="/cadastro" className="w-full sm:w-auto px-8 py-3 bg-blue-600 text-white rounded-xl font-bold text-xs hover:bg-blue-500 transition-all">
              Criar Perfil
            </Link>
            <Link to="/login" className="w-full sm:w-auto px-8 py-3 border border-white/10 bg-white/5 text-white rounded-xl font-bold text-xs hover:bg-white/10 transition-all">
              Entrar na Conta
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
};

export default LandingPage;
