
import React from 'react';
import { Link } from 'react-router-dom';

const PrivacyPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#101922] py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <Link to="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-white transition-colors mb-12 group">
          <span className="material-symbols-outlined text-sm group-hover:-translate-x-1 transition-transform">arrow_back</span>
          <span className="text-[10px] font-black uppercase tracking-widest">Voltar para Início</span>
        </Link>

        <header className="mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 mb-4">
            <span className="material-symbols-outlined text-green-500 text-xs">shield</span>
            <span className="text-[9px] font-black uppercase tracking-widest text-green-500">Privacidade</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter mb-4">Política de Privacidade</h1>
          <p className="text-slate-400 font-medium">Sua segurança e dados são nossa prioridade.</p>
        </header>

        <div className="space-y-12 text-slate-300 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-white mb-4">Quais dados coletamos?</h2>
            <p>Para o funcionamento da plataforma, coletamos informações essenciais:</p>
            <ul className="list-disc pl-5 mt-4 space-y-3 text-sm">
              <li><strong className="text-white">Dados de Perfil:</strong> Nome artístico, idade, localização, medidas e fotos para exibição pública.</li>
              <li><strong className="text-white">Dados de Contato:</strong> Número de telefone e WhatsApp (protegidos e ocultos por padrão).</li>
              <li><strong className="text-white">Dados de Verificação:</strong> Vídeo de prova de vida e imagem de documento de identidade (armazenados em servidores criptografados e acessíveis apenas pela equipe de auditoria).</li>
            </ul>
          </section>

          <section className="bg-[#1c2127] p-8 rounded-3xl border border-white/5">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
              <span className="material-symbols-outlined text-blue-500">lock</span>
              Proteção de Mídia de Verificação
            </h2>
            <p className="text-sm">
              Os vídeos enviados para verificação de perfil nunca são exibidos publicamente. Eles servem exclusivamente para que nossa equipe confirme que a pessoa nas fotos do perfil é a mesma pessoa que detém o documento de identidade. Após a aprovação, esses dados são marcados como "Auditados" e protegidos por múltiplas camadas de segurança.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4">Uso de Cookies</h2>
            <p>
              Utilizamos cookies para manter sua sessão ativa e personalizar sua experiência de navegação. Não compartilhamos dados de navegação com redes de publicidade externas.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4">Compartilhamento de Dados</h2>
            <p>
              Seus dados de contato só são revelados a usuários que realizam o pagamento da taxa de desbloqueio. Ao se cadastrar como modelo, você está ciente de que seu contato profissional poderá ser acessado por contratantes mediante esta transação.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4">Seus Direitos</h2>
            <p>
              A qualquer momento, você pode solicitar a exclusão permanente de sua conta e de todos os dados associados (incluindo mídias de verificação) através das configurações do seu painel ou entrando em contato com nosso suporte.
            </p>
          </section>
        </div>

        <footer className="mt-20 pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">© 2024 Verificados Inc. • Moçambique</p>
          <Link to="/termos" className="text-[10px] font-black text-blue-500 uppercase tracking-widest hover:underline">Termos de Uso</Link>
        </footer>
      </div>
    </div>
  );
};

export default PrivacyPage;
